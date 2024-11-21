# Generated by Django 4.2.16 on 2024-11-21 06:57

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Demography',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year_month', models.CharField(max_length=7)),
                ('direction', models.CharField(max_length=10)),
                ('estimate', models.IntegerField()),
                ('standard_error', models.IntegerField()),
                ('status', models.CharField(max_length=50)),
                ('gender', models.CharField(max_length=10)),
                ('age_group', models.CharField(max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='VisaCountry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year_month', models.CharField(max_length=7)),
                ('direction', models.CharField(max_length=10)),
                ('citizenship', models.CharField(max_length=50)),
                ('visa_type', models.CharField(max_length=50)),
                ('country', models.CharField(max_length=50)),
                ('country_code', models.CharField(max_length=10)),
                ('estimate', models.IntegerField()),
                ('standard_error', models.IntegerField()),
                ('status', models.CharField(max_length=50)),
            ],
        ),
    ]
