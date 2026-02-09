# PraxisPuls – MVP Scope (Final, Merged)
## Patientenumfrage + Review-Management SaaS für Zahnarztpraxen

**Version:** 1.0 (Final MVP Scope)  
**Stand:** Februar 2026  
**Ziel:** Erste zahlende Kunden in 12 Wochen  
**Entwickler:** 1 Person (Vibe Coding mit AI)  
**Projektname:** PraxisPuls (ehem. DentReview)  
**Quellen:** Zusammenführung aus `mvp-scope-dentreview.md` + `praxispuls-mvp-scope.md`

---

## 1. Produkt-Vision

### One-Liner

> **„Patientenfeedback sammeln, Google-Bewertungen steigern, QM-Pflicht erfüllen – in 5 Minuten eingerichtet, für 49 €/Monat."**

### Problem
Zahnarztpraxen müssen Patientenbefragungen durchführen (QM-Pflicht nach G-BA), tun es aber auf Papier oder gar nicht. Gleichzeitig wollen sie bessere Google-Bewertungen, wissen aber nicht wie. Beides passiert getrennt, manuell, und ineffizient.

### Lösung
Ein Tool, das beides in einem automatisierten Flow verbindet:
1. Patient füllt kurze Umfrage aus (QR-Code, 60 Sekunden)
2. Zufriedene Patienten werden automatisch zu Google weitergeleitet
3. Unzufriedene werden intern aufgefangen + Praxis wird alarmiert
4. QM-Dashboard + Reports entstehen automatisch

### Kern-Mechanik: Die Zufriedenheits-Weiche
```
Patient scannt QR-Code → Umfrage (NPS + Kategorien + Freitext)
  ├── NPS 9-10 (Promoter)  → Google-Review-Deeplink anbieten
  ├── NPS 7-8  (Passive)   → Danke-Seite (kein Google-Prompt)
  └── NPS 0-6  (Detractor) → Empathie-Seite + E-Mail-Alert an Praxis
```

---

## 2. MVP-Philosophie

### Was der MVP MUSS:
- Praxis registriert sich und hat in **5 Minuten** eine Umfrage live
- Patienten füllen eine Umfrage in **60 Sekunden** auf dem Smartphone aus
- Zufriedene Patienten werden **automatisch** auf Google weitergeleitet
- Praxis sieht ein **einfaches Dashboard** mit den wichtigsten Kennzahlen
- Funktioniert auf **Deutsch**, ist **DSGVO-konform** und sieht **professionell** aus

### Was der MVP NICHT muss:
- ❌ PVS-Integration (zu komplex, jedes PVS hat eigene API)
- ❌ SMS/WhatsApp-Versand (regulatorische Hürden, Kosten)
- ❌ KI-Sentiment-Analyse (kommt in v2)
- ❌ Multi-Standort / MVZ-Dashboard
- ❌ QM-PDF-Reports (kommt in v2)
- ❌ Tablet Kiosk-Modus
- ❌ Jameda/Doctolib-Integration
- ❌ Benchmark / Vergleichsdaten
- ❌ Mobile App (Web reicht)
- ❌ Mitarbeiterbefragung
- ❌ Mehrsprachigkeit (nur Deutsch im MVP, Englisch in v2)

---

## 3. Feature-Scope (MVP)

### 3.1 Patienten-Umfrage (Core)

#### Umfrage-Flow
```
1. Patient scannt QR-Code (Wartezimmer / Rezeption / Behandlungszimmer)
2. Mobile-optimierte Web-Umfrage öffnet sich (kein App-Download!)
3. Seite 1: NPS-Frage
   „Wie wahrscheinlich ist es, dass Sie unsere Praxis weiterempfehlen?"
   [0] [1] [2] [3] [4] [5] [6] [7] [8] [9] [10]
4. Seite 2: Kategorie-Bewertung (je 1-5 Sterne)
   - Wartezeit ★★★★★
   - Freundlichkeit ★★★★★
   - Behandlungsqualität ★★★★★
   - Praxisausstattung ★★★★★
5. Seite 3: Freitext (optional)
   „Möchten Sie uns noch etwas mitteilen?"
6. Danke-Screen → Routing je nach NPS (siehe Zufriedenheits-Weiche)

Dauer: 60-90 Sekunden
```

