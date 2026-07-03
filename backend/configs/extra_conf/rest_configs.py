REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAdminUser',
    ],

    'DEFAULT_THROTTLE_RATES': {
        "anon": "60/min",
        "user": "120/min",
        "login": "10/min",
        "register": "5/min",
        "auth_refresh": "30/min",
        "password_recovery": "5/min",
        "password_reset": "10/min",
        "social_login": "6/min",
        "logout": "30/min",
        "forum_create_topic": "5/min",
        "forum_create_post": "20/min",
        "feedback": "5/hour",
    },

    'DEFAULT_PAGINATION_CLASS': 'core.pagination.PagePagination',

    'EXCEPTION_HANDLER': 'core.handlers.error_handler.error_handler',




}
