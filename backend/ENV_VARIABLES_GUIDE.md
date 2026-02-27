# Environment Variables - Quick Reference Guide

## Overview

Environment variables are loaded from `.env` file in the `backend/` directory using `python-dotenv`.

## How to Access Credentials in Your Code

### Method 1: Using `os.getenv()` (Most Common)

```python
import os
from dotenv import load_dotenv

load_dotenv()

# Access with fallback value
secret_key = os.getenv('SECRET_KEY', 'fallback-value')
debug_mode = os.getenv('DEBUG', 'False') == 'True'
database_url = os.getenv('DB_URL')
```

### Method 2: Using `decouple` (Alternative - More Elegant)

```python
from decouple import config

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', cast=bool, default=False)
DB_NAME = config('DB_NAME', default='ev_analytics_db')
```

### Method 3: In Django Settings (Already Configured)

```python
# In settings.py
SECRET_KEY = os.getenv('SECRET_KEY', 'fallback-default')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
```

---

## Available Environment Variables

### Django Core

| Variable        | Type    | Example                 | Default               |
| --------------- | ------- | ----------------------- | --------------------- |
| `SECRET_KEY`    | String  | `django-insecure-xxxxx` | Required              |
| `DEBUG`         | Boolean | `True` or `False`       | `True`                |
| `ALLOWED_HOSTS` | CSV     | `localhost,127.0.0.1`   | `localhost,127.0.0.1` |

### Database

| Variable      | Type   | Example           | Default           |
| ------------- | ------ | ----------------- | ----------------- |
| `DB_NAME`     | String | `ev_analytics_db` | `ev_analytics_db` |
| `DB_USER`     | String | `postgres`        | `postgres`        |
| `DB_PASSWORD` | String | `password123`     | Empty             |
| `DB_HOST`     | String | `localhost`       | `localhost`       |
| `DB_PORT`     | Number | `5432`            | `5432`            |

### JWT / Authentication

| Variable        | Type   | Example             |
| --------------- | ------ | ------------------- |
| `JWT_SECRET`    | String | Your JWT secret key |
| `JWT_ALGORITHM` | String | `HS256`             |

### Email (Optional)

| Variable              | Type    | Example                                       |
| --------------------- | ------- | --------------------------------------------- |
| `EMAIL_BACKEND`       | String  | `django.core.mail.backends.smtp.EmailBackend` |
| `EMAIL_HOST`          | String  | `smtp.gmail.com`                              |
| `EMAIL_PORT`          | Number  | `587`                                         |
| `EMAIL_USE_TLS`       | Boolean | `True`                                        |
| `EMAIL_HOST_USER`     | String  | `your-email@gmail.com`                        |
| `EMAIL_HOST_PASSWORD` | String  | Your app password                             |

### AWS S3 (Optional)

| Variable                  | Type   | Example          |
| ------------------------- | ------ | ---------------- |
| `AWS_ACCESS_KEY_ID`       | String | Your AWS key     |
| `AWS_SECRET_ACCESS_KEY`   | String | Your AWS secret  |
| `AWS_STORAGE_BUCKET_NAME` | String | Your bucket name |

---

## Step-by-Step Setup

### 1. Create `.env` File

```bash
cd backend
cp .env.example .env
```

### 2. Edit `.env` with Your Values

```bash
nano .env
# or
vim .env
# or use your IDE
```

### 3. Fill in Required Credentials

```env
# Django
SECRET_KEY=your-super-secret-key-123456789
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

# Database
DB_NAME=ev_analytics_db
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_ALGORITHM=HS256
```

### 4. Add to `.gitignore`

```bash
echo ".env" >> ../.gitignore
# or
echo ".env" >> .gitignore
```

### 5. Verify Configuration

```bash
python manage.py check
```

---

## Accessing in Different Parts of Your App

### In Views

```python
from django.conf import settings
import os

def my_view(request):
    secret = settings.SECRET_KEY
    # or
    secret = os.getenv('SECRET_KEY')
```

### In Models

```python
from django.conf import settings

class MyModel(models.Model):
    is_active = models.BooleanField(default=settings.DEBUG)
```

### In Serializers

```python
from rest_framework import serializers
import os

class MySerializer(serializers.Serializer):
    def validate(self, data):
        if os.getenv('DEBUG') == 'True':
            # Dev mode behavior
            pass
```

### In Middleware

```python
import os

class MyMiddleware:
    def __call__(self, request):
        api_key = os.getenv('EXTERNAL_API_KEY')
        # Use the key
```

### In Management Commands

