---
id: PP-016
type: task
title: "Integration + E2E + Security Tests"
status: backlog
priority: high
sprint: launch-prep
parent: PP-013
branch: ticket/PP-016-integration-e2e
created: 2026-02-11
updated: 2026-02-11
estimate: 8h
actual: ""
tags: [testing, integration, e2e, security, pglite, rls]
---

# PP-016: Integration + E2E + Security Tests

## Beschreibung
PGlite für DB-Integrationstests aufsetzen, RLS-Policies mit pgTAP testen, Security Headers in Playwright prüfen, E2E-Tests erweitern (Survey-Flow, Auth-Flow, Smoke), Stripe Webhook Idempotency testen.

Basierend auf PP-013 Research, Phase 1 + Phase 2 MUST-Items.

## Akzeptanzkriterien

### Integration Tests
- [ ] PGlite (WASM Postgres) installiert + Drizzle-Integration konfiguriert
- [ ] DB-Integrationstests: CRUD auf practices, surveys, responses, alerts
- [ ] DB-Migration-Test: Drizzle-Migrations auf PGlite anwenden → Schema konsistent
- [ ] Server Actions Tests: getPractice, updatePractice, getSurveys (mit gemocktem Auth)
- [ ] @faker-js/faker installiert + Custom Builder-Funktionen (buildPractice, buildSurveyResponse)
- [ ] Stripe Webhook: Signature-Verifizierung mit `generateTestHeaderString()`
- [ ] Stripe Webhook: Idempotency — gleiches Event 2x senden → nur 1x verarbeitet

### E2E Tests (Playwright)
- [ ] Survey-Flow: QR-Link → NPS → Kategorien → Submit → Routing (Google/Danke/Empathie)
- [ ] Duplicate-Prevention: Session-Hash → 2. Submit blockiert
- [ ] Auth Guard: Dashboard ohne Login → Redirect zu /login
- [ ] Smoke Tests: /api/health → 200, Survey-Page rendert, Login-Page kein 500

### Security Tests
- [ ] Security Headers auf allen Seiten: CSP, X-Frame-Options, HSTS, X-Content-Type-Options
- [ ] RLS Policy Tests mit pgTAP + supabase-test-helpers (Practice A ≠ Practice B)
- [ ] RLS auf allen 6 Tabellen getestet (practices, surveys, responses, alerts, loginEvents, auditEvents)

### Allgemein
- [ ] Alle Tests grün in CI (GitHub Actions)
- [ ] `npx next build` bleibt sauber

## Technische Details

### PGlite Setup
```bash
npm install -D @electric-sql/pglite
```

Test-Helper: PGlite-Instanz pro Test-Suite, Drizzle-Schema pushen, nach Test aufräumen.

### RLS Testing
```bash
supabase test db
```
SQL-Tests mit pgTAP + `supabase-test-helpers`:
- `create_supabase_user()` + `authenticate_as()` für Multi-Tenant-Szenarien
- Practice A kann nicht Practice B's Daten lesen/schreiben

### Stripe Idempotency
```typescript
const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
// Event 1x senden → DB-Insert
// Gleiches Event nochmal → kein doppelter Insert
```

### Test-Daten Factories
```typescript
// test/factories.ts
import { faker } from '@faker-js/faker/locale/de';
export function buildPractice(overrides?) { ... }
export function buildSurveyResponse(overrides?) { ... }
```

## Abhängigkeiten
- PP-015 (Vitest Setup) — sollte zuerst laufen
- PP-014 (Static Analysis) — unabhängig

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Aus PP-013 Research abgeleitet |
