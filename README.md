# SILONG PH

Heat awareness, cooling-place discovery, and preparedness for **Central Luzon (Region III), Philippines**.

SILONG PH is a mobile-first Progressive Web App. It shows model weather and an **application-estimated** heat index for the seven provinces of Region III, maps public facilities that may offer relief from the heat, publishes preparedness guidance, and gives administrators a reviewed workflow for places, reports, and official advisories.

**Live:** <https://silong-ph.vercel.app> — deployed on Vercel with Supabase Postgres.

> **Important:** SILONG PH does not publish official PAGASA heat-index readings. The heat index shown in the app is calculated from Open-Meteo model data using the US National Weather Service / Rothfusz regression and is classified with PAGASA's published heat-index categories. Always check PAGASA, DOH, NDRRMC, and your LGU for official warnings and instructions.

---

## What is in the app

### Public

- **Dashboard** — current model conditions for the selected locality, estimated heat index, risk guidance, 24-hour and 7-day outlook, and a regional summary.
- **Heat map** — Leaflet/OpenStreetMap map with province and municipality boundaries, province risk shading, verified-place layer, legend, and a searchable text alternative.
- **Province and locality pages** — model conditions at the province's representative point, locality lists, nearby public facilities, and transparent data notes.
- **Cool places** — searchable and filterable directory of public facilities that may provide shade, water, or indoor relief. Every seeded facility is marked **UNVERIFIED** until a reviewer checks it.
- **Place details** — map, access and hours information, verification explanation, source dates, and a community correction form.
- **Preparedness** — heat-safety guidance with links to official sources.
- **Alerts** — official advisories entered by administrators, plus clearly labelled **application-generated heat notices** derived from model data.
- **About, privacy, methodology** — scope, data provenance, limitations, and how the estimate is calculated.
- **PWA** — installable manifest, production service worker, offline fallback page, and stale-data warnings. API responses are never cached by the service worker.

### Administration

- Email/password login with a signed, HTTP-only session cookie (8-hour expiry).
- Server-side role checks for `SUPER_ADMIN`, `CONTENT_ADMIN`, and `PLACE_VERIFIER`.
- Place create/edit/archive with verification status, reviewer note, and review timestamps.
- Community report moderation.
- Official advisory composer and status changes.
- Audit log for administrative actions.
- System health page for database, Redis, and weather-provider checks.

All administrative mutations are authorised on the server. Hiding a button is never treated as authorisation.

---

## Data transparency

| Data | Status | Source / behaviour |
| --- | --- | --- |
| Province, city, and municipality names and codes | **Real** | Philippine Statistics Authority PSGC data via the PSGC API; 10-digit PSGC codes. |
| Boundary polygons | **Real** | `faeldon/philippines-json-maps` 2023 GeoJSON (MIT), derived from PSA PSGC shapefiles. |
| Weather (temperature, humidity, wind, precipitation) | **Real when online** | Open-Meteo model grid data interpolated to the selected coordinate. Cached for 10 minutes; a snapshot up to 3 hours old may be shown with a stale warning. No synthetic weather is substituted. |
| Heat index | **Application estimate** | NWS/Rothfusz regression with low- and high-humidity adjustments, classified with PAGASA categories. Not an official PAGASA reading. |
| Cooling places | **Imported, unverified** | 46 public facilities imported from OpenStreetMap (ODbL). They are not confirmed cooling centres. Verify access and hours before travelling. |
| Official advisories | **Empty until an administrator adds one** | Administrators must supply the issuer, issue time, optional expiry, affected area, and source URL. |
| Application heat notices | **Generated, non-official** | Calculated from the latest model snapshot and explicitly labelled "not official". |
| Preparedness articles | **Curated** | Seeded editorial content with official source references. |
| Geography provenance | **Documented** | See `src/data/geography.json` and `/methodology`. |

Angeles and Olongapo are independent cities. Their source boundary files do not contain city geometry, so they are included with a geocoded representative point and `boundaryAvailable: false`. They are not drawn as filled municipality polygons.

### Heat-index domain

The estimate accepts **20–50 °C** and **1–100 % relative humidity**. If the polynomial result exceeds **60 °C**, the app returns no value instead of displaying a physically implausible number. This is deliberate and is explained on `/methodology`.

PAGASA categories used by the app:

| Estimated heat index | Category |
| --- | --- |
| below 27 °C | Below Caution |
| 27–32 °C | Caution |
| 33–41 °C | Extreme Caution |
| 42–51 °C | Danger |
| 52 °C and above | Extreme Danger |

PAGASA publishes integer ranges. For continuous values, the app uses the lower bound of each band: `<27`, `27–<33`, `33–<42`, `42–<52`, and `>=52`.

---

## Tech stack

