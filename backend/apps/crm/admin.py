from django.contrib import admin
from .models import Company, Contact, Lead, Opportunity, Activity, Task

class ContactInline(admin.TabularInline):
    model=Contact
    extra=0

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display=('name','kind','country')
    search_fields=('name','country')
    inlines=[ContactInline]

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display=('name','company_name','product_interest','status','owner','created_at')
    list_filter=('status','business_unit','created_at')
    search_fields=('name','email','company_name','product_interest')
    readonly_fields=('created_at','updated_at','source')

@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display=('name','company','stage','estimated_value','currency','owner')
    list_filter=('stage','business_unit','currency')

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display=('kind','lead','opportunity','performed_by','created_at')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display=('title','assignee','due_at','completed')
    list_filter=('completed','due_at')


# Audit recent verification attempts (never show OTP digests).
from .models import EmailOTPChallenge

@admin.register(EmailOTPChallenge)
class EmailOTPChallengeAdmin(admin.ModelAdmin):
    list_display = ("email", "issued_at", "expires_at", "failed_attempts", "used_at")
    readonly_fields = ("id", "email", "issued_at", "expires_at", "failed_attempts", "used_at", "request_ip")
    exclude = ("code_digest",)
    list_filter = ("issued_at", "used_at")
    search_fields = ("email",)
    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False