#### Technische Anforderungen
| Anforderung | Details |
|-------------|---------|
| Kein Login für Patienten | Direkt über QR-Code/Link aufrufbar |
| Mobile-first | Optimiert für Smartphone-Ausfüllung, große Buttons, klarer Kontrast |
| Anonym | Kein Name, keine E-Mail, keine IP-Speicherung |
| Deduplizierung | Session-Cookie verhindert doppelte Antworten (24h) |
| Performance | Umfrage lädt in **< 2 Sekunden** auf mobilem Netz |
| Barrierearm | WCAG 2.1 AA: große Touch-Targets, Kontrast, Screenreader |

#### Fragebogen-Templates (vorkonfiguriert)
1. **Zahnarzt Standard** – NPS + 4 Kategorien + Freitext (empfohlen)
2. **Zahnarzt Kurz** – Nur NPS + Freitext (30 Sekunden)
3. **Zahnarzt Prophylaxe** – NPS + PZR-spezifische Fragen

### 3.2 Smart Review Routing (Killer-Feature)

```
Smart Routing Logic:

  NPS 9-10 (Promoter):
    → Danke-Screen:
      „Toll! Würden Sie Ihre Erfahrung auch auf Google teilen?"
      [Button: „Ja, gerne! ⭐"] → Google Review Deeplink
      [Button: „Nein, danke"] → Danke + Ende
    → Tracking: Klick auf Google-Button wird gezählt

  NPS 7-8 (Passive):
    → Danke-Screen:
      „Vielen Dank für Ihr Feedback!"
      → Kein Google-Prompt (zu riskant)

  NPS 0-6 (Detractor):
    → Empathie-Screen:
      „Danke für Ihre Ehrlichkeit. Wir nehmen Ihr Feedback ernst
       und arbeiten daran, besser zu werden."
    → E-Mail-Alert an Praxisinhaber:
      „⚠️ Kritisches Feedback: NPS [Score] – [Freitext-Auszug]"
    → KEIN Google-Link!
```

**Google-Integration:**
- Praxis gibt bei Setup ihre Google Place ID ein (mit Suchfunktion)
- System generiert Google-Review-Deeplink:
  `https://search.google.com/local/writereview?placeid={PLACE_ID}`
- Conversion-Tracking: Survey → Promoter → Google-Klick → (geschätzt) Review

### 3.3 Praxis-Dashboard (Web App)

**Seiten im Dashboard:**

| Seite | Inhalte |
|-------|---------|
| **Übersicht** | NPS-Score + Trend-Chart, Antworten/Woche, Kategorie-Scores (Ø Sterne), Google-Review-Funnel, letzte Freitexte, ungelesene Alerts |
| **Antworten** | Chronologische Liste aller Umfrageantworten, filterbar nach Zeitraum (7/30/90 Tage, benutzerdefiniert) und NPS-Kategorie |
| **QR-Codes** | QR-Code generieren + Download als: A4 Poster (Wartezimmer), A6 Aufsteller (Rezeption), Visitenkarten-Größe, PNG/SVG (Website, Social Media) |
| **Einstellungen** | Praxisdaten, Logo + Farben, Google Place ID, Alert-E-Mail, Template-Wahl, NPS-Schwellenwert konfigurieren |
| **Billing** | Stripe Customer Portal (Abo verwalten, Rechnungen) |

### 3.4 Onboarding & Setup

```
Registrierungs-Flow (Ziel: < 5 Minuten):

  1. Registrierung (E-Mail + Passwort, oder Google SSO)
  2. Praxisname + PLZ eingeben
  3. Google-Praxis suchen (Autocomplete via Places API)
     → Place ID wird automatisch ermittelt
  4. Logo hochladen (optional, Fallback: neutrales Design)
  5. Farben wählen (optional, Fallback: PraxisPuls-Standard)
  6. Umfrage-Template wählen (Standard / Kurz / Prophylaxe)
  7. Vorschau der Umfrage anzeigen
  8. QR-Code wird generiert → Download + Druckvorlage
  9. Dashboard → „Warten auf erste Antworten" State

Dauer: ~5-10 Minuten
```

