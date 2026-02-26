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
)

urlpatterns = [
    # Authentication endpoints
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", RegisterView.as_view(), name="register"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", UserDetailView.as_view(), name="user-detail"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
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
