# Deployment and operations

This guide covers a production deployment of SILONG PH on a single Linux host, plus the local production smoke test used in this workspace. The app is a standard Next.js server, so it can also run on a container platform or a managed Node host.

> **Safety first:** production must use HTTPS, a dedicated database user, strong secrets, and a verified backup/restore process. The local administrator credentials in the README are for development only.

---

## 1. Production checklist

- [ ] Node.js 20.9+ (Node 22 LTS recommended)
- [ ] MySQL 8+ or MariaDB 10.4+ database with `utf8mb4`
- [ ] Dedicated database user and strong password
- [ ] Redis 6+ if running more than one app instance (optional otherwise)
- [ ] `AUTH_SECRET` of at least 32 random characters
- [ ] `NEXT_PUBLIC_APP_URL` set to the final **https://** origin
- [ ] `CRON_SECRET` set if scheduled cache warming is enabled
- [ ] `.env` not committed and not readable by other users
- [ ] HTTPS reverse proxy or managed TLS
- [ ] `npm run db:deploy` applied
- [ ] Bootstrap administrator seeded, then `ADMIN_PASSWORD` removed from runtime env
- [ ] `npm run build` and `npm start` verified
- [ ] `/api/health` monitored
- [ ] Database backup and restore tested
- [ ] PWA/service worker tested against the production build
- [ ] Content and official-source links reviewed

---

## 2. Architecture

```text
Browser / installed PWA
        |
        | HTTPS
        v
Reverse proxy (Nginx, Caddy, or platform ingress)
        |
        v
Next.js server (`next start`, Node.js)
   |                 |
   | Prisma          | optional
   v                 v
MySQL/MariaDB      Redis
```

- MySQL/MariaDB is the source of truth for users, places, reports, alerts, articles, and audit logs.
- Redis is a cache and distributed rate-limit store. It is **not** a source of truth. If Redis is absent or unreachable, the app falls back to process memory. That fallback is only correct for a single app instance.
- Weather data comes from Open-Meteo over the public internet. The server must be able to reach `api.open-meteo.com`.

---

## 3. Database setup

### 3.1 Create the database and user

MySQL 8 and MariaDB 10.4 both accept the following:

```sql
CREATE DATABASE silong CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'silong'@'localhost' IDENTIFIED BY 'replace-with-a-long-random-password';
GRANT ALL PRIVILEGES ON silong.* TO 'silong'@'localhost';
FLUSH PRIVILEGES;
```

If the app server is on a different host, use the appropriate host part (for example `'silong'@'10.0.0.%'`) and restrict it to the app network. Do not grant global privileges.

### 3.2 Connection string

```dotenv
DATABASE_URL="mysql://silong:URL_ENCODED_PASSWORD@127.0.0.1:3306/silong"
```

URL-encode special characters in the password (for example `@` becomes `%40`). For managed databases, add the provider's recommended TLS parameters to the connection string.

Optional pool tuning:

```dotenv
DATABASE_URL="mysql://silong:password@127.0.0.1:3306/silong?connection_limit=10&pool_timeout=20"
```

Size the pool for the number of app processes and the database's `max_connections`.

### 3.3 Time zone

Prisma stores `DateTime` values in UTC. The app formats dates for Asia/Manila explicitly. Setting `TZ=Asia/Manila` on the server is optional but makes logs easier to read.

### 3.4 Migrations

The repository contains a baseline migration in `prisma/migrations/`.

Fresh database:

```bash
npx prisma generate
npm run db:deploy
```

Existing database that was created with `prisma db push` before migrations were added:

```bash
npx prisma migrate resolve --applied 20261025120000_init
```

Check status:

```bash
npx prisma migrate status
```

Do not use `prisma db push` against a production database. It can make destructive changes without a migration history. Use `npm run db:migrate` during development to create a new migration, review the SQL, commit it, and apply it with `npm run db:deploy`.

### 3.5 Seed the bootstrap administrator

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the environment for this step only:

```bash
npm run db:seed
```

The password must be at least 12 characters. The seed:

