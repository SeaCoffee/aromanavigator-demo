# apps/users/redis_client.py
import redis
from django.conf import settings
from redis.exceptions import ConnectionError as RedisConnectionError

r = redis.Redis.from_url(getattr(settings, "REDIS_URL", "redis://localhost:6379/0"))

__all__ = ["r", "RedisConnectionError"]
