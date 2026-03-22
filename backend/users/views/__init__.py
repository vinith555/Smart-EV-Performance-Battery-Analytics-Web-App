from .loginView import LoginView, RegisterView
from . import IssuesView
from . import VehicleViews
from . import ServiceView
from . import TripDetailsView
from . import UserInfoView
from . import NotificationView
from . import BillViews
from . import AdminDashboardView
from . import EvonView
from . import authView
from .role_based_url_handler import RoleBasedUrlHandler, BaseHandler

__all__ = [
    "LoginView",
    "RegisterView",
    "IssuesView",
    "VehicleViews",
    "ServiceView",
    "TripDetailsView",
    "UserInfoView",
    "NotificationView",
    "BillViews",
    "AdminDashboardView",
    "EvonView",
    "authView",
    "RoleBasedUrlHandler",
    "BaseHandler",
]
