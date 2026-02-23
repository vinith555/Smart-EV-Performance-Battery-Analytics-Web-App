from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, VehicleViews, TripDetailsView, ServiceView, IssuesView, UserInfoView

urlpatterns = [
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("login/", LoginView.as_view(), name="login"),
    path("get-vehicle-details", VehicleViews.VehicleDetails, name="vehicle-details"),
    path("get-trip-details", TripDetailsView.TripDetails, name="trip-details"),
    path("get-service-details", ServiceView.ServiceDetails, name="service-details"),
    path("get-issue-details", IssuesView.IssueDetails, name="issue-details"),
    path("get-user-details-by-vehicle", UserInfoView.UserDetailsByVehicle, name="user-details-by-vehicle"),
]
