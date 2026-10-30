"""Public business enquiry endpoints with DB-backed email OTP validation.

Do not put SMTP passwords, OTPs, or sensitive verification details in logs.
In production add bot challenge/WAF and delivery monitoring; see README.
"""

import logging
import hashlib
import re
import secrets
import uuid
from datetime import timedelta

from django.conf import settings
from django.core.mail import EmailMessage
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
from django.utils.crypto import constant_time_compare, salted_hmac
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.catalog.models import BusinessUnit
from apps.crm.models import EmailOTPChallenge, Lead

logger = logging.getLogger(__name__)

# Same approved catalogue terms as frontend/src/data/enquiryCatalog.js.
CATEGORIES = {
    'agriculture': [
        '1121 Basmati Rice', 'Steam & Sella Rice', 'Sona Masoori Rice',
        'Khapli Wheat', 'Black Rice', 'Kala Namak Rice', 'Maida',
        'Sooji (Semolina)', 'Double Fingers Turmeric', 'Other Agricultural Product',
    ],
    'building-materials': [
        'Tie Rod', 'Brace Lock Pin', 'Swivel Coupler', 'Ledger Blade',
        'U Jack (U-Head Jack)', 'Base Jack', 'Wing Nut',
        'Anchor Nut (with Plate)', 'Winding Wire',
        'Thread Rod - Zinc Plated', 'Horizontal (Ledger)',
        'Flower Plate (Rosette)', 'Base Plate',
        'Top Cup - Casted', 'Top Cup - Forged', 'Bottom Cup',
        'Other Building Material',
    ],
    'technology': [
        'Technology Product Distribution', 'Dealer / Distributor Partnership',
        'Retail Store Enquiry', 'Other Technology Product',
    ],
}

OTP_TTL_MINUTES = 10
OTP_MAX_ATTEMPTS = 5
OTP_RESEND_SECONDS = 60
MAX_IP_REQUESTS_HOUR = 15
MAX_EMAIL_REQUESTS_HOUR = 5


def normalized_email(value):
    return value.strip().lower()


def otp_digest(challenge_id, code):
    # HMAC makes 6-digit codes resistant to offline guessing if database leaks.
    return salted_hmac('horizonfield.email-otp', f'{challenge_id}:{code}', algorithm='sha256').hexdigest()


def proof_digest(challenge_id, token):
    """Only a successful server-side OTP check can mint a submission proof."""
    return salted_hmac(
        'horizonfield.email-otp-proof', f'{challenge_id}:{token}', algorithm='sha256'
    ).hexdigest()


def resend_cache_key(email):
    # Do not store the email itself as part of the Redis cache key.
    return 'hfg:otp:resend:' + hashlib.sha256(email.encode('utf-8')).hexdigest()


def client_ip(request):
    # Do not trust X-Forwarded-For unless a trusted reverse proxy is configured.
    return request.META.get('REMOTE_ADDR', '') or None


class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)
    fax_field = serializers.CharField(required=False, allow_blank=True, max_length=120)

    def validate_email(self, value):
        return normalized_email(value)

    def validate_fax_field(self, value):
        if value:
            raise serializers.ValidationError('Unable to process the request.')
        return value


class VerifyOTPSerializer(serializers.Serializer):
    challenge_id = serializers.UUIDField()
    email = serializers.EmailField(max_length=254)
    otp = serializers.RegexField(regex=r'^\d{6}$')

    def validate_email(self, value):
        return normalized_email(value)


class EnquirySerializer(serializers.Serializer):
    challenge_id = serializers.UUIDField()
    verification_token = serializers.RegexField(regex=r'^[A-Za-z0-9_-]{32,128}$')
    email = serializers.EmailField(max_length=254)
    name = serializers.CharField(max_length=120)
    company_name = serializers.CharField(max_length=180)
    company_website = serializers.URLField(required=False, allow_blank=True, max_length=250)
    whatsapp_country_code = serializers.RegexField(regex=r'^\+\d{1,4}$')
    whatsapp_number = serializers.RegexField(regex=r'^\d{6,15}$')
    category = serializers.ChoiceField(choices=list(CATEGORIES))
    product = serializers.CharField(max_length=160)
    other_product = serializers.CharField(required=False, allow_blank=True, max_length=160)
    quantity = serializers.CharField(required=False, allow_blank=True, max_length=100)
    destination = serializers.CharField(required=False, allow_blank=True, max_length=160)
    message = serializers.CharField(required=False, allow_blank=True, max_length=2500)
    consent = serializers.BooleanField()
    fax_field = serializers.CharField(required=False, allow_blank=True, max_length=120)
    country_iso = serializers.CharField(required=False, allow_blank=True, max_length=2)

    def validate_email(self, value):
        return normalized_email(value)

    def validate(self, attrs):
        if attrs.get('fax_field'):
            raise serializers.ValidationError({'detail': 'Unable to process the request.'})
        if not attrs.get('consent'):
            raise serializers.ValidationError({'consent': 'Permission to contact you is required.'})
        if attrs['product'] not in CATEGORIES[attrs['category']]:
            raise serializers.ValidationError({'product': 'Select a product from the chosen category.'})
        if attrs['product'].startswith('Other ') and not attrs.get('other_product', '').strip():
            raise serializers.ValidationError({'other_product': 'Please specify the product.'})
        number = attrs['whatsapp_country_code'].lstrip('+') + attrs['whatsapp_number']
        if len(number) > 15:
            raise serializers.ValidationError({'whatsapp_number': 'Full international number must contain at most 15 digits.'})
        return attrs


