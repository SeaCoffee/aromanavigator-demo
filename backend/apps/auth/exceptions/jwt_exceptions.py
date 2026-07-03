from rest_framework.exceptions import APIException

class JWTException(APIException):
    status_code = 400
    default_detail = "JWT error."
    default_code = "jwt_error"


class JWTInvalidException(JWTException):
    default_detail = "Invalid token."
    default_code = "invalid_token"


class JWTBlacklistException(JWTException):
    default_detail = "Token is blacklisted."
    default_code = "blacklisted_token"


class JWTExpiredException(JWTException):
    default_detail = "Token has expired."
    default_code = "token_expired"
