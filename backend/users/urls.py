from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from .views import (
    VehicleViews,
    TripDetailsView,
    ServiceView,
    IssuesView,
    UserInfoView,
)
from .views.authView import (
    RegisterView,
    LogoutView,
    UserDetailView,
    ChangePasswordView,
    DeactivateAccountView,
    ResetUserPasswordView,
)

urlpatterns = [
    # Authentication endpoints
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", UserDetailView.as_view(), name="user-detail"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path(
        "auth/deactivate-account/",
        DeactivateAccountView.as_view(),
        name="deactivate-account",
    ),
    path(
        "auth/reset-password/", ResetUserPasswordView.as_view(), name="reset-password"
    ),
    # Data endpoints
    path("get-vehicle-details/", VehicleViews.VehicleDetails, name="vehicle-details"),
    path(
        "get-charging-details/",
        VehicleViews.GetChargingDetails,
        name="charging-details",
    ),
    path("get-trip-details/", TripDetailsView.TripDetails, name="trip-details"),
    path("get-service-details/", ServiceView.ServiceDetails, name="service-details"),
    path("get-issue-details/", IssuesView.IssueDetails, name="issue-details"),
    path(
        "get-user-details-by-vehicle/",
        UserInfoView.UserDetailsByVehicle,
        name="user-details-by-vehicle",
    ),
]
