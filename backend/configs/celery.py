import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configs.settings')

app = Celery('backend')
app.config_from_object(obj='django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
