# SILONG PH — Official Alert Source Registry (Region III)

## Verified source inventory — real integration status

This registry documents which official sources have been researched and what integration method is supported. It does not claim automatic ingestion where only manual verification exists.

### Tier 1: National / Scientific (research completed; automatic API not available)

| Source | URL | Integration Method | Status | Notes |
|---|---|---|---|---|
| DOST-PAGASA (general weather) | https://pagasa.dost.gov.ph/ | No public structured API documented for bulletins; manual admin entry with source URL required | Manually verified / linked | Heat index, severe weather bulletins available on site. No RSS or JSON endpoint confirmed. |
| PAGASA Heat Index | https://pagasa.dost.gov.ph/weather/heat-index | Same — HTML only | Manually verified / linked | Regional heat categories published; must be reviewed and entered by admin with source link. |
| NDRRMC | https://ndrrmc.gov.ph/ | No confirmed public bulletin API; official advisories on site | Manually verified / linked | Disaster situation updates, emergency instructions published as HTML/docs. |
| OCD (Office of Civil Defense) | https://ocd.gov.ph/ (research needed) | Official advisories on site | Manually verified / linked | Emergency announcements; no confirmed RSS feed for automated pull. |
| PHIVOLCS | https://phivolcs.dost.gov.ph/ | Official bulletins on site | Manually verified / linked | Earthquake/volcanic advisories; HTML pages; manual review needed. |

### Tier 2: Regional / Provincial

| Province / Agency | URL / Channel | Method | Status | Notes |
|---|---|---|---|---|
| DILG Region III — Regional News / Advisories | https://centralluzon.region3.dilg.gov.ph/feed/ (RSS) | RSS feed verified; basic server-side fetch possible | **Real feed found — can poll** | WordPress RSS; actual feed retrieved (lastBuild 2026-10-22, hourly update). Contains regional news/events, not structured disaster bulletins. Use for regional awareness; manual admin review required for emergency classification. No auth required. |
| Provincial DRRMO (all 7) | Each provincial government site | Manual / linked | Not yet integrated | No uniform API; must be checked per province. |

### Tier 3: City / Municipal

| Locality / Source | URL / Channel | Method | Status | Notes |
|---|---|---|---|---|
| City of San Fernando (Pampanga) | https://www.cityofsanfernando.gov.ph/ | Manual / linked | Not yet integrated | LGU advisories available on official site. |
| City of Balanga (Bataan) | https://balanga.gov.ph/ | Manual / linked | Not yet integrated | Public advisory pages exist; no automated feed confirmed. |
| City of Malolos (Bulacan) | https://malolos.gov.ph/ | Manual / linked | Not yet integrated | LGU news and advisories on site. |
| Cabanatuan City (Nueva Ecija) | https://cabanatuan.gov.ph/ | Manual / linked | Not yet integrated | City advisories published on official site. |
| Baler (Aurora) | https://baler.gov.ph/ | Manual / linked | Not yet integrated | Municipal advisories on site. |
| Olongapo City (Zambales) | https://olongapo.gov.ph/ | Manual / linked | Not yet integrated | Official public information. |
| City of Tarlac | https://tarlac.gov.ph/ | Manual / linked | Not yet integrated | City DRRMO advisories available. |

## Integration reality

- **Automatic updates:** Not implemented for any Tier 1/2/3 source. PAGASA, NDRRMC, OCD, and LGU DRRMOs do not provide documented public APIs or RSS feeds that can be reliably consumed without manual agreement, credentials, or parsing unstable HTML.
- **Admin-assisted workflow:** The existing `OfficialAlert` database model and admin pages (`/admin/alerts`) support manual recording with `sourceUrl`, `issuedAt`, `issuer`, `severity`, and `affectedArea`. This is the supported method until an authorized automatic feed is configured.
- **No fabricated alerts:** All displayed official advisories must be manually entered by an authorized administrator with a verifiable source URL, original publication time, and correct affected-area description.
- **Heat notices:** The application-generated heat notices (`/alerts`) are derived from Open-Meteo model data (not official PAGASA bulletins) and are clearly labelled as estimates.

## Coverage gaps (honest)

- Aurora: Baler LGU advisory page exists but no automatic integration configured.
- Bataan: Balanga LGU exists; no automatic feed.
- All provinces: Provincial DRRMO uniform API does not exist.
- No real-time webhook or polling endpoint is confirmed for any listed agency.

## Recommended next steps (not fabricated)

1. Monitor `https://pagasa.dost.gov.ph/weather/heat-index` and official bulletins manually; record verified advisories via admin dashboard.
2. Contact PAGASA / OCD / NDRRMC for authorized API or RSS access if automatic ingestion is needed.
3. Add LGU DRRMO links to the source registry as they publish advisories.
4. Keep the existing `OfficialAlert` table with `status`, `sourceUrl`, `issuedAt`, `verifiedAt`, and `lastSynchronizedAt` fields.

## Last updated

- 2026-10-25 — Source registry created from verified web research (PAGASA, NDRRMC, OCD, SM Supermalls, LGU sites, OSM).
- No API keys or private credentials exposed.
- No fabricated source endpoints.
