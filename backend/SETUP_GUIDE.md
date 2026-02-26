# Smart EV Performance Battery Analytics - Backend Setup Guide

## Created Files and Configurations

### 1. **role_based_url_handler.py** ✅ CREATED

Location: `/backend/users/views/role_based_url_handler.py`

**Purpose:** Handles role-based URL routing and delegates requests to appropriate handler methods.

**Key Classes:**

- `BaseHandler`: Base class for all view handlers
- `RoleBasedUrlHandler`: Handles request routing based on user role and HTTP method

**How it works:**

1. Receives HTTP request and handler instance
2. Checks user authentication
3. Maps HTTP methods (GET, POST, PUT, DELETE, PATCH) to handler methods
4. Supports role-specific method routing (e.g., `getAdmin`, `getService`, `getPersonal`)
5. Falls back to generic methods (e.g., `getVehicleDetails`)

**Example Usage:**

```python
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def VehicleDetails(request):
    return RoleBasedUrlHandler(request, VehicleDetailsView())
```

---

### 2. **Updated LoginSerializer.py** ✅ FIXED

Location: `/backend/users/serializers/LoginSerializer.py`

**Changes Made:**

- Fixed user object reference (was using class attributes instead of instance)
- Now properly returns user instance data in JWT response

**Response Structure:**

```json
{
  "user_id": "user-uuid",
  "email": "user@example.com",
  "role": "PERSONAL",
  "access": "jwt-access-token",
  "refresh": "jwt-refresh-token"
}
```

---

### 3. **.env.example** ✅ CREATED

Location: `/backend/.env.example`

**Purpose:** Template file showing all required environment variables.

**Contains:**

- Django settings (SECRET_KEY, DEBUG, ALLOWED_HOSTS)
- Database credentials
- JWT configuration
- Email settings (optional)
- AWS S3 settings (optional)
- API keys (optional)
- Redis configuration (optional)

**Usage:**

```bash
cp .env.example .env
# Edit .env with your actual values
```

---

### 4. **Updated settings.py** ✅ MODIFIED

Location: `/backend/config/settings.py`

**Changes Made:**

- Properly imports `load_dotenv()` from python-dotenv
- All sensitive credentials now loaded from `.env` file
- Database configuration uses environment variables
- Added fallback values for development

**Key Environment Variables Used:**

```python
SECRET_KEY = os.getenv('SECRET_KEY', 'fallback-default')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'ev_analytics_db'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}
```

---

### 5. **Updated views/**init**.py** ✅ MODIFIED

Location: `/backend/users/views/__init__.py`

**Changes Made:**

- Added imports for all view modules
- Exported `RoleBasedUrlHandler` and `BaseHandler`
- Enables proper module organization

---

## How to Use Environment Variables

### Step 1: Create `.env` file

```bash
cd /backend
cp .env.example .env
```

### Step 2: Edit `.env` with your credentials

```env
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

DB_NAME=ev_analytics_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

JWT_SECRET=your-jwt-secret-key
```

### Step 3: Add `.env` to `.gitignore`

```bash
echo ".env" >> .gitignore
```

### Step 4: Access in Django code

```python
import os
from dotenv import load_dotenv

load_dotenv()

# Access variables
secret = os.getenv('SECRET_KEY')
debug = os.getenv('DEBUG') == 'True'
```

---

## View Handler Implementation Pattern

### Example: Implementing a new view handler

```python
# views/MyView.py
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from .role_based_url_handler import RoleBasedUrlHandler, BaseHandler
from django.http import JsonResponse

@csrf_exempt
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def MyEndpoint(request):
    return RoleBasedUrlHandler(request, MyHandler())

class MyHandler(BaseHandler):
    def getMyData(self, request):
        # Handle GET request
        return JsonResponse({
            "success": True,
            "data": []
        })

    def postMyData(self, request):
        # Handle POST request
        return JsonResponse({
            "success": True,
            "message": "Data created"
        })

    # Optional: Role-specific methods
    def getAdmin(self, request):
        # Handle GET for ADMIN role
        pass

    def getService(self, request):
        # Handle GET for SERVICE role
        pass

    def getPersonal(self, request):
        # Handle GET for PERSONAL role
        pass
```

---

