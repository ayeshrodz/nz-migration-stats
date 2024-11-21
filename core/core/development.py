from .base import *

SECRET_KEY = 'django-insecure-z1ma%-meg#v7l_hcuao@!jm0&nweif&rf0urb76!)5ce9weu_9'

ALLOWED_HOSTS = []

DEBUG = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
