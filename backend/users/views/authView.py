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
                            "id": str(user.id),
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
