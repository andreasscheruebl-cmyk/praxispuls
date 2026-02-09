# CLAUDE.md – Anweisungen für Claude Code

## Projekt: PraxisPuls
SaaS für Zahnarztpraxen: Patientenumfrage + Google-Review-Routing + QM-Dashboard.

## Entwickler
Andi – Solo-Dev, Bayern. Arbeitet Abende/Wochenenden. Pragmatische Lösungen bevorzugt.

## Kommunikation
- **Mit Andi:** Deutsch
- **Code + Kommentare:** Englisch
- **UI-Texte:** Deutsch, Siezen ("Sie")

## Tech Stack
- Next.js 15 (App Router, RSC, Server Actions, Turbopack)
- TypeScript strict mode
- Tailwind CSS + shadcn/ui
- Supabase (Auth + DB + Storage) – Frankfurt Region
- Drizzle ORM (DB Queries) + Drizzle Kit (Migrations)
- Stripe (Payments)
- Resend (E-Mail)
- Recharts (Charts)
- zod (Validation)
- qrcode (QR generation)

## Coding Rules

### TypeScript
- `"strict": true` – kein `any`, verwende `unknown` + Type Guards
- Zod für alle Runtime-Validierungen
- Keine Barrel Exports

### Datenbank
- Alle Queries über Drizzle ORM (kein Raw SQL)
- Supabase Client NUR für Auth und Storage
- UUIDs als Primary Keys
- `created_at` + `updated_at` auf allen Tabellen
- Schema: `src/lib/db/schema.ts`

### Frontend
- Server Components wo möglich
- `"use client"` nur wenn interaktiv nötig
- shadcn/ui als Basis-Komponenten
- Mobile-first (Survey wird zu 95% auf Smartphones ausgefüllt)
- WCAG 2.1 AA (große Touch-Targets, Kontrast)

### API
- Server Actions für Dashboard-Mutations
- API Routes für Public Endpoints + Webhooks
- Zod für Request-Validierung
- Error-Format: `{ error: string, code: string }`

### Git
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`

## MVP Scope – Was NICHT gebaut wird
- ❌ PVS-Integration
- ❌ SMS/WhatsApp
- ❌ KI-Sentiment-Analyse
- ❌ Multi-Standort
- ❌ QM-PDF-Reports
- ❌ Tablet Kiosk-Modus
- ❌ Jameda/Doctolib
- ❌ Mehrsprachigkeit (nur Deutsch)
- ❌ Mobile App

Wenn Andi eines davon anfragt: "⚠️ Das ist v2. Soll ich es trotzdem machen?"

## Warnungen – Proaktiv ansprechen bei:
- **Feature Creep:** Nicht im MVP-Scope → v2
- **Wartbarkeit:** Zu komplex für Solo-Dev → einfachere Alternative vorschlagen
- **DSGVO:** Datenschutz-Risiko erkennen und warnen
- **Performance:** Survey muss < 2s laden (mobil)
- **Kosten:** API-Kosten abschätzen bei externen Services

## Aktuelle Prioritäten
1. Build-Fehler fixen, `npm run dev` muss sauber laufen
2. Git initialisieren
3. Supabase DB aufsetzen (Migration)
4. Alle Features E2E testen
5. Fehlende Features: Billing-Seite, Stripe Webhook, NPS-Chart

## Projektstruktur
Siehe README.md für die vollständige Struktur.

## DB Schema
Siehe `src/lib/db/schema.ts` – 4 Tabellen:
- practices (Tenants)
- surveys (Umfragen)
- responses (Antworten, kein PII!)
- alerts (Detractor-Notifications)

## Environment Variables
Siehe `.env.example` für alle benötigten Variablen.
