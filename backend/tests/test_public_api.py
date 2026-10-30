from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.crm.models import Lead
from apps.catalog.models import BusinessUnit, Product

class PublicInquiryTests(TestCase):
    def setUp(self):
        self.client=APIClient()
        self.division=BusinessUnit.objects.create(name='Building Materials',slug='building-materials')

    def test_legacy_inquiry_submission_route_is_removed(self):
        result=self.client.post('/api/v1/inquiries/', {
            'name':'Test Buyer','email':'buyer@example.com','business_unit':'building-materials',
            'product_interest':'Tie Rod','quantity':'27 MT','destination':'Jebel Ali'
        }, format='json')
        self.assertEqual(result.status_code,404)
        self.assertEqual(Lead.objects.count(),0)

    def test_anonymous_cannot_get_lead_list(self):
        response=self.client.get('/api/v1/inquiries/')
        self.assertEqual(response.status_code,404)

    def test_honeypot_rejected(self):
        response=self.client.post('/api/v1/inquiries/', {
            'name':'Robot','email':'robot@example.com','website':'www.spam.example'
        }, format='json')
        self.assertEqual(response.status_code,404)
        self.assertEqual(Lead.objects.count(),0)

    def test_product_list_is_public_but_does_not_include_inactive(self):
        Product.objects.create(name='Tie Rod',slug='tie-rod',business_unit=self.division,is_active=True)
        Product.objects.create(name='Hidden Product',slug='hidden',business_unit=self.division,is_active=False)
        response=self.client.get('/api/v1/products/')
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.data['count'],1)
