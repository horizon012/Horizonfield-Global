# How to continue after extracting

1. Extract ZIP to a clean directory (avoid putting it inside an existing Next.js project).
2. Open the folder in VS Code; use two terminals, `backend/` and `frontend/`.
3. Follow the commands in the root README.
4. Test public site on localhost:3000 and Django Admin on localhost:8000/admin/.
5. Run `python manage.py seed_starter` to add business-unit records: `agriculture`, `building-materials`, `technology`. These slugs match the frontend dropdown.
6. Test a quote form. Verify that a new Lead appears in Admin.
7. Build authenticated CRM UI *after* backend authentication and permission design.

**Suggested initial admin credentials:** never hardcode passwords; run `python manage.py createsuperuser`.

## Two ways to work locally

- **Fast start:** Django SQLite (no Docker), Next.js.
- **Production-like:** Docker Compose PostgreSQL, Django, Next.js.

## Existing project integration

If you already have a Next.js site, you may instead copy the components/data from `frontend/src` into it, but avoid blindly replacing existing `package.json`, routing and global styles. The ZIP is designed to be a fresh project scaffold.
