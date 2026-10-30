from django.core.management.base import BaseCommand
from apps.catalog.models import BusinessUnit, Category, Product, BusinessProfile

DIVISIONS = [
    ('Agricultural Commodities','agriculture','Grains and other agricultural commodities'),
    ('Building Materials','building-materials','Scaffolding and construction components'),
    ('Technology Distribution','technology','Distribution and retail operations'),
]
PRODUCTS = [
    ('1121 Basmati Rice','1121-basmati-rice','agriculture','Rice'),
    ('Sona Masoori Rice','sona-masoori-rice','agriculture','Rice'),
    ('Khapli Wheat','khapli-wheat','agriculture','Grains'),
    ('Double Fingers Turmeric','double-fingers-turmeric','agriculture','Spices'),
    ('Tie Rod','tie-rod','building-materials','Scaffolding'),
    ('Base Jack','base-jack','building-materials','Scaffolding'),
    ('Swivel Coupler','swivel-coupler','building-materials','Scaffolding'),
]

class Command(BaseCommand):
    help = 'Create a few safe starter catalogue records for local development.'

    def handle(self,*args,**kwargs):
        divisions = {}
        for name,slug,description in DIVISIONS:
            unit,_ = BusinessUnit.objects.update_or_create(slug=slug,defaults={'name':name,'description':description})
            divisions[slug]=unit
        for name,slug,division,cat in PRODUCTS:
            category,_ = Category.objects.get_or_create(
                business_unit=divisions[division],slug=cat.lower(),defaults={'name':cat}
            )
            Product.objects.update_or_create(slug=slug,defaults={
                'name':name,'business_unit':divisions[division],'category':category,
                'description':f'Starter catalogue record for {name}. Replace with approved specs.',
            })
        for name,slug,url in [
            ('Nector Harvest','nector-harvest','https://nectorharvest.com/'),
            ('Elementall Core','elementall-core','https://www.elementallcore.com/'),
        ]:
            BusinessProfile.objects.update_or_create(slug=slug,defaults={'name':name,'website_url':url})
        self.stdout.write(self.style.SUCCESS('Starter business units, products and portfolio records created.'))
