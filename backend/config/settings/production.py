import os
from django.core.exceptions import ImproperlyConfigured
from .base import *

DEBUG = False
if SECRET_KEY == 'development-only-insecure-key' or SECRET_KEY.startswith('development-only'):
    raise ImproperlyConfigured('Configure a secure DJANGO_SECRET_KEY for production')
if not os.getenv('DATABASE_URL'):
    raise ImproperlyConfigured('PostgreSQL DATABASE_URL is required in production')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
