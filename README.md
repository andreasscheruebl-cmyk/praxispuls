# PraxisPuls

[![CI](https://github.com/andreasscheruebl-cmyk/praxispuls/actions/workflows/ci.yml/badge.svg)](https://github.com/andreasscheruebl-cmyk/praxispuls/actions/workflows/ci.yml)

**Patientenfeedback sammeln, Google-Bewertungen steigern, QM-Pflicht erfüllen – automatisch.**

SaaS für Zahnarztpraxen: QM-konforme Patientenumfrage + Smart Google-Review-Routing.

## Tech Stack

- **Framework:** Next.js 15 (App Router, RSC, Server Actions, Turbopack)
- **Sprache:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** Supabase Auth (E-Mail + Google SSO)
- **DB:** PostgreSQL (Supabase, Frankfurt)
- **ORM:** Drizzle ORM
- **Payments:** Stripe (Checkout + Portal + Webhooks)
- **E-Mail:** Resend.com
- **QR-Code:** qrcode (npm)
- **Charts:** Recharts
- **Google:** Places API

## Setup

```bash
npm install
cp .env.example .env.local
# Supabase Credentials eintragen
npm run dev
```

## Projektstruktur

```
src/
├── app/
│   ├── (auth)/           # Login, Register
│   ├── (dashboard)/      # Dashboard + Sidebar
│   ├── (marketing)/      # Landing, Legal
│   ├── s/[slug]/         # Public Survey (SSR)
│   └── api/              # API Routes
├── components/
│   ├── ui/               # shadcn/ui
│   ├── survey/           # Survey-Formular
│   └── dashboard/        # Dashboard-Komponenten
├── lib/
│   ├── db/schema.ts      # Drizzle DB Schema
│   ├── db/queries/       # DB Queries
│   ├── supabase/         # Auth Client/Server
│   ├── email.ts          # Resend
│   ├── stripe.ts         # Stripe
│   ├── qr.ts             # QR-Code Gen
│   ├── google.ts         # Places API
│   ├── review-router.ts  # Zufriedenheits-Weiche
│   └── validations.ts    # Zod Schemas
├── actions/              # Server Actions
└── types/
```

## Kern-Feature: Zufriedenheits-Weiche

```
Patient scannt QR-Code → Umfrage (NPS + Kategorien + Freitext)
├── NPS 9-10 (Promoter)  → Google-Review-Link anbieten
├── NPS 7-8  (Passive)   → Danke-Seite
└── NPS 0-6  (Detractor) → Empathie-Seite + E-Mail-Alert
```

## Pricing

| Plan | Preis | Antworten/Monat |
|------|-------|----------------|
| Free | 0 € | 30 |
| Starter | 49 €/Mo | 200 |
| Professional | 99 €/Mo | Unbegrenzt |

## Coding Standards

- TypeScript strict, kein `any`
- Zod für Runtime-Validierung
- Server Components wo möglich
- UI-Texte: Deutsch (Siezen)
- Code + Kommentare: Englisch
- Drizzle ORM für alle DB-Queries
- Supabase Client nur für Auth + Storage
