from django.urls import path
from .views import *

urlpatterns = [
    path('api/sample/', sample_api, name="sample"),
    path('api/upload/', gather_file_data, name="upload"),
    path("api/csrf-token/", csrf_token_view, name="csrf_token"),
    path("api/csv-upload/", upload_csv, name="upload_csv")
]