### 3.5 Alerts & Benachrichtigungen

| Trigger | Aktion |
|---------|--------|
| NPS ≤ 5 (Detractor) | E-Mail-Alert mit Score + Freitext an Praxisinhaber |
| Erste 10 Antworten erreicht | Gratulations-E-Mail + Dashboard-Hinweis |
| Free-Limit erreicht (30/Monat) | Upgrade-Hinweis per E-Mail + Dashboard-Banner |

---

## 4. User Flows (MVP)

### Flow 1: Praxis-Onboarding
Siehe 3.4 oben. Kernmetriken: < 5 Minuten, maximal 8 Schritte, kein Schritt mit mehr als 2 Eingabefeldern.

### Flow 2: Patient füllt Umfrage aus
Siehe 3.1 oben. Kernmetriken: < 60 Sekunden, < 2s Ladezeit, 0 Eingabefelder (nur Taps/Klicks bis auf optionalen Freitext).

### Flow 3: Praxis schaut Dashboard an
```
1. Login → Dashboard Übersicht
2. Auf einen Blick:
   - NPS Score: 72 (→ +5 vs. letzter Monat)
   - Antworten diese Woche: 23
   - Google-Review-Klicks: 8 (35% Conversion)
   - 1 Alert: „Kritisches Feedback eingegangen"
3. Detail-Ansichten:
   - Kategorie-Scores im Zeitverlauf
   - Freitext-Antworten (neueste zuerst)
   - Review-Funnel: 23 Surveys → 14 Promoter → 8 Klicks → ? Reviews
4. Alert anklicken:
   - Detractor-Feedback lesen
   - Optional: Notiz hinterlegen („Wartezeit lang wegen Notfall")
   - Als gelesen markieren
```

---

## 5. Technische Architektur (MVP)

### 5.1 Tech-Stack (Stand: 2026)

```
Frontend + Backend:
  ├── Framework:            Next.js 16 (App Router, RSC, Server Actions, Cache Components, Turbopack)
  ├── Sprache:              TypeScript (strict mode)
  ├── Styling:              Tailwind CSS 4 + shadcn/ui
  ├── Forms:                react-hook-form + zod
  ├── Charts:               Recharts
  ├── QR-Code:              qrcode (npm, serverseitig)
  └── Survey:               In Next.js integriert (kein separates Preact)
                            → Server-side gerendert, minimaler JS-Hydration

Auth:
  └── Supabase Auth           → E-Mail/Passwort + Google SSO, 50k MAU free, RLS-integriert

Datenbank:
  ├── Haupt-DB:             PostgreSQL (Supabase, Frankfurt Region)
  ├── ORM:                  Drizzle ORM + Drizzle Kit (Migrations)
  ├── RLS:                  Row Level Security nativ in Supabase (Multi-Tenant-Schutz)
  └── Kein separater Cache nötig im MVP (DB-Queries reichen)

Externe Dienste:
  ├── Payments:             Stripe (Checkout + Customer Portal + Webhooks)
  ├── E-Mail:               Resend.com (Transactional, gratis bis 100/Tag)
  ├── Google:               Places API (Autocomplete, Place Details, Review-Link)
  └── KI (v2):              Claude API (Sentiment-Analyse, Report-Generierung)

Hosting:
  ├── App:                  Vercel (Frontend + API Routes)
  ├── DB + Auth + Storage:  Supabase (Frankfurt Region, HIPAA-compliant)
  └── File Storage:         Supabase Storage (Logos, QR-PDFs)

Monitoring:
  ├── Error Tracking:       Sentry
  ├── Analytics:            Plausible (DSGVO-konform, kein Cookie-Banner nötig)
  └── Uptime:               BetterStack (optional)
```

#### Tech-Stack-Entscheidungen (2026)

