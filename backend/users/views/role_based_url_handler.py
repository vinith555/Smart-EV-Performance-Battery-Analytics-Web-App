from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
import logging

logger = logging.getLogger(__name__)


class BaseHandler:
    """
    Base handler class for role-based view handling.
    All view handlers should inherit from this class.
    """

    def handle_request(self, request):
        """
        Override this method in subclasses to handle the request logic.
        """
        raise NotImplementedError("Subclasses must implement handle_request method")


class RoleBasedUrlHandler:
    """
    Handles role-based URL routing and delegates to appropriate handler methods.
    Maps HTTP methods to handler class methods based on request type and user role.
    """

    def __new__(cls, request, handler: BaseHandler):
        """
        Route the request to the appropriate handler method based on HTTP method.

        Args:
            request: Django HTTP request object
            handler: Instance of BaseHandler subclass

        Returns:
            JSON response from handler method
        """
        try:
            # Check if user is authenticated
            if not request.user.is_authenticated:
                return JsonResponse(
                    {
                        "success": False,
                        "message": "User is not authenticated.",
                        "icon": "error",
                    },
                    status=401,
                )

            # Get user role
            user_role = getattr(request.user, "role", None)

            # Map HTTP methods to handler methods
            method_mapping = {
                "GET": "get",
                "POST": "post",
                "PUT": "put",
                "DELETE": "delete",
                "PATCH": "patch",
            }

            http_method = request.method
            handler_method_name = method_mapping.get(http_method)

            if not handler_method_name:
                return JsonResponse(
                    {
                        "success": False,
                        "message": f"HTTP method {http_method} is not allowed.",
                        "icon": "error",
                    },
                    status=405,
                )

            # Try to get the specific handler method from the handler class
            # First, try role-specific method (e.g., getAdminVehicleDetails)
            role_specific_method = None
            if user_role:
                role_specific_method_name = (
                    f"{handler_method_name}{user_role.capitalize()}"
                )
                role_specific_method = getattr(handler, role_specific_method_name, None)

            # If no role-specific method, try generic method (e.g., getVehicleDetails)
            if role_specific_method and callable(role_specific_method):
                logger.info(
                    f"Calling role-specific handler method for role: {user_role}"
                )
                return role_specific_method(request)

            # Try generic handler method name based on handler class name
            # e.g., VehicleDetailsView -> getVehicleDetails
            generic_method_name = cls._get_generic_method_name(handler, http_method)
            generic_method = getattr(handler, generic_method_name, None)

            if generic_method and callable(generic_method):
                logger.info(f"Calling generic handler method: {generic_method_name}")
                return generic_method(request)

            # If no handler method found, return error
            logger.warning(
                f"No handler method found for {handler.__class__.__name__} with HTTP method {http_method}"
            )
            return JsonResponse(
                {
                    "success": False,
                    "message": f"Handler method not implemented for {http_method} request.",
                    "icon": "error",
                },
                status=405,
            )

        except Exception as e:
            logger.error(f"Error in RoleBasedUrlHandler: {str(e)}", exc_info=True)
            return JsonResponse(
                {
                    "success": False,
                    "message": "An internal server error occurred.",
                    "icon": "error",
                },
                status=500,
            )

    @staticmethod
    def _get_generic_method_name(handler, http_method):
        """
        Generate generic method name from handler class name and HTTP method.

        Args:
            handler: Handler instance
            http_method: HTTP method (GET, POST, etc.)

        Returns:
            Method name (e.g., 'getVehicleDetails')
        """
        handler_class_name = handler.__class__.__name__
        # Remove 'View' suffix if present
        if handler_class_name.endswith("View"):
            handler_class_name = handler_class_name[:-4]

        # Method prefix should be lowercase (e.g., 'get', 'post')
        method_prefix = http_method.lower()

        # Ensure first letter of handler name is capitalized
        # e.g., 'vehicleDetails' -> 'VehicleDetails'
        if handler_class_name and len(handler_class_name) > 0:
            handler_class_name = handler_class_name[0].upper() + handler_class_name[1:]

        return f"{method_prefix}{handler_class_name}"
