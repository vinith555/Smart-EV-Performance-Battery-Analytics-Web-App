from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from .role_based_url_handler import RoleBasedUrlHandler, BaseHandler
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from django.db import IntegrityError, DatabaseError
from ..models import Vehicle, VehicleStats
import logging
import json

logger = logging.getLogger(__name__)

@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def VehicleDetails(request):
  return RoleBasedUrlHandler(request, VehicleDetailsView())

class VehicleDetailsView(BaseHandler):
  def getVehicleDetails(self, request):
    try:
      vehicle = (
        Vehicle.objects.filter(owner=request.user).all()
      )
    
    except Exception as e:
      logger.error(f"Error fetching vehicle details: {str(e)}")
      return JsonResponse(
        {
          "success": False,
          "message": "An error occurred while fetching vehicle details.",
          "icon": "error",
        },
        status=500,
      )
      
    try:
      vehicle_stats = VehicleStats.objects.filter(vehicle__owner=request.user).all()
    except Exception as e:
      logger.error(f"Error fetching vehicle stats: {str(e)}")
      return JsonResponse(
        {
          "success": False,
          "message": "An error occurred while fetching vehicle stats.",
          "icon": "error",
        },
        status=500,
      )
    
    logger.info(f"Vehicle details fetched successfully for user {request.user.id}")
    
    return JsonResponse(
      {
        "success": True,
        "message": "Vehicle details fetched successfully.",
        "icon": "success",
        "data": {
          "vehicle": list(vehicle),
          "vehicle_stats": list(vehicle_stats),
        },
      },
      status=200,
    )
    
@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def GetChargingDetails(request):
  return RoleBasedUrlHandler(request, chargingDetailsView())

class chargingDetailsView(BaseHandler):
  def getChargingDetails(self, request):
    try:
      vehicle_stats = VehicleStats.objects.filter(vehicle__owner=request.user).all()
    except Exception as e:
      logger.error(f"Error fetching vehicle stats: {str(e)}")
      return JsonResponse(
        {
          "success": False,
          "message": "An error occurred while fetching vehicle stats.",
          "icon": "error",
        },
        status=500,
      )
    
    logger.info(f"Vehicle stats fetched successfully for user {request.user.id}")
    
    return JsonResponse(
      {
        "success": True,
        "message": "Vehicle stats fetched successfully.",
        "icon": "success",
        "data": {
          "vehicle_stats": list(vehicle_stats),
        },
      },
      status=200,
    )