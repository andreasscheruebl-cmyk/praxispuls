---
name: db-migrate
description: Drizzle ORM DB-Workflow — Schema generieren, pushen, Studio öffnen, Status prüfen.
argument-hint: "<generate|push|studio|status>"
disable-model-invocation: true
---

Führe den Drizzle DB-Workflow aus basierend auf dem Argument `$ARGUMENTS`:

## Befehle

### `generate`
1. Führe aus: `npx drizzle-kit generate`
2. Zeige die generierten SQL-Dateien in `drizzle/`
3. Hinweis: Bei ambigen Schema-Änderungen (rename vs. create) wird drizzle-kit interaktiv — ggf. `--custom` verwenden und SQL manuell schreiben

### `push`
1. Warnung: `push` ist destruktiv — Daten können verloren gehen!
2. Frage nach Bestätigung bevor du fortfährst
3. Führe aus: `npm run db:push`
4. Zeige Ergebnis

### `studio`
1. Führe aus: `node node_modules/drizzle-kit/bin.cjs studio` (im Hintergrund)
2. Hinweis: Drizzle Studio läuft auf Port 4983

### `status`
1. Zeige aktuelle Schema-Datei: `src/lib/db/schema.ts`
2. Liste Migrations in `drizzle/` auf
3. Zeige die Anzahl der Tabellen im Schema

## Regeln
- Alle Schema-Änderungen NUR in `src/lib/db/schema.ts`
- UUIDs als Primary Keys
- `created_at` + `updated_at` auf allen Tabellen
- Kein Raw SQL — alles über Drizzle ORM
- `drizzle/meta/` Snapshots sind gitignored — nur SQL committed