| Entscheidung | Begründung |
|-------------|------------|
| **Next.js 16 statt separatem Frontend/Backend** | Solo-Dev: ein Projekt statt zwei. Server Actions + API Routes reichen für MVP. Turbopack als Default-Bundler = schnellere Dev-Experience. Cache Components für optimale Performance. |
| **Survey in Next.js integriert (kein separates Preact)** | Next.js 16 mit RSC + Cache Components rendert Survey-Seiten serverseitig mit minimalem JS. Performance-Ziel (< 2s) erreichbar ohne separates Framework. Weniger Komplexität. |
| **Supabase statt Neon + Auth.js + Vercel Blob** | Ein integrierter Service (DB + Auth + Storage + RLS) statt drei separate. Weniger Konfiguration für Solo-Dev. HIPAA-compliant = Vertrauens-Signal für Praxen. 50k MAU Auth free. RLS nativ für Multi-Tenant-Sicherheit. |
| **Drizzle ORM statt Supabase Client** | Type-safe Queries, Migrations via Drizzle Kit. Supabase Client nur für Auth + Storage. Kein Vendor-Lock-in auf DB-Ebene. |
| **Kein Redis/Cache im MVP** | Bei < 100 Praxen sind DB-Queries schnell genug. Rate Limiting über Next.js proxy.ts. |
| **Kein Queue-System im MVP** | Alert-E-Mails werden direkt nach Response-Submit via Resend gesendet. Bei Scale: Inngest hinzufügen. |
| **Plausible statt Vercel Analytics** | DSGVO-konform ohne Cookie-Banner. Kein Google Analytics. |

### 5.2 Datenmodell (MVP)

```sql
-- Praxen (Tenants)
CREATE TABLE practices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,              -- für Survey-URL: praxispuls.de/s/{slug}
    email TEXT NOT NULL UNIQUE,
    google_place_id TEXT,
    google_review_url TEXT,                 -- vorberechneter Review-Link
    postal_code TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#2563EB',
    plan TEXT DEFAULT 'free',               -- free / starter / professional
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    alert_email TEXT,                       -- E-Mail für Detractor-Alerts
    survey_template TEXT DEFAULT 'zahnarzt_standard',
    nps_threshold SMALLINT DEFAULT 9,       -- Ab welchem Score → Google (konfigurierbar)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Umfragen
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Patientenbefragung',
    questions JSONB NOT NULL,               -- Fragen-Schema (Template-basiert)
    is_active BOOLEAN DEFAULT TRUE,
    slug TEXT UNIQUE NOT NULL,              -- für URL: /s/{slug}
    config JSONB DEFAULT '{}',              -- Zusätzliche Konfiguration
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Antworten (KEIN PII!)
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
    nps_score SMALLINT NOT NULL CHECK (nps_score BETWEEN 0 AND 10),
    nps_category TEXT NOT NULL,             -- 'promoter' / 'passive' / 'detractor'
    rating_wait_time SMALLINT CHECK (rating_wait_time BETWEEN 1 AND 5),
    rating_friendliness SMALLINT CHECK (rating_friendliness BETWEEN 1 AND 5),
    rating_treatment SMALLINT CHECK (rating_treatment BETWEEN 1 AND 5),
    rating_facility SMALLINT CHECK (rating_facility BETWEEN 1 AND 5),
    free_text TEXT,
    language TEXT DEFAULT 'de',
    channel TEXT DEFAULT 'qr',              -- qr / link / email / tablet (Zukunft)
    routed_to TEXT,                         -- 'google' / 'internal' / NULL
    google_review_shown BOOLEAN DEFAULT FALSE,
    google_review_clicked BOOLEAN DEFAULT FALSE,
    device_type TEXT,                       -- mobile / tablet / desktop
    session_hash TEXT,                      -- SHA-256 für Deduplizierung (kein PII!)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts (Detractor-Notifications)
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
    response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'detractor',
    is_read BOOLEAN DEFAULT FALSE,
    note TEXT,                              -- Praxis-Notiz zum Feedback
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_responses_practice ON responses(practice_id, created_at DESC);
CREATE INDEX idx_responses_nps ON responses(practice_id, nps_category);
CREATE INDEX idx_responses_session ON responses(session_hash);
CREATE INDEX idx_alerts_unread ON alerts(practice_id, is_read) WHERE NOT is_read;
CREATE INDEX idx_practices_slug ON practices(slug);
CREATE INDEX idx_surveys_slug ON surveys(slug);

-- Row Level Security (Supabase)
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Praxis-Inhaber sieht nur eigene Daten
CREATE POLICY "practices_own" ON practices
    FOR ALL USING (id = auth.jwt() ->> 'practice_id');

CREATE POLICY "surveys_own_practice" ON surveys
    FOR ALL USING (practice_id = auth.jwt() ->> 'practice_id');

CREATE POLICY "responses_own_practice" ON responses
    FOR SELECT USING (practice_id = auth.jwt() ->> 'practice_id');

-- Public: Patienten können Responses einfügen (ohne Auth)
CREATE POLICY "responses_public_insert" ON responses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "alerts_own_practice" ON alerts
    FOR ALL USING (practice_id = auth.jwt() ->> 'practice_id');
```

