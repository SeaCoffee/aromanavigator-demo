# Aroma Navigator Demo

Aroma Navigator is a full-stack portfolio demo for a fragrance community product: a structured fragrance encyclopedia, personal wardrobes, favorites, public profiles, forum discussions, wardrobe-based exchanges, activity feed and in-app notifications.

Live project: [aromanavigator.com.ua](https://aromanavigator.com.ua/)

This repository is not a full source mirror of the deployed product. It is a public portfolio/demo edition that keeps the core fragrance, community, wardrobe, exchange, activity and notification flows while excluding production-sensitive and marketplace-specific modules.

## Why This Project Matters

Most fragrance apps stop at catalog search or simple reviews. Aroma Navigator models a richer product surface:

- A fragrance encyclopedia with brands, perfumers, notes, olfactory families and public fragrance pages.
- Personal wardrobes that turn fragrance data into a user-owned collection.
- Exchange proposals built from wardrobe items, not free-form listings.
- Social context through profiles, follows, favorites, comments, forum topics and activity.
- In-app notifications that mirror product events such as exchange proposals and decisions.
- A Docker-first development setup with MySQL, Redis, Celery, Mailpit and separate frontend/backend containers.

The result is not a landing page or a mockup. It is a working application with real models, APIs, server-rendered frontend pages, auth flows, seed data and tests.

## Core Features

### Authentication And Profiles

- Email/password registration and login.
- Email activation and password recovery routed to Mailpit in local demo mode.
- Stricter password policy: 8-16 characters, no spaces, lowercase Latin letter, uppercase Latin letter, digit and special character.
- Public user profiles with wardrobe, activity, articles, followers and following.
- Optional Google OAuth integration. The Google button is hidden unless real client credentials are configured, so the public demo does not show a broken social login.

### Fragrance Encyclopedia

- Fragrance catalog with brands, notes, perfumers and olfactory families.
- Public fragrance detail pages with structured metadata.
- Admin/editor flows for fragrance creation and editing.
- Community UGC surface for fragrance add requests and note/similarity suggestions.

### Wardrobe

- Authenticated users can add fragrances to their wardrobe.
- Wardrobe statuses include own, sample, want, favorite and had.
- Public wardrobe pages support discovery and exchange entry points.
- Wardrobe events feed activity.

### Favorites, Likes And Social Graph

- Favorites for supported content.
- Likes for forum/comment surfaces.
- Follow/follower relationships.
- User subscriptions for supported content targets.

### Forum And Comments

- Forum sections and topic pages.
- Topic creation/editing.
- Universal comments that can attach to forum topics, fragrance pages and other supported targets.
- Mentions, tags, nested replies and moderation/admin views for content review.

### Wardrobe-Based Exchanges

- Private exchange proposals are created against real wardrobe items.
- Proposal states: pending, accepted, rejected and canceled.
- Offered and accepted items are validated against the proposer wardrobe.
- Exchange actions create in-app notifications and private activity events.

### Activity Feed And Notifications

Activity is intentionally focused for the demo:

- `user.followed`
- `wardrobe.item_added`
- `exchange.created`
- `exchange.accepted`
- `exchange.rejected`
- `forum.topic_created`
- `forum.comment_created`
- `article.created`

Notifications cover exchange proposals/decisions, activity-derived notifications and announcement-style messages.

## Demo Dataset

The repository includes a repeatable seed command for portfolio demos:

```bash
docker compose exec app python manage.py seed_demo --reset
```

Use `--reset` to recreate the demo scenario from scratch.

Important: `--reset` is scoped to demo data only. The seed creates and removes data through explicit demo markers:

- demo user emails are fixed `*.demo@example.com` addresses;
- demo fragrance, brand, note and family slugs start with `demo-`;
- demo forum sections use `demo-` slugs;
- demo forum topics use `demo-topic-` slugs;
- demo articles start with `[Demo]`;
- demo activity is created by demo users;
- demo exchange proposals are between demo users only.

Demo users all use password `DemoPass1!`:

| User | Email | Scenario Role |
| --- | --- | --- |
| Lesia | `lesia.demo@example.com` | Tea, musk and elegant everyday wardrobe |
| Marta | `marta.demo@example.com` | Amber/incense wardrobe and exchange proposer |
| Olena | `olena.demo@example.com` | Citrus/neroli wardrobe and exchange owner |
| Taras | `taras.demo@example.com` | Forum/articles participant |

The seed creates:

| Area | Count |
| --- | ---: |
| Demo users | 4 |
| Brands | 8 |
| Notes | 28 |
| Perfumers | 3 |
| Fragrances | 30 |
| Wardrobe items | 15 |
| Exchange proposals | 3 |
| Notifications | 10 |
| Activity events | 20 |
| Forum sections | 4 |
| Forum topics | 8 |
| Comments | 30 |

Seeded exchange scenario:

- Pending: Marta -> Lesia
- Accepted: Lesia -> Olena
- Rejected: Olena -> Marta

The command is safe to run repeatedly; a normal run refreshes the exchange scenario without growing duplicate demo exchange notifications or activity.

## Tech Stack

### Backend

- Python 3.12
- Django 5.2
- Django REST Framework
- Simple JWT
- MySQL 8
- Redis
- Celery
- Mailpit for local email capture
- Pillow for image handling

### Frontend

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Lucide icons
- Vitest and Playwright tooling

### Infrastructure

- Docker Compose for local development.
- Separate production compose file with Gunicorn, Nginx and persistent volumes.
- GitHub Actions workflow for backend and frontend checks.

## Architecture Overview

```text
Browser
  |
  | Next.js pages, forms, server actions
  v
Next.js app
  |
  | /api/userApi/* and /api/anonApi/* proxy calls
  v
Django REST API
  |
  | domain apps: users, fragrance, wardrobe, exchange, forum, comments,
  | favorites, social, activity, notifications, articles, photos, tags
  v
MySQL

Redis + Celery handle async/background-ready infrastructure.
Mailpit captures local activation and recovery emails.
Nginx is included as the local entrypoint and production reverse proxy.
```

The backend is organized by product domains rather than by technical layer only. Cross-cutting concerns such as validators, choices, pagination, content type references and shared services live under `backend/core`.

The frontend keeps route builders, API actions, selectors, components and typed domain models separated so route changes are centralized instead of scattered across the UI.

## Local Quick Start

Requirements:

- Docker Desktop
- Git

Clone the repository and create env files.

Linux/macOS:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up --build
```

Windows PowerShell:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
docker compose up --build
```

After the containers are healthy, optionally seed demo data:

```bash
docker compose exec app python manage.py seed_demo --reset
```

## Local URLs

| Service | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| Nginx entrypoint | http://localhost |
| Django API | http://localhost:8888 |
| Mailpit inbox | http://localhost:8025 |
| MySQL host port | `localhost:3308` |

Activation and recovery emails are available in Mailpit.

## Useful Commands

Start the project:

```bash
docker compose up --build
```

Stop containers:

```bash
docker compose down
```

Run migrations manually:

```bash
docker compose exec app python manage.py migrate
```

Run Django checks:

```bash
docker compose exec app python manage.py check
```

Run the demo seed:

```bash
docker compose exec app python manage.py seed_demo --reset
```

Run backend tests:

```bash
docker compose exec app python manage.py test
```

Build the frontend:

```bash
docker compose stop nextapp
cd frontend
npm run build
```

Run frontend unit tests:

```bash
docker compose exec nextapp npm run test:run
```

## Demo Scope

This public repository is intentionally narrower than the deployed product. Removed from the demo:

- shop
- cart
- orders
- marketplace listings
- user showcase
- decants
- splits
- bottle remaining listings
- disputes
- reviews
- direct messaging
- complaints app
- standalone moderation app
- gamification app

Kept in the demo:

- auth
- profiles
- fragrance encyclopedia
- wardrobe
- favorites
- social graph
- forum
- comments
- likes
- mentions
- articles
- tags
- photos
- exchange
- notifications
- activity

That scope keeps the public codebase focused, easier to review and easier to run while still demonstrating non-trivial product design and implementation.

## Quality And Verification

The current demo baseline has been verified with:

- Django system checks.
- Targeted backend tests for auth, users, exchange, forum, comments, activity and notifications.
- Next.js production build.
- HTTP smoke checks for login, register, fragrances, forum, articles, users and authenticated redirects.
- Repeatable demo seed counts.

Expected demo seed counts:

```text
users=4
brands=8
notes=28
perfumers=3
fragrances=30
wardrobe=15
exchanges=3
notifications=10
activity=20
sections=4
topics=8
comments=30
```

## Production Notes

This repository includes production-oriented files, but the checked-in demo env examples are not production secrets.

Before deploying publicly:

- Set `DEBUG=False`.
- Generate a fresh strong `SECRET_KEY`.
- Replace all database, SMTP and OAuth placeholders.
- Configure production `DJANGO_ALLOWED_HOSTS`.
- Configure production `CORS_ALLOWED_ORIGINS`.
- Configure production `CSRF_TRUSTED_ORIGINS`.
- Set `SESSION_COOKIE_SECURE=True`.
- Set `CSRF_COOKIE_SECURE=True`.
- Use real persistent volumes and backup MySQL/media data.
- Configure TLS at the reverse proxy or hosting layer.

See [DEPLOY.md](DEPLOY.md) for the production compose flow.

## Repository Structure

```text
.
|-- backend/
|   |-- apps/
|   |   |-- activity/
|   |   |-- articles/
|   |   |-- auth/
|   |   |-- comments/
|   |   |-- exchange/
|   |   |-- favorites/
|   |   |-- forum/
|   |   |-- fragrance/
|   |   |-- fragrance_ugc/
|   |   |-- notifications/
|   |   |-- photos/
|   |   |-- social/
|   |   |-- taste_profile/
|   |   |-- users/
|   |   `-- wardrobe/
|   |-- configs/
|   `-- core/
|-- frontend/
|   `-- src/app/
|       |-- (public)/
|       |-- (private)/
|       |-- actions/
|       |-- components/
|       |-- services/
|       |-- types/
|       |-- urls/
|       `-- validators/
|-- docker-compose.yml
|-- docker-compose.prod.yml
|-- nginx.conf
`-- DEPLOY.md
```

## License

This repository is intended as a portfolio/demo project. Add a license before accepting external contributions or reuse.
