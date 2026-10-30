from django.db import models
from django.utils.text import slugify

class BusinessUnit(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    class Meta:
        ordering = ['name']
    def __str__(self): return self.name

class Category(models.Model):
    business_unit = models.ForeignKey(BusinessUnit, related_name='categories', on_delete=models.PROTECT)
    name = models.CharField(max_length=120)
    slug = models.SlugField()
    class Meta:
        constraints = [models.UniqueConstraint(fields=['business_unit','slug'],name='unique_division_category')]
        ordering = ['name']
    def __str__(self): return f'{self.business_unit.name}: {self.name}'

class Product(models.Model):
    business_unit = models.ForeignKey(BusinessUnit, on_delete=models.PROTECT, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True)
    description = models.TextField(blank=True)
    specifications = models.JSONField(default=dict, blank=True)
    image_url = models.URLField(blank=True)
    brochure_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['name']
    def __str__(self): return self.name

class BusinessProfile(models.Model):
    name = models.CharField(max_length=140)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    website_url = models.URLField(blank=True)
    logo_url = models.URLField(blank=True)
    is_visible = models.BooleanField(default=True)
    def __str__(self): return self.name
