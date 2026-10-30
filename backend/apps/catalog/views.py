from rest_framework import permissions, viewsets
from .models import BusinessUnit, Product, BusinessProfile
from .serializers import BusinessUnitSerializer, ProductSerializer, BusinessProfileSerializer

class BusinessUnitViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=BusinessUnit.objects.filter(is_active=True)
    serializer_class=BusinessUnitSerializer
    permission_classes=[permissions.AllowAny]
    lookup_field='slug'

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=Product.objects.filter(is_active=True, business_unit__is_active=True).select_related('business_unit')
    serializer_class=ProductSerializer
    permission_classes=[permissions.AllowAny]
    lookup_field='slug'
    def get_queryset(self):
        qs=super().get_queryset()
        division=self.request.query_params.get('division')
        if division: qs=qs.filter(business_unit__slug=division)
        return qs

class BusinessProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=BusinessProfile.objects.filter(is_visible=True)
    serializer_class=BusinessProfileSerializer
    permission_classes=[permissions.AllowAny]
    lookup_field='slug'
