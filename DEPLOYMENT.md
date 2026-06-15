# Verdalis Foods — Production Deployment Guide

Target architecture:

| Component | Platform |
|-----------|----------|
| Laravel 12 API | [Render](https://render.com) |
| PostgreSQL | [Neon](https://neon.tech) (or Render Postgres via `render.yaml`) |
| Client SPA | [Vercel](https://vercel.com) |
| Admin SPA | Vercel |
| Shipper SPA | Vercel |

---

## 1. Issues Found & Fixes Applied

### Critical (fixed)

| Issue | Severity | Fix |
|-------|----------|-----|
| `.env.example` missing `FRONTEND_URL`, `ADMIN_URL`, `SHIPPER_URL` | Critical | Added to `Back/.env.example` + `config/frontend.php` |
| CORS/Sanctum defaulted to localhost in production | Critical | `config/cors.php`, `config/sanctum.php` — no localhost fallback when `APP_ENV=production` |
| Stripe webhooks accepted without signature when secret unset | Critical | `PaymentService::handleStripeWebhook()` rejects in production |
| Google OAuth audience check skipped when client ID unset | Critical | `GoogleTokenVerifier` requires `GOOGLE_CLIENT_ID` in production |
| PostgreSQL migration `hasForeign()` used MySQL-only SQL | Critical | Cross-driver FK detection in split-users migration |
| PostgreSQL sequence desync after explicit ID inserts | Critical | `resetPostgresSequences()` after legacy data migration |
| Admin `AddProductPage` hardcoded `localhost:8000` | High | Uses shared `storageUrl()` helper |
| No SPA rewrites on Vercel | High | `vercel.json` in each frontend app |
| No Render deployment config | High | `Back/render.yaml` + build/start scripts |
| Storage URLs used `asset()` instead of disk config | Medium | `StorageUrl` uses `Storage::disk('public')->url()` |
| No trusted proxies for Render HTTPS | Medium | `trustProxies(at: '*')` in `bootstrap/app.php` |
| Order emails used hardcoded localhost fallback | Medium | Uses `config('frontend.client_url')` |

### Remaining manual steps (not auto-fixable)

| Item | Action |
|------|--------|
| Production secrets | Set in Render/Vercel dashboards (never commit `.env`) |
| Neon database | Create project, set `DATABASE_URL` or `DB_*` on Render |
| Stripe webhook endpoint | Register `https://your-api.onrender.com/api/webhooks/stripe` |
| Google OAuth authorized origins | Add Vercel client URL in Google Cloud Console |
| SMTP credentials | Configure `MAIL_*` on Render |
| Cron scheduler | Add Render cron job: `php artisan schedule:run` every minute |
| Persistent uploads on Render | Use S3 or Render disk; local storage is ephemeral on free tier |
| Cross-domain Sanctum cookies | If API and frontends differ by domain, set `SESSION_SAME_SITE=none` + `SESSION_SECURE_COOKIE=true` |

---

## 2. Files Modified

### Backend (`Back/`)

- `.env.example` — complete production/local template
- `config/frontend.php` — **new** frontend URL config
- `config/cors.php` — production-safe origin defaults
- `config/sanctum.php` — production-safe stateful domains
- `config/filesystems.php` — `ASSET_URL` support
- `config/database.php` — `DATABASE_URL` for Neon/Render
- `bootstrap/app.php` — trusted proxies
- `app/Support/StorageUrl.php` — disk-based public URLs
- `app/Mail/OrderConfirmationMail.php` — config-driven tracking links
- `app/Services/PaymentService.php` — webhook signature enforcement
- `app/Services/GoogleTokenVerifier.php` — production client ID requirement
- `app/Http/Middleware/SecurityHeaders.php` — CSP includes frontend URLs
- `database/migrations/2026_06_02_190000_split_users_into_clients_and_shippers.php` — PostgreSQL compatibility
- `render.yaml` — **new** Render blueprint
- `scripts/render-build.sh` — **new**
- `scripts/render-start.sh` — **new**

### Frontend

- `Front/Client_side/.env.example`, `vercel.json`
- `Front/Admin_side/.env.example`, `vercel.json`, `src/utils/storageUrl.js` (**new**)
- `Front/Admin_side/src/pages/AddProductPage.jsx`, `ProductDashboardPage.jsx`
- `Front/Admin_side/src/components/product-dashboard/ProductDashTable.jsx`
- `Front/Shippers_side/.env.example`, `vercel.json`

---

## 3. Environment Variables

### Laravel API (Render)

**Required in production:**

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...
APP_URL=https://your-api.onrender.com

FRONTEND_URL=https://your-client.vercel.app
ADMIN_URL=https://your-admin.vercel.app
SHIPPER_URL=https://your-shipper.vercel.app

CORS_ALLOWED_ORIGINS=https://your-client.vercel.app,https://your-admin.vercel.app,https://your-shipper.vercel.app
SANCTUM_STATEFUL_DOMAINS=your-client.vercel.app,your-admin.vercel.app,your-shipper.vercel.app

SESSION_SECURE_COOKIE=true
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

DB_CONNECTION=pgsql
DATABASE_URL=postgresql://...   # Neon connection string
DB_SSLMODE=require

MAIL_MAILER=smtp
MAIL_HOST=...
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_FROM_ADDRESS=...

GOOGLE_CLIENT_ID=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_SUCCESS_URL=https://your-client.vercel.app/dashboard/orders
STRIPE_CANCEL_URL=https://your-client.vercel.app/checkout
```

**Do not set in production:** `APP_ADMIN_PASSWORD` (auto-seed disabled when `APP_ENV=production`).

### Vercel (each frontend)

| Variable | Client | Admin | Shipper |
|----------|--------|-------|---------|
| `VITE_API_URL` | `https://api.../api` | same | same |
| `VITE_GOOGLE_CLIENT_ID` | required | — | — |

---

## 4. PostgreSQL Compatibility Status

| Area | Status |
|------|--------|
| Migrations | **Fixed** — cross-driver FK check + sequence reset |
| Phone CHECK constraint | **OK** — already has `pgsql` branch |
| Raw SQL in controllers | **OK** — portable `DATE()`, `COUNT()`, `SUM()` |
| JSON columns | **OK** — Laravel casts, no MySQL JSON functions |
| Enum columns | **OK** — uses `string()`, not MySQL ENUM |
| `unsigned*` columns | **OK** — Laravel maps to integer on PG |
| Case-sensitive search | **Note** — PostgreSQL `LIKE` is case-sensitive; consider `ilike` later if needed |

**Fresh deploy on Neon:** run `php artisan migrate --force` (included in `render-build.sh`).

---

## 5. Render Readiness Status

| Item | Status |
|------|--------|
| `render.yaml` blueprint | Ready |
| Build script (`composer install --no-dev`, config/route/view cache, migrate) | Ready |
| Start script (`php artisan serve`) | Ready |
| Health check `/up` | Ready (Laravel built-in) |
| Trusted proxies | Ready |
| Database drivers (no Redis required) | Ready |
| Scheduler | **Manual** — add cron on Render |
| Queue worker | **Optional** — mail is synchronous; add worker if queuing later |
| File storage | **Manual** — configure S3 for persistent uploads |

### Render deploy steps

1. Push repo to GitHub
2. Create Render Web Service from `Back/render.yaml` or manually:
   - **Root directory:** `Back`
   - **Build:** `./scripts/render-build.sh`
   - **Start:** `./scripts/render-start.sh`
3. Link Neon database → set `DATABASE_URL`
4. Set all env vars from section 3
5. Verify `https://your-api.onrender.com/up` returns 200

---

## 6. Vercel Readiness Status

| App | Root | Build | Output | SPA rewrite |
|-----|------|-------|--------|-------------|
| Client | `Front/Client_side` | `npm run build` | `dist` | `vercel.json` |
| Admin | `Front/Admin_side` | `npm run build` | `dist` | `vercel.json` |
| Shipper | `Front/Shippers_side` | `npm run build` | `dist` | `vercel.json` |

### Vercel deploy steps (×3 projects)

1. Import repo, set root directory to the app folder
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment: `VITE_API_URL=https://your-api.onrender.com/api`
6. Client only: `VITE_GOOGLE_CLIENT_ID=...`
7. Deploy and test login flows

---

## 7. Cache, Queue & Session

Default configuration uses **database drivers** (free-hosting safe):

```
CACHE_STORE=database
QUEUE_CONNECTION=database
SESSION_DRIVER=database
```

Ensure migrations include `cache`, `jobs`, and `sessions` tables (Laravel defaults).

**Redis (optional):** Uncomment Redis vars in `.env.example` when using Render Redis or Upstash.

---

## 8. Storage & Files

- Run `php artisan storage:link` on deploy (included in build script)
- API returns URLs via `StorageUrl::public()` using `APP_URL` or `ASSET_URL`
- Admin frontend uses `storageUrl()` helper — no localhost fallbacks
- **Production recommendation:** set `FILESYSTEM_DISK=s3` for multi-instance or persistent uploads

---

## 9. Security Checklist

- [ ] `APP_DEBUG=false` in production
- [ ] `APP_KEY` generated and secret
- [ ] `STRIPE_WEBHOOK_SECRET` set (webhooks rejected without it in production)
- [ ] `GOOGLE_CLIENT_ID` set (Google login rejected without it in production)
- [ ] `CORS_ALLOWED_ORIGINS` lists only your Vercel domains
- [ ] `SANCTUM_STATEFUL_DOMAINS` lists only your frontend hosts
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] No `APP_ADMIN_PASSWORD` in production `.env`
- [ ] SMTP credentials not committed to git
- [ ] Stripe/Google secrets only in platform env dashboards

---

## 10. Deployment Checklist

### Pre-deploy

- [ ] Run `composer install --no-dev` locally to verify
- [ ] Run `npm run build` in each frontend app
- [ ] Test migrations against PostgreSQL (Neon branch or Docker PG)
- [ ] Configure Stripe webhook URL
- [ ] Configure Google OAuth authorized JavaScript origins

### Render (API)

- [ ] Create web service from `Back/`
- [ ] Set environment variables
- [ ] Connect Neon `DATABASE_URL`
- [ ] Deploy and verify `/up`
- [ ] Verify `php artisan storage:link` (build script)
- [ ] Add cron: `* * * * * cd /app && php artisan schedule:run`

### Vercel (frontends)

- [ ] Deploy Client, Admin, Shipper as separate projects
- [ ] Set `VITE_API_URL` on each
- [ ] Update `CORS_ALLOWED_ORIGINS` and `SANCTUM_STATEFUL_DOMAINS` on API with Vercel URLs
- [ ] Test client login, admin login, shipper login
- [ ] Test checkout (Stripe) and file uploads

### Post-deploy smoke tests

- [ ] Client: browse products, add to cart, checkout
- [ ] Admin: login, product CRUD, order management
- [ ] Shipper: login, scan QR, delivery flow
- [ ] Password reset email
- [ ] Order confirmation email tracking link
- [ ] Google Sign-In (client)

---

## 11. Local vs Production Summary

| Setting | Local | Production |
|---------|-------|------------|
| `APP_ENV` | `local` | `production` |
| `APP_DEBUG` | `true` | `false` |
| `DB_CONNECTION` | `mysql` | `pgsql` |
| `VITE_API_URL` | `/api` (proxy) | `https://api.../api` |
| `SESSION_SECURE_COOKIE` | `false` | `true` |
| Cache/Queue/Session | `database` | `database` (or Redis) |

---

*Generated as part of production deployment readiness audit. UI and business logic unchanged.*
