from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from .role_based_url_handler import RoleBasedUrlHandler, BaseHandler
from django.http import JsonResponse
from ..models import Notification, User
import logging

logger = logging.getLogger(__name__)


@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def NotificationDetails(request, user_id):
    return RoleBasedUrlHandler(request, NotificationDetailsView(user_id))


class NotificationDetailsView(BaseHandler):
    def __init__(self, user_id):
        self.user_id = user_id

    def getNotificationDetails(self, request):
        try:
            if request.user.role != User.Role.ADMIN and request.user.user_id != int(
                self.user_id
            ):
                return JsonResponse(
                    {
                        "success": False,
                        "message": "You are not authorized to view these notifications.",
                        "icon": "error",
                    },
                    status=403,
                )

            notifications = (
                Notification.objects.filter(user__user_id=self.user_id)
                .all()
                .values(
                    "notification_id",
                    "user__user_id",
                    "user__name",
                    "user__email",
                    "vehicle__vehicle_id",
                    "vehicle__registration_number",
                    "priority",
                    "message",
                    "created_at",
                )
                .order_by("-created_at")
            )

        except Exception as e:
            logger.error(f"Error fetching notifications: {str(e)}")
            return JsonResponse(
                {
                    "success": False,
                    "message": "An error occurred while fetching notifications.",
                    "icon": "error",
                },
                status=500,
            )

        logger.info(
            f"Notifications fetched successfully for user {self.user_id} by requester {request.user.user_id}"
        )

        return JsonResponse(
            {
                "success": True,
                "message": "Notifications fetched successfully.",
                "icon": "success",
                "data": list(notifications),
            },
            status=200,
        )


@csrf_exempt
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def DeleteNotification(request, notification_id):
    return RoleBasedUrlHandler(request, DeleteNotificationView(notification_id))


class DeleteNotificationView(BaseHandler):
    def __init__(self, notification_id):
        self.notification_id = notification_id

    def deleteDeleteNotification(self, request):
        try:
            notification = (
                Notification.objects.select_related("user")
                .filter(notification_id=self.notification_id)
                .first()
            )

            if not notification:
                return JsonResponse(
                    {
                        "success": False,
                        "message": "Notification not found.",
                        "icon": "error",
                    },
                    status=404,
                )

            if (
                request.user.role != User.Role.ADMIN
                and notification.user
                and notification.user.user_id != request.user.user_id
            ):
                return JsonResponse(
                    {
                        "success": False,
                        "message": "You are not authorized to delete this notification.",
                        "icon": "error",
                    },
                    status=403,
                )

            notification.delete()

        except Exception as e:
            logger.error(f"Error deleting notification: {str(e)}")
            return JsonResponse(
                {
                    "success": False,
                    "message": "An error occurred while deleting notification.",
                    "icon": "error",
                },
                status=500,
            )

        logger.info(
            f"Notification {self.notification_id} deleted by requester {request.user.user_id}"
        )

        return JsonResponse(
            {
                "success": True,
                "message": "Notification deleted successfully.",
                "icon": "success",
            },
            status=200,
        )
