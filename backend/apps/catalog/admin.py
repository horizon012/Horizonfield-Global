from django.contrib import admin
from .models import BusinessUnit, Category, Product, BusinessProfile

@admin.register(BusinessUnit)
class BusinessUnitAdmin(admin.ModelAdmin):
    list_display=('name','slug','is_active')
    prepopulated_fields={'slug':('name',)}

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display=('name','business_unit')
    list_filter=('business_unit',)
    prepopulated_fields={'slug':('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display=('name','business_unit','is_active','updated_at')
    list_filter=('business_unit','is_active')
    search_fields=('name','description')
    prepopulated_fields={'slug':('name',)}

@admin.register(BusinessProfile)
class BusinessProfileAdmin(admin.ModelAdmin):
    list_display=('name','website_url','is_visible')
    prepopulated_fields={'slug':('name',)}
