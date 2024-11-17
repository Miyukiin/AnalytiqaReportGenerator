from django.urls import path
from .views import sample_api

urlpatterns = [
    path('api/sample/', sample_api),
]