from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.core.validators import MinValueValidator, MaxValueValidator


class CustomUserManager(BaseUserManager):
    """Custom user manager that uses email as the unique identifier."""

    def create_user(self, email, name, password=None, **extra_fields):
        """Create and save a regular user."""
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        """Create and save a superuser."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if not extra_fields.get("is_staff"):
            raise ValueError("Superuser must have is_staff=True")
        if not extra_fields.get("is_superuser"):
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(email, name, password, **extra_fields)


class Company(models.Model):
    company_id = models.AutoField(primary_key=True)
    company_name = models.CharField(max_length=255)
    address = models.TextField()
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=10)
    vehicle_manufactured_count = models.IntegerField()
    vehicle_sold_count = models.IntegerField()
    is_active = models.BooleanField(default=True)
    deactivated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.company_name} ({self.company_id})"


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        PERSONAL = "PERSONAL", "Personal User"
        SERVICE = "SERVICE", "Service User"

    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PERSONAL)
    company = models.ForeignKey(
        Company, on_delete=models.SET_NULL, null=True, blank=True, related_name="users"
    )
    performance = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(10)], default=0
    )
    phone = models.CharField(max_length=20, blank=True, default='')
    linkedin = models.URLField(max_length=500, blank=True, default='')
    twitter = models.URLField(max_length=500, blank=True, default='')
    facebook = models.URLField(max_length=500, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    deactivated_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = "email"
    USER_ID_FIELD = "user_id"
    REQUIRED_FIELDS = ["name"]

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.name} <{self.email}>"


class Vehicle(models.Model):
    vehicle_id = models.AutoField(primary_key=True)
    vehicle_model = models.CharField(max_length=255)
    vehicle_colour = models.CharField()
    registration_number = models.CharField(max_length=10)
    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_vehicle",
    )
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="vehicles"
    )
    is_sold = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    deactivated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.vehicle_model} ({self.registration_number})"


class Trip(models.Model):
    trip_id = models.AutoField(primary_key=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="trips")
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    start_location = models.CharField(max_length=255)
    end_location = models.CharField(max_length=255)
    distance = models.IntegerField()
    duration = models.IntegerField()
    average_speed = models.IntegerField()
    battery_used = models.IntegerField()
    cost = models.IntegerField()
    efficiency = models.IntegerField()
    status = models.CharField(max_length=20)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Trip {self.trip_id} - Vehicle {self.vehicle_id}"


class VehicleStats(models.Model):
    stats_id = models.AutoField(primary_key=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="stats")
    battery_percentage = models.IntegerField()
    total = models.IntegerField()
    battery_health = models.IntegerField()
    charging_time = models.IntegerField()
    temperature = models.IntegerField()
    battery_capacity = models.IntegerField()
    is_charging = models.BooleanField(default=False)
    estimated_range = models.IntegerField()
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Stats {self.stats_id} - Vehicle {self.vehicle_id}"


class ChargeHistory(models.Model):
    charge_id = models.AutoField(primary_key=True)
    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.CASCADE, related_name="charge_history"
    )
    charge_date = models.DateField()
    charge_start_time = models.TimeField()
    charge_end_time = models.TimeField()
    energy_added_kwh = models.IntegerField()
    cost = models.IntegerField()

    def __str__(self):
        return f"Charge {self.charge_id} - Vehicle {self.vehicle_id}"


class Task(models.Model):
    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"

    task_id = models.AutoField(primary_key=True)
    assigned_to = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="tasks"
    )
    date_assigned = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    priority = models.CharField(
        max_length=10, choices=Priority.choices, default=Priority.LOW
    )
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.priority})"


class ServiceTask(models.Model):
    task_id = models.AutoField(primary_key=True)
    task_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.CASCADE, related_name="service_tasks"
    )
    serviceman = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="service_tasks"
    )

    def __str__(self):
        return self.task_name


class Service(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ONGOING = "ONGOING", "Ongoing"
        COMPLETED = "COMPLETED", "Completed"

    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"

    service_id = models.AutoField(primary_key=True)
    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.PROTECT, related_name="services"
    )
    serviceman = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="assigned_services"
    )
    tasks = models.ManyToManyField(ServiceTask, related_name="services")
    start_time = models.DateTimeField()
    deadline = models.DateTimeField()
    assigned_by = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="assigned_services_by"
    )
    assigned_to = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="assigned_services_to"
    )
    priority = models.CharField(
        max_length=10, choices=Priority.choices, default=Priority.LOW
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    sla_time = models.IntegerField()
    sla_status = models.CharField(max_length=20)
    notes = models.TextField(blank=True)
    rating = models.IntegerField()

    def __str__(self):
        return f"Service {self.service_id} - Vehicle {self.vehicle_id}"


class Issues(models.Model):
    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"

    issue_id = models.AutoField(primary_key=True)
    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.PROTECT, related_name="issues"
    )
    category = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date_reported = models.DateTimeField(auto_now_add=True)
    date_completed = models.DateTimeField(null=True, blank=True)
    assigned_to = models.ForeignKey(
        User, on_delete=models.PROTECT, null=True, related_name="assigned_issues"
    )
    assigned_by = models.ForeignKey(
        User, on_delete=models.PROTECT, null=True, related_name="reported_issues"
    )
    priority = models.CharField(
        max_length=10, choices=Priority.choices, default=Priority.LOW
    )
    is_resolved = models.BooleanField(default=False)
    cost = models.IntegerField()

    def __str__(self):
        return f"Issue {self.issue_id} - {self.category}"


class Notification(models.Model):
    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"

    notification_id = models.AutoField(primary_key=True)
    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.PROTECT, null=True, related_name="alerts"
    )
    user = models.ForeignKey(
        User, on_delete=models.PROTECT, null=True, related_name="notifications"
    )
    priority = models.CharField(
        max_length=10, choices=Priority.choices, default=Priority.LOW
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification {self.notification_id} - {self.priority}"


class Bill(models.Model):
    class PaymentStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PAID = "PAID", "Paid"
        OVERDUE = "OVERDUE", "Overdue"
        CANCELLED = "CANCELLED", "Cancelled"

    class PaymentMethod(models.TextChoices):
        CASH = "CASH", "Cash"
        CARD = "CARD", "Card"
        UPI = "UPI", "UPI"
        NET_BANKING = "NET_BANKING", "Net Banking"
        WALLET = "WALLET", "Wallet"

    bill_id = models.AutoField(primary_key=True)
    service = models.ForeignKey(
        Service, on_delete=models.PROTECT, null=True, blank=True, related_name="bills"
    )
    issue = models.ForeignKey(
        Issues, on_delete=models.PROTECT, null=True, blank=True, related_name="bills"
    )
    vehicle = models.ForeignKey(Vehicle, on_delete=models.PROTECT, related_name="bills")
    customer = models.ForeignKey(User, on_delete=models.PROTECT, related_name="bills")
    bill_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    payment_method = models.CharField(
        max_length=20, choices=PaymentMethod.choices, null=True, blank=True
    )
    payment_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Bill {self.bill_id} - {self.customer.name} - ₹{self.total_amount}"

    def calculate_totals(self):
        """Calculate tax and total amount based on subtotal."""
        self.tax_amount = (self.subtotal * self.tax_percentage) / 100
        self.total_amount = self.subtotal + self.tax_amount - self.discount
        return self.total_amount
