---
id: PP-001
type: feature
title: "Umfrage-Weiterleitung: Konfiguration zum Deaktivieren"
status: done
priority: medium
sprint: survey-engine
parent: ""
branch: ticket/PP-001-redirect-toggle
created: 2026-02-10
updated: 2026-02-10
estimate: 1h
actual: ""
tags: [settings, survey, google-reviews]
---

# PP-001: Umfrage-Weiterleitung: Konfiguration zum Deaktivieren

## Beschreibung
Praxen sollen die Google-Review-Weiterleitung nach der Umfrage deaktivieren können, ohne die Place ID entfernen zu müssen. Ein Toggle in den Dashboard-Settings steuert, ob Promoter den Google-Review-Prompt sehen.

## Analyse
- **Ist-Zustand:** Review-Router (`src/lib/review-router.ts`) prüft `npsScore >= threshold && googlePlaceId` — keine Möglichkeit die Weiterleitung zu deaktivieren ohne Place ID zu entfernen.
- **Betroffene Stellen:** Schema, Validierung, Review-Router, Public Response API, Danke-Seite, Settings-UI.
- **Ansatz:** Neues boolean-Feld `google_redirect_enabled` (default `true`) in der `practices`-Tabelle. Flag wird im Review-Router und auf der Danke-Seite geprüft.

## Lösungsansatz
Minimal-invasiv: Ein einzelnes boolean-Feld steuert die Weiterleitung. Default `true` = bestehende Praxen behalten ihr Verhalten. Toggle in Settings-UI nur sichtbar wenn Place ID konfiguriert ist.

## Änderungen

### `src/lib/db/schema.ts`
- Neues Feld `googleRedirectEnabled: boolean("google_redirect_enabled").default(true)` in `practices`-Tabelle

### `drizzle/0003_google_redirect_toggle.sql`
- Migration: `ALTER TABLE "practices" ADD COLUMN "google_redirect_enabled" boolean DEFAULT true;`

### `src/lib/validations.ts`
- `googleRedirectEnabled: z.boolean().optional()` zu `practiceUpdateSchema` hinzugefügt

### `src/lib/review-router.ts`
- `routeByNps()` um Parameter `googleRedirectEnabled: boolean = true` erweitert
- Bedingung geändert: `npsScore >= npsThreshold && googlePlaceId && googleRedirectEnabled`

### `src/app/api/public/responses/route.ts`
- `practice.googleRedirectEnabled ?? true` wird als 4. Parameter an `routeByNps()` übergeben

### `src/app/s/[slug]/danke/page.tsx`
- `redirectEnabled` Variable aus `practice.googleRedirectEnabled ?? true`
- `googleReviewUrl` wird nur gesetzt wenn `redirectEnabled === true`

### `src/app/(dashboard)/dashboard/settings/page.tsx`
- State-Type erweitert um `boolean`
- Checkbox-Toggle "Google-Bewertung nach Umfrage anzeigen" — nur sichtbar wenn `googlePlaceId` gesetzt

## Betroffene Dateien
- `src/lib/db/schema.ts`
- `src/lib/validations.ts`
- `src/lib/review-router.ts`
- `src/app/api/public/responses/route.ts`
- `src/app/s/[slug]/danke/page.tsx`
- `src/app/(dashboard)/dashboard/settings/page.tsx`
- `drizzle/0003_google_redirect_toggle.sql`

## Verifikation
- Build sauber (next build ✅)
- Manueller Test: Toggle aus → Promoter sieht keinen Google-Prompt
- Manueller Test: Toggle an → Verhalten wie bisher

## Akzeptanzkriterien
- [x] Neues DB-Feld `google_redirect_enabled` (boolean, default `true`) in `practices`-Tabelle
- [x] Toggle-Switch in Dashboard-Settings neben der Google-Place-ID-Konfiguration ("Google-Bewertung nach Umfrage anzeigen")
- [x] Review-Router prüft das Flag – wenn `false`, wird kein Google-Prompt angezeigt (auch bei Promotern)
- [x] API-Route `/api/practice` akzeptiert das neue Feld beim Update
- [x] Build bleibt sauber, bestehende Logik unverändert wenn Flag `true`

## Test-Plan
- [x] Manueller Test: Toggle aus → Promoter sieht keinen Google-Prompt
- [x] Manueller Test: Toggle an → Verhalten wie bisher
- [x] Build sauber

## Abhängigkeiten
Keine

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-10 | Erstellt | Ticket angelegt |
| 2026-02-10 | Analyse | Ist-Zustand geprüft: review-router.ts, danke/page.tsx, settings/page.tsx, schema.ts |
| 2026-02-10 | Implementiert | Schema + Migration + Validation + Router + API + Settings-UI + Danke-Seite angepasst (7 Dateien) |
| 2026-02-10 | Build | `next build` sauber ✅ |
| 2026-02-10 | Commit | `2dc8308` feat(settings): add toggle to disable Google review redirect [PP-001] |
| 2026-02-10 | Done | Alle Akzeptanzkriterien erfüllt ✅ |
