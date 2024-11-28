
# New Zealand Migration Dashboard

This is a Django-based web application that provides insights into migration data in New Zealand. The dashboard includes visualizations and filters for analyzing migration trends by gender, age group, and direction (Arrivals/Departures). 

## Project Overview
This project, New Zealand Migration Dashboard, was developed as the final assessment for the Data Analytics subject of the Master of Information Technology program at Eastern Institute of Technology (EIT), New Zealand. The dashboard provides comprehensive visual insights into migration trends, including arrivals, departures, and demographic analysis, offering an interactive interface for data exploration and analysis. 

Special thanks and credit to **Dr. Farhad Mehdipour** for his invaluable guidance and support throughout the development of this project.

## Live Production Deployment
The New Zealand Migration Dashboard is already live and accessible in production. You can view the dashboard at the following URL: [New Zealand Migration Dashboard](https://nz-migration-dashboard-fecqhwd0ezhnhcdk.australiasoutheast-01.azurewebsites.net/). on Azure. 

[Dashboard UI](https://github.com/ayeshrodz/nz-migration-stats/blob/main/core/data/dashboard_ui.png)

This deployment is hosted on **Microsoft Azure** and leverages a CI/CD pipeline established between GitHub and Azure. With this setup, every push to the GitHub repository's main branch triggers an automated deployment to Azure, ensuring that the live dashboard is always up to date with the latest changes in the codebase. This pipeline streamlines development and deployment, making the process efficient and reliable.

---

## Features

- Interactive migration dashboard with charts and filters.
- Visualizations of migration trends (line, bar, pie, doughnut charts).
- Responsive design with a sticky navbar.
- Filter dataset by date range, gender, age group, and direction.

---

## Prerequisites

Before you can run this application, make sure you have the following installed on your system:

1. **Python 3.7 or higher**
2. **Django 4.x** (or the compatible version listed in `requirements.txt`)
3. **Pip** (Python package manager)
4. **Virtual Environment (Optional but recommended)**

---

## Setup Instructions

1. **Clone the Repository**  
   Clone this project to your local machine using the following command:

   ```bash
   git clone https://github.com/your-username/nz-migration-stats.git
   ```

2. **Navigate to the Project Directory**  
   Move into the project directory:
   ```bash
   cd nz-migration-stats
   ```

3. **Create a Virtual Environment** (Optional)  
   It's recommended to use a virtual environment to manage dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # For Linux/Mac
   venv\Scripts\activate     # For Windows
   ```

4. **Install Dependencies**  
   Install the required Python packages using pip:
   ```bash
   pip install -r requirements.txt
   ```

5. **Apply Migrations**  
   Set up the database by applying migrations:
   ```bash
   python manage.py migrate
   ```

6. **Load Initial Data** (Optional)  
   If there is a fixture file available, load it into the database:
   ```bash
   python manage.py loaddata
   ```

7. **Run the Development Server**  
   Start the Django development server:
   ```bash
   python manage.py runserver
   ```

---

## Access the Application

Once the server is running, you can access the application using the following URLs:

1. **Main Dashboard**  
   Access the migration dashboard at:
   ```
   http://localhost:8000/
   ```

2. **Admin Panel**  
   Access the Django admin panel for managing data (if enabled):
   ```
   http://localhost:8000/admin/
   ```

3. **Data Page**  
   If configured, access data tables at:
   ```
   http://localhost:8000/data/
   ```

---

## File Structure

- **`data_app/`**  
  Contains the main application logic, including views, models, templates, and URLs.

- **`templates/`**  
  Contains HTML templates for rendering views.

- **`static/`**  
  Stores static files like CSS, JavaScript, and images.

- **`requirements.txt`**  
  A list of Python dependencies for the project.

---

## Troubleshooting

- **Issue:** Cannot start the server due to missing dependencies.  
  **Solution:** Ensure you installed dependencies using `pip install -r requirements.txt`.

- **Issue:** Access denied to the admin panel.  
  **Solution:** Create a superuser account using:
  ```bash
  python manage.py createsuperuser
  ```

- **Issue:** Charts or filters are not working.  
  **Solution:** Check your browser's console for JavaScript errors and ensure all required libraries (Chart.js, Bootstrap) are properly loaded.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contributing

Feel free to submit issues or pull requests to improve the project. Contributions are welcome!

---

## Contact

For queries or support, contact the developer:

**Name:** Ayesh Rodrigo  
**Email:** ayeshrodz@gmail.com  
**GitHub:** [@ayeshrodz](https://github.com/ayeshrodz)
