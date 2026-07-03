from rest_framework.exceptions import APIException
class ProviderAuthError(Exception):
    pass

class ProviderConfigError(Exception):
    pass

class SocialProviderConfigError(APIException):
    status_code = 500
    default_detail = "Social auth provider is not configured."
    default_code = "provider_config_error"
