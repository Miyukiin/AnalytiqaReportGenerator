import os
import re
from django.conf import settings
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import Http404, HttpRequest, HttpResponse, HttpResponseBadRequest, JsonResponse
from django.middleware.csrf import get_token
import pandas as pd
from .models import Visitors
from django.core.exceptions import ObjectDoesNotExist
from functools import wraps
from django.core.files.base import ContentFile
import google.generativeai as genai
from decouple import config

genai.configure(api_key=settings.API_KEY)

import logging
logger = logging.getLogger(__name__)

# Create your views here.
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
    with open(csv_file_path, encoding="ISO-8859-1") as csv_file:
        logger.info("Reading CSV")
        df:pd.DataFrame = pd.read_csv(csv_file, encoding="ISO-8859-1", encoding_errors='ignore', skip_blank_lines=True, on_bad_lines="skip")
        logger.info("Finished Reading CSV")
        
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

@api_view(['GET'])
def sample_api(request:HttpRequest):
    return Response({'message': 'Testing from Django Backend'})


def validate_uuid(func):
    @wraps(func)
    def wrapper(request:HttpRequest, *args, **kwargs):
        uuid = request.GET.get('uuid')
        if not uuid:
            raise HttpResponseBadRequest("UUID parameter is required.")
        try:
            query_object = Visitors.objects.get(uuid=uuid)
        except ObjectDoesNotExist:
            raise Http404("Visitor with the given UUID does not exist.")
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        
        return func(request, query_object, *args, **kwargs)
    return wrapper

@api_view(['GET'])
@validate_uuid  
def get_table_preview_data(request:HttpRequest, query_object: Visitors):
    if request.method == "GET":
        try:
            logger.info(str(query_object.orig_csv_file))
            preview_data:dict = get_csv_preview_data(str(query_object.orig_csv_file))
            return JsonResponse(preview_data)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@api_view(['GET'])
@validate_uuid  
def get_cleaned_table_preview_data(request:HttpRequest, query_object: Visitors):
    if request.method == "GET":
        try:
            preview_data:dict = get_csv_preview_data(str(query_object.clean_csv_file))
            preview_data['name'] = query_object.file_name
            return JsonResponse(preview_data)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
@validate_uuid
def get_summary_statistics(request:HttpRequest, query_object: Visitors):
    def get_summary_data(csv_file_of_uuid_path: str) -> dict | JsonResponse:
        csv_file_path = os.path.join(settings.MEDIA_ROOT, csv_file_of_uuid_path)
        
        with open(csv_file_path, encoding="ISO-8859-1") as csv_file:
            df:pd.DataFrame = pd.read_csv(csv_file, encoding="ISO-8859-1", encoding_errors='ignore', skip_blank_lines=True, on_bad_lines="skip")
            
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
                        "Standard_Deviation": int(column.std()),
                        "Variance": int(column.var()),
                        "Mean": int(column.mean()),
                        "Median": int(column.median()),
                        "Mode": int(column.mode().iloc[0]) if not column.mode().empty else None,  # Handle empty mode
                        "Quartiles": {
                            "Q1": int(column.quantile(0.25)),
                            "Q2": int(column.quantile(0.5)),
                            "Q3": int(column.quantile(0.75)),
                        },
                    }
                    numeric_columns_stats[column_name] = temp_dict
                data["numeric_columns_stats"] = numeric_columns_stats
            
            return data

    if request.method == "GET":
        try:
            summary_data:dict = get_summary_data(str(query_object.orig_csv_file))
            # Add the file_name as it was originally uploaded
            summary_data['name'] = query_object.file_name
            return JsonResponse(summary_data)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        

@api_view(['PUT'])
def upload_csv(request: HttpRequest):
    if request.method == "PUT":
        csv_file = request.FILES.get("file")
        user_uuid = request.POST.get("uuid")
        csv_file_name = request.POST.get("file_name")
        
        if not csv_file or user_uuid is None:
            return JsonResponse({"error": "File and UUID are required"}, status=400)
        
        entry = Visitors.objects.filter(uuid=user_uuid).first()
        
        if entry:
            entry.orig_csv_file = csv_file  
            entry.clean_csv_file = None
            entry.file_name = csv_file_name
            entry.save()
            return JsonResponse({"message": "CSV file updated successfully!"}, status=200)
        else:
            entry = Visitors(uuid=user_uuid, orig_csv_file=csv_file, file_name= csv_file_name)
            entry.save()
            return JsonResponse({"message": "CSV file uploaded successfully!"}, status=200)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=400)
    
