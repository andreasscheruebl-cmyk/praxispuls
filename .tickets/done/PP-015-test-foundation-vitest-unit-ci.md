---
id: PP-015
type: task
title: "Test-Foundation: Vitest v4 + Unit Tests + Pre-commit + CI"
status: done
priority: high
sprint: launch-prep
parent: PP-013
branch: ticket/PP-015-test-foundation
created: 2026-02-11
updated: 2026-02-11
estimate: 5h
actual: "1.5h"
tags: [testing, vitest, unit-tests, ci, dx]
---

# PP-015: Test-Foundation — Vitest v4 + Unit Tests + CI

## Akzeptanzkriterien
- [x] Vitest v4.0+ installiert + konfiguriert (`vitest.config.ts`)
- [x] Coverage-Provider V8 konfiguriert (80% Threshold auf getestete Dateien)
- [x] Unit-Tests: `validations.ts` — alle 6 Zod-Schemas (valide + invalide Inputs, Edge-Cases)
- [x] Unit-Tests: `review-router.ts` — alle NPS-Kombinationen (Promoter/Passive/Detractor × Google/Custom)
- [x] Unit-Tests: `utils.ts` — alle 5 Funktionen (getNpsCategory, slugify, formatDateDE, getGoogleReviewUrl)
- [x] Unit-Tests: `themes.ts` — getThemeConfig für standard + vertrauen + Fallback
- [x] Unit-Tests: `qr.ts` — URL-Format, DataURL generiert, Custom Options
- [x] `simple-git-hooks` Pre-push: `vitest run` (full suite)
- [x] GitHub Actions Workflow: 4 parallele Jobs (Lint+Types, Unit Tests, E2E, Security)
- [x] Coverage ≥ 80% auf getestete `src/lib/` Module
- [x] `npx next build` bleibt sauber (0 Errors)

## Analyse
- 5 reine Business-Logic-Dateien identifiziert: validations.ts, review-router.ts, utils.ts, themes.ts, qr.ts
- Dateien mit externen Dependencies (email.ts, stripe.ts, google.ts, qr-pdf.ts etc.) werden in PP-016 (Integration Tests) mit Mocks getestet
- Pre-commit/Pre-push Hooks waren bereits teilweise aus PP-014 vorhanden

## Änderungen

### `vitest.config.ts` (NEU)
- Environment: node, Include: `src/**/*.test.ts`
- Coverage: V8, Thresholds 80%, Scope auf reine lib-Module

### Unit-Test-Dateien (5 NEU)
- `src/lib/__tests__/validations.test.ts` — 36 Tests (6 Schemas × valide/invalide/edge-cases)
- `src/lib/__tests__/review-router.test.ts` — 13 Tests (Promoter/Passive/Detractor × Google/Custom/Threshold)
- `src/lib/__tests__/utils.test.ts` — 16 Tests (getNpsCategory boundaries, slugify Umlaute, formatDateDE, getGoogleReviewUrl)
- `src/lib/__tests__/themes.test.ts` — 8 Tests (standard, vertrauen, Fallback, Properties)
- `src/lib/__tests__/qr.test.ts` — 6 Tests (URL-Format, DataURL, Custom Options)

### `package.json`
- Neue Scripts: `test`, `test:watch`, `test:coverage`
- Pre-push Hook: `npx vitest run`
- DevDeps: `vitest`, `@vitest/coverage-v8`

### `.github/workflows/ci.yml`
- Erweitert von 1 Job auf 4 parallele Jobs: Lint+Types, Unit Tests, E2E, Security
- Coverage + Playwright Reports als Artifacts

### `eslint.config.mjs`
- Test-Dateien von `no-hardcoded-passwords`, `no-hardcoded-secrets`, `max-lines-per-function` ausgenommen

### `knip.json`
- `@vitest/coverage-v8` zu ignoreDependencies hinzugefügt

### `src/lib/utils.ts`
- `// test` Kommentar entfernt (Cleanup)

## Verifikation
- `npx vitest run` — **79 Tests, alle grün**
- `npx vitest run --coverage` — **93% Stmts, 100% Branch, 89% Funcs, 93% Lines**
- `npx next lint` — 0 Errors
- `npx next build` — Build sauber, 36 Routes

## Betroffene Dateien
| Datei | Aktion |
|-------|--------|
| `vitest.config.ts` | Neu |
| `src/lib/__tests__/validations.test.ts` | Neu |
| `src/lib/__tests__/review-router.test.ts` | Neu |
| `src/lib/__tests__/utils.test.ts` | Neu |
| `src/lib/__tests__/themes.test.ts` | Neu |
| `src/lib/__tests__/qr.test.ts` | Neu |
| `package.json` | Geändert – Scripts, pre-push hook, devDeps |
| `package-lock.json` | Geändert |
| `.github/workflows/ci.yml` | Geändert – 4 parallele Jobs |
| `eslint.config.mjs` | Geändert – Test-Overrides |
| `knip.json` | Geändert – ignoreDeps |
| `src/lib/utils.ts` | Geändert – Cleanup |

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Aus PP-013 Research abgeleitet |
| 2026-02-11 | Aktiviert | Branch ticket/PP-015-test-foundation |
| 2026-02-11 | Vitest installiert | v4.0.18 + @vitest/coverage-v8 |
| 2026-02-11 | 79 Unit-Tests geschrieben | 5 Test-Dateien, alle grün |
| 2026-02-11 | Coverage geprüft | 93% Stmts, 100% Branch, 89% Funcs |
| 2026-02-11 | CI erweitert | 4 parallele Jobs (Lint, Unit, E2E, Security) |
| 2026-02-11 | Pre-push Hook | vitest run bei jedem git push |
| 2026-02-11 | Build verifiziert | next build sauber, 0 Lint-Errors |
| 2026-02-11 | Ticket → review | Alle Akzeptanzkriterien erfüllt |
