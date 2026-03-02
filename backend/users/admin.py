from django.contrib import admin
from .models import User, Company, Vehicle, Trip, Service, VehicleStats, ChargeHistory, Task, ServiceTask, Service, Issues, Notification, Bill

# Register your models here.
admin.site.register(User)
admin.site.register(Company)
admin.site.register(Vehicle)
admin.site.register(VehicleStats)
admin.site.register(ChargeHistory)
admin.site.register(Task)
admin.site.register(ServiceTask)
admin.site.register(Issues)
admin.site.register(Trip) 
admin.site.register(Service)
admin.site.register(Bill)
admin.site.register(Notification)