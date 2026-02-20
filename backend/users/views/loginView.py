from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.serializers.LoginSerializer import LoginSerializer

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            return Response(serializer.validated_data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