### 5.3 API Endpoints (MVP)

```
Auth (Supabase):
  POST   /api/auth/callback                 → Supabase Auth Callback
  POST   /api/auth/confirm                  → E-Mail-Bestätigung

Practice Setup:
  GET    /api/practice                      → eigene Praxis laden
  PUT    /api/practice                      → Praxis updaten
  POST   /api/practice/logo                 → Logo hochladen
  GET    /api/practice/qr-code              → QR-Code generieren/downloaden
  GET    /api/google/places/search?q=       → Google Places Autocomplete

Survey (Server Actions bevorzugt):
  GET    /api/surveys                       → alle Surveys der Praxis
  POST   /api/surveys                       → neuen Survey erstellen
  PUT    /api/surveys/:id                   → Survey bearbeiten

Public (kein Auth):
  GET    /s/[slug]                          → Survey-Seite (SSR)
  POST   /api/public/responses              → Antwort einreichen
  POST   /api/public/track-click            → Google-Review-Klick tracken

Dashboard (Server Actions bevorzugt):
  GET    /api/dashboard/overview            → NPS, Counts, Trends
  GET    /api/dashboard/responses           → Antworten-Liste (paginiert)
  GET    /api/dashboard/categories          → Kategorie-Scores
  GET    /api/dashboard/review-funnel       → Conversion-Daten

Alerts:
  GET    /api/alerts                        → ungelesene Alerts
  PUT    /api/alerts/:id/read               → als gelesen markieren
  PUT    /api/alerts/:id/note               → Notiz hinzufügen

Billing:
  POST   /api/billing/checkout              → Stripe Checkout Session
  POST   /api/billing/portal                → Stripe Customer Portal
  POST   /api/webhooks/stripe               → Stripe Webhook
```

### 5.4 Next.js Routes

```
/                               Landing Page
/login                          Login
/register                       Registrierung
/onboarding                     Setup-Wizard (nach Registrierung)

/dashboard                      Hauptübersicht (geschützt)
/dashboard/responses            Alle Antworten (filterbar)
/dashboard/qr-codes             QR-Code Generator + Download
/dashboard/settings             Einstellungen
/dashboard/billing              Stripe Portal

/s/[slug]                       Patienten-Umfrage (PUBLIC, SSR)
/s/[slug]/danke                 Danke-Screen (mit/ohne Google-Link)

/api/auth/callback              Supabase Auth Callback
/api/auth/confirm               E-Mail-Bestätigung
/api/public/responses           Submit Response (Public)
/api/webhooks/stripe            Stripe Webhooks

/impressum                      Legal
/datenschutz                    Legal
/agb                            Legal
```

### 5.5 Projektstruktur

