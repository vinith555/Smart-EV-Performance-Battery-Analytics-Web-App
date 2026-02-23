from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from .role_based_url_handler import RoleBasedUrlHandler, BaseHandler
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from django.db import IntegrityError, DatabaseError
from ..models import Vehicle, User
import logging
import json

logger = logging.getLogger(__name__)

@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def UserDetailsByVehicle(request):
  return RoleBasedUrlHandler(request, UserDetailsView())

class UserDetailsView(BaseHandler):
  def GetUserDetailsByVehicle(self, request):
    try:
      user_details = (
        Vehicle.objects.filter(owner=request.user)
          .values("owner__id", "owner__username", "owner__email", "vehicle_model", "vehicle_colour", "registration_number")
          .distinct()
      )
    
    except Exception as e:
      logger.error(f"Error fetching user details: {str(e)}")
      return JsonResponse(
        {
          "success": False,
          "message": "An error occurred while fetching user details.",
          "icon": "error",
        },
        status=500,
      )
    
    logger.info(f"User details fetched successfully for user {request.user.id}")
    
    return JsonResponse(
      {
        "success": True,
        "message": "User details fetched successfully.",
        "icon": "success",
        "data": list(user_details),
      },
      status=200,
    )