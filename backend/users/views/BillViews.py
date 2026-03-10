from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from .role_based_url_handler import RoleBasedUrlHandler, BaseHandler
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from django.db import IntegrityError, DatabaseError
from ..models import Bill, Vehicle
import logging
import json

logger = logging.getLogger(__name__)


@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def BillDetails(request):
    return RoleBasedUrlHandler(request, BillDetailsView())


class BillDetailsView(BaseHandler):
    def getBillDetails(self, request):
        try:
            # Get bills for vehicles owned by the current user
            bills = (
                Bill.objects.filter(customer=request.user)
                .select_related("vehicle", "service", "issue")
                .all()
                .values(
                    "bill_id",
                    "vehicle__registration_number",
                    "vehicle__vehicle_model",
                    "service__service_id",
                    "issue__issue_id",
                    "bill_date",
                    "due_date",
                    "subtotal",
                    "tax_percentage",
                    "tax_amount",
                    "discount",
                    "total_amount",
                    "payment_status",
                    "payment_method",
                    "payment_date",
                    "notes",
                )
            )

        except Exception as e:
            logger.error(f"Error fetching bill details: {str(e)}")
            return JsonResponse(
                {
                    "success": False,
                    "message": "An error occurred while fetching bill details.",
                    "icon": "error",
                },
                status=500,
            )

        logger.info(
            f"Bill details fetched successfully for user {request.user.user_id}"
        )

        return JsonResponse(
            {
                "success": True,
                "message": "Bill details fetched successfully.",
                "icon": "success",
                "data": {
                    "bills": list(bills),
                },
            },
            status=200,
        )
