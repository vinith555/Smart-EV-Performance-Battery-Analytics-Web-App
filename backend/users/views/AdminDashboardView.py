from django.http import JsonResponse
from django.db.models import Count
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt

from ..models import (
    Bill,
    ChargeHistory,
    Company,
    Issues,
    Notification,
    Service,
    ServiceTask,
    Task,
    Trip,
    User,
    Vehicle,
    VehicleStats,
)


def _is_admin(user):
    return str(getattr(user, "role", "")).upper() == "ADMIN"


def _as_bool(value):
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _summary_counts():
    return {
        "companies": Company.objects.count(),
        "users": User.objects.count(),
        "vehicles": Vehicle.objects.count(),
        "vehicle_stats": VehicleStats.objects.count(),
        "trips": Trip.objects.count(),
        "charge_history": ChargeHistory.objects.count(),
        "tasks": Task.objects.count(),
        "service_tasks": ServiceTask.objects.count(),
        "services": Service.objects.count(),
        "issues": Issues.objects.count(),
        "notifications": Notification.objects.count(),
        "bills": Bill.objects.count(),
    }


def _scope_options():
    users = list(
        User.objects.filter(is_active=True)
        .order_by("name")
        .values("user_id", "name", "email", "role")
    )
    vehicles = list(
        Vehicle.objects.select_related("owner")
        .filter(is_active=True)
        .order_by("registration_number")
        .values(
            "vehicle_id",
            "registration_number",
            "vehicle_model",
            "owner__name",
        )
    )
    return {"users": users, "vehicles": vehicles}


def _build_user_scoped_data(user_id):
    user_qs = User.objects.filter(user_id=user_id)
    owned_vehicles_qs = Vehicle.objects.filter(owner_id=user_id)
    owned_vehicle_ids = list(owned_vehicles_qs.values_list("vehicle_id", flat=True))

    company_ids = set(user_qs.values_list("company_id", flat=True))
    company_ids.update(owned_vehicles_qs.values_list("company_id", flat=True))
    company_ids.discard(None)

    return {
        "companies": list(
            Company.objects.filter(company_id__in=company_ids).values(
                "company_id",
                "company_name",
                "address",
                "contact_email",
                "contact_phone",
                "vehicle_manufactured_count",
                "vehicle_sold_count",
                "is_active",
                "deactivated_at",
            )
        ),
        "users": list(
            user_qs.select_related("company").values(
                "user_id",
                "name",
                "email",
                "role",
                "company_id",
                "company__company_name",
                "performance",
                "phone",
                "linkedin",
                "twitter",
                "facebook",
                "bio",
                "is_active",
                "is_staff",
                "deactivated_at",
                "last_login",
            )
        ),
        "vehicles": list(
            owned_vehicles_qs.select_related("owner", "company").values(
                "vehicle_id",
                "vehicle_model",
                "vehicle_colour",
                "registration_number",
                "owner_id",
                "owner__name",
                "owner__email",
                "company_id",
                "company__company_name",
                "is_sold",
                "is_active",
                "created_at",
                "deactivated_at",
            )
        ),
        "vehicle_stats": list(
            VehicleStats.objects.filter(vehicle_id__in=owned_vehicle_ids)
            .select_related("vehicle")
            .values(
                "stats_id",
                "vehicle_id",
                "vehicle__registration_number",
                "battery_percentage",
                "total",
                "battery_health",
                "charging_time",
                "temperature",
                "battery_capacity",
                "is_charging",
                "estimated_range",
                "recorded_at",
            )
        ),
        "trips": list(
            Trip.objects.filter(vehicle_id__in=owned_vehicle_ids)
            .select_related("vehicle")
            .values(
                "trip_id",
                "vehicle_id",
                "vehicle__registration_number",
                "start_date",
                "end_date",
                "start_location",
                "end_location",
                "distance",
                "duration",
                "average_speed",
                "battery_used",
                "cost",
                "efficiency",
                "status",
                "notes",
            )
        ),
        "charge_history": list(
            ChargeHistory.objects.filter(vehicle_id__in=owned_vehicle_ids)
            .select_related("vehicle")
            .values(
                "charge_id",
                "vehicle_id",
                "vehicle__registration_number",
                "charge_date",
                "charge_start_time",
                "charge_end_time",
                "energy_added_kwh",
                "cost",
            )
        ),
        "tasks": list(
            Task.objects.filter(assigned_to_id=user_id)
            .select_related("assigned_to")
            .values(
                "task_id",
                "assigned_to_id",
                "assigned_to__name",
                "assigned_to__email",
                "date_assigned",
                "title",
                "description",
                "priority",
                "is_completed",
                "completed_at",
                "created_at",
            )
        ),
        "service_tasks": list(
            ServiceTask.objects.filter(
                Q(serviceman_id=user_id) | Q(vehicle_id__in=owned_vehicle_ids)
            )
            .select_related("vehicle", "serviceman")
            .distinct()
            .values(
                "task_id",
                "task_name",
                "description",
                "vehicle_id",
                "vehicle__registration_number",
                "serviceman_id",
                "serviceman__name",
                "serviceman__email",
            )
        ),
        "services": list(
            Service.objects.filter(
                Q(serviceman_id=user_id)
                | Q(assigned_by_id=user_id)
                | Q(assigned_to_id=user_id)
                | Q(vehicle_id__in=owned_vehicle_ids)
            )
            .select_related("vehicle", "serviceman", "assigned_by", "assigned_to")
            .annotate(task_count=Count("tasks"))
            .distinct()
            .values(
                "service_id",
                "vehicle_id",
                "vehicle__registration_number",
                "serviceman_id",
                "serviceman__name",
                "assigned_by_id",
                "assigned_by__name",
                "assigned_to_id",
                "assigned_to__name",
                "start_time",
                "deadline",
                "priority",
                "status",
                "sla_time",
                "sla_status",
                "notes",
                "rating",
                "task_count",
            )
        ),
        "issues": list(
            Issues.objects.filter(
                Q(assigned_to_id=user_id)
                | Q(assigned_by_id=user_id)
                | Q(vehicle_id__in=owned_vehicle_ids)
            )
            .select_related("vehicle", "assigned_to", "assigned_by")
            .distinct()
            .values(
                "issue_id",
                "vehicle_id",
                "vehicle__registration_number",
                "category",
                "description",
                "date_reported",
                "date_completed",
                "assigned_to_id",
                "assigned_to__name",
                "assigned_by_id",
                "assigned_by__name",
                "priority",
                "is_resolved",
                "cost",
            )
        ),
        "notifications": list(
            Notification.objects.filter(
                Q(user_id=user_id) | Q(vehicle_id__in=owned_vehicle_ids)
            )
            .select_related("vehicle", "user")
            .distinct()
            .values(
                "notification_id",
                "vehicle_id",
                "vehicle__registration_number",
                "user_id",
                "user__name",
                "priority",
                "message",
                "created_at",
            )
        ),
        "bills": list(
            Bill.objects.filter(
                Q(customer_id=user_id) | Q(vehicle_id__in=owned_vehicle_ids)
            )
            .select_related("service", "issue", "vehicle", "customer")
            .distinct()
            .values(
                "bill_id",
                "service_id",
                "issue_id",
                "vehicle_id",
                "vehicle__registration_number",
                "customer_id",
                "customer__name",
                "bill_date",
                "due_date",
                "subtotal",
                "tax_percentage",
                "tax_amount",
                "discount",
                "total_amount",
                "payment_status",
                "payment_method",
                "payment_date",
                "notes",
            )
        ),
    }