```python
from django.core.management.base import BaseCommand
import os

class Command(BaseCommand):
    def handle(self, *args, **options):
        db_name = os.getenv('DB_NAME')
```

---

## Common Patterns

### Database Connection String

```python
# Format: postgresql://user:password@host:port/dbname
DATABASE_URL = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"

DATABASES = {
    'default': dj_database_url.config(default=DATABASE_URL)
}
```

### Email Configuration

```python
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
```

### API Keys

```python
# Load multiple API keys
EXTERNAL_API_KEY = os.getenv('EXTERNAL_API_KEY')
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
```

### Feature Flags

```python
ENABLE_ANALYTICS = os.getenv('ENABLE_ANALYTICS', 'True') == 'True'
ENABLE_EMAIL_NOTIFICATIONS = os.getenv('ENABLE_EMAIL_NOTIFICATIONS', 'False') == 'True'
CACHE_ENABLED = os.getenv('CACHE_ENABLED', 'True') == 'True'
```

---

## Debugging Environment Variables

### Check if Variable is Loaded

```python
import os
from dotenv import load_dotenv

load_dotenv()
print(os.getenv('SECRET_KEY'))  # Will print the value or None
```

### List All Environment Variables

```python
import os
from dotenv import load_dotenv

load_dotenv()
for key, value in os.environ.items():
    if not value.startswith('/'):  # Skip system paths
        print(f"{key}={value}")
```

### Check if `.env` File Exists

```python
import os
from pathlib import Path

env_file = Path(__file__).parent / '.env'
print(f".env exists: {env_file.exists()}")
print(f".env path: {env_file}")
```

### Django Shell Check

```bash
python manage.py shell
>>> import os
>>> from dotenv import load_dotenv
>>> load_dotenv()
>>> os.getenv('SECRET_KEY')
'your-secret-key-value'
```

---

## Security Best Practices

### Do's ✅

- ✅ Always use environment variables for sensitive data
- ✅ Add `.env` to `.gitignore`
- ✅ Use strong, random SECRET_KEY
- ✅ Rotate credentials regularly
- ✅ Use different credentials for different environments
- ✅ Keep `.env.example` without real credentials
- ✅ Use long, complex database passwords
- ✅ Limit who has access to `.env` files

### Don'ts ❌

- ❌ Never commit `.env` file to git
- ❌ Never hardcode secrets in code
- ❌ Never share `.env` file via email or chat
- ❌ Never use default/weak credentials
- ❌ Never log sensitive values
- ❌ Never push production credentials to dev branch
- ❌ Never share credentials in code comments
- ❌ Never use same credentials across environments

---

## Production Deployment

### Using Environment Variables Instead of `.env`

```bash
# Set environment variables directly
export SECRET_KEY="your-production-secret"
export DEBUG="False"
export DB_NAME="prod_database"
export DB_HOST="prod-db.example.com"

# Or use Docker
docker run -e SECRET_KEY="your-secret" -e DEBUG="False" your-app
```

### AWS/Heroku Integration

```python
import os

# Will work with platform environment variables
SECRET_KEY = os.getenv('SECRET_KEY')
DATABASE_URL = os.getenv('DATABASE_URL')
```

### GitHub Secrets (for CI/CD)

```yaml
# .github/workflows/deploy.yml
env:
  SECRET_KEY: ${{ secrets.SECRET_KEY }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  DEBUG: false
```

---

## Troubleshooting

### Issue: Variables Not Loading

```python
# Solution 1: Make sure load_dotenv() is called
from dotenv import load_dotenv
load_dotenv()

# Solution 2: Specify the path to .env file
load_dotenv('/path/to/.env')

# Solution 3: Check if .env file exists
import os
from pathlib import Path
print(Path('.env').exists())
```

### Issue: Wrong Values

```bash
# Check the actual .env file
cat .env

# Make sure you're in the right directory
pwd

# Verify changes took effect
python manage.py check
```

### Issue: Environment Variable Not Found

```python
# Always provide a default value
value = os.getenv('MISSING_VAR', 'default-value')

# Or check if it exists
if os.getenv('MY_VAR'):
    use_my_var()
else:
    print("MY_VAR not set")
```

---

## Reference Links

- [python-dotenv Documentation](https://github.com/theskumar/python-dotenv)
- [Django Settings Documentation](https://docs.djangoproject.com/en/6.0/topics/settings/)
- [12 Factor App - Config](https://12factor.net/config)
- [Django Security Documentation](https://docs.djangoproject.com/en/6.0/topics/security/)

---

**Last Updated**: February 25, 2026
**Status**: Ready for Use ✅
