from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials")

        if not user.is_active:
            raise serializers.ValidationError("Account is deactivated")

        refresh = RefreshToken.for_user(user)

        return {
            "user_id": User.user_id,
            "email": User.email,
            "role": User.role,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