class PublicEnquiryBase(APIView):
    authentication_classes = []  # Public: no session cookie/CSRF dependency.
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'inquiry'


class RequestEnquiryOTP(PublicEnquiryBase):
    throttle_scope = 'otp_request'
    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        now = timezone.now()
        ip = client_ip(request)
        recent = EmailOTPChallenge.objects.filter(issued_at__gte=now - timedelta(hours=1))

        if (recent.filter(email=email).count() >= MAX_EMAIL_REQUESTS_HOUR or
                (ip and recent.filter(request_ip=ip).count() >= MAX_IP_REQUESTS_HOUR)):
            return Response({'detail': 'Too many verification requests. Please try later.'}, status=429)

        last = EmailOTPChallenge.objects.filter(email=email).order_by('-issued_at').first()
        if last:
            elapsed = (now - last.issued_at).total_seconds()
            if elapsed < OTP_RESEND_SECONDS:
                return Response({'detail': f'Please wait {int(OTP_RESEND_SECONDS - elapsed) + 1} seconds before requesting another code.'}, status=429)

        email_lock_key = resend_cache_key(email)
        if not cache.add(email_lock_key, '1', timeout=OTP_RESEND_SECONDS):
            return Response({'detail': 'Please wait before requesting another code.'}, status=429)

        code = f'{secrets.randbelow(1000000):06d}'
        challenge = EmailOTPChallenge(id=uuid.uuid4(), email=email,
            expires_at=now + timedelta(minutes=OTP_TTL_MINUTES), request_ip=ip)
        challenge.code_digest = otp_digest(challenge.id, code)
        challenge.save()

        try:
            sent = EmailMessage(
                subject='Horizonfield Global | Your email verification code',
                body=(f'Your Horizonfield Global enquiry verification code is: {code}\n\n'
                      f'It expires in {OTP_TTL_MINUTES} minutes. If you did not request it, ignore this email.\n'
                      'Never share your verification code with anyone.'),
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email],
            ).send(fail_silently=False)
            if sent != 1:
                raise RuntimeError('SMTP did not accept the message')
        except Exception:
            logger.exception('Unable to send enquiry verification email')
            challenge.delete()  # Do not leave a challenge for an undelivered OTP.
            cache.delete(email_lock_key)
            return Response({'detail': 'Unable to send a verification email. Please try later.'}, status=503)

        return Response({
            'challenge_id': str(challenge.id), 'expires_in_seconds': OTP_TTL_MINUTES * 60,
            'resend_after_seconds': OTP_RESEND_SECONDS, 'detail': 'Verification code sent.',
        }, status=status.HTTP_201_CREATED)


class VerifyEnquiryOTP(PublicEnquiryBase):
    throttle_scope = 'otp_verify'

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        now = timezone.now()

        # PostgreSQL row lock ensures simultaneous attempts cannot pass the limit.
        with transaction.atomic():
            try:
                challenge = EmailOTPChallenge.objects.select_for_update().get(
                    pk=data['challenge_id']
                )
            except EmailOTPChallenge.DoesNotExist:
                return Response({'detail': 'Verification expired. Request a new code.'}, status=400)

            if (challenge.used_at or challenge.verified_at or
                    challenge.expires_at <= now or
                    challenge.failed_attempts >= OTP_MAX_ATTEMPTS):
                return Response({'detail': 'Code is expired or already used. Request a new code.'}, status=400)
            if not constant_time_compare(challenge.email, data['email']):
                return Response({'detail': 'Code does not match this email.'}, status=400)
            if not constant_time_compare(challenge.code_digest, otp_digest(challenge.id, data['otp'])):
                challenge.failed_attempts += 1
                challenge.save(update_fields=['failed_attempts'])
                return Response({'detail': 'Incorrect code. Please check and try again.'}, status=400)

            # Token is not the OTP. It is returned ONCE and never stored in plaintext.
            token = secrets.token_urlsafe(32)
            challenge.verified_at = now
            challenge.verification_token_digest = proof_digest(challenge.id, token)
            challenge.code_digest = ''
            challenge.save(update_fields=[
                'verified_at', 'verification_token_digest', 'code_digest'
            ])

        return Response({
            'verified': True,
            'verification_token': token,
            'detail': 'Successfully verified',
        }, status=200)


