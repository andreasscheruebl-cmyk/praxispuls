---
id: PP-022
type: task
title: "SEO + Monitoring (Meta Tags, Sentry, Plausible)"
status: review
priority: high
sprint: launch-prep
parent: ""
branch: ticket/PP-022-seo-monitoring
created: 2026-02-11
updated: 2026-02-11
estimate: 4h
actual: 1.5h
tags: [seo, monitoring, sentry, plausible, meta-tags, og-tags, launch]
---

# PP-022: SEO + Monitoring (Meta Tags, Sentry, Plausible)

## SEO

### Meta Tags
- [x] Root layout: title, description, OG, Twitter (existierte bereits)
- [x] Login: `title: "Anmelden"`, eigene description
- [x] Register: `title: "Kostenlos registrieren"`, eigene description
- [x] Impressum, Datenschutz, AGB (existierte bereits)
- [x] Survey `/s/[slug]`: `generateMetadata` mit Praxis-Name, `robots: noindex`

### Structured Data
- [x] JSON-LD `SoftwareApplication` auf Landing Page (Name, Category, Offers, Features)

### OG Image
- [x] `src/app/opengraph-image.tsx` – generiertes OG Image via `ImageResponse`
- [x] Teal-Gradient, PraxisPuls Logo + Tagline, 1200x630px

### Sitemap + robots.txt
- [x] Existierte bereits, keine Änderungen nötig

## Monitoring

### Sentry
- [x] `sentry.server.config.ts` (existierte bereits)
- [x] `sentry.edge.config.ts` (existierte bereits)
- [x] `sentry.client.config.ts` **NEU** – Client-side Error Capturing
- [x] `src/instrumentation.ts` (existierte bereits)
- [x] Build-Plugin conditional (PP-027)

### Plausible
- [x] Script in `layout.tsx` (existierte bereits, conditional)
- [x] `src/lib/plausible.ts` **NEU** – Utility für Custom Events
- [x] Event: `Survey Completed` (mit category prop)
- [x] Event: `Google Review Click`

## Offene Punkte (manuelle Schritte durch Andi)

### Sentry aktivieren
1. Sentry-Account erstellen: https://sentry.io (Free Tier reicht)
2. Projekt erstellen (Next.js)
3. Env-Vars setzen:
   - `NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx`
   - `SENTRY_ORG=dein-org-name`
   - `SENTRY_PROJECT=praxispuls`
   - `SENTRY_AUTH_TOKEN=sntrys_xxx` (in Vercel für Source Maps)

### Plausible aktivieren
1. Plausible-Account erstellen: https://plausible.io
2. Domain registrieren
3. Env-Var setzen: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=praxispuls.de`

## Betroffene Dateien

### Neue Dateien
| Datei | Beschreibung |
|-------|-------------|
| `sentry.client.config.ts` | Client-side Sentry Error Capturing |
| `src/app/(auth)/login/login-form.tsx` | Login Form (Client Component, extrahiert) |
| `src/app/(auth)/register/register-form.tsx` | Register Form (Client Component, extrahiert) |
| `src/app/opengraph-image.tsx` | Dynamisches OG Image (Edge, 1200x630) |
| `src/lib/plausible.ts` | Plausible Custom Event Utility |

### Geänderte Dateien
| Datei | Änderung |
|-------|----------|
| `src/app/(auth)/login/page.tsx` | Server Component mit Metadata, importiert LoginForm |
| `src/app/(auth)/register/page.tsx` | Server Component mit Metadata, importiert RegisterForm |
| `src/app/(marketing)/page.tsx` | JSON-LD SoftwareApplication hinzugefügt |
| `src/app/s/[slug]/page.tsx` | `generateMetadata` mit Praxis-Name + noindex |
| `src/components/survey/survey-form.tsx` | Plausible Events (Survey Completed, Google Review Click) |

## Verifikation
- `npm run test` → 79/79 passed ✅
- `npm run typecheck` → passed ✅
- `npx next lint` → 0 errors ✅
- `npm run build` → sauber ✅

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Aus CLAUDE.md Priorität #4 |
| 2026-02-11 | Status → active | Branch `ticket/PP-022-seo-monitoring` |
| 2026-02-11 | Analyse | IST-Zustand aller SEO/Monitoring-Bereiche |
| 2026-02-11 | Meta Tags | Login + Register: Page/Form-Split für Metadata-Export |
| 2026-02-11 | Survey Metadata | generateMetadata mit Praxis-Name, robots:noindex |
| 2026-02-11 | JSON-LD | SoftwareApplication auf Landing Page |
| 2026-02-11 | Sentry Client | sentry.client.config.ts erstellt |
| 2026-02-11 | Plausible Events | Utility + Survey Completed + Google Review Click |
| 2026-02-11 | OG Image | opengraph-image.tsx mit Teal-Gradient |
| 2026-02-11 | Verifikation | Tests 79/79 ✅, TypeScript ✅, Lint 0 errors ✅, Build ✅ |
| 2026-02-11 | Status → review | Code fertig, Sentry/Plausible Accounts noch durch Andi |
