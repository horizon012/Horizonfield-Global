from rest_framework import serializers
from .models import BusinessUnit, Product, BusinessProfile

class BusinessUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model=BusinessUnit
        fields=['id','name','slug','description']

class ProductSerializer(serializers.ModelSerializer):
    business_unit=BusinessUnitSerializer(read_only=True)
    class Meta:
        model=Product
        fields=['id','name','slug','description','business_unit','specifications','image_url','brochure_url']

class BusinessProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model=BusinessProfile
        fields=['id','name','slug','description','website_url','logo_url']
