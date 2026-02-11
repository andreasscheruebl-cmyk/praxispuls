---
id: PP-027
type: bug
title: "Vercel Build Warnings – Sentry Auth Token + Telemetrie"
status: review
priority: high
sprint: launch-prep
parent: PP-022
branch: ticket/PP-027-build-warnings
created: 2026-02-11
updated: 2026-02-11
estimate: 1h
actual: 0.25h
tags: [sentry, build, vercel, telemetry, dx]
---

# PP-027: Vercel Build Warnings – Sentry Auth Token + Telemetrie

## Beschreibung
Vercel-Build zeigte 4 Warnings von `@sentry/nextjs`:
- 2x "No auth token provided" (release + source maps)
- 2x "Sending telemetry data" (Node.js + Edge)
- Plus `clientTraceMetadata` Experiment-Warning

## Analyse

**Root Cause:** `withSentryConfig()` in `next.config.ts` wurde **immer** aufgerufen, auch wenn kein `SENTRY_AUTH_TOKEN` gesetzt ist. Das Build-Plugin versucht dann Release zu erstellen + Source Maps hochzuladen und warnt wenn kein Token da ist.

## Lösung

`next.config.ts` geändert:
1. **Conditional wrapping:** `withSentryConfig` nur wenn `SENTRY_AUTH_TOKEN` vorhanden
2. **`telemetry: false`** in den Build-Options
3. Ohne Token: reines `nextConfig` exportiert → keine Warnings, kein `clientTraceMetadata` Experiment

Sentry.init() in `sentry.server.config.ts` / `sentry.edge.config.ts` läuft weiterhin über DSN (unabhängig vom Build-Plugin).

## Akzeptanzkriterien

### Sentry Warnings (MUST)
- [x] Keine "No auth token" Warnings mehr im Build-Log
- [x] Source Maps werden hochgeladen wenn `SENTRY_AUTH_TOKEN` gesetzt (conditional)

### Telemetrie (MUST)
- [x] Sentry-Telemetrie deaktiviert (`telemetry: false`)

### Experiment Warning (SHOULD)
- [x] `clientTraceMetadata` Experiment nur aktiv wenn Sentry-Build-Plugin aktiv (mit Token)

### Sauberer Build (MUST)
- [x] Build zeigt keine Sentry-Warnings mehr

## Betroffene Dateien
| Datei | Änderung |
|-------|----------|
| `next.config.ts` | `withSentryConfig` conditional + `telemetry: false` |

## Verifikation
- `npm run test` → 79/79 passed ✅
- `npm run typecheck` → passed ✅
- `npx next lint` → 0 errors ✅
- `npm run build` → sauber, keine Sentry-Warnings ✅
- Geprüft mit: `grep -i "No auth token\|telemetry data\|clientTraceMetadata"` → nichts gefunden ✅

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Vercel Build Warnings aus Andi-Report |
| 2026-02-11 | Status → active | Branch `ticket/PP-027-build-warnings` |
| 2026-02-11 | Fix implementiert | `next.config.ts` – conditional withSentryConfig + telemetry: false |
| 2026-02-11 | Verifikation | Tests 79/79 ✅, TypeScript ✅, Lint 0 errors ✅, Build sauber ✅ |
| 2026-02-11 | Status → review | Alle Warnings eliminiert, bereit für Andis Review |
