---
id: PP-020
type: task
title: "Supabase DB Migration – Schema deployen"
status: active
priority: critical
sprint: launch-prep
parent: ""
branch: ticket/PP-020-db-migration
created: 2026-02-11
updated: 2026-02-11
estimate: 2h
actual: ""
tags: [database, supabase, drizzle, migration, deployment]
---

# PP-020: Supabase DB Migration – Schema deployen

## Beschreibung
Das Drizzle-Schema (`src/lib/db/schema.ts`) existiert lokal, ist aber noch nicht gegen die Supabase-Instanz (Frankfurt) deployed. Ohne DB-Migration läuft kein Feature gegen echte Daten.

`npm run db:push` führt `drizzle-kit push` aus und synchronisiert das Schema mit der Supabase-PostgreSQL-DB.

## Voraussetzungen
- Supabase-Projekt existiert (Frankfurt Region)
- `DATABASE_URL` in `.env.local` korrekt konfiguriert
- Drizzle Kit installiert (bereits in devDeps)

## Schritte
- [ ] `DATABASE_URL` in `.env.local` prüfen/setzen
- [ ] `npm run db:push` ausführen
- [ ] Schema in Supabase Dashboard verifizieren (4 Tabellen: practices, surveys, responses, alerts)
- [ ] RLS Policies prüfen (falls in Schema definiert)
- [ ] Testdaten anlegen (optional: Seed-Script)
- [ ] App gegen echte DB starten und Login testen

## Akzeptanzkriterien
- [ ] Alle 4 Tabellen in Supabase sichtbar
- [ ] `created_at` + `updated_at` Columns vorhanden
- [ ] UUIDs als Primary Keys
- [ ] App startet lokal gegen Supabase ohne DB-Fehler
- [ ] Login/Register funktioniert gegen echte Auth

## Risiken
- Schema-Drift: Lokales Schema vs. evtl. manuell erstellte Tabellen in Supabase
- RLS: Policies müssen nach Push separat geprüft werden

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Status → active | Verschoben von backlog |
| 2026-02-11 | Ticket erstellt | Aus CLAUDE.md Priorität #1 |
