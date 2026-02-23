from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from .role_based_url_handler import RoleBasedUrlHandler, BaseHandler
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from django.db import IntegrityError, DatabaseError
from ..models import Issues
import logging
import json

logger = logging.getLogger(__name__)

@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def IssueDetails(request):
  return RoleBasedUrlHandler(request, IssueDetailsView())

class IssueDetailsView(BaseHandler):
  def getIssueDetails(self, request):
    try:
      issue_details = (
        Issues.objects.filter(vehicle__owner=request.user)
          .all()
      )
    
    except Exception as e:
      logger.error(f"Error fetching issue details: {str(e)}")
      return JsonResponse(
        {
          "success": False,
          "message": "An error occurred while fetching issue details.",
          "icon": "error",
        },
        status=500,
      )
    
    logger.info(f"Issue details fetched successfully for user {request.user.id}")
    
    return JsonResponse(
      {
        "success": True,
        "message": "Issue details fetched successfully.",
        "icon": "success",
        "data": list(issue_details),
      },
      status=200,
    )