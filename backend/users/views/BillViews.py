from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from .role_based_url_handler import RoleBasedUrlHandler, BaseHandler
from django.http import JsonResponse
from django.utils import timezone
from ..models import Bill, Service, Issues
import logging
import csv
from pathlib import Path
from datetime import timedelta
from decimal import Decimal, InvalidOperation
import json

logger = logging.getLogger(__name__)


PRICING_FILE_PATH = Path(__file__).resolve().parents[2] / "data" / "service_pricing.csv"
BILLING_META_PREFIX = "[BILLING_META]"


def _normalize_name(value: str) -> str:
    return " ".join((value or "").strip().lower().split())


def _load_pricing_catalog():
    pricing_map = {}
    pricing_rows = []

    if not PRICING_FILE_PATH.exists():
        return pricing_map, pricing_rows

    with PRICING_FILE_PATH.open("r", newline="", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            service_name = (row.get("service_name") or "").strip()
            if not service_name:
                continue

            try:
                price = float(row.get("price") or 0)
            except (TypeError, ValueError):
                price = 0.0

            pricing_map[_normalize_name(service_name)] = {
                "name": service_name,
                "price": round(price, 2),
                "description": (row.get("description") or "").strip(),
            }
            pricing_rows.append(
                {
                    "service_name": service_name,
                    "price": round(price, 2),
                    "description": (row.get("description") or "").strip(),
                }
            )

    return pricing_map, pricing_rows


def _append_missing_pricing_rows(rows):
    if not rows:
        return

    file_exists = PRICING_FILE_PATH.exists()
    PRICING_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)

    with PRICING_FILE_PATH.open("a", newline="", encoding="utf-8") as csv_file:
        fieldnames = ["service_name", "price", "description"]
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

        if not file_exists:
            writer.writeheader()

        for row in rows:
            writer.writerow(
                {
                    "service_name": row["service_name"],
                    "price": f"{float(row['price']):.2f}",
                    "description": row.get("description", ""),
                }
            )


def _extract_billing_meta(description: str):
    if not description:
        return {}

    marker_index = description.rfind(BILLING_META_PREFIX)
    if marker_index == -1:
        return {}

    raw_json = description[marker_index + len(BILLING_META_PREFIX) :].strip()
    try:
        parsed = json.loads(raw_json)
    except (TypeError, ValueError, json.JSONDecodeError):
        return {}

    if not isinstance(parsed, dict):
        return {}

    return parsed


def _build_issue_description(base_message: str, qty: float, rate: float, tax: float):
    payload = {
        "qty": qty,
        "rate": rate,
        "tax": tax,
    }
    return f"{base_message} {BILLING_META_PREFIX} {json.dumps(payload)}"


@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def BillDetails(request):
    return RoleBasedUrlHandler(request, BillDetailsView())