@api_view(['PUT'])
@validate_uuid
def clean_csv(request: HttpRequest, query_object: Visitors):
    def remove_non_ascii(s: str) -> str:
        """Remove non-ASCII characters from a string."""
        return re.sub(r'[^\x00-\x7F]+', '', s)
    if request.method == "PUT":
        try:
            orig_csv_file_path = os.path.join(settings.MEDIA_ROOT, str(query_object.orig_csv_file))
            with open(orig_csv_file_path, mode='r', encoding="ISO-8859-1") as csv_file:
                logger.info("Reading CSV")
                df:pd.DataFrame = pd.read_csv(csv_file, encoding="ISO-8859-1", encoding_errors='ignore', skip_blank_lines=True, on_bad_lines="skip")
                logger.info("Reading CSV Finish")
                
                # Remove non-ASCII characters from all string columns
                for column in df.select_dtypes(include=['object']).columns:
                    logger.info(df[column])
                    df[column] = df[column].apply(lambda x: remove_non_ascii(str(x)) if isinstance(x, str) else x)
                
                # Handle duplicate values
                df = df.drop_duplicates(keep='first')

                # Handling missing values through Imputation and interpolation 
                for column in df.columns:
                    if df[column].isnull().sum() > 0:  # Process only columns with missing values
                        if df[column].isnull().all():  # Handle cases where a column is all-NaN
                            if pd.api.types.is_numeric_dtype(df[column]):
                                df[column] = 0  # Replace all-NaN numeric columns with 0
                            else:
                                df[column] = "not specified"  # Replace all-NaN non-numeric columns with a placeholder
                        elif pd.api.types.is_numeric_dtype(df[column]):
                            # Numeric columns: Interpolate and fallback to median for edge cases such as cannot interpolate for values at each end.
                            df[column] = df[column].interpolate(method='linear', limit_direction='both')
                            df[column] = df[column].fillna(df[column].median())
                        else:
                            # Non-numeric columns: Imputation with pad and fallback to mode or not specified for edge cases.
                            df[column] = df[column].bfill(axis=0)
                            if not df[column].mode().empty:
                                df[column] = df[column].fillna(df[column].mode()[0])
                            else:
                                df[column] = df[column].fillna("not specified")

            # Update the database with the relative path of the cleaned file
            cleaned_csv_content = df.to_csv(index=False,encoding="UTF-8")
            cleaned_csv_file_name = str(query_object.orig_csv_file)[28:-4 ] + "_cleaned.csv" # Orig file name appended.
            cleaned_csv_file = ContentFile(cleaned_csv_content)

            # Delete existing clean_csv_file.
            if query_object.clean_csv_file:
                if os.path.exists(query_object.clean_csv_file.path):
                    os.remove(query_object.clean_csv_file.path)
                    
            query_object.clean_csv_file.save(cleaned_csv_file_name, cleaned_csv_file)
            query_object.save()  # Save changes to the database

            return JsonResponse({
                "message": "CSV cleaned successfully",
                "modified_csv": str(query_object.clean_csv_file)
            })
        
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        
@api_view(['GET'])
@validate_uuid
def download_cleaned_csv(request: HttpRequest, query_object: Visitors):
    if request.method == 'GET':
        try:
            # Get the cleaned file path
            cleaned_csv_path = query_object.clean_csv_file.path

            # Check if the file exists
            if not os.path.exists(cleaned_csv_path):
                return JsonResponse({"error": "Cleaned CSV file not found."}, status=404)

            # Serve the file as a response
            with open(cleaned_csv_path, 'r') as file:
                response = HttpResponse(file.read(), content_type='text/csv')
                response['Access-Control-Expose-Headers'] = 'Content-Disposition' # By default, browsers will block access to custom headers unless the server explicitly allows them in the Access-Control-Expose-Headers header.
                response['Content-Disposition'] = f'attachment; filename="{query_object.file_name}_cleaned.csv"'
            return response
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    

