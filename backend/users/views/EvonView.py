import json
import re
import logging
import os
import importlib

from django.db.models import Avg
from django.db import connection
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from ..models import (
    Bill,
    Company,
    Issues,
    Notification,
    Service,
    Trip,
    User,
    Vehicle,
    VehicleStats,
)

logger = logging.getLogger(__name__)

FORBIDDEN_SQL_KEYWORDS = {
    "insert",
    "update",
    "delete",
    "drop",
    "alter",
    "truncate",
    "grant",
    "revoke",
    "create",
}

ALLOWED_TABLES = {
    "users_user",
    "users_vehicle",
    "users_company",
    "users_service",
    "users_issues",
    "users_bill",
    "users_trip",
    "users_vehiclestats",
    "users_notification",
}


def _is_admin(user):
    return str(getattr(user, "role", "")).upper() == "ADMIN"


def _extract_prompt(request):
    # Prefer DRF-parsed data when available.
    if request.method == "POST":
        try:
            data = getattr(request, "data", None)
            if isinstance(data, dict):
                return str(data.get("prompt", "")).strip()
        except Exception:
            pass

        # Fallback to raw body parsing for non-DRF contexts.
        try:
            body = json.loads(request.body.decode("utf-8") or "{}")
            return str(body.get("prompt", "")).strip()
        except Exception:
            return ""

    return str(request.GET.get("prompt", "")).strip()


