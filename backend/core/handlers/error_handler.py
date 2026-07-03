from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def error_handler(exc: Exception, context: dict):
    handlers = {
        "JWTException": jwt_validation_exception_handler,
        "JWTInvalidException": jwt_invalid_token_handler,
        "JWTBlacklistException": jwt_blacklist_handler,
        "JWTExpiredException": jwt_expired_handler,
    }

    response = exception_handler(exc, context)
    exc_class = exc.__class__.__name__

    if exc_class in handlers:
        return handlers[exc_class](exc, context)

    return response


def jwt_validation_exception_handler(exc, context):
    return Response(
        {"detail": "JWT validation failed"},
        status=status.HTTP_401_UNAUTHORIZED
    )

def jwt_invalid_token_handler(exc, context):
    return Response(
        {"detail": "Invalid token"},
        status=status.HTTP_401_UNAUTHORIZED
    )

def jwt_blacklist_handler(exc, context):
    return Response(
        {"detail": "Token is blacklisted"},
        status=status.HTTP_401_UNAUTHORIZED
    )

def jwt_expired_handler(exc, context):
    return Response(
        {"detail": "JWT expired"},
        status=status.HTTP_401_UNAUTHORIZED
    )
