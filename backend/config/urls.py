from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from rest_framework.routers import SimpleRouter
from apps.catalog.views import BusinessUnitViewSet, ProductViewSet, BusinessProfileViewSet
from apps.crm.enquiry_otp import RequestEnquiryOTP, SubmitVerifiedEnquiry, VerifyEnquiryOTP

router = SimpleRouter()
router.register('divisions', BusinessUnitViewSet, basename='division')
router.register('products', ProductViewSet, basename='product')
router.register('businesses', BusinessProfileViewSet, basename='business')

def health(_request):
    return JsonResponse({'status':'ok'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', health),
    # OTP is mandatory for the public enquiry endpoint. The old unverified
    # /api/v1/inquiries/ endpoint is intentionally removed.
    path('api/v1/enquiry/otp/', RequestEnquiryOTP.as_view(), name='request-enquiry-otp'),
    path('api/v1/enquiry/verify/', VerifyEnquiryOTP.as_view(), name='verify-enquiry-otp'),
    path('api/v1/enquiry/submit/', SubmitVerifiedEnquiry.as_view(), name='verified-enquiry-submit'),
    path('api/v1/', include(router.urls)),
]
