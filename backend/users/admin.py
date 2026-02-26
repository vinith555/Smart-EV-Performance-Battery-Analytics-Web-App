from django.contrib import admin
from .models import User, Company, Vehicle, Trip, Service

# Register your models here.
admin.site.register(User)
admin.site.register(Company)
admin.site.register(Vehicle)
admin.site.register(Trip)
admin.site.register(Service)