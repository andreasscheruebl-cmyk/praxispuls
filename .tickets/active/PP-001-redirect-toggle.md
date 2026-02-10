---
id: PP-001
type: feature
title: "Umfrage-Weiterleitung: Konfiguration zum Deaktivieren"
status: active
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

## Akzeptanzkriterien
- [x] Neues DB-Feld `google_redirect_enabled` (boolean, default `true`) in `practices`-Tabelle
- [x] Toggle-Switch in Dashboard-Settings neben der Google-Place-ID-Konfiguration ("Google-Bewertung nach Umfrage anzeigen")
- [x] Review-Router prüft das Flag – wenn `false`, wird kein Google-Prompt angezeigt (auch bei Promotern)
- [x] API-Route `/api/practice` akzeptiert das neue Feld beim Update
- [x] Build bleibt sauber, bestehende Logik unverändert wenn Flag `true`

## Technische Details
- `src/lib/db/schema.ts` – neues Feld `googleRedirectEnabled`
- `src/lib/review-router.ts` – Flag-Check in `routeByNps()`
- `src/app/api/public/responses/route.ts` – Flag an Router übergeben
- `src/app/api/practice/route.ts` – PUT akzeptiert neues Feld
- `src/app/(dashboard)/dashboard/settings/page.tsx` – Toggle-UI
- `drizzle/` – Migration-SQL

## Test-Plan
- [ ] Manueller Test: Toggle aus → Promoter sieht keinen Google-Prompt
- [ ] Manueller Test: Toggle an → Verhalten wie bisher
- [ ] Build sauber

## Abhängigkeiten
Keine

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-10 | Erstellt | Ticket angelegt |
| 2026-02-10 | Implementiert | Schema, Validation, Router, API, Settings-UI, Danke-Seite, Migration |
| 2026-02-10 | Build | Sauber ✅ |
