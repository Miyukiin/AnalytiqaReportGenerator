import os
import re
from typing import Counter
from django.conf import settings
from django.shortcuts import get_object_or_404, render
import numpy as np
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
        logger.info("Printing File Name:", csv_file_name)
        
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
                        
                    logger.info(comparison_result)


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
def generate_ai_remarks(request:HttpRequest):
    if request.method == "POST":
        # Get chart data from request
        chart_array = request.data.get("chart_array_on_page")
        dataset = request.data.get("entire_dataset")

        if not chart_array or not isinstance(chart_array, list):
            return JsonResponse({'error': "Invalid or missing chart data"}, status=400)

        logger.info(f"Received chart data: {chart_array}")

        try:
            # Initialize the Gemini model
            model = genai.GenerativeModel("gemini-1.5-flash")
            remarks = ""

            # Iterate over each chart in the array
            for index, chart in enumerate(chart_array):
                chart_type = chart.get("type", "Unknown")
                chart_name = chart.get("title", "Untitled")
                chart_data = chart.get("data", [])

                if not chart_data:
                    remarks += f"For Chart Name: {chart_name} with Chart Type {chart_type}.\nNo data available for analysis.\n"
                    continue

                # Build the prompt for the current chart
                prompt = (
                    f"I am using Python. I am building a Data Report Generator. I am tasking you to generates, insights, relationships and remarks between the data I provide to you."
                    f"Respond in the form of one paragraph, with a minimum of five sentences. "
                    f"Data is {chart_data}, sourced from {dataset}. The Data Chart type is {chart_type} and Chart Name is {chart_name}. If I have specified no name, you must use \"Chart Number {index+1}\"#\n"
                    f"Follow the response format:\n"
                    f"Begin with Specifying the Chart Name and Chart Type.\n"
                    f"As an example\n"
                    f"For Chart Name: <Chart Name Value here or the default that I have specified>\n"
                    f"For Chart Type: <Chart Type Value here>\n"
                    f"Then your insights in a newline.\n"
                )

                # Generate content using the Gemini model
                response = model.generate_content([prompt])

                # Append the response to the remarks
                if response and hasattr(response, "text"):
                    remarks += f"\n{response.text.strip()}\n"
                else:
                    remarks += f"For Chart Name: {chart_name} with Chart Type {chart_type}.\nUnable to generate insights for this chart.\n"

            # Return the concatenated remarks
            return JsonResponse({'remarks': remarks}, status=200)

        except Exception as e:
            logger.error(f"Error generating AI remarks: {e}")
            return JsonResponse({'error': str(e)}, status=500)

    
@api_view(['DELETE'])
def delete_clean_csv(request: HttpRequest, uuid: str):
    if request.method == "DELETE":
        try:
            # Retrieve the visitor object
            query_object = get_object_or_404(Visitors, uuid=uuid)

            # Check if the visitor has a clean CSV file
            if query_object.clean_csv_file:
                # Remove the clean CSV file from the file system
                clean_csv_file_path = query_object.clean_csv_file.path
                if os.path.exists(clean_csv_file_path):
                    os.remove(clean_csv_file_path)
                
                # Remove the file reference in the database
                query_object.clean_csv_file = None
                query_object.save()  # Save the updated Visitor instance

                return Response({"message": "Clean CSV file deleted successfully."}, status=200)
            else:
                return Response({"message": "No clean CSV file found for this visitor."}, status=404)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
        
import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
def calculate_radial_data(request: HttpRequest):
    def calculate_bins_for_numeric_column(column_values: np.ndarray, num_bins=5):
        min_value = column_values.min()
        max_value = column_values.max()
        bins = pd.cut(column_values, bins=num_bins, right=False).categories
        categorized_data = pd.cut(column_values, bins=bins, right=False, include_lowest=True)
        bin_counts = categorized_data.value_counts().to_dict()
        return bin_counts

    def calculate_category_counts(column_values):
        return dict(Counter(column_values))

    if request.method == "POST":
        try:
            dataset = request.data.get("dataset")
            radial_column = request.data.get("RadialColumn")
            logger.info("Printing Dataset %s", dataset)
            logger.info("RadialColumn: %s", radial_column)

            radial_bar_data = {}

            if radial_column in dataset:
                values: list[int | str | bool] = dataset[radial_column]
                
                 # Check if the column is entirely boolean
                if all(isinstance(value, bool) for value in values):
                    # Handle boolean column
                    boolean_counts = calculate_category_counts(values)
                    radial_bar_data[radial_column] = boolean_counts
                else:
                    # Convert to numeric values using pandas, but only if not entirely boolean
                    numeric_values: np.ndarray = pd.to_numeric(values, errors='coerce')

                    # Handle NaN count
                    nan_count = np.isnan(numeric_values).sum()  # Using numpy to check NaN
                    logger.info("NaN count in numeric values: %d", nan_count)

                    if nan_count == 0:  # If there are no NaNs, the column is entirely numeric
                        bin_counts = calculate_bins_for_numeric_column(numeric_values)
                        bin_ranges = {f"{bin.left}-{bin.right}": count for bin, count in bin_counts.items()}
                        radial_bar_data[radial_column] = bin_ranges
                    else:  # May be a mix of data types. Numeric, Categorical or Boolean or None Type.
                        numeric_column = numeric_values[~np.isnan(numeric_values)]  # Get valid numeric values
                        categorical_column = [value for value, isnan in zip(values, np.isnan(numeric_values)) if isnan]  # Get non-numeric values
                        
                        # Handle boolean values (True/False) explicitly
                        boolean_column = [value for value in values if isinstance(value, bool)]

                        # If any type of mix exist, raise an error
                        if (numeric_column.size > 0 and len(categorical_column) > 0) or (numeric_column.size > 0 and len(boolean_column) > 0) or (len(categorical_column) > 0 and len(boolean_column) > 0):
                            return Response({"error": "Cannot process column with mixed data types of numeric and categorical, boolean or None"}, status=400)
                                         
                        if categorical_column:
                            category_counts = calculate_category_counts(categorical_column)
                            radial_bar_data[radial_column] = category_counts
                        else:
                            return Response({"error": "No valid data found in the column or Cannot process column with mixed data types of numeric and categorical, boolean or None"}, status=400)
                    
                logger.info(radial_bar_data)
            return Response({"radialBarData": radial_bar_data}, status=200)

        except Exception as e:
            logger.error(f"Error processing data: {e}")
            return Response({"error": str(e)}, status=500)