def _build_vehicle_scoped_data(vehicle_id):
    vehicle_qs = Vehicle.objects.filter(vehicle_id=vehicle_id)
    owner_id = vehicle_qs.values_list("owner_id", flat=True).first()
    company_id = vehicle_qs.values_list("company_id", flat=True).first()

    user_filter = Q()
    if owner_id:
        user_filter = Q(user_id=owner_id)

    company_filter = Q()
    if company_id:
        company_filter = Q(company_id=company_id)

    return {
        "companies": list(
            Company.objects.filter(company_filter).values(
                "company_id",
                "company_name",
                "address",
                "contact_email",
                "contact_phone",
                "vehicle_manufactured_count",
                "vehicle_sold_count",
                "is_active",
                "deactivated_at",
            )
        ),
        "users": list(
            User.objects.filter(user_filter).select_related("company").values(
                "user_id",
                "name",
                "email",
                "role",
                "company_id",
                "company__company_name",
                "performance",
                "phone",
                "linkedin",
                "twitter",
                "facebook",
                "bio",
                "is_active",
                "is_staff",
                "deactivated_at",
                "last_login",
            )
        ),
        "vehicles": list(
            vehicle_qs.select_related("owner", "company").values(
                "vehicle_id",
                "vehicle_model",
                "vehicle_colour",
                "registration_number",
                "owner_id",
                "owner__name",
                "owner__email",
                "company_id",
                "company__company_name",
                "is_sold",
                "is_active",
                "created_at",
                "deactivated_at",
            )
        ),
        "vehicle_stats": list(
            VehicleStats.objects.filter(vehicle_id=vehicle_id)
            .select_related("vehicle")
            .values(
                "stats_id",
                "vehicle_id",
                "vehicle__registration_number",
                "battery_percentage",
                "total",
                "battery_health",
                "charging_time",
                "temperature",
                "battery_capacity",
                "is_charging",
                "estimated_range",
                "recorded_at",
            )
        ),
        "trips": list(
            Trip.objects.filter(vehicle_id=vehicle_id)
            .select_related("vehicle")
            .values(
                "trip_id",
                "vehicle_id",
                "vehicle__registration_number",
                "start_date",
                "end_date",
                "start_location",
                "end_location",
                "distance",
                "duration",
                "average_speed",
                "battery_used",
                "cost",
                "efficiency",
                "status",
                "notes",
            )
        ),
        "charge_history": list(
            ChargeHistory.objects.filter(vehicle_id=vehicle_id)
            .select_related("vehicle")
            .values(
                "charge_id",
                "vehicle_id",
                "vehicle__registration_number",
                "charge_date",
                "charge_start_time",
                "charge_end_time",
                "energy_added_kwh",
                "cost",
            )
        ),
        "tasks": [],
        "service_tasks": list(
            ServiceTask.objects.filter(vehicle_id=vehicle_id)
            .select_related("vehicle", "serviceman")
            .values(
                "task_id",
                "task_name",
                "description",
                "vehicle_id",
                "vehicle__registration_number",
                "serviceman_id",
                "serviceman__name",
                "serviceman__email",
            )
        ),
        "services": list(
            Service.objects.filter(vehicle_id=vehicle_id)
            .select_related("vehicle", "serviceman", "assigned_by", "assigned_to")
            .annotate(task_count=Count("tasks"))
            .values(
                "service_id",
                "vehicle_id",
                "vehicle__registration_number",
                "serviceman_id",
                "serviceman__name",
                "assigned_by_id",
                "assigned_by__name",
                "assigned_to_id",
                "assigned_to__name",
                "start_time",
                "deadline",
                "priority",
                "status",
                "sla_time",
                "sla_status",
                "notes",
                "rating",
                "task_count",
            )
        ),
        "issues": list(
            Issues.objects.filter(vehicle_id=vehicle_id)
            .select_related("vehicle", "assigned_to", "assigned_by")
            .values(
                "issue_id",
                "vehicle_id",
                "vehicle__registration_number",
                "category",
                "description",
                "date_reported",
                "date_completed",
                "assigned_to_id",
                "assigned_to__name",
                "assigned_by_id",
                "assigned_by__name",
                "priority",
                "is_resolved",
                "cost",
            )
        ),
        "notifications": list(
            Notification.objects.filter(vehicle_id=vehicle_id)
            .select_related("vehicle", "user")
            .values(
                "notification_id",
                "vehicle_id",
                "vehicle__registration_number",
                "user_id",
                "user__name",
                "priority",
                "message",
                "created_at",
            )
        ),
        "bills": list(
            Bill.objects.filter(vehicle_id=vehicle_id)
            .select_related("service", "issue", "vehicle", "customer")
            .values(
                "bill_id",
                "service_id",
                "issue_id",
                "vehicle_id",
                "vehicle__registration_number",
                "customer_id",
                "customer__name",
                "bill_date",
                "due_date",
                "subtotal",
                "tax_percentage",
                "tax_amount",
                "discount",
                "total_amount",
                "payment_status",
                "payment_method",
                "payment_date",
                "notes",
            )
        ),
    }


