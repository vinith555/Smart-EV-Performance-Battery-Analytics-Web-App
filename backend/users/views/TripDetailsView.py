from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from .role_based_url_handler import RoleBasedUrlHandler, BaseHandler
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from django.db import IntegrityError, DatabaseError
from ..models import Trip
import logging
import json

logger = logging.getLogger(__name__)


@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def TripDetails(request):
    return RoleBasedUrlHandler(request, TripDetailsView())


class TripDetailsView(BaseHandler):
    def getTripDetails(self, request):
        try:
            # Get vehicle_id from query parameters if provided
            vehicle_id = request.query_params.get("vehicle_id")

            # Base query: filter by user
            trip_queryset = Trip.objects.filter(vehicle__owner=request.user)

            # If vehicle_id is provided, filter by that specific vehicle
            if vehicle_id:
                trip_queryset = trip_queryset.filter(vehicle_id=vehicle_id)

            trip_details = trip_queryset.all().values(
                "trip_id",
                "vehicle_id",
                "start_date",
                "end_date",
                "start_location",
                "end_location",
                "distance",
                "duration",
                "average_speed",
                "battery_used",
                "cost",
                "efficiency",
                "status",
                "notes",
            )

        except Exception as e:
            logger.error(f"Error fetching trip details: {str(e)}")
            return JsonResponse(
                {
                    "success": False,
                    "message": "An error occurred while fetching trip details.",
                    "icon": "error",
                },
                status=500,
            )

        logger.info(
            f"Trip details fetched successfully for user {request.user.user_id}"
            + (f" and vehicle {vehicle_id}" if vehicle_id else "")
        )

        return JsonResponse(
            {
                "success": True,
                "message": "Trip details fetched successfully.",
                "icon": "success",
                "data": list(trip_details),
            },
            status=200,
        )
