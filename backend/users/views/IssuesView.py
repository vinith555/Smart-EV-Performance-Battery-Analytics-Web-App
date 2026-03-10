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


@csrf_exempt
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def DeleteIssue(request, issue_id):
    try:
        # Get the issue and verify it belongs to the user
        issue = Issues.objects.get(issue_id=issue_id, vehicle__owner=request.user)

        issue_info = f"Issue {issue.issue_id} - {issue.category}"
        issue.delete()

        logger.info(
            f"Issue deleted successfully: {issue_info} by user {request.user.user_id}"
        )

        return JsonResponse(
            {
                "success": True,
                "message": "Issue deleted successfully.",
                "icon": "success",
            },
            status=200,
        )

    except Issues.DoesNotExist:
        logger.warning(
            f"Issue {issue_id} not found or unauthorized access by user {request.user.user_id}"
        )
        return JsonResponse(
            {
                "success": False,
                "message": "Issue not found or you don't have permission to delete it.",
                "icon": "error",
            },
            status=404,
        )

    except Exception as e:
        logger.error(f"Error deleting issue {issue_id}: {str(e)}")
        return JsonResponse(
            {
                "success": False,
                "message": "An error occurred while deleting the issue.",
                "icon": "error",
            },
            status=500,
        )


class IssueDetailsView(BaseHandler):
    def getIssueDetails(self, request):
        try:
            issue_details = (
                Issues.objects.filter(vehicle__owner=request.user)
                .all()
                .values(
                    "issue_id",
                    "vehicle_id",
                    "vehicle__registration_number",
                    "category",
                    "description",
                    "date_reported",
                    "date_completed",
                    "assigned_to__user_id",
                    "assigned_to__email",
                    "assigned_by__user_id",
                    "assigned_by__email",
                    "priority",
                    "is_resolved",
                    "cost",
                )
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

        logger.info(
            f"Issue details fetched successfully for user {request.user.user_id}"
        )

        return JsonResponse(
            {
                "success": True,
                "message": "Issue details fetched successfully.",
                "icon": "success",
                "data": list(issue_details),
            },
            status=200,
        )
