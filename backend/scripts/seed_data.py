import random
from faker import Faker
from django.utils import timezone
from users.models import (
    User, Vehicle, Trip, VehicleStats, ChargeHistory,
    Task, ServiceTask, Service, Issues, Notification, Bill
)

fake = Faker()

def run():

    # USERS (15)
    users = []
    for i in range(15):
        user = User.objects.create(
            name=fake.name(),
            email=fake.unique.email(),
            role=random.choice(["ADMIN", "PERSONAL", "SERVICE"]),
            phone=str(random.randint(6000000000, 9999999999)),
            bio=fake.text(),
        )
        users.append(user)

    # VEHICLES (12)
    vehicles = []
    for i in range(12):
        vehicle = Vehicle.objects.create(
            vehicle_model=random.choice(["Tesla Model 3","Tata Nexon EV","MG ZS EV","Hyundai Kona"]),
            vehicle_colour=random.choice(["Red","Blue","Black","White"]),
            registration_number=f"KA{random.randint(10,99)}AB{random.randint(1000,9999)}",
            owner=random.choice(users),
            company_id=1,
        )
        vehicles.append(vehicle)

    # TRIPS (12)
    for i in range(12):
        Trip.objects.create(
            vehicle=random.choice(vehicles),
            start_date=fake.date_time_this_year(),
            end_date=fake.date_time_this_year(),
            start_location=fake.city(),
            end_location=fake.city(),
            distance=random.randint(10,200),
            duration=random.randint(20,300),
            average_speed=random.randint(20,80),
            battery_used=random.randint(5,50),
            cost=random.randint(50,500),
            efficiency=random.randint(3,8),
            status=random.choice(["COMPLETED","ONGOING"]),
            notes=fake.text(),
        )

    # VEHICLE STATS (15)
    for i in range(15):
        VehicleStats.objects.create(
            vehicle=random.choice(vehicles),
            battery_percentage=random.randint(10,100),
            total=random.randint(1000,20000),
            battery_health=random.randint(70,100),
            charging_time=random.randint(20,120),
            temperature=random.randint(20,45),
            battery_capacity=random.randint(30,75),
            is_charging=random.choice([True, False]),
            estimated_range=random.randint(100,450),
        )

    # CHARGE HISTORY (10)
    for i in range(10):
        ChargeHistory.objects.create(
            vehicle=random.choice(vehicles),
            charge_date=fake.date_this_year(),
            charge_start_time=fake.time(),
            charge_end_time=fake.time(),
            energy_added_kwh=random.randint(10,60),
            cost=random.randint(100,800),
        )

    # TASKS (12)
    for i in range(12):
        Task.objects.create(
            assigned_to=random.choice(users),
            title=fake.sentence(),
            description=fake.text(),
            priority=random.choice(["LOW","MEDIUM","HIGH"]),
            is_completed=random.choice([True, False]),
        )

    # SERVICE TASKS (10)
    service_tasks = []
    for i in range(10):
        st = ServiceTask.objects.create(
            task_name=fake.word(),
            description=fake.text(),
            vehicle=random.choice(vehicles),
            serviceman=random.choice(users),
        )
        service_tasks.append(st)

    # SERVICES (10)
    services = []
    for i in range(10):
        s = Service.objects.create(
            vehicle=random.choice(vehicles),
            serviceman=random.choice(users),
            start_time=fake.date_time_this_year(),
            deadline=fake.date_time_this_year(),
            assigned_by=random.choice(users),
            assigned_to=random.choice(users),
            priority=random.choice(["LOW","MEDIUM","HIGH"]),
            status=random.choice(["PENDING","ONGOING","COMPLETED"]),
            sla_time=random.randint(1,48),
            sla_status=random.choice(["OK","BREACHED"]),
            notes=fake.text(),
            rating=random.randint(1,5),
        )
        s.tasks.set(random.sample(service_tasks, 2))
        services.append(s)

    # ISSUES (12)
    issues = []
    for i in range(12):
        issue = Issues.objects.create(
            vehicle=random.choice(vehicles),
            category=random.choice(["Battery","Motor","Brake","Software"]),
            description=fake.text(),
            assigned_to=random.choice(users),
            assigned_by=random.choice(users),
            priority=random.choice(["LOW","MEDIUM","HIGH"]),
            cost=random.randint(500,5000),
        )
        issues.append(issue)

    # NOTIFICATIONS (10)
    for i in range(10):
        Notification.objects.create(
            vehicle=random.choice(vehicles),
            user=random.choice(users),
            priority=random.choice(["LOW","MEDIUM","HIGH"]),
            message=fake.sentence(),
        )

    # BILLS (10)
    for i in range(10):
        subtotal=random.randint(1000,10000)
        tax= subtotal * 0.18

        Bill.objects.create(
            service=random.choice(services),
            issue=random.choice(issues),
            vehicle=random.choice(vehicles),
            customer=random.choice(users),
            due_date=fake.date_time_this_year(),
            subtotal=subtotal,
            tax_amount=tax,
            total_amount=subtotal + tax,
            payment_status=random.choice(["PENDING","PAID"]),
        )

    print("✅ 10–15 sample records created successfully")