- Upserts a `SUPER_ADMIN`.
- Imports `data/seed-places.json` if present, skipping existing OSM IDs.
- Seeds preparedness articles.

Re-running the seed with a new `ADMIN_PASSWORD` rotates the bootstrap administrator's password. **Remove `ADMIN_PASSWORD` from the runtime environment after seeding.** The app does not need it at runtime.

The seed does not create official advisories. An administrator must add those with a real issuer and source URL.

---

## 4. Redis (optional, recommended for multiple instances)

Install Redis 6+ and bind it to a private interface. Example minimal configuration:

```conf
bind 127.0.0.1
protected-mode yes
maxmemory 256mb
maxmemory-policy allkeys-lru
appendonly no
```

Set:

```dotenv
REDIS_URL="redis://127.0.0.1:6379"
```

For a managed or remote Redis, use TLS (`rediss://`) and a strong password/ACL. The app only stores JSON weather snapshots and rate-limit counters, so Redis persistence is not required for correctness. Losing Redis causes a temporary cache miss and resets distributed rate-limit counters.

If Redis is unreachable, the app logs no reconnect storm, uses the in-process cache, and reports `in-process-fallback` on `/api/health`. Fix Redis before scaling horizontally.

---

## 5. Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MySQL/MariaDB connection string. |
| `AUTH_SECRET` | Yes | At least 32 random characters. Signs session JWTs. Rotating it invalidates all sessions. |
| `NEXT_PUBLIC_APP_URL` | Yes in production | Final public origin, e.g. `https://heat.example.ph`. Must match the browser origin for same-origin checks and secure cookies. |
| `CRON_SECRET` | For cron | Bearer token for `/api/cron/weather`. If unset, the endpoint returns 503. |
| `REDIS_URL` | No | Enables shared cache and distributed rate limiting. |
| `ADMIN_EMAIL` | Seed only | Bootstrap administrator email. |
| `ADMIN_PASSWORD` | Seed only | At least 12 characters. Remove after seeding. |
| `RATE_LIMIT_SALT` | No | Optional separate salt for hashed client keys. Falls back to `AUTH_SECRET`. |
| `PORT` | No | Port for `next start` (default 3000). |
| `TZ` | No | Optional server log time zone; the app formats Asia/Manila explicitly. |
| `NEXT_TELEMETRY_DISABLED` | No | Set to `1` to disable Next.js telemetry. |

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never commit `.env`. Restrict it to the service user:

```bash
chmod 600 /etc/silong.env
chown silong:silong /etc/silong.env
```

### Secure cookies

Session cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` when:

- `NODE_ENV=production`, and
- `NEXT_PUBLIC_APP_URL` is empty or starts with `https://`.

A production app URL of `http://...` deliberately disables the `Secure` flag so local `npm start` smoke tests can log in. **Use HTTPS in production.** If the public URL is HTTPS but TLS terminates at a proxy, set `NEXT_PUBLIC_APP_URL` to the public HTTPS URL.

---

## 6. Install, build, and run

### 6.1 Install

```bash
npm ci --legacy-peer-deps
```

`--legacy-peer-deps` is required by the current dependency set. `npm ci` uses `package-lock.json` for reproducible installs.

### 6.2 Build

Ensure the production environment file is available at build time:

```bash
set -a
. /etc/silong.env
set +a

npx prisma generate
npm run build
```

`NEXT_PUBLIC_*` values are inlined into the client bundle at build time. If `NEXT_PUBLIC_APP_URL` changes, rebuild.

### 6.3 Start

```bash
npm start
```

Or run Next directly without the npm wrapper:

```bash
node node_modules/next/dist/bin/next start -p 3000 -H 127.0.0.1
```

Binding to `127.0.0.1` is appropriate when a reverse proxy is on the same host. Use `0.0.0.0` only when the network is otherwise restricted.

### 6.4 systemd example

```ini
[Unit]
Description=SILONG PH
After=network.target mysql.service redis.service
Wants=mysql.service

[Service]
Type=simple
User=silong
Group=silong
WorkingDirectory=/srv/silong
EnvironmentFile=/etc/silong.env
ExecStart=/usr/bin/node node_modules/next/dist/bin/next start -p 3000 -H 127.0.0.1
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/srv/silong/.next/cache

[Install]
WantedBy=multi-user.target
```

