from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from users.serializers.AuthSerializers import (
    LoginSerializer,
    RegisterSerializer,
    UserDetailSerializer,
    LogoutSerializer,
    PasswordChangeSerializer,
)
import logging

logger = logging.getLogger(__name__)


class RegisterView(APIView):
    """
    API endpoint for user registration.

    POST /api/users/register/
    {
        "email": "user@example.com",
        "name": "John Doe",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!",
        "role": "PERSONAL",
        "performance": 5
    }

    Returns JWT tokens and user details.
    """

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        """Register a new user."""
        try:
            serializer = RegisterSerializer(data=request.data)

            if serializer.is_valid():
                user = serializer.save()

                logger.info(f"User registered successfully: {user.email}")

                return Response(
                    {
                        "success": True,
                        "message": "User registered successfully",
                        "icon": "success",
                        "data": {
                            "user_id": str(user.user_id),
                            "email": user.email,
                            "name": user.name,
                            "role": user.role,
                        },
                    },
                    status=status.HTTP_201_CREATED,
                )
            else:
                logger.warning(f"Registration failed with errors: {serializer.errors}")
                return Response(
                    {
                        "success": False,
                        "message": "Registration failed",
                        "icon": "error",
                        "errors": serializer.errors,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            logger.error(f"Error during registration: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "An error occurred during registration",
                    "icon": "error",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LoginView(APIView):
    """
    API endpoint for user login.

    POST /api/users/login/
    {
        "email": "user@example.com",
        "password": "password123"
    }

    Returns JWT access and refresh tokens.
    """

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        """Authenticate user and return JWT tokens."""
        try:
            serializer = LoginSerializer(data=request.data)

            if serializer.is_valid():
                logger.info(f"User logged in successfully: {request.data.get('email')}")

                return Response(
                    {
                        "success": True,
                        "message": "Login successful",
                        "icon": "success",
                        "data": serializer.validated_data,
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                logger.warning(f"Login failed with errors: {serializer.errors}")
                return Response(
                    {
                        "success": False,
                        "message": "Login failed",
                        "icon": "error",
                        "errors": serializer.errors,
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
        except Exception as e:
            logger.error(f"Error during login: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "An error occurred during login",
                    "icon": "error",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LogoutView(APIView):
    """
    API endpoint for user logout.
    Blacklists the refresh token to invalidate it.

    POST /api/users/logout/
    {
        "refresh": "refresh_token_here"
    }

    Requires authentication.
    """

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Logout user by blacklisting refresh token."""
        try:
            serializer = LogoutSerializer(data=request.data)

            if serializer.is_valid():
                try:
                    refresh_token = serializer.validated_data["refresh"]
                    token = RefreshToken(refresh_token)
                    token.blacklist()

                    logger.info(f"User logged out: {request.user.email}")

                    return Response(
                        {
                            "success": True,
                            "message": "Logout successful",
                            "icon": "success",
                        },
                        status=status.HTTP_200_OK,
                    )
                except Exception as e:
                    logger.error(f"Error blacklisting token: {str(e)}")
                    return Response(
                        {
                            "success": False,
                            "message": "Invalid refresh token",
                            "icon": "error",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            else:
                return Response(
                    {
                        "success": False,
                        "message": "Logout failed",
                        "icon": "error",
                        "errors": serializer.errors,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            logger.error(f"Error during logout: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "An error occurred during logout",
                    "icon": "error",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UserDetailView(APIView):
    """
    API endpoint to retrieve current user details.

    GET /api/users/me/

    Returns authenticated user's information.
    Requires JWT authentication.
    """

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current user details."""
        try:
            serializer = UserDetailSerializer(request.user)

            return Response(
                {
                    "success": True,
                    "message": "User details retrieved successfully",
                    "icon": "success",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error(f"Error retrieving user details: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "An error occurred while retrieving user details",
                    "icon": "error",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ChangePasswordView(APIView):
    """
    API endpoint to change user password.

    POST /api/users/change-password/
    {
        "old_password": "currentPassword123",
        "new_password": "NewPassword123!",
        "new_password_confirm": "NewPassword123!"
    }

    Requires JWT authentication.
    """

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Change user password."""
        try:
            serializer = PasswordChangeSerializer(data=request.data)

            if serializer.is_valid():
                user = request.user

                # Verify old password
                if not user.check_password(serializer.validated_data["old_password"]):
                    return Response(
                        {
                            "success": False,
                            "message": "Old password is incorrect",
                            "icon": "error",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Set new password
                user.set_password(serializer.validated_data["new_password"])
                user.save()

                logger.info(f"User password changed: {user.email}")

                return Response(
                    {
                        "success": True,
                        "message": "Password changed successfully",
                        "icon": "success",
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {
                        "success": False,
                        "message": "Password change failed",
                        "icon": "error",
                        "errors": serializer.errors,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            logger.error(f"Error changing password: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "An error occurred while changing password",
                    "icon": "error",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """Functional view for user registration (alternative to class-based view)."""
    return RegisterView().post(request)


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """Functional view for user login (alternative to class-based view)."""
    return LoginView().post(request)


@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """Functional view for user logout (alternative to class-based view)."""
    return LogoutView().post(request)


@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_detail(request):
    """Functional view for retrieving user details (alternative to class-based view)."""
    return UserDetailView().get(request)


@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Functional view for changing password (alternative to class-based view)."""
    return ChangePasswordView().post(request)


class DeactivateAccountView(APIView):
    """
    API endpoint for deactivating/reactivating user account.

    POST /api/users/auth/deactivate/
    {
        "action": "deactivate"  # or "reactivate"
    }

    Allows users to deactivate or reactivate their own account.
    """

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Deactivate or reactivate user account."""
        try:
            action = request.data.get("action", "").lower()

            if action not in ["deactivate", "reactivate"]:
                return Response(
                    {
                        "success": False,
                        "message": 'Invalid action. Use "deactivate" or "reactivate".',
                        "icon": "error",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = request.user
            from django.utils import timezone

            if action == "deactivate":
                if not user.is_active:
                    return Response(
                        {
                            "success": False,
                            "message": "Account is already deactivated",
                            "icon": "info",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                user.is_active = False
                user.deactivated_at = timezone.now()
                user.save()

                logger.info(f"User account deactivated: {user.email}")

                return Response(
                    {
                        "success": True,
                        "message": "Account deactivated successfully",
                        "icon": "success",
                    },
                    status=status.HTTP_200_OK,
                )

            elif action == "reactivate":
                if user.is_active:
                    return Response(
                        {
                            "success": False,
                            "message": "Account is already active",
                            "icon": "info",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                user.is_active = True
                user.deactivated_at = None
                user.save()

                logger.info(f"User account reactivated: {user.email}")

                return Response(
                    {
                        "success": True,
                        "message": "Account reactivated successfully",
                        "icon": "success",
                    },
                    status=status.HTTP_200_OK,
                )

        except Exception as e:
            logger.error(f"Error during account deactivation/reactivation: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "An error occurred during the operation",
                    "icon": "error",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def deactivate_account(request):
    """Functional view for account deactivation/reactivation."""
    return DeactivateAccountView().post(request)


class ResetUserPasswordView(APIView):
    """
    API endpoint for admin to reset user password.

    POST /api/users/auth/reset-password/
    {
        "email": "user@example.com",
        "new_password": "NewPassword123!"
    }

    Only admins can reset other users' passwords.
    """

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Reset user password (admin only)."""
        try:
            # Check if user is admin
            if request.user.role != "ADMIN":
                return Response(
                    {
                        "success": False,
                        "message": "Only admins can reset user passwords",
                        "icon": "error",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            email = request.data.get("email")
            new_password = request.data.get("new_password")

            if not email or not new_password:
                return Response(
                    {
                        "success": False,
                        "message": "Email and new_password are required",
                        "icon": "error",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {
                        "success": False,
                        "message": "User not found",
                        "icon": "error",
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Validate password strength
            try:
                validate_password(new_password, user=user)
            except ValidationError as e:
                return Response(
                    {
                        "success": False,
                        "message": "Password validation failed",
                        "icon": "error",
                        "errors": list(e.messages),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Set the new password
            user.set_password(new_password)
            user.save()

            logger.info(
                f"Password reset for user: {email} by admin: {request.user.email}"
            )

            return Response(
                {
                    "success": True,
                    "message": f"Password reset successfully for {email}",
                    "icon": "success",
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error during password reset: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "An error occurred during password reset",
                    "icon": "error",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reset_user_password(request):
    """Functional view for password reset."""
    return ResetUserPasswordView().post(request)
