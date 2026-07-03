def parse_id_list(value: str | None) -> list[int] | None:
    if value in (None, ""):
        return []

    result = []

    for item in str(value).split(","):
        clean = item.strip()

        if not clean:
            continue

        try:
            result.append(int(clean))
        except (TypeError, ValueError):
            return None

    return result
