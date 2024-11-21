from django.db import models

class Demography(models.Model):
    STATUS_CHOICES = [
        ('Final', 'Final'),
        ('Provisional', 'Provisional'),
    ]
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
    ]
    DIRECTION_CHOICES = [
        ('Arrivals', 'Arrivals'),
        ('Departures', 'Departures'),
    ]
    AGE_GROUP_CHOICES = [
        ('0-4 years', '0-4 years'),
        ('5-9 years', '5-9 years'),
        ('10-14 years', '10-14 years'),
        ('15-19 years', '15-19 years'),
        ('20-24 years', '20-24 years'),
        ('25-29 years', '25-29 years'),
        ('30-34 years', '30-34 years'),
        ('35-39 years', '35-39 years'),
        ('40-44 years', '40-44 years'),
        ('45-49 years', '45-49 years'),
        ('50-54 years', '50-54 years'),
        ('55-59 years', '55-59 years'),
        ('60-64 years', '60-64 years'),
        ('65-69 years', '65-69 years'),
        ('70-74 years', '70-74 years'),
        ('75-79 years', '75-79 years'),
        ('80-84 years', '80-84 years'),
        ('85-89 years', '85-89 years'),
        ('90+ years', '90+ years'), 
    ]

    year_month = models.CharField(max_length=7, db_index=True)  # Format: YYYY-MM
    direction = models.CharField(max_length=10, db_index=True, choices=DIRECTION_CHOICES)  # "in" or "out"
    estimate = models.IntegerField()
    standard_error = models.IntegerField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    age_group = models.CharField(max_length=20, choices=AGE_GROUP_CHOICES)

    def __str__(self):
        return f"{self.year_month} - {self.direction} ({self.gender}, {self.age_group})"


class VisaCountry(models.Model):
    STATUS_CHOICES = [
        ('Final', 'Final'),
        ('Provisional', 'Provisional'),
    ]
    DIRECTION_CHOICES = [
        ('Arrivals', 'Arrivals'),
        ('Departures', 'Departures'),
    ]
    CITIZENSHIP_CHOICES = [
        ('NZ', 'NZ'),
        ('non-NZ', 'non-NZ'),
    ]
    VISA_TYPE_CHOICES = [
        ('NZ and Australian citizens', 'NZ and Australian citizens'),
        ('Other', 'Other'),
        ('Resident', 'Resident'),
        ('Student', 'Student'),
        ('Visitor', 'Visitor'),
        ('Work', 'Work'),
    ]

    year_month = models.CharField(max_length=7, db_index=True)  # Format: YYYY-MM
    direction = models.CharField(max_length=10, db_index=True, choices=DIRECTION_CHOICES)  # "in" or "out"
    citizenship = models.CharField(max_length=50, choices=CITIZENSHIP_CHOICES)
    visa_type = models.CharField(max_length=50, choices=VISA_TYPE_CHOICES)
    country = models.CharField(max_length=50)
    country_code = models.CharField(max_length=10)
    estimate = models.IntegerField()
    standard_error = models.IntegerField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)

    def __str__(self):
        return f"{self.year_month} - {self.country} ({self.visa_type})"
