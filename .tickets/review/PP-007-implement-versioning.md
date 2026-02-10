---
id: PP-007
type: feature
title: "Automatische Versionierung + Build-Info implementieren"
status: review
priority: medium
sprint: survey-engine
parent: PP-006
branch: ticket/PP-007-implement-versioning
created: 2026-02-11
updated: 2026-02-11
estimate: 1h
actual: ""
tags: [dx, versioning, monitoring, sentry]
---

# PP-007: Automatische Versionierung + Build-Info implementieren

## Beschreibung
Basierend auf dem Konzept aus PP-006: Versionierung, Build-Info und Health-Endpoint einrichten. Version aus `package.json` lesen, Build-Metadaten (Git Hash, Datum, Env) via `next.config.ts` injizieren, zentrale `version.ts` Lib, Health-API, Dashboard-Footer-Badge, Sentry Release-Tag.

## Analyse
- **Ist-Zustand:** `package.json` version `0.1.0`, keine Git Tags, kein CHANGELOG, Sentry ohne `release` Property
- **next.config.ts:** Existiert mit Sentry-Wrapper + Image-Config, kein `env`-Block
- **Sentry:** `sentry.server.config.ts` + `sentry.edge.config.ts` ohne `release`
- **Dashboard-Layout:** Sidebar mit Logo + Nav + User-Info + Logout, kein Footer-Version-Badge
- **Health-Endpoint:** Existiert nicht (`src/app/api/health/` fehlt)

## Änderungen

### 1. `next.config.ts` — Build-Info injizieren
- `readFileSync("./package.json")` für Version (nicht `npm_package_version` — unzuverlässig auf Vercel)
- `NEXT_PUBLIC_APP_VERSION` aus package.json
- `NEXT_PUBLIC_BUILD_HASH` aus `VERCEL_GIT_COMMIT_SHA` (Fallback: lokaler `git rev-parse --short HEAD`)
- `NEXT_PUBLIC_BUILD_DATE` aus `new Date().toISOString()`
- `NEXT_PUBLIC_BUILD_ENV` aus `VERCEL_ENV` (Fallback: `NODE_ENV`)
- `NEXT_PUBLIC_GIT_BRANCH` aus `VERCEL_GIT_COMMIT_REF` (Fallback: lokaler `git rev-parse --abbrev-ref HEAD`)

### 2. `src/lib/version.ts` — Zentraler Zugriff (NEU)
- `BuildInfo` Interface: version, hash, date, env, branch, label
- `getBuildInfo()`: liest alle `NEXT_PUBLIC_*` Env-Vars
- `getVersionString()`: formatiert als `v0.1.0 (abc1234 · 2026-02-10)`

### 3. `src/app/api/health/route.ts` — Health-Endpoint (NEU)
- `GET /api/health` → `{ status, timestamp, build: BuildInfo, uptime }`
- `export const dynamic = "force-dynamic"`
- Nutzbar für BetterStack Monitoring

### 4. `src/components/shared/build-badge.tsx` — Dashboard-Footer (NEU)
- Client-Komponente, Click-to-expand
- Kompakt: `v0.1.0` → Klick → `v0.1.0+abc1234 · 10.02.2026`
- Non-Production: zeigt `[preview]` / `[development]` Badge

### 5. `src/app/(dashboard)/layout.tsx` — Badge einbauen
- `<BuildBadge />` im Sidebar-Footer (unter Logout-Button)

### 6. `sentry.server.config.ts` + `sentry.edge.config.ts` — Release-Tag
- `release: \`praxispuls@${process.env.NEXT_PUBLIC_APP_VERSION}+${process.env.NEXT_PUBLIC_BUILD_HASH}\``
- Ermöglicht Sentry Release-Tracking pro Version

### 7. `package.json` — Version-Scripts
- `"release:patch": "npm version patch -m \"chore(release): v%s\""` (mit Git-Tag)
- `"release:minor": "npm version minor -m \"chore(release): v%s\""` (mit Git-Tag)
- `"release:major": "npm version major -m \"chore(release): v%s\""` (mit Git-Tag)
- Bewusst MIT Git-Tags (ohne `--no-git-tag-version`) → `git log v0.1.0..v0.2.0` möglich

## Betroffene Dateien
- `next.config.ts` (geändert)
- `src/lib/version.ts` (neu)
- `src/app/api/health/route.ts` (neu)
- `src/components/shared/build-badge.tsx` (neu)
- `src/app/(dashboard)/layout.tsx` (geändert)
- `sentry.server.config.ts` (geändert)
- `sentry.edge.config.ts` (geändert)
- `package.json` (geändert — Scripts)

## Akzeptanzkriterien
- [ ] `next.config.ts` injiziert Build-Info als `NEXT_PUBLIC_*` Env-Vars
- [ ] `src/lib/version.ts` exportiert `getBuildInfo()` und `getVersionString()`
- [ ] `GET /api/health` gibt Build-Info + Status als JSON zurück
- [ ] Dashboard-Sidebar-Footer zeigt klickbares Version-Badge
- [ ] Sentry-Config hat `release` Property mit Version+Hash
- [ ] `npm run release:minor` bumpt Version, erstellt Commit + Git-Tag
- [ ] Build bleibt sauber

## Test-Plan
- [ ] `npx next build` — sauber
- [ ] Lokal: `process.env.NEXT_PUBLIC_APP_VERSION` gibt `0.1.0` zurück
- [ ] Lokal: `/api/health` gibt korrektes JSON zurück
- [ ] Dashboard: Version-Badge sichtbar und klickbar
- [ ] `npm run release:patch` → package.json bumpt, Git-Tag erstellt

## Abhängigkeiten
- PP-006 (Research — done)

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Implementierungs-Ticket basierend auf PP-006 Konzept + Review-Feedback |
| 2026-02-11 | Aktiviert | Status backlog → active |
| 2026-02-11 | Implementiert | `next.config.ts`: Build-Info Env-Vars mit `readFileSync` + Git Hash/Branch Helpers |
| 2026-02-11 | Implementiert | `src/lib/version.ts`: BuildInfo Interface + getBuildInfo() + getVersionString() |
| 2026-02-11 | Implementiert | `src/app/api/health/route.ts`: Health-Endpoint mit Build-Info + Uptime |
| 2026-02-11 | Implementiert | `src/components/shared/build-badge.tsx`: Click-to-expand Version-Badge |
| 2026-02-11 | Implementiert | `src/app/(dashboard)/layout.tsx`: BuildBadge im Sidebar-Footer |
| 2026-02-11 | Implementiert | `sentry.server.config.ts` + `sentry.edge.config.ts`: release + environment Tags |
| 2026-02-11 | Implementiert | `package.json`: release:patch/minor/major Scripts mit Git-Tags |
| 2026-02-11 | Build | `npx next build` sauber ✅, `/api/health` Route sichtbar |