```
praxispuls/
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Login, Register
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/            # Dashboard mit Sidebar Layout
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx        # Übersicht
│   │   │   │   ├── responses/
│   │   │   │   ├── qr-codes/
│   │   │   │   ├── settings/
│   │   │   │   └── billing/
│   │   │   └── onboarding/
│   │   ├── (marketing)/            # Landing, Legal
│   │   │   ├── page.tsx            # Landing Page
│   │   │   ├── impressum/
│   │   │   ├── datenschutz/
│   │   │   └── agb/
│   │   ├── s/[slug]/               # Public Survey (SSR)
│   │   │   ├── page.tsx
│   │   │   └── danke/page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── callback/route.ts
│   │       │   └── confirm/route.ts
│   │       ├── public/
│   │       ├── practice/
│   │       ├── dashboard/
│   │       ├── alerts/
│   │       ├── billing/
│   │       └── webhooks/
│   ├── components/
│   │   ├── ui/                     # shadcn/ui Basis
│   │   ├── dashboard/              # Dashboard-spezifisch
│   │   ├── survey/                 # Survey-Formular
│   │   ├── marketing/              # Landing Page Sektionen
│   │   └── shared/                 # Shared (Logo, Footer, etc.)
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts           # Drizzle Schema
│   │   │   ├── index.ts            # DB Connection (Supabase Postgres)
│   │   │   └── queries/            # Wiederverwendbare Queries
│   │   ├── auth.ts                 # Supabase Auth Helpers
│   │   ├── supabase/
│   │   │   ├── client.ts           # Supabase Browser Client
│   │   │   ├── server.ts           # Supabase Server Client
│   │   │   └── middleware.ts       # Supabase Auth Middleware (für proxy.ts)
│   │   ├── stripe.ts               # Stripe Helpers
│   │   ├── email.ts                # Resend E-Mail-Versand
│   │   ├── google.ts               # Google Places API
│   │   ├── qr.ts                   # QR-Code Generierung
│   │   ├── review-router.ts        # NPS → Routing-Logik
│   │   ├── validations.ts          # Zod Schemas (shared)
│   │   └── utils.ts                # Utility Functions
│   ├── types/
│   │   └── index.ts
│   └── proxy.ts                # Auth + Rate Limiting (ersetzt middleware.ts in Next.js 16)
├── public/
│   ├── fonts/
│   └── images/
├── drizzle/                        # Migration Files
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.local
└── package.json
```

---

## 6. Pricing

| Feature | Free | Starter (49 €/Monat) | Professional (99 €/Monat) |
|---------|------|---------------------|--------------------------|
| Antworten/Monat | 30 | 200 | Unbegrenzt |
| Survey-Templates | 1 (Standard) | Alle 3 | Alle + anpassbar |
| Google Review Routing | ✅ | ✅ | ✅ |
| QR-Code Download | ✅ | ✅ | ✅ |
| Dashboard (NPS, Kategorien) | ✅ (Basis) | ✅ (Vollständig) | ✅ (Vollständig) |
| Detractor Alerts (E-Mail) | ❌ | ✅ | ✅ |
| Zeitraum-Filter | Letzte 30 Tage | Frei wählbar | Frei wählbar |
| Praxis-Branding (Logo/Farben) | ❌ | ✅ | ✅ |
| QM-Report PDF | ❌ | ❌ (v2: 1/Quartal) | ❌ (v2: monatlich) |
| KI-Analyse | ❌ | ❌ | ❌ (v2) |
| Support | Community | E-Mail | E-Mail + Priorität |

**Entscheidung:** Review-Routing bleibt in ALLEN Plänen (auch Free) – das ist der Hook. Monetarisierung über Alerts, Branding, und Antwort-Limits.

**Preislogik:** 49 €/Monat < Kosten einer Prophylaxe-Behandlung. ROI-Argument: 1 zusätzlicher Patient durch bessere Google-Bewertung = 500-3.000 € Lifetime Value.

---

## 7. Zielgruppen-Persona

**Dr. Sarah Müller**, 42, Inhaberin einer Zahnarztpraxis in München-Schwabing.
- 6 Mitarbeiter, 2 Behandlungsräume
- 3,9 Sterne auf Google (38 Bewertungen) – will mehr Privatpatienten
- Hat keine Zeit für Marketing – ZFA kümmert sich um „alles Digitale"
- Budget für neue Tools: max. 100 €/Monat
- Entscheidungskriterien: Einfachheit, schneller Nutzen, keine Einarbeitungszeit
- Typischer Satz: *„Ich hab 10 Minuten zwischen zwei Patienten. Zeig mir, ob's funktioniert."*

**Warum diese Persona zählt:** Wenn es für Dr. Müller funktioniert (wenig Zeit, nicht technikaffin, preissensibel), funktioniert es für alle Einzelpraxen.

---

## 8. Timeline (12 Wochen)

