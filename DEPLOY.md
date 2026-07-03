# Production Deploy

This project has a separate production compose file. Keep local/dev `docker-compose.yml` for development and use `docker-compose.prod.yml` on the server.

## 1. Prepare env

Copy the production env template on the server:

```bash
cp .env.prod.example .env.prod
```

Edit `.env.prod` and replace every `example.com` and placeholder secret/password.

For a first HTTP-only smoke test, set `PUBLIC_ORIGIN`, `FRONTEND_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_BASE`, `NEXTAUTH_URL`, `CSRF_TRUSTED_ORIGINS`, and `CORS_ALLOWED_ORIGINS` to `http://your-domain`. Switch them to `https://your-domain` after TLS is active.

## 2. Build and start

```bash
git pull origin main
docker compose --env-file .env.prod -f docker-compose.prod.yml build
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
```

The backend container waits for MySQL, runs migrations, runs `collectstatic`, and then starts Gunicorn.

## 3. Check logs

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f app
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f nextapp
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f nginx
```

## 4. Smoke checks

```bash
curl -I http://your-domain/
curl -I http://your-domain/fragrances
curl -I http://your-domain/userApi/fragrance/fragrances
```

## 5. Update deploy

```bash
git pull origin main
docker compose --env-file .env.prod -f docker-compose.prod.yml build
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
```

## 6. Persistent data

Production compose uses Docker volumes for:

- `mysql_data`
- `staticfiles`
- `public_media`
- `private_media`

Back these up before destructive maintenance or moving servers.
