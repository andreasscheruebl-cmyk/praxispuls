---
id: PP-004
type: bug
title: "Dashboard: Server Components Render-Fehler"
status: done
priority: high
sprint: foundation
branch: ticket/PP-004-dashboard-server-error
created: 2026-02-10
updated: 2026-02-10
---

# PP-004: Dashboard Server Components Render-Fehler

## Fehlerbeschreibung
`/dashboard` zeigt "Ein unerwarteter Fehler ist aufgetreten" (global-error.tsx).
Browser-Konsole: "Error: An error occurred in the Server Components render."
Vercel Logs zeigen 200 – Fehler passiert beim RSC-Streaming.

## Analyse
- **Ist-Zustand:** Dashboard-Seite crashed mit Server Components Render-Fehler in Production.
- **Vercel Logs:** HTTP 200 (Streaming beginnt), dann RSC-Fehler während des Renderings.
- **Ursache identifiziert:** Migration `0003_google_redirect_toggle.sql` (aus PP-001) war nicht auf die Produktions-DB angewendet worden. Drizzle ORM generiert SQL-Queries mit allen Spalten aus dem Schema → PostgreSQL wirft "column google_redirect_enabled does not exist" → Server Components Render-Fehler.
- **Root Cause:** Schema-Drift zwischen Code (hat `googleRedirectEnabled`) und Produktions-DB (fehlt die Spalte).

## Lösungsansatz
Direkte DB-Migration auf Produktions-DB: `ALTER TABLE practices ADD COLUMN IF NOT EXISTS google_redirect_enabled boolean DEFAULT true`. Kein Code-Change nötig — das Schema war korrekt, nur die DB-Migration fehlte.

## Änderungen

### Produktions-DB (manuell)
- SQL ausgeführt: `ALTER TABLE practices ADD COLUMN IF NOT EXISTS google_redirect_enabled boolean DEFAULT true`
- Keine Code-Änderungen nötig

## Betroffene Dateien
- Keine Code-Dateien geändert (reines DB-Operations-Ticket)

## Verifikation
- SQL-Query `SELECT * FROM practices` nach Migration → Spalte vorhanden, Default-Wert korrekt
- Dashboard `/dashboard` geladen → kein Fehler mehr
- User-Bestätigung: Dashboard funktioniert ✅

## Ursache
Migration 0003 (`google_redirect_enabled` Spalte auf `practices`) war nicht auf die Produktions-DB angewendet worden. Drizzle generiert SQL mit allen Schema-Spalten → PostgreSQL wirft "column does not exist" → Server Components Render-Fehler.

## Akzeptanzkriterien
- [x] Fehlerursache identifiziert
- [x] Dashboard lädt ohne Fehler
- [x] Build bleibt sauber

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-10 | Ticket erstellt | Server Components render error in Production |
| 2026-02-10 | Analyse | Vercel Logs geprüft (200 + RSC-Error), DB-Schema vs. Migrations verglichen |
| 2026-02-10 | Ursache | `google_redirect_enabled` Spalte fehlt in Produktions-DB, Schema hat sie aber |
| 2026-02-10 | Fix | `ALTER TABLE practices ADD COLUMN IF NOT EXISTS google_redirect_enabled boolean DEFAULT true` auf Prod-DB |
| 2026-02-10 | Verifiziert | `SELECT * FROM practices` — Spalte vorhanden ✅, Dashboard lädt ✅ |
| 2026-02-10 | Done | User bestätigt: Dashboard funktioniert ✅ |