| Woche | Sprint | Fokus | Deliverables |
|-------|--------|-------|-------------|
| **1-2** | Foundation | Projekt-Setup | Next.js 16, Drizzle + Supabase DB, Supabase Auth, Tailwind + shadcn/ui, CI/CD (Vercel), Datenmodell + Migrations + RLS Policies, Layout-Shell (Dashboard Sidebar), Landing Page (einfach) |
| **3-4** | Survey Engine | Kern-Feature | Survey-Schema + 3 Templates (JSONB), Patienten-Umfrage Seite (SSR, mobile-first), Submit-Endpoint + Response-Speicherung, Smart Review Routing (NPS → Google / Internal), Danke-Screens (3 Varianten), Google Places API Integration |
| **5-6** | Dashboard | Auswertung | NPS-Übersicht + Trend-Chart (Recharts), Kategorie-Scores (Ø Sterne), Response-Liste (paginiert, filterbar), Review-Funnel Metriken, Detractor-Alert-System (E-Mail via Resend) |
| **7-8** | QR & Onboarding | Onboarding | QR-Code Generator (4 Formate), Druckvorlagen (PDF), Google Place ID Lookup + Autocomplete, Onboarding-Wizard (8 Schritte), Praxis-Branding (Logo, Farben) |
| **9-10** | Payments & Polish | Monetarisierung | Stripe Integration (Checkout, Portal, Webhooks), Plan-Logik + Limits (Free: 30, Starter: 200), Upgrade-Flow + Banner bei Limit, Error Handling, Edge Cases, Performance-Optimierung (Survey < 2s) |
| **11-12** | Launch Prep | Go-Live | Landing Page finalisieren (Features, Pricing, FAQ, Trust-Signale), SEO-Basics (Meta, OG, Sitemap), DSGVO: Impressum, Datenschutz, AGB, AV-Vertrag, Testing (E2E mit Playwright, manuelle Tests), Monitoring (Sentry, Plausible, BetterStack), **Beta-Test: 3-5 Praxen onboarden**, Bug-Fixes, Soft Launch 🚀 |

---

## 9. Kosten-Kalkulation

| Phase | Kosten/Monat |
|-------|-------------|
| **Entwicklung (Woche 1-12)** | ~0–5 €/Monat (Free Tiers: Supabase, Vercel, Resend, Sentry) |
| **Bei 10 Kunden** | ~25 €/Monat (Supabase Pro) |
| **Bei 50 Kunden** | ~70-100 €/Monat (Supabase Pro, Vercel Pro, Resend Starter) |
| **Bei 100 Kunden** | ~120-180 €/Monat |

**Break-Even:** ~2-3 zahlende Kunden à 49 € = ~100-150 €/Monat decken Infrastruktur.

---

## 10. Erfolgskriterien

**North Star Metrik:** Anzahl Praxen mit ≥ 10 Antworten in den letzten 30 Tagen

| KPI | Ziel (3 Monate nach Launch) |
|-----|----------------------------|
| Registrierungen (Free) | 50-100 |
| Zahlende Kunden (Starter/Pro) | 10-15 |
| Ø Antworten pro Praxis/Monat | 20+ |
| Google-Review-Conversion | 25-35% der Promoter klicken Link |
| Survey-Completion-Rate | > 80% |
| Survey-Ladezeit (mobile) | < 2 Sekunden |
| Monthly Churn | < 5% |
| NPS des eigenen Produkts | > 40 |

---

## 11. Risiken & Mitigierung

| Risiko | Wahrscheinlichkeit | Impact | Mitigierung |
|--------|-------------------|--------|-------------|
| Zu wenige Beta-Tester | Mittel | Hoch | Eigenes Netzwerk, Zahnarzt-Facebook-Gruppen, LinkedIn, kostenloser Start |
| Google Places API Kosten | Niedrig | Mittel | Caching der Place IDs, nur bei Onboarding nötig, Rate Limiting |
| Survey wird nicht ausgefüllt | Mittel | Hoch | A/B-Test Kürze (3 vs. 5 Fragen), QR-Code-Platzierung optimieren, Anleitung für Praxis |
| DSGVO-Bedenken der Praxen | Hoch | Hoch | Keine PII speichern, Hosting in DE (Supabase Frankfurt), HIPAA-compliant, AV-Vertrag bereitstellen, Datenschutzerklärung prominent, RLS auf DB-Ebene |
| Technische Komplexität | Mittel | Mittel | Bewusst simpel starten, kein PVS/SMS/KI im MVP, Monolith-Architektur |
| Google ändert Review-API | Niedrig | Hoch | Deeplink-Ansatz ist stabil (kein API-Zugriff auf Reviews nötig), nur Places API für Lookup |
| Alleine als Solo-Founder | Hoch | Mittel | AI-gestütztes Vibe Coding, Fokus auf Kern-Features, Community für Feedback |

