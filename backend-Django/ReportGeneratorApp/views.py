from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import HttpRequest, JsonResponse
from django.middleware.csrf import get_token
import pandas as pd

import logging
logger = logging.getLogger(__name__)

# Create your views here.

@api_view(['GET'])
def sample_api(request:HttpRequest):
    return Response({'message': 'Testing from Django Backend'})


@api_view(['POST'])
def upload_csv(request:HttpRequest):
    if request.method =="POST":
        
        return JsonResponse({"message": "All Good"}, status=200)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=400)


@api_view(['POST'])
def gather_file_data(request:HttpRequest):
    if request.method == "POST":
        uploaded_file = request.FILES.get("file")
        
        if not uploaded_file:
            return JsonResponse({"error": "No file uploaded"}, status=400)
        
        try:
            context = {"name": uploaded_file.name, "size": uploaded_file.size}
            df = pd.read_csv(uploaded_file, encoding="UTF-8")
            
            if df.empty:
                return JsonResponse({"error": "The uploaded CSV file is empty"}, status=400)

            # Get row and column count of csv file
            context["row_count"] = df.shape[0]
            context["column_count"] = df.shape[1]
            
            # Get Duplicate and Unique Count
            duplicate_count = int(df.duplicated().sum())
            context["duplicate_count"] = duplicate_count
            context["unique_count"] = len(df) - duplicate_count
            
            # Get number of blank cells
            context["total_number_blank_cells"] = int(df.isna().sum().sum())
            
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
                context["numeric_columns_stats"] = numeric_columns_stats
                
                # Get Headers, Data Type and Data of CSV File to display in Preview. 
                TYPE_MAPPING = {
                    "object": "string",
                    "int64": "number",
                    "float64": "number",
                    "bool": "boolean",
                }
                
                # Extract column headers and dtypes
                headers = {}

                for column in df.columns:
                    dtype = str(df[column].dtype)
                    ts_type = TYPE_MAPPING.get(dtype, "any")  # Default to "any" if no mapping is found
                    headers[column] = ts_type
                    
                context["headers_types"] = headers
                
                # Include CSV rows as an array of dictionaries
                df = df.where(pd.notnull(df), "") # Replace Nan, None null things with empty string for mapping
                context["data"] = df.to_dict(orient="records")  # Converts each row into a dictionary
                    
            return JsonResponse(context)
        
        except UnicodeDecodeError:
            return JsonResponse({"error": "File encoding is not UTF-8"}, status=400)
        except Exception as e:
            logger.info(e)
            return JsonResponse({"error": f"Error processing file: {str(e)}"}, status=400)
        
    return JsonResponse({"error": "Invalid request method"}, status=405)

def csrf_token_view(request):
    return JsonResponse({"csrfToken": get_token(request)})