- **Next.js 16.4** App Router, React 19, TypeScript (strict)
- **Tailwind CSS 4** with shadcn-style UI primitives
- **Lucide** icons
- **React Hook Form + Zod** for forms and server-side validation
- **Leaflet + React Leaflet** with OpenStreetMap-compatible tiles
- **Prisma 6** with **PostgreSQL** (Supabase-compatible)
- **Redis (optional)** for shared weather caching and distributed rate limiting; automatic in-process fallback
- **jose** JWT sessions, **bcryptjs** password hashing
- **Vitest** unit/integration tests
- **Playwright** is installed for optional browser tests

---

## Local development

### Prerequisites

- Node.js 20.9 or newer (Node 22 LTS recommended)
- npm
- A PostgreSQL database (Supabase is the recommended managed option)
- Redis 6+ is optional
- A modern browser

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

The repository includes `.npmrc` with `legacy-peer-deps=true` because of an npm peer-dependency resolution bug in the installed Next/React combination. It does not change runtime behaviour, and Vercel picks it up automatically.

### 2. Create the Supabase database

1. Create a project at <https://supabase.com/dashboard>.
2. Open **Project Settings → Database → Connection string** (or the **Connect** button).
3. Copy the **transaction pooler** URI (port `6543`) and the **session pooler/direct** URI (port `5432`).

This app uses Prisma over the Postgres connection string. You do **not** need a Supabase API key (`sb_publishable_…` or `sb_secret_…`) for the app to work.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env`:

```dotenv
# Transaction pooler: used by the running app (port 6543)
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
# Session pooler/direct: used by Prisma migrations (port 5432)
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"
REDIS_URL="redis://127.0.0.1:6379"
AUTH_SECRET="at-least-32-random-characters"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="a-unique-password-of-at-least-12-characters"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CRON_SECRET="a-long-random-token"
```

URL-encode special characters in the database password (for example `@` becomes `%40`). Keep `DIRECT_URL` private; it is only used for migrations and seeding.

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`REDIS_URL` may be omitted or left blank. The app then uses in-process caching and rate limiting, which is suitable for a single instance only.

### 4. Apply the schema and seed

For a new database:

```bash
npx prisma generate
npm run db:deploy
npm run db:seed
```

The seed creates the first `SUPER_ADMIN`, imports the OSM-derived place file, and seeds preparedness articles. It does **not** create official alerts. It is safe to run again: the administrator is upserted and existing places are skipped by OSM ID.

### 5. Run the app

```bash
npm run dev
```

Open <http://localhost:3000>.

The service worker is **not** registered in development. If a production worker was previously installed on the same origin, development mode unregisters it to avoid stale-cache confusion.

### Local administrator

The local seed in this workspace uses:

- Email: `admin@silong.local`
- Password: `SilongPH2026!`

These are **development credentials only**. Change or remove them before any shared or production deployment. Never commit a real `.env` file.

---

## Deploy publicly (Supabase + Vercel)

1. Create a Supabase project and copy the **transaction pooler** URI (port `6543`) and the **session pooler/direct** URI (port `5432`) from **Project Settings → Database → Connection string**.
2. Set `DATABASE_URL` to the transaction pooler and `DIRECT_URL` to the session pooler/direct URI in your local `.env`.
3. Apply the schema and seed against Supabase:

   ```bash
   npx prisma generate
   npm run db:deploy
   npm run db:seed
   ```

4. Push this repository to GitHub.
5. Import the repository into Vercel. Keep the **Next.js** preset, use `npm install --legacy-peer-deps`, and build with `npm run build`.
6. Add the environment variables from `.env.example` in Vercel. Set `NEXT_PUBLIC_APP_URL` to the final HTTPS origin. `ADMIN_PASSWORD` is only needed for seeding and should not be added to the runtime environment.
7. Deploy. Vercel provides HTTPS automatically.
8. Open `/api/health` and confirm `database.reachable` is `true`. Log in at `/admin/login` with the administrator you seeded.

A Supabase API key is **not** used by this app. Prisma connects directly over the Postgres connection string. Keep `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, and `CRON_SECRET` out of Git.

