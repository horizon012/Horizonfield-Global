# Horizonfield Global — Full-stack Starter

**Stack:** Next.js (JavaScript), Django + Django REST Framework, PostgreSQL (optional for local startup).

This is a **starter project**, not a finished enterprise CRM. It contains:

- **Public website:** responsive homepage, product catalogue, product detail pages, trading divisions, business portfolio, inquiry form and company pages.
- **Django backend:** catalogue models/API, CRM lead intake, companies, contacts, opportunities, tasks, activities, quotations, admin registrations and basic automated tests.
- **Actual brand assets:** Horizonfield Global, Nector Harvest and Elementall Core logos, plus reference product imagery and the two catalogues shared for this project.
- **PostgreSQL option:** Docker Compose starts a local PostgreSQL instance. For quick tests you may instead use SQLite.

## Requirements

- Node.js 20.9+ (Node.js 22 LTS recommended)
- npm
- Python 3.11+ (3.12/3.13 recommended)
- Optional: Docker Desktop for PostgreSQL

## Step 1 — Start Django backend

Open a terminal in `backend/`.

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py makemigrations catalog crm sales
python manage.py migrate
python manage.py seed_starter
python manage.py createsuperuser
python manage.py runserver
```

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py makemigrations catalog crm sales
python manage.py migrate
python manage.py seed_starter
python manage.py createsuperuser
python manage.py runserver
```

Visit:
- Django Admin: http://127.0.0.1:8000/admin/
- API health: http://127.0.0.1:8000/api/v1/health/
- Products: http://127.0.0.1:8000/api/v1/products/

> Initial app migrations are intentionally not supplied because this is an editable starter. Run `makemigrations` before `migrate`. **Commit the generated migrations** before team or production deployment. Django's built-in apps already have their own migrations.

### Optional PostgreSQL instead of SQLite

From the project root:

```bash
docker compose up -d db
```

Set the following in `backend/.env` (the Compose defaults are for local development only):

```env
DATABASE_URL=postgresql://hfg_dev:change-me-development-only@127.0.0.1:5432/horizonfield_dev
```

Then run the migrations as shown above. If `DATABASE_URL` is empty, Django uses local SQLite for convenience.

## Step 2 — Start Next.js frontend

Open a second terminal in `frontend/`:

```bash
npm install
```

Copy the environment example:

Windows:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Then:

```bash
npm run dev
```

Visit http://localhost:3000

The product pages currently use `src/data/products.js`, so the frontend works before any API data is added. The inquiry form **POSTs to Django**: you must run the backend to save a lead. If the backend is unavailable, the form shows an error and does **not** pretend to save anything.

## Step 3 — Verify CRM lead flow

1. On the Next.js site, open `/request-quote` and submit a test inquiry.
2. Visit Django Admin and open **CRM > Leads**.
3. See the new lead and assign an owner or update its stage.
4. The `seed_starter` command creates initial divisions and a small product catalogue in Django Admin. Edit records as needed before switching static frontend data to API-driven content.

## API endpoints (initial)

| URL | Allowed actions | Access |
| --- | --- | --- |
| `/api/v1/health/` | GET | Public |
| `/api/v1/divisions/` | GET | Public |
| `/api/v1/products/` | GET | Public; active items only |
| `/api/v1/products/<id>/` | GET | Public; active items only |
| `/api/v1/businesses/` | GET | Public |
| `/api/v1/inquiries/` | POST | Public, throttled |
| `/admin/` | Django Admin | Staff login required |

**No public lead list or public write access to products exists.** The inquiry POST serializer accepts only buyer-provided fields. Use Django Admin for internal data until the custom CRM dashboard has authentication and permissions.

## Suggested build milestones

**Phase 1 — Public website:** refine UI, SEO, product data and responsive design.

**Phase 2 — CRM foundations:** seed divisions/products, wire frontend API catalogue, lead capture, staff workflows in Django Admin.

**Phase 3 — CRM dashboard:** authenticated Next.js sales interface, business-unit permissions, opportunity stages, customer histories, quotation workflows and reports.

**Phase 4 — Advanced:** task reminders, email, uploads, audits, inventory and dealer/distributor features.

## Security and production checklist

- Replace development `DJANGO_SECRET_KEY`, database passwords and all placeholders.
- Set `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS` and enforce HTTPS.
- Use managed PostgreSQL or reliable backups; never expose PostgreSQL to the public Internet.
- Add CAPTCHA or challenge-based anti-spam for public enquiry submissions and appropriate protection at the reverse proxy.
- Implement secure CRM session/login, granular business-unit authorization, audit logging and MFA before exposing CRM features publicly.
- Configure a transactional email service before promising automatic notifications.
- Authenticate and authorize file uploads; validate file types and limits; do not store user uploads in a public source-controlled directory.
- Verify all company claims, supported products, catalogues and contact details before publishing.
- CRM dashboard screens, supplier management, payments, quote PDF generation, and background jobs are **not** yet implemented.

## Folder map

- `frontend/src/app/(website)/`: public website routes
- `frontend/src/components/`: shared website UI, hero, category cards, quote form
- `frontend/src/data/`: editable initial catalogue and group businesses
- `backend/apps/catalog/`: product catalogue and division records
- `backend/apps/crm/`: lead, company, contact, opportunity, follow-up models
- `backend/apps/sales/`: quotation and quotation-line models
- `backend/config/`: settings and API routing
- `docs/`: future CRM plan and environment/architecture notes

**Important:** Django Admin is the initial admin interface. A polished full CRM front end is a separate, later development phase. No external service connections or deployment are included in this ZIP.
