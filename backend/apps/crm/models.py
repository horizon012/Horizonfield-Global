from django.conf import settings
from django.db import models
from apps.catalog.models import BusinessUnit, Product

class Company(models.Model):
    class Kind(models.TextChoices):
        BUYER='buyer','Buyer'
        SUPPLIER='supplier','Supplier'
        BOTH='both','Both'
    name=models.CharField(max_length=200)
    kind=models.CharField(max_length=10,choices=Kind.choices,default=Kind.BUYER)
    country=models.CharField(max_length=100,blank=True)
    website=models.URLField(blank=True)
    notes=models.TextField(blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

class Contact(models.Model):
    company=models.ForeignKey(Company,on_delete=models.CASCADE,related_name='contacts')
    name=models.CharField(max_length=150)
    email=models.EmailField(blank=True)
    phone=models.CharField(max_length=50,blank=True)
    job_title=models.CharField(max_length=100,blank=True)
    def __str__(self): return f'{self.name} ({self.company.name})'

class Lead(models.Model):
    class Status(models.TextChoices):
        NEW='new','New'
        CONTACTED='contacted','Contacted'
        QUALIFIED='qualified','Qualified'
        QUOTED='quoted','Quotation sent'
        CLOSED='closed','Closed'
    name=models.CharField(max_length=150)
    email=models.EmailField()
    phone=models.CharField(max_length=50,blank=True)
    company_name=models.CharField(max_length=200,blank=True)
    company_website=models.URLField(blank=True)
    business_unit=models.ForeignKey(BusinessUnit,on_delete=models.SET_NULL,null=True,blank=True,related_name='leads')
    product=models.ForeignKey(Product,on_delete=models.SET_NULL,null=True,blank=True)
    product_interest=models.CharField(max_length=200,blank=True)
    quantity=models.CharField(max_length=100,blank=True)
    destination=models.CharField(max_length=160,blank=True)
    message=models.TextField(blank=True)
    source=models.CharField(max_length=60,default='website')
    status=models.CharField(max_length=12,choices=Status.choices,default=Status.NEW)
    owner=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name='assigned_leads')
    company=models.ForeignKey(Company,on_delete=models.SET_NULL,null=True,blank=True,related_name='leads')
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta:
        ordering=['-created_at']
    def __str__(self): return f'{self.name} — {self.product_interest or "general enquiry"}'

class Opportunity(models.Model):
    class Stage(models.TextChoices):
        NEW='new','New'
        QUALIFIED='qualified','Qualified'
        PROPOSAL='proposal','Proposal'
        NEGOTIATION='negotiation','Negotiation'
        WON='won','Won'
        LOST='lost','Lost'
    name=models.CharField(max_length=200)
    company=models.ForeignKey(Company,on_delete=models.PROTECT,related_name='opportunities')
    lead=models.ForeignKey(Lead,on_delete=models.SET_NULL,null=True,blank=True,related_name='opportunities')
    business_unit=models.ForeignKey(BusinessUnit,on_delete=models.PROTECT)
    owner=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True)
    stage=models.CharField(max_length=15,choices=Stage.choices,default=Stage.NEW)
    estimated_value=models.DecimalField(max_digits=14,decimal_places=2,null=True,blank=True)
    currency=models.CharField(max_length=3,default='USD')
    expected_close_date=models.DateField(null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

class Activity(models.Model):
    class Kind(models.TextChoices):
        CALL='call','Call'
        EMAIL='email','Email'
        MEETING='meeting','Meeting'
        NOTE='note','Note'
    lead=models.ForeignKey(Lead,on_delete=models.CASCADE,null=True,blank=True,related_name='activities')
    opportunity=models.ForeignKey(Opportunity,on_delete=models.CASCADE,null=True,blank=True,related_name='activities')
    kind=models.CharField(max_length=15,choices=Kind.choices)
    details=models.TextField()
    performed_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self): return f'{self.kind} — {self.created_at:%Y-%m-%d}'

class Task(models.Model):
    title=models.CharField(max_length=180)
    lead=models.ForeignKey(Lead,on_delete=models.SET_NULL,null=True,blank=True,related_name='tasks')
    opportunity=models.ForeignKey(Opportunity,on_delete=models.SET_NULL,null=True,blank=True,related_name='tasks')
    assignee=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True)
    due_at=models.DateTimeField(null=True,blank=True)
    completed=models.BooleanField(default=False)
    notes=models.TextField(blank=True)
    def __str__(self): return self.title

# Email verification for new public enquiries (separate from employee login).
import uuid

class EmailOTPChallenge(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(db_index=True)
    code_digest = models.CharField(max_length=64)
    issued_at = models.DateTimeField(auto_now_add=True, db_index=True)
    expires_at = models.DateTimeField()
    request_ip = models.GenericIPAddressField(null=True, blank=True, db_index=True)
    failed_attempts = models.PositiveSmallIntegerField(default=0)
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_token_digest = models.CharField(max_length=64, blank=True, default='')
    used_at = models.DateTimeField(null=True, blank=True)
    submitted_lead = models.ForeignKey(
        Lead, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='email_otp_challenges',
    )

    class Meta:
        ordering = ['-issued_at']
        indexes = [models.Index(fields=['email', 'issued_at'])]

    def __str__(self):
        return f'Enquiry verification • {self.email} • {self.issued_at:%Y-%m-%d}'
