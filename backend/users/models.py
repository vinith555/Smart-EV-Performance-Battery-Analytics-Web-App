from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


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


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        PERSONAL = "PERSONAL", "Personal User"
        SERVICE = "SERVICE", "Service User"

    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PERSONAL)
    company = models.ForeignKey(
        Company, on_delete=models.SET_NULL, null=True, blank=True, related_name="users"
    )
    performance = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    is_active = models.BooleanField(default=True)
    deactivated_at = models.DateTimeField(null=True, blank=True)


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
    cost= models.IntegerField()
    efficiency = models.IntegerField()
    status = models.CharField(max_length=20)
    notes= models.TextField(blank=True)


class VehicleStats(models.Model):
    stats_id = models.AutoField(primary_key=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="stats")
    battery_percentage = models.IntegerField()
    total=models.IntegerField()
    battery_health = models.IntegerField()
    charging_time = models.IntegerField()
    temperature = models.IntegerField()
    battery_capacity = models.IntegerField()
    is_charging = models.BooleanField(default=False)
    estimated_range = models.IntegerField()
    recorded_at = models.DateTimeField(auto_now_add=True)
    
class ChargeHistory(models.Model):
    charge_id = models.AutoField(primary_key=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="charge_history")
    charge_date = models.DateTimeField()
    charge_start_time = models.DateTimeField()
    charge_end_time = models.DateTimeField()
    energy_added_kwh = models.IntegerField()
    cost = models.IntegerField()

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
    completed_at = models.DateTimeField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class ServiceTask(models.Model):
    task_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

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
    assigned_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="assigned_services_by")
    assigned_to = models.ForeignKey(User, on_delete=models.PROTECT, related_name="assigned_services_to")
    priority = models.CharField(
        max_length=10, choices=Priority.choices, default=Priority.LOW)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    sla_time = models.IntegerField()
    sla_status = models.CharField(max_length=20)
    notes= models.TextField(blank=True)
    rating = models.IntegerField()


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
    date_completed = models.DateTimeField(null=True)
    assigned_to = models.ForeignKey(User, on_delete=models.PROTECT, null=True, related_name="assigned_issues")
    assigned_by = models.ForeignKey(User, on_delete=models.PROTECT, null=True, related_name="reported_issues")
    priority = models.CharField(
        max_length=10, choices=Priority.choices, default=Priority.LOW
    )
    is_resolved = models.BooleanField(default=False)
    cost = models.IntegerField()
    


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
