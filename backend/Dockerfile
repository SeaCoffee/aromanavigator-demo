FROM python:3.12-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    POETRY_VERSION=1.8.2 \
    POETRY_NO_INTERACTION=1 \
    COLUMNS=80
# (DEBIAN_FRONTEND РЅР° Alpine РЅРё РЅР° С‡С‚Рѕ РЅРµ РІР»РёСЏРµС‚ вЂ” РјРѕР¶РЅРѕ СѓР±СЂР°С‚СЊ)

WORKDIR /app

# 1) runtime-Р·Р°РІРёСЃРёРјРѕСЃС‚Рё, РєРѕС‚РѕСЂС‹Рµ РЅСѓР¶РЅС‹ РІ РєРѕРЅС‚РµР№РЅРµСЂРµ РЅР° РїРѕСЃС‚РѕСЏРЅРєСѓ
# - mariadb-connector-c: СЂР°РЅС‚Р°Р№Рј-Р±РёР±Р»РёРѕС‚РµРєР° РґР»СЏ mysqlclient
# - curl: РґР»СЏ СѓСЃС‚Р°РЅРѕРІРєРё Poetry
RUN apk add --no-cache \
    mariadb-connector-c \
    curl

# 2) РІСЂРµРјРµРЅРЅС‹Рµ build-Р·Р°РІРёСЃРёРјРѕСЃС‚Рё РґР»СЏ СЃР±РѕСЂРєРё РєРѕР»РµСЃ (СѓРґР°Р»РёРј РїРѕСЃР»Рµ install)
#   gcc musl-dev mariadb-dev python3-dev pkgconfig С‡Р°СЃС‚Рѕ С‚СЂРµР±СѓСЋС‚СЃСЏ РґР»СЏ mysqlclient/cryptography
RUN apk add --no-cache --virtual .build-deps \
    gcc musl-dev mariadb-dev python3-dev pkgconfig

# 3) РЈСЃС‚Р°РЅРѕРІРєР° Poetry
ENV POETRY_HOME=/usr/local/poetry
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="$POETRY_HOME/bin:$PATH"

# 4) РЎС‚Р°РІРёРј Р·Р°РІРёСЃРёРјРѕСЃС‚Рё РїСЂРѕРµРєС‚Р°
COPY pyproject.toml poetry.lock* /app/
RUN poetry config virtualenvs.create false \
 && (poetry lock || true) \
 && poetry install --no-interaction --no-ansi --no-root

# 5) РљРѕРїРёСЂСѓРµРј РёСЃС…РѕРґРЅРёРєРё
COPY . /app/

# 6) РЈР±РёСЂР°РµРј Р»РёС€РЅРµРµ вЂ” СѓРјРµРЅСЊС€Р°РµРј РѕР±СЂР°Р·
RUN apk del .build-deps
