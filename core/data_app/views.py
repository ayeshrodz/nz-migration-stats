import pandas as pd
from django.shortcuts import render, redirect
from .models import Demography, VisaCountry
import json

# def dashboard(request):
#     return render(request, 'data_app/dashboard.html')

def dashboard(request):
    # Fetch data from Demography model
    demography_df = pd.DataFrame.from_records(Demography.objects.all().values())

    # Group by year_month and direction, summing estimates
    grouped = demography_df.groupby(['year_month', 'direction'])['estimate'].sum().unstack(fill_value=0).reset_index()

    # Prepare data for Chart.js
    chart_data = {
        'labels': grouped['year_month'].tolist(),  # X-axis (time)
        'datasets': [
            {
                'label': 'Arrivals',
                'data': grouped['Arrivals'].tolist(),  # Y-axis data for arrivals
                'borderColor': 'rgba(75, 192, 192, 1)',
                'backgroundColor': 'rgba(75, 192, 192, 0.2)',
                'fill': False
            },
            {
                'label': 'Departures',
                'data': grouped['Departures'].tolist(),  # Y-axis data for departures
                'borderColor': 'rgba(255, 99, 132, 1)',
                'backgroundColor': 'rgba(255, 99, 132, 0.2)',
                'fill': False
            },
        ]
    }

    # Pass the data as JSON to the template
    context = {
        'chart_data': json.dumps(chart_data),  # Convert to JSON for Chart.js
    }

    return render(request, 'data_app/dashboard.html', context)

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