---

## 12. Post-MVP Roadmap (v2+)

### Phase 2: Growth (Monat 4-6)
| Feature | Priorität | Aufwand |
|---------|-----------|---------|
| KI-Sentiment-Analyse (Claude API) | P1 | 2 Wochen |
| QM-Report PDF (G-BA-konform) | P1 | 2 Wochen |
| SMS-Versand (post-visit, Opt-in) | P1 | 1 Woche |
| Tablet Kiosk-Modus | P2 | 1 Woche |
| Englisch als Zweitsprache | P2 | 1 Woche |
| KI-Antwort-Assistent für Google Reviews | P2 | 1 Woche |

### Phase 3: Scale (Monat 7-12)
| Feature | Priorität | Aufwand |
|---------|-----------|---------|
| Multi-Standort / MVZ-Dashboard | P1 | 2 Wochen |
| Jameda-Monitoring + Alerts | P2 | 2 Wochen |
| PVS-Integration (Dampsoft, Z1, Charly) | P3 | 4+ Wochen |
| Benchmark (anonymer Praxis-Vergleich) | P2 | 2 Wochen |
| White-Label (für Dental-Berater) | P3 | 3 Wochen |
| Mitarbeiter-Befragung (Zusatzmodul) | P3 | 3 Wochen |
| Enterprise-Plan (179 €/Standort + API) | P3 | 2 Wochen |

---

## 13. Definition of Done (MVP)

- [ ] Praxis registriert sich und hat in **5 Min** eine Umfrage live
- [ ] Patient füllt **60-Sekunden-Umfrage** via QR-Code aus
- [ ] Promoter (NPS 9-10) sehen **Google-Review-Button**
- [ ] Detractor (NPS 0-6) lösen **E-Mail-Alert** aus
- [ ] Dashboard zeigt **NPS, Trend, Kategorien, Freitext, Funnel**
- [ ] QR-Codes als **druckfertige PDFs** downloadbar (4 Formate)
- [ ] **Stripe-Zahlung** funktioniert (Checkout + Portal)
- [ ] **DSGVO-konform**: kein Cookie (außer Auth), Server in DE, Datenschutzerklärung, AV-Vertrag
- [ ] **3+ Beta-Praxen** nutzen das Tool aktiv
- [ ] Survey **< 2 Sekunden** Ladezeit (mobile, 3G)
- [ ] Keine kritischen Bugs

---

## 14. Wettbewerber (Kurzübersicht)

| Wettbewerber | Stärke | Schwäche | Preis |
|-------------|--------|----------|-------|
| **solvi reviews** | Dental-Ökosystem, 2.000+ Kunden | Noch früh, Teil eines größeren Systems | Unbekannt |
| **TOPMEDIS** | MA + PA-Befragung, QR-basiert | Kein Review-Management | ~400-900 €/Jahr |
| **Blickwinkel.io** | Tablet-Befragung | Kein Review-Mgmt, teuer | 400-900 €/Jahr |
| **Birdeye/Podium** | Marktführer (US) | Nicht DSGVO, nicht lokalisiert, teuer | 300-650 $/Monat |

**PraxisPuls-Differenzierung:**
- Kombination aus Befragung + Review-Routing (beides in einem)
- DSGVO by Design, Server in DE, auf Deutsch
- Preis: 49 €/Monat (deutlich günstiger als US-Alternativen)
- Setup in 5 Minuten (kein Onboarding-Call nötig)
- Fokus auf Zahnarztpraxen (nicht generisch)
