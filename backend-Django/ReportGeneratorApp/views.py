from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import HttpRequest, JsonResponse
from django.middleware.csrf import get_token
import pandas as pd
from .models import Visitors
from .utils import get_summary_data, get_csv_preview_data
from django.core.exceptions import ObjectDoesNotExist

import logging
logger = logging.getLogger(__name__)

# Create your views here.

@api_view(['GET'])
def sample_api(request:HttpRequest):
    return Response({'message': 'Testing from Django Backend'})


@api_view(['GET'])
def get_table_preview_data(request:HttpRequest):
    if request.method == "GET":
        uuid = request.GET.get('uuid')
        if not uuid:
            return JsonResponse({"error": "UUID parameter is required."}, status=400)

        try:
            query_object  = Visitors.objects.get(uuid=uuid)
            summary_data:dict = get_csv_preview_data(str(query_object.orig_csv_file))
            return JsonResponse(summary_data)
        
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Visitor with the given UUID does not exist."}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
def get_summary_statistics(request:HttpRequest):
    if request.method == "GET":
        uuid = request.GET.get('uuid')
        if not uuid:
            return JsonResponse({"error": "UUID parameter is required."}, status=400)

        try:
            query_object = Visitors.objects.get(uuid=uuid)
            summary_data:dict = get_summary_data(str(query_object.orig_csv_file))
            # Add the file_name as it was originally uploaded
            summary_data['name'] = query_object.file_name
            return JsonResponse(summary_data)
        
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Visitor with the given UUID does not exist."}, status=404)

        except Exception as e:
            logger.info(str(e))
            return JsonResponse({"error": str(e)}, status=500)
        

@api_view(['PUT'])
def upload_csv(request: HttpRequest):
    if request.method == "PUT":
        csv_file = request.FILES.get("file")
        user_uuid = request.POST.get("uuid")
        csv_file_name = request.POST.get("file_name")
        
        if not csv_file or user_uuid is None:
            return JsonResponse({"error": "File and UUID are required"}, status=400)
        
        logger.info(f"User UUID: {user_uuid}")
        
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

def csrf_token_view(request):
    return JsonResponse({"csrfToken": get_token(request)})