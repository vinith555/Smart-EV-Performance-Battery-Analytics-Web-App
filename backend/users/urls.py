from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from .views import (
    VehicleViews,
    TripDetailsView,
    ServiceView,
    IssuesView,
    UserInfoView,
    NotificationView,
    BillViews,
    AdminDashboardView,
    EvonView,
)
from .views.authView import (
    RegisterView,
    LogoutView,
    UserDetailView,
    UpdateUserView,
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
    path("auth/update-profile/", UpdateUserView.as_view(), name="update-profile"),
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
    # Vehicle endpoints
    path("get-vehicle-details/", VehicleViews.VehicleDetails, name="vehicle-details"),
    # Charging endpoints
    path(
        "get-charging-details/",
        VehicleViews.GetChargingDetails,
        name="charging-details",
    ),
    # Trip endpoints
    path("get-trip-details/", TripDetailsView.TripDetails, name="trip-details"),
    # Service and Issue endpoints
    path("get-service-details/", ServiceView.ServiceDetails, name="service-details"),
    path(
        "update-service-status/<int:service_id>/",
        ServiceView.UpdateServiceStatus,
        name="update-service-status",
    ),
    path("get-issue-details/", IssuesView.IssueDetails, name="issue-details"),
    path(
        "update-issue-status/<int:issue_id>/",
        IssuesView.UpdateIssueStatus,
        name="update-issue-status",
    ),
    path("delete-issue/<int:issue_id>/", IssuesView.DeleteIssue, name="delete-issue"),
    path(
        "get-user-details-by-vehicle/",
        UserInfoView.UserDetailsByVehicle,
        name="user-details-by-vehicle",
    ),
    # Bill endpoints
    path("get-bill-details/", BillViews.BillDetails, name="bill-details"),
    path(
        "get-billing-form-data/",
        BillViews.BillingFormData,
        name="billing-form-data",
    ),
    path(
        "register-billing-items-as-issues/",
        BillViews.RegisterBillingItemsAsIssues,
        name="register-billing-items-as-issues",
    ),
    # notification endpoints
    path(
        "get-notification-details/<int:user_id>/",
        NotificationView.NotificationDetails,
        name="notification-details",
    ),
    path(
        "delete-notification/<int:notification_id>/",
        NotificationView.DeleteNotification,
        name="delete-notification",
    ),
    path(
        "admin/dashboard-data/",
        AdminDashboardView.AdminDashboardData,
        name="admin-dashboard-data",
    ),
    path(
        "admin/evon-query/",
        EvonView.EvonQuery,
        name="admin-evon-query",
    ),
]
