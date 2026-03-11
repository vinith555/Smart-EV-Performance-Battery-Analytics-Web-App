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
                    "service_id",
                    "vehicle_id",
                    "vehicle__vehicle_model",
                    "vehicle__registration_number",
                    "serviceman__user_id",
                    "serviceman__email",
                    "start_time",
                    "deadline",
                    "assigned_by__user_id",
                    "assigned_by__email",
                    "assigned_to__user_id",
                    "assigned_to__email",
                    "priority",
                    "status",
                    "sla_time",
                    "sla_status",
                    "notes",
                    "rating",
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

        logger.info(
            f"Service details fetched successfully for user {request.user.user_id}"
        )

        return JsonResponse(
            {
                "success": True,
                "message": "Service details fetched successfully.",
                "icon": "success",
                "data": list(service_details),
            },
            status=200,
        )


@csrf_exempt
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def UpdateServiceStatus(request, service_id):
    role = getattr(request.user, "role", None)
    if role != "SERVICE":
        return JsonResponse(
            {"success": False, "message": "Unauthorized. SERVICE role required."},
            status=403,
        )

    try:
        service = Service.objects.get(service_id=service_id, serviceman=request.user)
    except Service.DoesNotExist:
        return JsonResponse(
            {"success": False, "message": "Service record not found."},
            status=404,
        )

    new_status = request.data.get("status")
    allowed = ["PENDING", "ONGOING", "COMPLETED"]
    if new_status not in allowed:
        return JsonResponse(
            {
                "success": False,
                "message": f"Invalid status. Must be one of: {', '.join(allowed)}.",
            },
            status=400,
        )

    service.status = new_status
    service.save()

    logger.info(
        f"Service {service_id} status updated to {new_status} by user {request.user.user_id}"
    )

    return JsonResponse(
        {
            "success": True,
            "message": "Service status updated successfully.",
            "icon": "success",
        },
        status=200,
    )