@api_view(['GET'])
@validate_uuid
def get_summary_changes(request: HttpRequest, query_object: Visitors):
    if request.method == "GET":
        try:
            # Get paths of the original and cleaned CSV files
            original_csv_path = os.path.join(settings.MEDIA_ROOT, str(query_object.orig_csv_file))
            cleaned_csv_path = os.path.join(settings.MEDIA_ROOT, str(query_object.clean_csv_file))

            # Check if both files exist
            if not os.path.exists(original_csv_path) or not os.path.exists(cleaned_csv_path):
                return JsonResponse({"error": "CSV files not found."}, status=404)

            # Load both CSVs into dataframes
            
            original_df = pd.read_csv(original_csv_path, encoding="ISO-8859-1", encoding_errors='ignore', skip_blank_lines=True, on_bad_lines="skip")
            cleaned_df = pd.read_csv(cleaned_csv_path, encoding="ISO-8859-1", encoding_errors='ignore', skip_blank_lines=True, on_bad_lines="skip")

             # Align columns and rows of both dataframes
            original_df = original_df.sort_index(axis=1).sort_values(by=original_df.columns.tolist())
            cleaned_df = cleaned_df.sort_index(axis=1).sort_values(by=cleaned_df.columns.tolist())
            
            # Track changes
            comparison_result = {
                "rows_removed": original_df.shape[0] - cleaned_df.shape[0],  # Rows removed (duplicates)
                "missing_values_replaced": 0,  # Count for imputed and interpolated values
                "column_changes": {},  # To track column-level changes
                "removed_columns": [],  # Columns that were dropped
                "non_ascii_values": 0  # Track rows with non-ASCII characters
            }
            # Function to check for non-ASCII characters in a string
            def contains_non_ascii(s):
                return bool(re.search(r'[^\x00-\x7F]+', str(s)))

            # Check for dropped columns (in original_df but not in cleaned_df)
            removed_columns = set(original_df.columns) - set(cleaned_df.columns)
            comparison_result["removed_columns"] = list(removed_columns)

            # Iterate over each column to track imputation and interpolation
            for column in original_df.columns:
                if column in cleaned_df.columns:
                    original_missing = original_df[column].isnull().sum()
                    cleaned_missing = cleaned_df[column].isnull().sum()
                    
                    # Count non-ASCII characters in each cell of the original dataframe
                    non_ascii_count = 0
                    for value in original_df[column]:
                        if contains_non_ascii(value):
                            non_ascii_count += 1

                    if non_ascii_count > 0:
                        comparison_result["non_ascii_values"] += non_ascii_count

                    # Calculate the difference in missing values
                    if original_missing > cleaned_missing:
                        comparison_result["missing_values_replaced"] += int(original_missing - cleaned_missing)

                    # Simulate dropping of duplicate rows to allow comparison (same shape of columns) and identify how many changes per column occurred.
                    temp_df = original_df.drop_duplicates(keep="first")
                    
                     # Reset index for both cleaned_df and temp_df to align the rows properly
                    temp_df = temp_df.reset_index(drop=True)
                    cleaned_column = cleaned_df[column].reset_index(drop=True)

                    # Compare the values in each column (fill NaN with empty string to compare properly)
                    changes_in_column = cleaned_column.fillna('') != temp_df[column].fillna('')
                    
                    if changes_in_column.any():
                        comparison_result["column_changes"][column] = int(changes_in_column.sum())

            # Return the comparison summary
            return JsonResponse(comparison_result)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
@validate_uuid
def retrieve_chart_data(request: HttpRequest, query_object: Visitors):
    if request.method == "GET":
        try:
            chartData: dict[list[str | int]] = {}

            if query_object.clean_csv_file:
                csv_path = str(query_object.clean_csv_file)
            else:
                csv_path = str(query_object.orig_csv_file)

                
            csv_file_path = os.path.join(settings.MEDIA_ROOT, csv_path)
            
            with open(csv_file_path, encoding='utf-8') as csv_file:
                df:pd.DataFrame = pd.read_csv(csv_file, encoding="UTF-8")
                df = df.fillna(value="") # Handle missing values as empty strings.
                
                csv_column_headers = df.columns.to_list()
                
                for column in csv_column_headers:
                   column_values = df[column].to_list()
                   chartData[column] = column_values
            
            return JsonResponse(chartData)  
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        
def csrf_token_view(request: HttpRequest):
    return JsonResponse({"csrfToken": get_token(request)})

@api_view(['POST'])
def generate_ai_remarks(request: HttpRequest):
    if request.method == "POST":
        chart_type:str = request.data.get("chart_type")
        chart_data:list[dict] = request.data.get("chart_data")
        
        logger.info(chart_type)
        logger.info(chart_data)
        
        if not chart_type or not chart_data:
                return JsonResponse({'error': "No Chart Type or Chart Data provided"}, status=400)

        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"Given the following chart data that I used in chart type {chart_type}, generate remarks and insights in the form of one paragraph, with a minimum of five sentences:\n"
        for item in chart_data:
            prompt += f"Point: x = {item['x']}, y = {item['y']}\n"
        
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content([prompt])
        
        try:
            remarks = response.text
        except AttributeError:
            return JsonResponse({'error': 'Unexpected response format or no content found'}, status=500)

        # Return the AI-generated remarks
        return JsonResponse({'remarks': remarks}, status=200)