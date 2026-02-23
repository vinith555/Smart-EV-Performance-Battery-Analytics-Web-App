from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView

urlpatterns = [
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("login/", LoginView.as_view(), name="login"),
]
