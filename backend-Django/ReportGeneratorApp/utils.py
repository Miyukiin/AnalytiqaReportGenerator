import django
import os, sys

# Add the project directory to sys.path
sys.path.append('d:/My Files (LATEST)/Coding/Django-ReactJS Projects/AnalytiqaReportGenerator/backend-Django')

# Explicitly set the DJANGO_SETTINGS_MODULE environment variable
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'AnalytiqaReportGenerator.settings')

# Initialize Django settings
django.setup()

from django.http import JsonResponse
import pandas as pd
from django.conf import settings

def get_csv_preview_data(csv_file_of_uuid_path: str) -> dict | JsonResponse:
    TYPE_MAPPING = {
            "object": "string",
            "int64": "number",
            "float64": "number",
            "bool": "boolean",
    }
    data = {} 
    headers = {}   
    
    csv_file_path = os.path.join(settings.MEDIA_ROOT, csv_file_of_uuid_path)
    
    with open(csv_file_path) as csv_file:
        df = pd.read_csv(csv_file, encoding="UTF-8")
         
        # Extract column headers and dtypes
        for column in df.columns:
            dtype = str(df[column].dtype)
            ts_type = TYPE_MAPPING.get(dtype, "any")  # Default to "any" if no mapping is found
            headers[column] = ts_type
            
        data["headers_types"] = headers
        
        # Include CSV rows as an array of dictionaries
        df = df.where(pd.notnull(df), "") # Replace Nan, None null things with empty string for mapping
        data["data"] = df.to_dict(orient="records")  # Converts each row into a dictionary
        
        return data


def get_summary_data(csv_file_of_uuid_path: str) -> dict | JsonResponse:
    csv_file_path = os.path.join(settings.MEDIA_ROOT, csv_file_of_uuid_path)
    
    with open(csv_file_path) as csv_file:
        df = pd.read_csv(csv_file, encoding="UTF-8")
        
        if df.empty:
            return JsonResponse({"error": "The uploaded CSV file is empty"}, status=400)
        
        data = {"name": os.path.basename(csv_file_path)}
        
        
        # Get row and column count of csv file
        data["row_count"] = df.shape[0]
        data["column_count"] = df.shape[1]
        
        # Get Duplicate and Unique Count
        duplicate_count = int(df.duplicated().sum())
        data["duplicate_count"] = duplicate_count
        data["unique_count"] = len(df) - duplicate_count
        
        # Get number of blank cells
        data["total_number_blank_cells"] = int(df.isna().sum().sum())
        
        # Numeric Columns Data
        # Select numeric columns only
        numeric_columns = df.select_dtypes(include="number")
        numeric_columns_stats = {}
        
        if not numeric_columns.empty:
            # Calculate statistical measures for each numeric column, if exists
            for column_name in numeric_columns.columns:
                column = numeric_columns[column_name]
                temp_dict = {
                    "Min": int(column.min()),
                    "Max": int(column.max()),
                    "Standard Deviation": int(column.std()),
                    "Variance": int(column.var()),
                    "Mean": int(column.mean()),
                    "Median": int(column.median()),
                    "Mode": int(column.mode().iloc[0]) if not column.mode().empty else None,  # Handle empty mode
                    "Quartiles": {
                        "Q1": int(column.quantile(0.25)),
                        "Q2 (Median)": int(column.quantile(0.5)),
                        "Q3": int(column.quantile(0.75)),
                    },
                }
                numeric_columns_stats[column_name] = temp_dict
            data["numeric_columns_stats"] = numeric_columns_stats
        
        return data
        

if __name__ == "__main__":
    print(settings.MEDIA_ROOT)
    