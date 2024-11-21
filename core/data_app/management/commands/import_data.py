import csv
from django.core.management.base import BaseCommand
from data_app.models import Demography, VisaCountry

class Command(BaseCommand):
    help = 'Import data from CSV files into Demography and VisaCountry tables'

    def handle(self, *args, **kwargs):
        # Import data for Demography
        with open('data/Demography.csv', 'r') as demography_file:
            reader = csv.DictReader(demography_file)
            for row in reader:
                Demography.objects.get_or_create(
                    year_month=row['year_month'],
                    direction=row['direction'],
                    estimate=int(row['estimate']),
                    standard_error=int(row['standard_error']),
                    status=row['status'],
                    gender=row['gender'],
                    age_group=row['age_group']
                )
        self.stdout.write(self.style.SUCCESS('Successfully imported Demography data.'))

        # Import data for VisaCountry
        with open('data/VisaCountry.csv', 'r') as visa_country_file:
            reader = csv.DictReader(visa_country_file)
            for row in reader:
                VisaCountry.objects.get_or_create(
                    year_month=row['year_month'],
                    direction=row['direction'],
                    citizenship=row['citizenship'],
                    visa_type=row['visa_type'],
                    country=row['country'],
                    country_code=row['country_code'],
                    estimate=int(row['estimate']),
                    standard_error=int(row['standard_error']),
                    status=row['status']
                )
        self.stdout.write(self.style.SUCCESS('Successfully imported VisaCountry data.'))