class SubmitVerifiedEnquiry(PublicEnquiryBase):
    def post(self, request):
        serializer = EnquirySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        now = timezone.now()

        # On PostgreSQL select_for_update serializes attempts and prevents OTP reuse.
        with transaction.atomic():
            try:
                challenge = EmailOTPChallenge.objects.select_for_update().get(pk=data['challenge_id'])
            except EmailOTPChallenge.DoesNotExist:
                return Response({'detail': 'Invalid or expired verification. Request a new code.'}, status=400)

            # Proof must match BOTH this challenge and this verified email.
            if (not constant_time_compare(challenge.email, data['email']) or
                    not challenge.verified_at or
                    challenge.expires_at <= now or
                    not challenge.verification_token_digest or
                    not constant_time_compare(
                        challenge.verification_token_digest,
                        proof_digest(challenge.id, data['verification_token'])
                    )):
                return Response({'detail': 'Email verification expired. Request a new code.'}, status=400)

            # A timed-out browser retry returns the same reference, not a second lead.
            if challenge.used_at:
                if challenge.submitted_lead_id:
                    return Response({
                        'detail': 'Enquiry already recorded.',
                        'reference': challenge.submitted_lead_id,
                        'already_submitted': True,
                    }, status=200)
                return Response({'detail': 'Verification was already used.'}, status=400)

            challenge.used_at = now
            challenge.save(update_fields=['used_at'])
            division = BusinessUnit.objects.filter(slug=data['category'], is_active=True).first()
            product = data['other_product'].strip() if data['product'].startswith('Other ') else data['product']
            whatsapp = f"{data['whatsapp_country_code']}{data['whatsapp_number']}"
            details = [
                f"Verified email: {data['email']}", f"Category: {data['category']}",
                f"Product selection: {data['product']}", f"Requested product: {product}",
                f"Company website: {data.get('company_website') or 'Not supplied'}",
                f"WhatsApp: {whatsapp}",
            ]
            if data.get('message'):
                details.append('Additional requirements:\n' + data['message'])

            lead = Lead.objects.create(
                name=data['name'].strip(), email=data['email'],
                company_name=data['company_name'].strip(),
                company_website=data.get('company_website', ''),
                phone=whatsapp, business_unit=division,
                product_interest=product[:200],
                quantity=data.get('quantity', ''), destination=data.get('destination', ''),
                message='\n'.join(details),
                source='verified-website-enquiry', status=Lead.Status.NEW,
            )
            challenge.submitted_lead = lead
            challenge.save(update_fields=['submitted_lead'])

        body = '\n'.join([
            'NEW VERIFIED BUSINESS ENQUIRY — HORIZONFIELD GLOBAL',
            f'Reference: HFG-{lead.pk:06d}', f'Name: {lead.name}',
            f'Company: {lead.company_name}',
            f'Company website: {lead.company_website or "Not provided"}',
            f'Email (OTP verified): {lead.email}', f'WhatsApp: {lead.phone}',
            f'Category: {data["category"]}', f'Product: {product}',
            f'Required quantity: {lead.quantity or "Not provided"}',
            f'Destination / port: {lead.destination or "Not provided"}',
            f'Additional requirements:\n{data.get("message") or "Not provided"}',
            '\nThis enquiry is also stored in the CRM for follow-up.',
        ])
        notification_sent = False
        try:
            notification_sent = EmailMessage(
                subject=f'[HFG Enquiry #{lead.pk}] {data["category"]} — {product[:70]}',
                body=body, from_email=settings.DEFAULT_FROM_EMAIL,
                to=[settings.ENQUIRY_NOTIFICATION_EMAIL], reply_to=[lead.email],
            ).send(fail_silently=False) == 1
        except Exception:
            logger.exception('Enquiry saved to CRM but support email notification failed, lead_id=%s', lead.pk)

        return Response({
            'detail': 'Enquiry saved successfully.',
            'reference': lead.pk,
            'notification_sent': notification_sent,
        }, status=status.HTTP_201_CREATED)