def _extract_entity_id(text, entity):
    patterns = [
        rf"{entity}\s*(?:with\s*)?(?:id|#)\s*(\d+)",
        rf"{entity}\s*number\s*(\d+)",
        rf"{entity}\s*(\d+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            try:
                return int(match.group(1))
            except (TypeError, ValueError):
                return None
    return None


def _extract_sql(raw_text):
    if not raw_text:
        return ""

    # Prefer fenced SQL block if model returns markdown.
    code_match = re.search(
        r"```(?:sql)?\s*(.*?)```", raw_text, re.IGNORECASE | re.DOTALL
    )
    if code_match:
        return code_match.group(1).strip()

    return raw_text.strip()


def _is_safe_select_query(sql):
    if not sql:
        return False

    cleaned = sql.strip().lower()
    if ";" in cleaned:
        # Reject multi-statement SQL.
        return False

    if not (cleaned.startswith("select") or cleaned.startswith("with")):
        return False

    if any(f" {kw} " in f" {cleaned} " for kw in FORBIDDEN_SQL_KEYWORDS):
        return False

    referenced_tables = re.findall(r"(?:from|join)\s+([a-zA-Z0-9_\.\"]+)", cleaned)
    normalized_tables = {
        table.replace('"', "").split(".")[-1] for table in referenced_tables
    }

    if normalized_tables and not normalized_tables.issubset(ALLOWED_TABLES):
        return False

    return True


def _execute_safe_sql(sql, params=None):
    if not _is_safe_select_query(sql):
        raise ValueError("Unsafe SQL query was blocked")

    with connection.cursor() as cursor:
        cursor.execute(sql, params or [])
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        return [dict(zip(columns, row)) for row in rows]


def _summarize_rows(rows, subject, max_preview=3):
    if not rows:
        return f"I could not find any {subject} matching your request."

    count = len(rows)
    preview = rows[:max_preview]
    preview_parts = []

    for item in preview:
        compact = ", ".join(f"{k}: {v}" for k, v in item.items())
        preview_parts.append(f"[{compact}]")

    preview_text = " ".join(preview_parts)
    suffix = "" if count <= max_preview else f" (showing {max_preview} of {count})"
    return f"I found {count} {subject}.{suffix} {preview_text}"


def _try_builtin_text2sql(prompt):
    text = prompt.lower().strip()

    # Example: "vehicle owned by John Doe"
    owner_match = re.search(r"vehicle(?:s)?\s+(?:owned\s+by|for)\s+(.+)$", text)
    if owner_match:
        owner_name = owner_match.group(1).strip().strip("?.!")
        sql = (
            "SELECT v.vehicle_id, v.vehicle_model, v.registration_number, v.vehicle_colour, "
            "u.name AS owner_name, c.company_name "
            "FROM users_vehicle v "
            "LEFT JOIN users_user u ON v.owner_id = u.user_id "
            "LEFT JOIN users_company c ON v.company_id = c.company_id "
            "WHERE LOWER(u.name) LIKE LOWER(%s) "
            "LIMIT 25"
        )
        rows = _execute_safe_sql(sql, [f"%{owner_name}%"])
        return (
            _summarize_rows(rows, "vehicle records"),
            len(rows),
            "builtin_text2sql_vehicle_by_owner",
        )

    # Example: "services for vehicle id 1"
    vehicle_id_match = re.search(
        r"service(?:s)?\s+(?:for|of)\s+vehicle\s*(?:id)?\s*(\d+)", text
    )
    if vehicle_id_match:
        vehicle_id = int(vehicle_id_match.group(1))
        sql = (
            "SELECT service_id, vehicle_id, status, priority, sla_status "
            "FROM users_service WHERE vehicle_id = %s LIMIT 25"
        )
        rows = _execute_safe_sql(sql, [vehicle_id])
        return (
            _summarize_rows(rows, "service records"),
            len(rows),
            "builtin_text2sql_services_by_vehicle",
        )

    # Example: "issues for vehicle id 1"
    issues_vehicle_match = re.search(
        r"issue(?:s)?\s+(?:for|of)\s+vehicle\s*(?:id)?\s*(\d+)", text
    )
    if issues_vehicle_match:
        vehicle_id = int(issues_vehicle_match.group(1))
        sql = (
            "SELECT issue_id, vehicle_id, category, priority, is_resolved, cost "
            "FROM users_issues WHERE vehicle_id = %s LIMIT 25"
        )
        rows = _execute_safe_sql(sql, [vehicle_id])
        return (
            _summarize_rows(rows, "issue records"),
            len(rows),
            "builtin_text2sql_issues_by_vehicle",
        )

    return None


def _build_db_uri():
    name = os.getenv("DB_NAME", "")
    user = os.getenv("DB_USER", "")
    password = os.getenv("DB_PASSWORD", "")
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")

    if not (name and user and host and port):
        return None

    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{name}"


def _try_langchain_text2sql(prompt):
    enabled = os.getenv("EVON_TEXT2SQL_ENABLED", "False").lower() == "true"
    if not enabled:
        return None

    try:
        chat_openai_module = importlib.import_module("langchain_openai")
        sql_utils_module = importlib.import_module("langchain_community.utilities")
        chains_module = importlib.import_module("langchain.chains")
        ChatOpenAI = getattr(chat_openai_module, "ChatOpenAI")
        SQLDatabase = getattr(sql_utils_module, "SQLDatabase")
        create_sql_query_chain = getattr(chains_module, "create_sql_query_chain")
    except Exception as exc:
        logger.warning("LangChain imports unavailable: %s", str(exc))
        return None

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    db_uri = _build_db_uri()

    if not api_key or not db_uri:
        logger.warning(
            "LangChain text2sql enabled but OPENAI_API_KEY or DB URI is missing"
        )
        return None

    try:
        db = SQLDatabase.from_uri(db_uri, include_tables=sorted(ALLOWED_TABLES))
        llm = ChatOpenAI(
            model=os.getenv("EVON_LLM_MODEL", "gpt-4o-mini"), temperature=0
        )
        chain = create_sql_query_chain(llm, db)

        sql_candidate = chain.invoke(
            {
                "question": (
                    "Generate a single read-only SQL query for PostgreSQL. "
                    "Use only SELECT, never modify data, and apply LIMIT 25 for row listings. "
                    f"Question: {prompt}"
                )
            }
        )
        sql = _extract_sql(sql_candidate)

        rows = _execute_safe_sql(sql)
        answer = _summarize_rows(rows, "records")
        return answer, len(rows), "langchain_text2sql"
    except Exception as exc:
        logger.warning("LangChain text2sql failed: %s", str(exc))
        return None


def _format_user_detail(user_obj):
    company_name = (
        user_obj.company.company_name
        if getattr(user_obj, "company", None)
        else "No Company"
    )
    status = "active" if user_obj.is_active else "inactive"
    return (
        f"User {user_obj.user_id} is {user_obj.name} ({user_obj.email}). "
        f"Role: {user_obj.role}. Status: {status}. "
        f"Company: {company_name}. Performance score: {user_obj.performance}/10."
    )


def _format_vehicle_detail(vehicle_obj):
    owner_name = (
        vehicle_obj.owner.name if getattr(vehicle_obj, "owner", None) else "Unassigned"
    )
    company_name = (
        vehicle_obj.company.company_name
        if getattr(vehicle_obj, "company", None)
        else "Unknown"
    )
    active = "active" if vehicle_obj.is_active else "inactive"
    sold = "sold" if vehicle_obj.is_sold else "unsold"

    return (
        f"Vehicle {vehicle_obj.vehicle_id} is {vehicle_obj.vehicle_model} "
        f"({vehicle_obj.registration_number}), color {vehicle_obj.vehicle_colour}. "
        f"Owner: {owner_name}. Company: {company_name}. "
        f"Current state: {active}, {sold}."
    )


def _format_issue_detail(issue_obj):
    status = "resolved" if issue_obj.is_resolved else "unresolved"
    return (
        f"Issue {issue_obj.issue_id} is in category '{issue_obj.category}' and is currently {status}. "
        f"Priority: {issue_obj.priority}. Cost: {issue_obj.cost}."
    )


def _format_service_detail(service_obj):
    return (
        f"Service {service_obj.service_id} for vehicle {service_obj.vehicle_id} is {service_obj.status}. "
        f"Priority: {service_obj.priority}. SLA status: {service_obj.sla_status}."
    )


def _format_bill_detail(bill_obj):
    return (
        f"Bill {bill_obj.bill_id} for customer {bill_obj.customer_id} is {bill_obj.payment_status}. "
        f"Total amount: {bill_obj.total_amount}. Due date: {bill_obj.due_date}."
    )


def _try_smalltalk_response(prompt):
    text = (prompt or "").lower().strip()
    normalized = re.sub(r"[^a-z0-9\s]", " ", text)
    normalized = re.sub(r"\s+", " ", normalized).strip()

    greeting_terms = {"hi", "hello", "hey", "hola", "yo"}
    goodbye_terms = {"bye", "goodbye", "see you", "cya"}

    # Greetings like "hi", "hello evon", "hey there"
    if (
        normalized in greeting_terms
        or any(normalized.startswith(f"{word} ") for word in greeting_terms)
        or "good morning" in normalized
        or "good evening" in normalized
        or "good afternoon" in normalized
    ):
        return (
            "Hi! I am Evon, your EV analytics assistant. You can ask things like: 'How many active users are there?', 'How many unresolved issues are there?', or 'Tell me about vehicle id 1'.",
            None,
            "smalltalk_greeting",
        )

    # Identity questions like "who are u?"
    if any(
        phrase in normalized
        for phrase in [
            "who are you",
            "who r you",
            "who are u",
            "what are you",
            "your name",
            "are you a bot",
        ]
    ):
        return (
            "I am Evon, the admin analytics assistant for Smart EV operations. I can help with users, vehicles, services, issues, bills, trips, notifications, and battery health insights.",
            None,
            "smalltalk_identity",
        )

    if "help" in normalized or "what can you do" in normalized:
        return (
            "I can answer EV operations analytics queries. Try: 'How many active vehicles?', 'How many overdue bills?', 'How many unresolved issues?', 'What is the average battery health?', or 'Tell me about user id 1'.",
            None,
            "smalltalk_help",
        )

    if any(term in normalized for term in ["thank you", "thanks", "thx"]):
        return (
            "You're welcome. Ask me any EV analytics question when you're ready.",
            None,
            "smalltalk_thanks",
        )

    if any(term in normalized for term in goodbye_terms):
        return (
            "Goodbye. I will be here when you need EV analytics insights.",
            None,
            "smalltalk_goodbye",
        )

    return None


def _answer_for_prompt(prompt):
    text = prompt.lower()

    # Conversational messages (hi, who are you, help, thanks, etc.)
    smalltalk_response = _try_smalltalk_response(prompt)
    if smalltalk_response:
        return smalltalk_response

    is_count_intent = ("how many" in text) or ("total" in text)

    # Entity detail queries
    user_id = _extract_entity_id(text, "user")
    if user_id is not None and not is_count_intent:
        user_obj = (
            User.objects.select_related("company").filter(user_id=user_id).first()
        )
        if not user_obj:
            return f"I could not find any user with id {user_id}.", None, "user_detail"
        return _format_user_detail(user_obj), user_id, "user_detail"

    vehicle_id = _extract_entity_id(text, "vehicle")
    if vehicle_id is not None and not is_count_intent:
        vehicle_obj = (
            Vehicle.objects.select_related("owner", "company")
            .filter(vehicle_id=vehicle_id)
            .first()
        )
        if not vehicle_obj:
            return (
                f"I could not find any vehicle with id {vehicle_id}.",
                None,
                "vehicle_detail",
            )
        return _format_vehicle_detail(vehicle_obj), vehicle_id, "vehicle_detail"

    issue_id = _extract_entity_id(text, "issue")
    if issue_id is not None and not is_count_intent:
        issue_obj = Issues.objects.filter(issue_id=issue_id).first()
        if not issue_obj:
            return (
                f"I could not find any issue with id {issue_id}.",
                None,
                "issue_detail",
            )
        return _format_issue_detail(issue_obj), issue_id, "issue_detail"

    service_id = _extract_entity_id(text, "service")
    if service_id is not None and not is_count_intent:
        service_obj = Service.objects.filter(service_id=service_id).first()
        if not service_obj:
            return (
                f"I could not find any service with id {service_id}.",
                None,
                "service_detail",
            )
        return _format_service_detail(service_obj), service_id, "service_detail"

    bill_id = _extract_entity_id(text, "bill")
    if bill_id is not None and not is_count_intent:
        bill_obj = Bill.objects.filter(bill_id=bill_id).first()
        if not bill_obj:
            return f"I could not find any bill with id {bill_id}.", None, "bill_detail"
        return _format_bill_detail(bill_obj), bill_id, "bill_detail"

    # User related insights
    if "active user" in text:
        count = User.objects.filter(is_active=True).count()
        return f"Currently there are {count} active users.", count, "active_users"

    if "inactive user" in text or "deactivated user" in text:
        count = User.objects.filter(is_active=False).count()
        return (
            f"Currently there are {count} inactive users.",
            count,
            "inactive_users",
        )

    if "admin user" in text:
        count = User.objects.filter(role="ADMIN").count()
        return f"Currently there are {count} admin users.", count, "admin_users"

    if "service user" in text:
        count = User.objects.filter(role="SERVICE").count()
        return f"Currently there are {count} service users.", count, "service_users"

    if "personal user" in text:
        count = User.objects.filter(role="PERSONAL").count()
        return f"Currently there are {count} personal users.", count, "personal_users"

    if "total user" in text or re.search(r"\bhow many users\b", text):
        count = User.objects.count()
        return f"Currently there are {count} total users.", count, "total_users"

    # Vehicle related insights
    if "active vehicle" in text:
        count = Vehicle.objects.filter(is_active=True).count()
        return f"Currently there are {count} active vehicles.", count, "active_vehicles"

    if "sold vehicle" in text:
        count = Vehicle.objects.filter(is_sold=True).count()
        return f"Currently there are {count} sold vehicles.", count, "sold_vehicles"

    if "unsold vehicle" in text or "available vehicle" in text:
        count = Vehicle.objects.filter(is_sold=False).count()
        return f"Currently there are {count} unsold vehicles.", count, "unsold_vehicles"

    if "total vehicle" in text or re.search(r"\bhow many vehicles\b", text):
        count = Vehicle.objects.count()
        return f"Currently there are {count} total vehicles.", count, "total_vehicles"

    # Service and issue insights
    if "ongoing service" in text:
        count = Service.objects.filter(status="ONGOING").count()
        return (
            f"Currently there are {count} ongoing services.",
            count,
            "ongoing_services",
        )

    if "pending service" in text:
        count = Service.objects.filter(status="PENDING").count()
        return (
            f"Currently there are {count} pending services.",
            count,
            "pending_services",
        )

    if "completed service" in text:
        count = Service.objects.filter(status="COMPLETED").count()
        return (
            f"Currently there are {count} completed services.",
            count,
            "completed_services",
        )

    if "open issue" in text or "unresolved issue" in text:
        count = Issues.objects.filter(is_resolved=False).count()
        return (
            f"Currently there are {count} unresolved issues.",
            count,
            "unresolved_issues",
        )

    if "resolved issue" in text:
        count = Issues.objects.filter(is_resolved=True).count()
        return f"Currently there are {count} resolved issues.", count, "resolved_issues"

    if "total issue" in text or re.search(r"\bhow many issues\b", text):
        count = Issues.objects.count()
        return f"Currently there are {count} total issues.", count, "total_issues"

    # Billing and payment insights
    if "overdue bill" in text:
        count = Bill.objects.filter(payment_status="OVERDUE").count()
        return f"Currently there are {count} overdue bills.", count, "overdue_bills"

    if "paid bill" in text:
        count = Bill.objects.filter(payment_status="PAID").count()
        return f"Currently there are {count} paid bills.", count, "paid_bills"

    if "pending bill" in text:
        count = Bill.objects.filter(payment_status="PENDING").count()
        return f"Currently there are {count} pending bills.", count, "pending_bills"

    if "total bill" in text or re.search(r"\bhow many bills\b", text):
        count = Bill.objects.count()
        return f"Currently there are {count} total bills.", count, "total_bills"

    # Other useful signals
    if "total company" in text or re.search(r"\bhow many companies\b", text):
        count = Company.objects.count()
        return f"Currently there are {count} companies.", count, "total_companies"

    if "active compan" in text:
        count = Company.objects.filter(is_active=True).count()
        return (
            f"Currently there are {count} active companies.",
            count,
            "active_companies",
        )

    if "trip" in text and ("how many" in text or "total" in text):
        count = Trip.objects.count()
        return f"Currently there are {count} total trips.", count, "total_trips"

    if "notification" in text and "today" in text:
        today = timezone.localdate()
        count = Notification.objects.filter(created_at__date=today).count()
        return (
            f"Today there are {count} notifications.",
            count,
            "today_notifications",
        )

    if "average battery health" in text:
        avg_health = VehicleStats.objects.aggregate(value=Avg("battery_health"))[
            "value"
        ]
        if avg_health is None:
            return (
                "No battery health data is available yet.",
                None,
                "average_battery_health",
            )
        rounded = round(float(avg_health), 2)
        return (
            f"The average battery health is currently {rounded}%.",
            rounded,
            "average_battery_health",
        )

    # Built-in text-to-SQL fallback for relational prompts not covered above.
    builtin_fallback = _try_builtin_text2sql(prompt)
    if builtin_fallback:
        return builtin_fallback

    # Optional LangChain text-to-SQL fallback.
    langchain_fallback = _try_langchain_text2sql(prompt)
    if langchain_fallback:
        return langchain_fallback

    return (
        "I can help with analytics queries such as: 'How many active users are there?', 'How many overdue bills are there?', 'How many unresolved issues are there?', 'What is the average battery health?', or detail lookups like 'Tell me about user with id 1'.",
        None,
        "unsupported",
    )


@csrf_exempt
@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def EvonQuery(request):
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
        prompt = _extract_prompt(request)
        if not prompt:
            return JsonResponse(
                {
                    "success": False,
                    "message": "Prompt is required.",
                    "icon": "error",
                },
                status=400,
            )

        answer, value, intent = _answer_for_prompt(prompt)

        return JsonResponse(
            {
                "success": True,
                "message": "Evon response generated successfully.",
                "icon": "success",
                "data": {
                    "intent": intent,
                    "value": value,
                    "answer": answer,
                },
            },
            status=200,
        )
    except Exception as exc:
        logger.exception("EvonQuery failed: %s", str(exc))
        return JsonResponse(
            {
                "success": False,
                "message": "Evon could not process this query due to a server error.",
                "icon": "error",
            },
            status=500,
        )
