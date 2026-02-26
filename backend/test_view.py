from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status


class TestView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                "message": "Test successful - GET",
                "auth_classes": str(self.authentication_classes),
                "perm_classes": str(self.permission_classes),
            }
        )

    def post(self, request):
        return Response(
            {
                "message": "Test successful - POST",
                "data": request.data,
                "auth_classes": str(self.authentication_classes),
                "perm_classes": str(self.permission_classes),
            },
            status=status.HTTP_200_OK,
        )
