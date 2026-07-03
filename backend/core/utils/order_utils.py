import hashlib
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP


def sha256(s: str) -> str:
    return hashlib.sha256((s or "").encode("utf-8")).hexdigest()


def mask_phone(phone: str) -> str:
    digits = "".join(filter(str.isdigit, phone or ""))

    return f"+{digits[:-4]}****" if len(digits) > 4 else "****"


def money(value) -> Decimal:
    if value is None:
        value = Decimal("0.00")

    try:
        decimal_value = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        decimal_value = Decimal("0.00")

    return decimal_value.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )
