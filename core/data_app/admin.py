from django.contrib import admin
from .models import Demography, VisaCountry

# Register the Demography model
@admin.register(Demography)
class DemographyAdmin(admin.ModelAdmin):
    list_display = ('year_month', 'direction', 'gender', 'age_group', 'estimate', 'standard_error', 'status')
    search_fields = ('year_month', 'direction', 'status', 'gender', 'age_group')
    list_filter = ('direction', 'status', 'gender', 'age_group')
    ordering = ('-year_month',)

# Register the VisaCountry model
@admin.register(VisaCountry)
class VisaCountryAdmin(admin.ModelAdmin):
    list_display = ('year_month', 'direction', 'citizenship', 'visa_type', 'country', 'country_code', 'estimate', 'standard_error', 'status')
    search_fields = ('country', 'citizenship', 'visa_type')
    list_filter = ('visa_type', 'status', 'citizenship', 'visa_type',)
    ordering = ('country',)
