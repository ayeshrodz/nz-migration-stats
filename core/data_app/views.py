import pandas as pd
from django.shortcuts import render, redirect
from .models import Demography, VisaCountry
import json

# def dashboard(request):
#     return render(request, 'data_app/dashboard.html')

def dashboard(request):
    # Fetch all data from the Demography model
    demography_df = pd.DataFrame.from_records(Demography.objects.all().values())

    # Split year_month into separate year and month columns
    demography_df['year'] = demography_df['year_month'].str[:4]  # Extract year
    demography_df['month'] = demography_df['year_month'].str[5:7]  # Extract month

    # Create a dictionary with all the data to send to the frontend
    dataset = {
        'year_month': demography_df['year_month'].tolist(),
        'year': demography_df['year'].tolist(),
        'month': demography_df['month'].tolist(),
        'direction': demography_df['direction'].tolist(),
        'estimate': demography_df['estimate'].tolist(),
        'gender': demography_df['gender'].tolist(),
        'age_group': demography_df['age_group'].tolist(),
        'status': demography_df['status'].tolist(),
    }

    context = {
        "dataset": json.dumps(dataset)  # Convert dataset to a valid JSON string
    }

    return render(request, 'data_app/base_dashboard.html', context)



def data_display(request):

    # Fetch all data from the database and order by year_month descending
    demography_df = pd.DataFrame.from_records(
        Demography.objects.all().order_by('-year_month').values()
    )

    # Convert data to a dictionary for use in the template
    table_data = demography_df.to_dict(orient='records')

    return render(request, 'data_app/data.html', {
        'table_data': table_data,  # All records ordered by year_month descending
        'model_name': 'Demography',
    })