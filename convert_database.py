import pandas as pd
import sqlite3

# File paths
demography_file = './database/demography.csv'
visa_country_file = './database/visa_country.csv'

# Load the CSV files into pandas DataFrames
demography_df = pd.read_csv(demography_file)
visa_country_df = pd.read_csv(visa_country_file)

# Define the SQLite database name
db_name = './database/datasets.db'

# Create an SQLite connection
conn = sqlite3.connect(db_name)

# Save the dataframes to the SQLite database
demography_df.to_sql('demography', conn, if_exists='replace', index=False)
visa_country_df.to_sql('visa_country', conn, if_exists='replace', index=False)

# Close the connection
conn.close()

print(f"SQLite database '{db_name}' has been created with tables 'demography' and 'visa_country'.")