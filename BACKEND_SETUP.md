# NeuroPsych Platform - Backend Setup Guide

This guide explains how to set up the Django REST Framework backend for the NeuroPsych Platform.

## Prerequisites

- Python 3.9+
- PostgreSQL 13+
- pip (Python package manager)
- Virtual environment tool (venv or virtualenv)

## Installation Steps

### 1. Create a Django Project

```bash
# Create a new directory for your backend
mkdir neuropsych-backend
cd neuropsych-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install required packages
pip install django==4.2
pip install djangorestframework==3.14
pip install django-cors-headers==4.0
pip install psycopg2-binary==2.9
pip install python-decouple==3.8
pip install pyjwt==2.8
pip install bcrypt==4.0
pip install python-dateutil==2.8
pip install Pillow==10.0
pip install celery==5.3
pip install redis==5.0
pip install python-dotenv==1.0
```

### 2. Create Django Project Structure

```bash
django-admin startproject neuropsych_config .
python manage.py startapp users
python manage.py startapp questionnaires
python manage.py startapp responses
python manage.py startapp results
```

### 3. Environment Configuration

Create a `.env` file in your backend root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/neuropsych_db
DB_NAME=neuropsych_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# Django
SECRET_KEY=your-secret-key-here-keep-it-secure
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
JWT_REFRESH_EXPIRATION_DAYS=7

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# AWS S3 (optional, for document exports)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=

# Redis (optional, for caching/async tasks)
REDIS_URL=redis://localhost:6379/0

# Link Expiration
LINK_EXPIRATION_DAYS=30

# Site settings
SITE_URL=http://localhost:3000
ADMIN_EMAIL=admin@neuropsych.com
```

### 4. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE neuropsych_db;
CREATE USER neuropsych_user WITH PASSWORD 'secure_password';
ALTER ROLE neuropsych_user SET client_encoding TO 'utf8';
ALTER ROLE neuropsych_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE neuropsych_user SET default_transaction_deferrable TO on;
ALTER ROLE neuropsych_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE neuropsych_db TO neuropsych_user;
\q

# Run migrations
python manage.py makemigrations
python manage.py migrate
```

### 5. Settings Configuration

Update `neuropsych_config/settings.py`:

```python
import os
from pathlib import Path
from decouple import config

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Security
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost').split(',')

# CORS Configuration
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000'
).split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'rest_framework',
    'corsheaders',
    
    'users',
    'questionnaires',
    'responses',
    'results',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),
    }
}

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=config('JWT_EXPIRATION_HOURS', default=24, cast=int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=config('JWT_REFRESH_EXPIRATION_DAYS', default=7, cast=int)),
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': config('JWT_SECRET_KEY'),
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'debug.log'),
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
}
```

### 6. Create API Endpoints

The backend should provide the following endpoints:

#### Authentication
- `POST /api/auth/register/` - Register new clinician
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/refresh/` - Refresh JWT token
- `POST /api/auth/logout/` - Logout

#### Patients
- `GET /api/patients/` - List patients for clinician
- `POST /api/patients/` - Create new patient
- `GET /api/patients/{id}/` - Get patient details
- `PUT /api/patients/{id}/` - Update patient
- `DELETE /api/patients/{id}/` - Delete patient

#### Questionnaires
- `GET /api/questionnaires/` - List available questionnaires
- `GET /api/questionnaires/{id}/` - Get questionnaire with questions
- `GET /api/questionnaires/{id}/questions/` - Get questionnaire questions

#### Assignments
- `POST /api/assignments/` - Assign questionnaires to patient
- `GET /api/assignments/?patient_id={id}` - Get assignments for patient
- `PUT /api/assignments/{id}/` - Update assignment

#### Links
- `POST /api/links/` - Generate secure links for patient
- `GET /api/links/{token}/` - Access questionnaire via link (public endpoint)
- `POST /api/links/{token}/submit/` - Submit questionnaire responses

#### Responses
- `POST /api/responses/` - Save response (auto-save)
- `POST /api/responses/batch/` - Batch save responses
- `GET /api/responses/?link_id={id}` - Get saved responses

#### Results
- `POST /api/results/calculate/` - Calculate and store results
- `GET /api/results/?patient_id={id}` - Get results for patient
- `GET /api/results/{id}/export/` - Export results as Word document

### 7. Create Models

Create models in `users/models.py`, `questionnaires/models.py`, etc. matching the database schema provided in `/scripts/init-database.sql`.

### 8. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 9. Create Superuser

```bash
python manage.py createsuperuser
```

### 10. Start Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Documentation

Generate API documentation using DRF's built-in tools or install drf-spectacular:

```bash
pip install drf-spectacular
```

Then configure it in settings and access the schema at `/api/schema/`.

## Testing

Create comprehensive tests for all endpoints:

```bash
python manage.py test
```

## Production Deployment

For production deployment:

1. Set `DEBUG = False`
2. Configure proper database credentials
3. Set secure `SECRET_KEY`
4. Use environment-specific settings
5. Configure allowed hosts
6. Set up HTTPS
7. Use proper WSGI server (Gunicorn, uWSGI)
8. Configure logging and error tracking

## Security Considerations

- All passwords are hashed with bcrypt
- JWT tokens expire after configured time
- CORS is restricted to allowed origins
- CSRF protection is enabled
- SQL injection prevention via ORM
- Rate limiting should be implemented
- API authentication required for most endpoints

## Documentation

For detailed API documentation, see `/api/docs/` (if drf-spectacular is configured)
