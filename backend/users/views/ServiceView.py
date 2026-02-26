from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from .role_based_url_handler import RoleBasedUrlHandler, BaseHandler
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from django.db import IntegrityError, DatabaseError
from ..models import Service
import logging
import json

logger = logging.getLogger(__name__)

@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ServiceDetails(request):
  return RoleBasedUrlHandler(request, ServiceDetailsView())

class ServiceDetailsView(BaseHandler):
  def getServiceDetails(self, request):
    try:
      service_details = (
        Service.objects.filter(serviceman=request.user)
          .all()
          .values(
            'service_id', 'vehicle_id', 'serviceman__user_id', 'serviceman__email',
            'start_time', 'deadline', 'assigned_by__user_id', 'assigned_by__email',
            'assigned_to__user_id', 'assigned_to__email', 'priority', 'status',
            'sla_time', 'sla_status', 'notes', 'rating'
          )
      )
    
    except Exception as e:
      logger.error(f"Error fetching service details: {str(e)}")
      return JsonResponse(
        {
          "success": False,
          "message": "An error occurred while fetching service details.",
          "icon": "error",
        },
        status=500,
      )
    
    logger.info(f"Service details fetched successfully for user {request.user.user_id}")
    
    return JsonResponse(
      {
        "success": True,
        "message": "Service details fetched successfully.",
        "icon": "success",
        "data": list(service_details),
      },
      status=200,
    )