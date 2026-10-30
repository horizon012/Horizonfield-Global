from django.contrib import admin
from .models import Quotation, QuotationLine

class QuotationLineInline(admin.TabularInline):
    model=QuotationLine
    extra=1

@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display=('number','company','status','currency','created_at')
    list_filter=('status','currency')
    search_fields=('number','company__name')
    inlines=[QuotationLineInline]