@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def AdminDashboardData(request):
    if not _is_admin(request.user):
        return JsonResponse(
            {
                "success": False,
                "message": "Access denied. Admin role required.",
                "icon": "error",
            },
            status=403,
        )

    try:
        include_details = _as_bool(request.GET.get("include_details", "false"))
        scope_type = str(request.GET.get("scope_type", "")).strip().lower()
        scope_id = request.GET.get("scope_id")

        counts = _summary_counts()
        options = _scope_options()

        if not include_details:
            return JsonResponse(
                {
                    "success": True,
                    "message": "Admin summary fetched successfully.",
                    "icon": "success",
                    "counts": counts,
                    "scope_options": options,
                    "data": {},
                    "scoped": False,
                },
                status=200,
            )

        if scope_type not in {"user", "vehicle"}:
            return JsonResponse(
                {
                    "success": False,
                    "message": "scope_type must be either 'user' or 'vehicle' when include_details=true.",
                    "icon": "error",
                    "counts": counts,
                    "scope_options": options,
                },
                status=400,
            )

        try:
            scope_id = int(scope_id)
        except (TypeError, ValueError):
            return JsonResponse(
                {
                    "success": False,
                    "message": "scope_id must be a valid integer when include_details=true.",
                    "icon": "error",
                    "counts": counts,
                    "scope_options": options,
                },
                status=400,
            )

        if scope_type == "user":
            data = _build_user_scoped_data(scope_id)
        else:
            data = _build_vehicle_scoped_data(scope_id)

        scoped_counts = {key: len(value) for key, value in data.items()}

        return JsonResponse(
            {
                "success": True,
                "message": "Scoped admin details fetched successfully.",
                "icon": "success",
                "counts": counts,
                "scope_options": options,
                "scoped": True,
                "scope": {"type": scope_type, "id": scope_id},
                "scoped_counts": scoped_counts,
                "data": data,
            },
            status=200,
        )
    except Exception as exc:
        return JsonResponse(
            {
                "success": False,
                "message": f"Failed to fetch admin dashboard data: {str(exc)}",
                "icon": "error",
            },
            status=500,
        )
