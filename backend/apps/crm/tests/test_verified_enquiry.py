import re
from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APITestCase
from apps.catalog.models import BusinessUnit
from apps.crm.models import Lead


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
                   DEFAULT_FROM_EMAIL='support@horizonfieldglobal.com',
                   ENQUIRY_NOTIFICATION_EMAIL='support@horizonfieldglobal.com')
class VerifiedEnquiryTests(APITestCase):
    otp_url = '/api/v1/enquiry/otp/'
    verify_url = '/api/v1/enquiry/verify/'
    submit_url = '/api/v1/enquiry/submit/'

    def setUp(self):
        super().setUp()
        cache.clear()

    @classmethod
    def setUpTestData(cls):
        BusinessUnit.objects.create(name='Agricultural Commodities', slug='agriculture', is_active=True)

    def get_challenge(self, email='buyer@example.org'):
        response = self.client.post(self.otp_url, {'email': email}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(len(mail.outbox), 1)
        otp = re.search(r'\b\d{6}\b', mail.outbox[0].body).group(0)
        return response.data['challenge_id'], otp

    def valid_payload(self, cid, otp):
        verify_response = self.client.post(self.verify_url, {
            'challenge_id': cid, 'email': 'buyer@example.org', 'otp': otp,
        }, format='json')
        self.assertEqual(verify_response.status_code, 200, verify_response.data)
        return {
            'challenge_id': cid, 'verification_token': verify_response.data['verification_token'],
            'email': 'buyer@example.org',
            'name': 'Sample Buyer', 'company_name': 'Sample Exports',
            'company_website': 'https://example.org',
            'whatsapp_country_code': '+91', 'whatsapp_number': '9876543210',
            'category': 'agriculture', 'product': '1121 Basmati Rice',
            'quantity': '1 container', 'destination': 'Jebel Ali',
            'message': 'Please quote CIF.', 'consent': True,
        }

    def test_verified_submission_creates_lead_and_emails_support(self):
        cid, otp = self.get_challenge()
        payload = self.valid_payload(cid, otp)
        response = self.client.post(self.submit_url, payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertTrue(response.data['notification_sent'])
        self.assertEqual(Lead.objects.count(), 1)
        lead = Lead.objects.first()
        self.assertEqual(lead.company_website, 'https://example.org')
        self.assertEqual(lead.phone, '+919876543210')
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(mail.outbox[1].to, ['support@horizonfieldglobal.com'])
        self.assertEqual(mail.outbox[1].reply_to, ['buyer@example.org'])
        self.assertEqual(self.client.post(self.submit_url, payload, format='json').status_code, 200)
        self.assertEqual(Lead.objects.count(), 1)

    def test_cannot_verify_with_incorrect_otp(self):
        cid, _ = self.get_challenge()
        response = self.client.post(self.verify_url, {
            'challenge_id': cid, 'email': 'buyer@example.org', 'otp': '000000',
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Lead.objects.count(), 0)

    def test_category_product_must_match(self):
        cid, otp = self.get_challenge()
        payload = self.valid_payload(cid, otp)
        payload['product'] = 'Tie Rod'
        response = self.client.post(self.submit_url, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Lead.objects.count(), 0)

    def test_unverified_legacy_route_is_not_available(self):
        response = self.client.post('/api/v1/inquiries/', {'name': 'bad'}, format='json')
        self.assertEqual(response.status_code, 404)