For the full checklist, backups, cron, self-hosting, and troubleshooting, see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Generate Prisma Client and create a production build. |
| `npm start` | Start the production server (after `npm run build`). |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run TypeScript without emitting files. |
| `npm test` | Run the Vitest suite. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run test:e2e` | Run Playwright (no project tests are included yet). |
| `npm run db:deploy` | Apply committed migrations in production. |
| `npm run db:migrate` | Create/apply a development migration. |
| `npm run db:push` | Push the schema without a migration (local prototyping only). |
| `npm run db:seed` | Seed the administrator, places, and articles. |
| `npm run db:studio` | Open Prisma Studio. |
| `npm run geo:build` | Rebuild geography data from the source APIs. |
| `npm run osm:import` | Re-import OSM facilities into `data/seed-places.json`. |
| `npm run setup` | Generate, push schema, and seed in one step (local only). |

---

## Testing

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Current verified result (25 October 2026):

- **149 tests passed** across 11 test files.
- `npm run typecheck` passed.
- `npm run lint` passed with no warnings.
- `npm run build` completed successfully with Next.js 16.4.3.
- Supabase Postgres migration and seed applied successfully: 46 places, 4 articles, and 1 administrator.
- Production smoke test against Supabase: home, map, directory, province, locality, alerts, preparedness, policy pages, sitemap, robots, manifest, service worker, places API, health API, live weather API, cron API, and authenticated admin pages all returned HTTP 200. `/api/health` reported the database and Redis reachable.

The suite covers heat-index boundaries and domain guards, Zod validation, Open-Meteo normalisation, cache freshness and stale fallback, operating-hours parsing, geography, authentication primitives, place helpers, alert activity rules, rate limiting, and admin route actions with mocked Prisma/audit dependencies.

Unit tests deliberately do **not** require a live database or Redis. Run the app against a real database for integration checks.

---

## Project structure

```text
src/
  app/
    (site)/                 Public pages
    admin/                  Login and protected administration
    api/                    Weather, places, reports, auth, admin, health, cron
  components/
    admin/                  Admin forms
    location/               Locality provider and picker
    map/                    Leaflet maps
    places/                 Place cards, filters, report form
    ui/                     shadcn-style primitives
    weather/                Dashboard, risk badges, charts, notices
  data/                     Geography and preparedness content
  lib/
    auth.ts                 JWT sessions, RBAC, origin checks
    heat-index.ts           NWS estimate and PAGASA classification
    geography.ts            PSGC lookups
    places.ts               Verification, amenities, hours
    validation.ts           Zod schemas
    weather/                Open-Meteo adapter, cache, types
    redis.ts                Optional Redis with fail-open behaviour
    rate-limit.ts           Redis or in-process limiter
prisma/
  schema.prisma             PostgreSQL schema
  migrations/               Baseline migration
  seed.ts                   Administrator, places, articles
public/
  geo/                      Province and municipality GeoJSON
  icons/                    PWA icons
  sw.js                     Production service worker
  offline.html              Standalone offline fallback
tests/                      Vitest suites
scripts/                    Geography and OSM import scripts
docs/DEPLOYMENT.md          Production deployment, operations, backups
```

---

## Security notes

- Session cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` when the configured app origin is HTTPS (or when no origin is configured in production). Production must use HTTPS.
- Login and report endpoints are rate-limited. Client IPs are hashed before use as rate-limit keys.
- Administrative APIs check same-origin requests, authenticate the session, and enforce roles server-side.
- Passwords use bcrypt with cost 12.
- Administrative mutations write audit entries. Audit failures are logged but do not hide the primary operation's result.
- Weather and health responses are `no-store`. The service worker never caches `/api/` requests.
- Security headers are set in `next.config.ts` (`nosniff`, `DENY` framing, referrer policy, permissions policy).
- Secrets belong in environment variables, never in source control. `.env` is ignored by Git.
- The Supabase migration revokes `anon`/`authenticated` access and enables RLS on application tables. The app uses Prisma as the table owner; the Supabase Data API cannot access these tables with a public key.

A Content Security Policy is not set by the app because Leaflet tiles and Next.js asset loading need careful per-deployment tuning. Add and test a CSP at the reverse proxy or in `next.config.ts` before production if your threat model requires one.

---

## Accessibility and resilience

- Mobile-first layout with a bottom navigation bar and skip link.
- Visible focus states, semantic landmarks, labelled form controls, and text alternatives for map data.
- Loading, error, empty, and stale states are explicit.
- Colour is not the only risk indicator; categories include text labels and guidance.
- The map has a searchable textual list of provinces and conditions.
- The offline page is standalone and precached. Cached pages are network-first, so users see fresh content when online.

WCAG 2.2 AA is the target. Automated checks do not replace manual testing with a keyboard and a screen reader.

---

## Known limitations

- No documented public PAGASA heat-index API is integrated. Official readings are linked out, not scraped or invented.
- Open-Meteo provides model grid data, not a measurement at a barangay or station. Local conditions can differ, especially in dense urban areas and direct sun.
- Seeded cooling places are unverified OSM public facilities. They are not official cooling centres.
- Official advisories are manual administrative records. The application-generated notices are not substitutes for official warnings.
- Redis is optional. Without it, rate limits and weather caches are per process; use Redis when running more than one instance.
- Playwright is installed but no browser test suite is committed yet.
- The app is scoped to Region III. Other regions are not included.

---

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for production setup, HTTPS, migrations, Redis, cron, health checks, backups, recovery, PWA verification, and troubleshooting.

---

## Attribution

- Heat-index categories and guidance: **DOST-PAGASA**.
- Weather model data: **Open-Meteo** (<https://open-meteo.com/>). Check the current Open-Meteo licence and attribution requirements for your deployment.
- Geography names/codes: **Philippine Statistics Authority (PSA) PSGC**.
- Boundary GeoJSON: **faeldon/philippines-json-maps** (MIT), derived from PSA PSGC shapefiles.
- Facility source data: **OpenStreetMap contributors** (ODbL).
- Preparedness content references: PAGASA, DOH, NDRRMC, and other official sources listed on `/preparedness`.

Third-party data and services retain their own licences and terms. This repository does not grant a licence to redistribute those datasets.