Adjust `ReadWritePaths` if Next.js needs other writable paths in your environment. Reload and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now silong-ph
sudo systemctl status silong-ph
```

PM2 is also suitable:

```bash
pm2 start npm --name silong-ph -- start
pm2 save
```

---

## 7. Reverse proxy and HTTPS

Example Nginx server block. Adjust certificate paths and host names.

```nginx
server {
    listen 80;
    server_name heat.example.ph;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name heat.example.ph;

    ssl_certificate     /etc/letsencrypt/live/heat.example.ph/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/heat.example.ph/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    client_max_body_size 1m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

Notes:

- Set `NEXT_PUBLIC_APP_URL="https://heat.example.ph"` and rebuild if it changed.
- Forward `X-Forwarded-For` so rate limiting sees client addresses. The app hashes the first forwarded address; do not trust a client-supplied header unless your proxy overwrites it.
- Next.js already sets `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, and `Permissions-Policy`. Add HSTS at the proxy as shown. Consider a CSP after testing Leaflet tiles, inline styles, and Next.js chunks.
- Do not cache HTML or API responses at the proxy. The service worker handles static assets; weather and health responses are `no-store`.

---

## 8. Scheduled weather refresh

The endpoint warms the seven province points:

```bash
curl -fsS \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://heat.example.ph/api/cron/weather
```

Run it every 10 minutes. Example crontab:

```cron
*/10 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://heat.example.ph/api/cron/weather >/dev/null 2>&1
```

Manual forced refresh:

```bash
curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
  "https://heat.example.ph/api/cron/weather?force=1"
```

Behaviour:

- `503` if `CRON_SECRET` is not configured on the server.
- `401` if the bearer token is wrong.
- `200` with `ok: true`, the number of points, and the snapshot time on success.
- `503` if the provider is unavailable. Cached data is not replaced with fabricated values.

The public weather endpoints also fetch on demand and cache for 10 minutes, so the cron job is an optimisation and a way to keep the shared cache warm, not a correctness requirement.

---

## 9. Health checks and monitoring

`GET /api/health` returns:

```json
{
  "status": "ok",
  "database": { "configured": true, "reachable": true, "latencyMs": 12 },
  "cache": { "configured": true, "reachable": true, "latencyMs": 2, "mode": "redis" },
  "checkedAt": "2026-10-25T05:00:00.000Z",
  "responseTimeMs": 18
}
```

- HTTP `200` when the database is reachable.
- HTTP `503` when the database is unreachable.
- Redis failure alone does **not** make the app unhealthy; it reports `mode: "in-process-fallback"`.

Monitor at least:

- `/api/health` status and latency
- process uptime and restart count
- disk space (database and logs)
- database connection count and slow queries
- weather-provider failures in application logs
- cron job success

Do not log request bodies, passwords, session cookies, or full client IPs. The app hashes rate-limit keys; keep proxy logs consistent with your privacy policy.

---

## 10. Backups and recovery

### 10.1 Database backup

Use a consistent, single-transaction dump:

```bash
mysqldump \
  --single-transaction \
  --routines \
  --triggers \
  --default-character-set=utf8mb4 \
  silong > /var/backups/silong-$(date +%F-%H%M).sql
```

Compress and encrypt backups according to your policy. Store at least one copy off the host. Restrict permissions:

```bash
chmod 600 /var/backups/silong-*.sql
```

### 10.2 Restore test

Restore into a separate database first:

```bash
mysql -u root -p -e "CREATE DATABASE silong_restore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p silong_restore < /var/backups/silong-2026-10-25-1200.sql
```

Then point a staging instance at the restored database and verify:

- `/api/health` is `ok`
- the admin login works
- places, reports, and alerts load
- a test place update writes an audit entry

Do not assume a backup is valid until a restore has succeeded.

### 10.3 Redis

Redis holds only cache data and rate-limit counters. It does not need a backup for correctness. After a Redis loss, weather is re-fetched and rate-limit windows reset.

### 10.4 Recovery procedure

1. Provision or restore the database.
2. Apply migrations with `npm run db:deploy` if restoring an older schema.
3. Restore the dump.
4. Confirm `DATABASE_URL`, `AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL`.
5. Start the app and check `/api/health`.
6. Verify an admin login and one read-only admin page.
7. Check the cron endpoint.
8. Rotate any secret that may have been exposed.

Rotating `AUTH_SECRET` logs out every administrator. That is the intended response to suspected session compromise.

---

## 11. Security hardening

- Use HTTPS everywhere; redirect HTTP to HTTPS.
- Keep `AUTH_SECRET` and `CRON_SECRET` out of source control and logs.
- Use a dedicated database user limited to the `silong` schema.
- Restrict Redis to a private interface; use TLS and authentication for remote Redis.
- Remove `ADMIN_PASSWORD` from runtime environment variables after seeding.
- Review administrator accounts and roles periodically. Deactivate leavers by setting `isActive = false`.
- Keep Node.js, Next.js, Prisma, and system packages patched.
- Run `npm audit` and review findings in context; do not blindly apply breaking upgrades.
- Back up before migrations and test restores.
- Rate limiting is best-effort. Put a WAF or proxy-level limiter in front of login and report endpoints for stronger protection.
- The app sets framing, MIME-sniffing, referrer, and permissions headers. Add HSTS and a tested CSP at the proxy.
- Administrative APIs require same-origin requests, a valid session, and an allowed role. Do not bypass them with direct database writes in normal operations.

---

## 12. PWA production testing

The service worker is registered **only in production**. Development mode unregisters an existing worker on the same origin to avoid stale-cache confusion.

### 12.1 Build and serve

```bash
npm run build
npm start
```

Open the production origin. For local testing, `http://localhost:3000` is treated as a secure context by browsers, so service workers work. Other hosts require HTTPS.

### 12.2 Verify installation and caching

1. Open Chrome DevTools → **Application** → **Manifest**. Confirm the name, icons, start URL, display mode, and theme colours.
2. Open **Application** → **Service Workers**. Confirm `sw.js` is activated and controlling the page.
3. Reload once so the worker controls the page.
4. Visit the dashboard, map, directory, and a place page while online.
5. Switch DevTools **Network** to **Offline** and reload a previously visited page. You should get the cached page or `/offline.html`, never a fabricated weather reading.
6. Confirm `/api/weather`, `/api/weather/region`, `/api/places`, and `/api/health` are **not** served from the service-worker cache.
7. Check that stale weather is labelled as stale and that an unavailable provider produces an error state, not synthetic data.
8. Run Lighthouse in an Incognito window for installability, accessibility, and performance signals.
9. Test on a real phone over HTTPS: add to home screen, launch standalone, rotate the device, and test with a slow or offline connection.

### 12.3 Updating the service worker

`public/sw.js` uses a versioned cache (`silong-v1`). When changing cache behaviour, bump `VERSION` so old caches are deleted on activation. The worker calls `skipWaiting()` and `clients.claim()`; verify that a new deployment does not leave users on an old shell. Because navigations are network-first, online users receive fresh HTML even if an old worker is briefly active.

### 12.4 What the worker caches

- Precache: `/offline.html`, manifest, icons, favicon.
- Cache-first: `/_next/static/`, `/icons/`, `/geo/`, manifest, favicon.
- Network-first: page navigations, with cached page or offline fallback.
- Never cached: `/api/`, `/admin/`, `/sw.js`, non-GET requests, cross-origin requests.

---

## 13. Local production smoke test (Windows)

This workspace uses MariaDB (XAMPP) and Redis (DBngin) locally. The exact service paths are machine-specific; the ports and commands are what matter.

1. Start MariaDB on `127.0.0.1:3306` and Redis on `127.0.0.1:6379`.
2. Confirm `.env` has `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`, and optionally `REDIS_URL`.
3. Apply migrations and seed if needed:

   ```powershell
   npx prisma migrate status
   npm run db:seed
   ```

4. Build and start:

   ```powershell
   npm run build
   npm start
   ```

5. Check health and weather:

   ```powershell
   Invoke-WebRequest http://localhost:3000/api/health -UseBasicParsing
   Invoke-WebRequest "http://localhost:3000/api/weather?lat=15.03&lon=120.69" -UseBasicParsing
   ```

6. Log in at <http://localhost:3000/admin/login>. Because the local app URL is HTTP, the session cookie is intentionally not `Secure`. This is only acceptable for localhost testing.

7. Stop the server with `Ctrl+C` or by stopping the process listening on port 3000:

   ```powershell
   $conn = Get-NetTCPConnection -LocalPort 3000 -State Listen
   Stop-Process -Id $conn.OwningProcess -Force
   ```

If Prisma Client generation fails on Windows with `EPERM ... query_engine-windows.dll.node`, stop any running Node/Next process, remove the stale `.tmp*` file under `node_modules/.prisma/client`, and retry:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item "node_modules\.prisma\client\query_engine-windows.dll.node.tmp*" -Force -ErrorAction SilentlyContinue
npx prisma generate
```

---

## 14. Troubleshooting

| Symptom | Check |
| --- | --- |
| `npm install` fails with peer-dependency errors | Use `npm install --legacy-peer-deps` or `npm ci --legacy-peer-deps`. |
| Prisma `P1001` / can't reach database | Database running, host/port, user grants, `DATABASE_URL`, TLS parameters. |
| `prisma migrate deploy` says migration already applied / table exists | The database was created with `db push`. Baseline it with `prisma migrate resolve --applied 20261025120000_init`, then re-check `migrate status`. |
| Admin login returns 200 but `/admin` redirects to login | Cookie is `Secure` while you are on HTTP. Use HTTPS, or for localhost ensure `NEXT_PUBLIC_APP_URL` is `http://localhost:3000`. |
| Weather shows an error instead of a number | Provider unreachable or returned an error. The app does not substitute synthetic readings. Check server egress and `/api/weather`. |
| Weather is labelled stale | The last successful snapshot is being used because a refresh failed. It is not shown beyond 3 hours. |
| `/api/health` says `in-process-fallback` | Redis is not configured or unreachable. Fine for one instance; configure Redis before scaling. |
| Cron endpoint returns 503 | `CRON_SECRET` is not set on the server. |
| Cron endpoint returns 401 | Bearer token mismatch. |
| Service worker not updating | Confirm you are on a production build, bump the cache version in `public/sw.js`, and check DevTools → Application → Service Workers. |
| Map tiles fail | The map shows a tile-failure notice and a text alternative. Check network access to OpenStreetMap tiles and the tile usage policy. |
| Prisma `EPERM` on Windows | Stop Node processes, remove stale `.tmp*` engine files, regenerate. |

---

## 15. Deployment verification

After deployment, verify at minimum:

- [ ] `/` returns 200 and shows live or explicitly stale data.
- [ ] `/api/health` returns 200 with database reachable.
- [ ] `/api/weather?lat=15.03&lon=120.69` returns a model snapshot or a clear error, never a fake reading.
- [ ] `/map`, `/cool-places`, `/provinces/pampanga`, `/localities/0305416000`, `/alerts`, `/preparedness`, `/about`, `/privacy`, and `/methodology` return 200.
- [ ] Unauthenticated `/admin` redirects to `/admin/login`.
- [ ] Admin login works over HTTPS and the cookie is `Secure`, `HttpOnly`, and `SameSite=Lax`.
- [ ] A place verification writes `verifiedAt`, `verifiedById`, and an audit log entry.
- [ ] A report moderation action writes `reviewedAt`, `reviewedById`, and an audit entry.
- [ ] An official advisory can be created only by a `SUPER_ADMIN` and requires a source URL.
- [ ] Cron refresh succeeds with the bearer token.
- [ ] PWA installs, offline fallback works, and API responses are not cached.
- [ ] Backup and restore have been tested.
- [ ] `ADMIN_PASSWORD` is no longer present in the runtime environment.
