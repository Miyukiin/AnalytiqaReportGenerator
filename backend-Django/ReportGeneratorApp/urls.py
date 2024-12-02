from django.urls import path
from .views import *

urlpatterns = [
    path('api/sample/', sample_api, name="sample"),
    path("api/csrf-token/", csrf_token_view, name="csrf_token"),
    path("api/csv-upload/", upload_csv, name="upload_csv"),
    path('api/csv/get-summary-statistics/', get_summary_statistics, name="get_summary_statistics"),
    path('api/csv/get-table-preview-data/', get_table_preview_data, name="get_table_preview_data"),
    path('api/csv/get-cleaned-table-preview-data/', get_cleaned_table_preview_data, name="get_cleaned_table_preview_data"),
    path('api/csv/clean/', clean_csv, name ="clean_csv"),
    path('api/csv/download-cleaned-csv/', download_cleaned_csv, name="download_cleaned_csv"),
    path('api/csv/get-summary-changes/', get_summary_changes, name="get_summary_changes")
]