class BillDetailsView(BaseHandler):
    def getBillDetails(self, request):
        try:
            # Get vehicle_id from query parameters if provided
            vehicle_id = request.query_params.get("vehicle_id")

            # Get bills for vehicles owned by the current user
            bills_queryset = Bill.objects.filter(customer=request.user).select_related(
                "vehicle", "service", "issue"
            )

            # If vehicle_id is provided, filter by that specific vehicle
            if vehicle_id:
                bills_queryset = bills_queryset.filter(vehicle_id=vehicle_id)

            bills = bills_queryset.all().values(
                "bill_id",
                "vehicle__registration_number",
                "vehicle__vehicle_model",
                "service__service_id",
                "issue__issue_id",
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

        except Exception as e:
            logger.error(f"Error fetching bill details: {str(e)}")
            return JsonResponse(
                {
                    "success": False,
                    "message": "An error occurred while fetching bill details.",
                    "icon": "error",
                },
                status=500,
            )

        logger.info(
            f"Bill details fetched successfully for user {request.user.user_id}"
            + (f" and vehicle {vehicle_id}" if vehicle_id else "")
        )

        return JsonResponse(
            {
                "success": True,
                "message": "Bill details fetched successfully.",
                "icon": "success",
                "data": {
                    "bills": list(bills),
                },
            },
            status=200,
        )


@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def BillingFormData(request):
    return RoleBasedUrlHandler(request, BillingFormDataView())


@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def RegisterBillingItemsAsIssues(request):
    return RoleBasedUrlHandler(request, RegisterBillingItemsAsIssuesView())


class BillingFormDataView(BaseHandler):
    def getBillingFormData(self, request):
        try:
            pricing_map, pricing_rows = _load_pricing_catalog()

            services = (
                Service.objects.filter(serviceman=request.user)
                .select_related("vehicle", "vehicle__owner")
                .prefetch_related("tasks")
                .order_by("-service_id")
            )

            issues_qs = (
                Issues.objects.filter(assigned_to=request.user)
                .select_related("vehicle")
                .order_by("-issue_id")
            )

            issues_by_vehicle = {}
            for issue in issues_qs:
                issues_by_vehicle.setdefault(issue.vehicle_id, []).append(issue)

            products_map = {}
            records = []
            missing_rows = []
            missing_names = set()

            def add_product(name, price, description, source):
                key = _normalize_name(name)
                if not key:
                    return

                if key not in products_map:
                    products_map[key] = {
                        "name": name,
                        "price": round(float(price), 2),
                        "description": description,
                        "source": source,
                    }

            for row in pricing_rows:
                add_product(
                    row["service_name"],
                    row["price"],
                    row.get("description", ""),
                    "pricing_catalog",
                )

            for service in services:
                task_names = [task.task_name for task in service.tasks.all()]
                related_issues = issues_by_vehicle.get(service.vehicle_id, [])
                suggested_items_map = {}

                def upsert_suggested_item(name, price, source, issue_id=None):
                    key = _normalize_name(name)
                    if not key:
                        return

                    existing = suggested_items_map.get(key)
                    item = {
                        "name": name,
                        "price": round(float(price), 2),
                        "source": source,
                        "qty": 1,
                        "tax": 0,
                    }
                    if issue_id is not None:
                        item["issue_id"] = issue_id

                    # Prefer issue-based row over service-task row for same category
                    if existing is None or source == "issue":
                        suggested_items_map[key] = item

                for task_name in task_names:
                    key = _normalize_name(task_name)
                    catalog_entry = pricing_map.get(key)

                    if catalog_entry:
                        item_price = catalog_entry["price"]
                        item_desc = catalog_entry.get("description", "")
                    else:
                        item_price = 0.0
                        item_desc = f"Auto-added for service task: {task_name}"
                        if key and key not in missing_names:
                            missing_names.add(key)
                            missing_rows.append(
                                {
                                    "service_name": task_name,
                                    "price": item_price,
                                    "description": item_desc,
                                }
                            )

                    upsert_suggested_item(task_name, item_price, "service_task")
                    add_product(task_name, item_price, item_desc, "service_task")

                for issue in related_issues:
                    issue_name = issue.category
                    key = _normalize_name(issue_name)
                    billing_meta = _extract_billing_meta(issue.description)

                    qty_value = float(billing_meta.get("qty", 1) or 1)
                    tax_value = float(billing_meta.get("tax", 0) or 0)

                    # Always prefer tracked issue cost for issue rows
                    issue_price = float(billing_meta.get("rate", 0) or 0)
                    if issue_price <= 0:
                        issue_price = float(issue.cost or 0)

                    if issue_price <= 0:
                        catalog_entry = pricing_map.get(key)
                        issue_price = (
                            float(catalog_entry["price"]) if catalog_entry else 0.0
                        )

                    issue_desc = f"Auto-added from issue #{issue.issue_id} category: {issue.category}"
                    if key and key not in missing_names and issue_price > 0:
                        missing_names.add(key)
                        missing_rows.append(
                            {
                                "service_name": issue_name,
                                "price": issue_price,
                                "description": issue_desc,
                            }
                        )

                    upsert_suggested_item(
                        issue_name,
                        issue_price,
                        "issue",
                        issue_id=issue.issue_id,
                    )
                    issue_item_key = _normalize_name(issue_name)
                    if issue_item_key in suggested_items_map:
                        suggested_items_map[issue_item_key]["qty"] = max(qty_value, 1)
                        suggested_items_map[issue_item_key]["tax"] = max(tax_value, 0)
                    add_product(issue_name, issue_price, issue_desc, "issue")

                suggested_items = list(suggested_items_map.values())

                records.append(
                    {
                        "record_key": f"service-{service.service_id}",
                        "service_id": service.service_id,
                        "vehicle_id": service.vehicle_id,
                        "vehicle_no": service.vehicle.registration_number,
                        "vehicle_model": service.vehicle.vehicle_model,
                        "owner_name": (
                            service.vehicle.owner.name
                            if service.vehicle.owner
                            else "N/A"
                        ),
                        "owner_email": (
                            service.vehicle.owner.email
                            if service.vehicle.owner
                            else "N/A"
                        ),
                        "task_names": task_names,
                        "issue_ids": [issue.issue_id for issue in related_issues],
                        "suggested_items": suggested_items,
                    }
                )

            for issue in issues_qs:
                issue_name = issue.category
                key = _normalize_name(issue_name)
                if any(
                    issue.issue_id in record.get("issue_ids", []) for record in records
                ):
                    continue

                catalog_entry = pricing_map.get(key)
                billing_meta = _extract_billing_meta(issue.description)
                qty_value = float(billing_meta.get("qty", 1) or 1)
                tax_value = float(billing_meta.get("tax", 0) or 0)
                issue_price = float(billing_meta.get("rate", 0) or 0)
                if issue_price <= 0:
                    issue_price = float(issue.cost or 0)
                if issue_price <= 0 and catalog_entry:
                    issue_price = float(catalog_entry["price"])

                issue_desc = f"Auto-added from issue #{issue.issue_id} category: {issue.category}"
                if key and key not in missing_names and issue_price > 0:
                    missing_names.add(key)
                    missing_rows.append(
                        {
                            "service_name": issue_name,
                            "price": issue_price,
                            "description": issue_desc,
                        }
                    )

                add_product(issue_name, issue_price, issue_desc, "issue")

                records.append(
                    {
                        "record_key": f"issue-{issue.issue_id}",
                        "service_id": None,
                        "vehicle_id": issue.vehicle_id,
                        "vehicle_no": issue.vehicle.registration_number,
                        "vehicle_model": issue.vehicle.vehicle_model,
                        "owner_name": (
                            issue.vehicle.owner.name if issue.vehicle.owner else "N/A"
                        ),
                        "owner_email": (
                            issue.vehicle.owner.email if issue.vehicle.owner else "N/A"
                        ),
                        "task_names": [],
                        "issue_ids": [issue.issue_id],
                        "suggested_items": [
                            {
                                "name": issue_name,
                                "price": round(issue_price, 2),
                                "source": "issue",
                                "issue_id": issue.issue_id,
                                "qty": max(qty_value, 1),
                                "tax": max(tax_value, 0),
                            }
                        ],
                    }
                )

            if missing_rows:
                _append_missing_pricing_rows(missing_rows)

            products = sorted(
                [
                    {
                        "id": index + 1,
                        "name": product["name"],
                        "price": product["price"],
                        "description": product["description"],
                        "source": product["source"],
                    }
                    for index, product in enumerate(products_map.values())
                ],
                key=lambda item: item["name"].lower(),
            )

            now = timezone.now()

            return JsonResponse(
                {
                    "success": True,
                    "message": "Billing form data fetched successfully.",
                    "icon": "success",
                    "data": {
                        "meta": {
                            "bill_no_suggestion": f"BILL-{now.strftime('%Y%m%d%H%M%S')}",
                            "generated_at": now.isoformat(),
                            "biller_name": request.user.name,
                            "biller_email": request.user.email,
                        },
                        "records": records,
                        "products": products,
                    },
                },
                status=200,
            )

        except Exception as e:
            logger.error(f"Error fetching billing form data: {str(e)}", exc_info=True)
            return JsonResponse(
                {
                    "success": False,
                    "message": "An error occurred while fetching billing form data.",
                    "icon": "error",
                },
                status=500,
            )


class RegisterBillingItemsAsIssuesView(BaseHandler):
    def postRegisterBillingItemsAsIssues(self, request):
        try:
            role = getattr(request.user, "role", "")
            if role != "SERVICE":
                return JsonResponse(
                    {
                        "success": False,
                        "message": "Only service users can register billing items as issues.",
                        "icon": "error",
                    },
                    status=403,
                )

            vehicle_id = request.data.get("vehicle_id")
            items = request.data.get("items", [])
            service_id = request.data.get("service_id")
            payment_method = (request.data.get("payment_method") or "").strip()
            place = (request.data.get("place") or "Service Center").strip()

            if not vehicle_id:
                return JsonResponse(
                    {
                        "success": False,
                        "message": "vehicle_id is required.",
                        "icon": "error",
                    },
                    status=400,
                )

            if not isinstance(items, list) or len(items) == 0:
                return JsonResponse(
                    {
                        "success": False,
                        "message": "At least one bill item is required.",
                        "icon": "error",
                    },
                    status=400,
                )

            related_service = None
            assigned_service = (
                Service.objects.filter(serviceman=request.user, vehicle_id=vehicle_id)
                .select_related("vehicle", "vehicle__owner")
                .order_by("-service_id")
                .first()
            )

            if service_id:
                related_service = Service.objects.filter(
                    service_id=service_id,
                    serviceman=request.user,
                    vehicle_id=vehicle_id,
                ).first()

                if not related_service:
                    return JsonResponse(
                        {
                            "success": False,
                            "message": "Invalid service selected for this vehicle.",
                            "icon": "error",
                        },
                        status=400,
                    )
                assigned_service = related_service
            else:
                if not assigned_service:
                    return JsonResponse(
                        {
                            "success": False,
                            "message": "You are not assigned to this vehicle.",
                            "icon": "error",
                        },
                        status=403,
                    )

            vehicle = assigned_service.vehicle

            allowed_payment_methods = {value for value, _ in Bill.PaymentMethod.choices}
            if payment_method and payment_method not in allowed_payment_methods:
                return JsonResponse(
                    {
                        "success": False,
                        "message": "Invalid payment method.",
                        "icon": "error",
                    },
                    status=400,
                )

            created = []
            updated = []
            skipped = []
            first_tracked_issue = None
            subtotal_amount = Decimal("0.00")

            for raw_item in items:
                category = (raw_item.get("name") or "").strip()
                qty = raw_item.get("qty", 1)
                rate = raw_item.get("rate", 0)
                tax = raw_item.get("tax", 0)

                try:
                    qty = float(qty)
                    rate = float(rate)
                    tax = float(tax)
                except (TypeError, ValueError):
                    skipped.append(
                        {
                            "item": category or "Unnamed Item",
                            "reason": "Invalid qty/rate/tax values.",
                        }
                    )
                    continue

                if not category:
                    skipped.append(
                        {
                            "item": "Unnamed Item",
                            "reason": "Item name is required.",
                        }
                    )
                    continue

                if qty <= 0 or rate < 0:
                    skipped.append(
                        {
                            "item": category,
                            "reason": "Qty must be > 0 and rate must be >= 0.",
                        }
                    )
                    continue

                line_subtotal = Decimal(str(qty)) * Decimal(str(rate))
                line_tax = Decimal(str(tax))
                line_total = line_subtotal + line_tax
                subtotal_amount += line_subtotal
                computed_cost = int(round(float(line_total)))

                existing_issue = (
                    Issues.objects.filter(
                        vehicle_id=vehicle_id,
                        assigned_to=request.user,
                        is_resolved=False,
                        category__iexact=category,
                    )
                    .order_by("-issue_id")
                    .first()
                )

                if existing_issue:
                    existing_issue.cost = computed_cost
                    existing_issue.description = _build_issue_description(
                        f"Updated from billing workflow by {request.user.name}.",
                        qty,
                        rate,
                        tax,
                    )
                    existing_issue.save(update_fields=["cost", "description"])
                    issue = existing_issue
                    updated.append(
                        {
                            "issue_id": issue.issue_id,
                            "category": issue.category,
                            "cost": issue.cost,
                        }
                    )
                else:
                    issue = Issues.objects.create(
                        vehicle_id=vehicle_id,
                        category=category,
                        description=_build_issue_description(
                            f"Registered from billing workflow by {request.user.name}.",
                            qty,
                            rate,
                            tax,
                        ),
                        assigned_to=request.user,
                        assigned_by=request.user,
                        priority=Issues.Priority.LOW,
                        is_resolved=False,
                        cost=computed_cost,
                    )
                    created.append(
                        {
                            "issue_id": issue.issue_id,
                            "category": issue.category,
                            "cost": issue.cost,
                        }
                    )

                if first_tracked_issue is None:
                    first_tracked_issue = issue

            try:
                tax_percentage = Decimal("10.00")
                tax_amount = (subtotal_amount * tax_percentage) / Decimal("100")
                discount_amount = Decimal("0.00")
                total_amount = subtotal_amount + tax_amount - discount_amount

                bill = Bill.objects.create(
                    service=related_service,
                    issue=first_tracked_issue,
                    vehicle=vehicle,
                    customer=vehicle.owner or request.user,
                    due_date=timezone.now() + timedelta(days=7),
                    subtotal=subtotal_amount,
                    tax_percentage=tax_percentage,
                    tax_amount=tax_amount,
                    discount=discount_amount,
                    total_amount=total_amount,
                    payment_method=payment_method if payment_method else None,
                    notes=f"Generated from service billing UI ({place}).",
                )
            except (InvalidOperation, ValueError):
                return JsonResponse(
                    {
                        "success": False,
                        "message": "Unable to compute bill totals.",
                        "icon": "error",
                    },
                    status=400,
                )

            message = (
                f"{len(created)} issue(s) created and {len(updated)} issue(s) updated."
                if (created or updated)
                else "No issue records were created or updated."
            )

            return JsonResponse(
                {
                    "success": True,
                    "message": message,
                    "icon": "success",
                    "data": {
                        "vehicle_id": vehicle_id,
                        "service_id": (
                            related_service.service_id if related_service else None
                        ),
                        "created_issues": created,
                        "updated_issues": updated,
                        "skipped_items": skipped,
                        "bill": {
                            "bill_id": bill.bill_id,
                            "bill_date": bill.bill_date.isoformat(),
                            "due_date": bill.due_date.isoformat(),
                            "vehicle_no": vehicle.registration_number,
                            "vehicle_model": vehicle.vehicle_model,
                            "customer": (
                                vehicle.owner.name
                                if vehicle.owner
                                else request.user.name
                            ),
                            "service_id": (
                                related_service.service_id if related_service else None
                            ),
                            "payment_method": bill.payment_method,
                            "payment_status": bill.payment_status,
                            "subtotal": float(bill.subtotal),
                            "tax_percentage": float(bill.tax_percentage),
                            "tax_amount": float(bill.tax_amount),
                            "discount": float(bill.discount),
                            "total_amount": float(bill.total_amount),
                            "notes": bill.notes,
                        },
                    },
                },
                status=200,
            )

        except Exception as e:
            logger.error(
                f"Error registering billing items as issues: {str(e)}",
                exc_info=True,
            )
            return JsonResponse(
                {
                    "success": False,
                    "message": "An error occurred while registering bill items.",
                    "icon": "error",
                },
                status=500,
            )
