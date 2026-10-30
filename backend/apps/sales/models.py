from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from apps.crm.models import Company, Opportunity

class Quotation(models.Model):
    class Status(models.TextChoices):
        DRAFT='draft','Draft'
        SENT='sent','Sent'
        ACCEPTED='accepted','Accepted'
        REJECTED='rejected','Rejected'
    number=models.CharField(max_length=60,unique=True)
    company=models.ForeignKey(Company,on_delete=models.PROTECT,related_name='quotations')
    opportunity=models.ForeignKey(Opportunity,on_delete=models.SET_NULL,null=True,blank=True,related_name='quotations')
    status=models.CharField(max_length=12,choices=Status.choices,default=Status.DRAFT)
    currency=models.CharField(max_length=3,default='USD')
    valid_until=models.DateField(null=True,blank=True)
    terms=models.TextField(blank=True)
    created_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.number
    @property
    def subtotal(self):
        return sum((line.amount for line in self.lines.all()),Decimal('0.00'))

class QuotationLine(models.Model):
    quotation=models.ForeignKey(Quotation,on_delete=models.CASCADE,related_name='lines')
    description=models.CharField(max_length=300)
    quantity=models.DecimalField(max_digits=12,decimal_places=3,validators=[MinValueValidator(Decimal('0.001'))])
    unit=models.CharField(max_length=30,default='unit')
    unit_price=models.DecimalField(max_digits=14,decimal_places=2,validators=[MinValueValidator(Decimal('0.00'))])
    class Meta:
        ordering=['id']
    @property
    def amount(self): return self.quantity*self.unit_price
    def __str__(self): return self.description