## URL Configuration

All endpoints are configured in `/backend/users/urls.py`:

```python
path("get-vehicle-details", VehicleViews.VehicleDetails, name="vehicle-details"),
path("get-trip-details", TripDetailsView.TripDetails, name="trip-details"),
path("get-service-details", ServiceView.ServiceDetails, name="service-details"),
path("get-issue-details", IssuesView.IssueDetails, name="issue-details"),
path("get-user-details-by-vehicle", UserInfoView.UserDetailsByVehicle, name="user-details-by-vehicle"),
```

---

## Required Models

All required models already exist in `/backend/users/models.py`:

1. ✅ **User** - Custom user model with role support
2. ✅ **Vehicle** - Vehicle information
3. ✅ **VehicleStats** - Vehicle statistics
4. ✅ **Trip** - Trip details
5. ✅ **Service** - Service records
6. ✅ **Issues** - Issue tracking
7. ✅ **ChargeHistory** - Charging records
8. ✅ **Task** - Task management
9. ✅ **ServiceTask** - Service task definitions
10. ✅ **Notification** - User notifications
11. ✅ **Company** - Company information

---

## Testing the Setup

### 1. Check if all imports work:

```bash
cd /backend
python manage.py shell
>>> from users.views import IssuesView, VehicleViews, ServiceView
>>> from users.views.role_based_url_handler import RoleBasedUrlHandler, BaseHandler
>>> print("All imports successful!")
```

### 2. Run migrations:

```bash
python manage.py migrate
```

### 3. Start the development server:

```bash
python manage.py runserver
```

### 4. Test endpoints:

```bash
# Login first to get JWT tokens
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use the access token in subsequent requests
curl -X GET http://localhost:8000/api/users/get-vehicle-details \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Security Best Practices

1. **Never commit `.env` file** - Always add to `.gitignore`
2. **Use strong SECRET_KEY** - Generate with `django-insecure-check`
3. **Set DEBUG=False in production**
4. **Rotate JWT secrets regularly**
5. **Use HTTPS in production**
6. **Implement rate limiting** for API endpoints
7. **Validate and sanitize all inputs**
8. **Use environment-specific settings**

---

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'dotenv'"

**Solution:** Install python-dotenv

```bash
pip install python-dotenv
```

### Issue: "Missing environment variables"

**Solution:** Create `.env` file with required variables

```bash
cp .env.example .env
# Edit with your values
```

### Issue: Database connection failed

**Solution:** Check database credentials in `.env`

```bash
# Verify PostgreSQL is running
psql -U postgres -d ev_analytics_db
```

### Issue: JWT authentication failing

**Solution:** Ensure valid SECRET_KEY and JWT tokens in `.env`

```bash
# Generate new SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## Next Steps

1. ✅ Create `.env` file with your credentials
2. ✅ Update database settings if needed
3. ✅ Run migrations: `python manage.py migrate`
4. ✅ Create admin user: `python manage.py createsuperuser`
5. ✅ Test endpoints with Postman or curl
6. ✅ Configure CORS settings for frontend
7. ✅ Set up logging for production

---

## Project Structure

```
backend/
├── config/
│   ├── settings.py (✅ Updated with env vars)
│   ├── urls.py
│   └── wsgi.py
├── users/
│   ├── views/
│   │   ├── __init__.py (✅ Updated)
│   │   ├── role_based_url_handler.py (✅ Created)
│   │   ├── IssuesView.py
│   │   ├── VehicleViews.py
│   │   ├── ServiceView.py
│   │   ├── TripDetailsView.py
│   │   ├── UserInfoView.py
│   │   └── loginView.py
│   ├── serializers/
│   │   ├── LoginSerializer.py (✅ Fixed)
│   │   └── __init__.py
│   ├── models.py (✅ All models exist)
│   ├── urls.py
│   └── migrations/
├── manage.py
├── requirements.txt
├── .env.example (✅ Created)
└── .env (Create this - don't commit)
```

---

For more help, refer to:

- [Django dotenv documentation](https://github.com/theskumar/python-dotenv)
- [Django Settings Documentation](https://docs.djangoproject.com/en/6.0/topics/settings/)
- [Django REST Framework Documentation](https://www.django-rest-framework.org/)
