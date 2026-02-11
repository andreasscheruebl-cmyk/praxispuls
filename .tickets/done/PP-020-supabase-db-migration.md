---
id: PP-020
type: task
title: "Supabase DB Migration – Schema deployen"
status: done
priority: critical
sprint: launch-prep
parent: ""
branch: ticket/PP-020-db-migration
created: 2026-02-11
updated: 2026-02-11
estimate: 2h
actual: 0.5h
tags: [database, supabase, drizzle, migration, deployment]
---

# PP-020: Supabase DB Migration – Schema deployen

## Beschreibung
Das Drizzle-Schema (`src/lib/db/schema.ts`) existiert lokal, ist aber noch nicht gegen die Supabase-Instanz (Frankfurt) deployed. Ohne DB-Migration läuft kein Feature gegen echte Daten.

`npm run db:push` führt `drizzle-kit push` aus und synchronisiert das Schema mit der Supabase-PostgreSQL-DB.

## Analyse

Schema-Introspection via `scripts/check-db.mjs` hat ergeben, dass die DB bereits **vollständig aufgesetzt** ist. `db:push` war nicht nötig.

### DB-Ist-Zustand (verifiziert 2026-02-11)

| Objekt | Anzahl | Details |
|--------|--------|---------|
| Tabellen | 6 | practices, surveys, responses, alerts, login_events, audit_events |
| Columns | 42 | Alle laut schema.ts vorhanden |
| Indexes | 17 | 8 custom + PKs + Uniques |
| Foreign Keys | 7 | Alle Relationen korrekt |
| RLS Policies | 12 | select_own, insert_own, update_own etc. |

### Schema-Vergleich schema.ts ↔ Supabase

- **Tabellen:** 6/6 ✅ (inkl. login_events + audit_events, die im Ticket noch nicht bekannt waren)
- **Columns:** Alle Spalten, Typen, Defaults stimmen überein ✅
- **UUIDs:** `gen_random_uuid()` als Default auf allen PKs ✅
- **Timestamps:** `created_at` + `updated_at` mit `now()` Default ✅
- **Soft Delete:** `deleted_at` auf practices, surveys, responses ✅ (responses hat kein deleted_at – korrekt laut Schema)
- **RLS:** 12 Policies aktiv – Row Level Security ist konfiguriert ✅

## Voraussetzungen
- Supabase-Projekt existiert (Frankfurt Region) ✅
- `DATABASE_URL` in `.env.local` korrekt konfiguriert ✅ (Pooler, Port 6543)
- Drizzle Kit installiert (bereits in devDeps) ✅

## Schritte
- [x] `DATABASE_URL` in `.env.local` prüfen/setzen
- [x] ~~`npm run db:push` ausführen~~ → nicht nötig, Schema bereits deployed
- [x] Schema in Supabase verifizieren (6 Tabellen, 42 Columns, 17 Indexes, 7 FKs)
- [x] RLS Policies prüfen → 12 Policies aktiv
- [x] App gegen echte DB starten und Login testen

## Akzeptanzkriterien
- [x] Alle 6 Tabellen in Supabase sichtbar
- [x] `created_at` + `updated_at` Columns vorhanden
- [x] UUIDs als Primary Keys
- [x] App startet lokal gegen Supabase ohne DB-Fehler
- [x] Login/Register funktioniert gegen echte Auth

## Risiken
- ~~Schema-Drift~~ → Kein Drift, Schema stimmt überein
- ~~RLS~~ → Policies sind bereits konfiguriert

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Aus CLAUDE.md Priorität #1 |
| 2026-02-11 | Status → active | Verschoben von backlog |
| 2026-02-11 | DB Introspection | 6 Tabellen, 42 Columns, 17 Indexes, 7 FKs, 12 RLS Policies – alles bereits deployed |
| 2026-02-11 | Status → review | Schema-Deployment nicht nötig, DB komplett. Offene Punkte: manueller App-Test durch Andi |
| 2026-02-11 | Status → done | Andi bestätigt: App läuft gegen Supabase, Login/Register funktioniert |
