from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from users.models import User


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Creates a new user account with email, password, and optional details.
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        help_text="Password must be at least 8 characters and contain mix of characters",
    )
    password_confirm = serializers.CharField(
        write_only=True, required=True, help_text="Confirm password must match password"
    )
    role = serializers.ChoiceField(
        choices=User.Role.choices,
        default=User.Role.PERSONAL,
        required=False,
        help_text="User role: PERSONAL, SERVICE, or ADMIN",
    )

    class Meta:
        model = User
        fields = (
            "email",
            "name",
            "password",
            "password_confirm",
            "role",
            "performance",
        )
        extra_kwargs = {
            "name": {"required": True, "help_text": "Full name of the user"},
            "performance": {"required": False, "help_text": "Performance rating 0-10"},
        }

    def validate(self, data):
        """Validate password match and user data."""
        password = data.get("password")
        password_confirm = data.get("password_confirm")

        if password != password_confirm:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match"}
            )

        # Remove password_confirm from data as it's not a model field
        data.pop("password_confirm", None)

        # Check if email already exists
        if User.objects.filter(email=data["email"]).exists():
            raise serializers.ValidationError({"email": "Email already registered"})

        return data

    def create(self, validated_data):
        """Create and return a new user instance."""
        user = User.objects.create_user(
            email=validated_data["email"],
            name=validated_data["name"],
            password=validated_data["password"],
            role=validated_data.get("role", User.Role.PERSONAL),
            performance=validated_data.get("performance", 0),
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    Authenticates user with email and password, returns JWT tokens.
    """

    email = serializers.EmailField(required=True, help_text="User email address")
    password = serializers.CharField(
        write_only=True, required=True, help_text="User password"
    )

    def validate(self, data):
        """Authenticate user and return JWT tokens."""
        email = data.get("email")
        password = data.get("password")

        # Authenticate user with email as username
        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("Account is deactivated")

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer for retrieving user details."""

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "name",
            "role",
            "is_active",
            "performance",
        )
        read_only_fields = ("id",)


class LogoutSerializer(serializers.Serializer):
    """Serializer for user logout (token blacklisting)."""

    refresh = serializers.CharField(
        required=True, help_text="Refresh token to blacklist"
    )


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing password."""

    old_password = serializers.CharField(
        write_only=True, required=True, help_text="Current password"
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        help_text="New password",
    )
    new_password_confirm = serializers.CharField(
        write_only=True, required=True, help_text="Confirm new password"
    )

    def validate(self, data):
        """Validate password change data."""
        if data["new_password"] != data["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "New passwords do not match"}
            )

        if data["old_password"] == data["new_password"]:
            raise serializers.ValidationError(
                {"new_password": "New password must be different from old password"}
            )

        return data
