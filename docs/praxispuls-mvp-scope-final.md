# PraxisPuls – MVP Scope (Updated)
## Feedback-Management SaaS für Dienstleister — Multi-Branchen

**Version:** 2.0 (Updated nach Multi-Survey-Redesign #59)
**Stand:** Februar 2026
**Ziel:** Erste zahlende Kunden in 12 Wochen
**Entwickler:** 1 Person (Solo-Dev mit AI)
**Projektname:** PraxisPuls
**Tracking:** GitHub Issues + Projects ([gh issue list](https://github.com))

---

## 1. Produkt-Vision

### One-Liner

> **„Kundenfeedback sammeln, Google-Bewertungen steigern, Qualität messen — in 5 Minuten eingerichtet, für 49 €/Monat."**

### Problem
Dienstleister (Zahnarztpraxen, Handwerker, Restaurants, Fitnessstudios u.v.m.) brauchen Kundenfeedback für Qualitätsmanagement, tun es aber auf Papier oder gar nicht. Gleichzeitig wollen sie bessere Google-Bewertungen. Beides passiert getrennt, manuell und ineffizient.

### Lösung
Ein Tool, das beides in einem automatisierten Flow verbindet:
1. Kunde/Patient scannt QR-Code → kurze Umfrage (60 Sekunden)
2. Zufriedene werden automatisch zu Google weitergeleitet
3. Unzufriedene werden intern aufgefangen + Betrieb wird alarmiert
4. Dashboard mit NPS, Trends und Kategorie-Scores entsteht automatisch

### Kern-Mechanik: Die Zufriedenheits-Weiche
```
Befragter scannt QR-Code → Umfrage (NPS + branchenspezifische Fragen + Freitext)
  ├── NPS 9-10 (Promoter)  → Google-Review-Deeplink anbieten
  ├── NPS 7-8  (Passive)   → Danke-Seite (kein Google-Prompt)
  └── NPS 0-6  (Detractor) → Empathie-Seite + E-Mail-Alert an Inhaber
```

---

## 2. MVP-Philosophie

### Was der MVP MUSS:
- Betrieb registriert sich und hat in **5 Minuten** eine Umfrage live
- Befragte füllen Umfrage in **60 Sekunden** auf dem Smartphone aus
- Zufriedene werden **automatisch** auf Google weitergeleitet
- Betrieb sieht ein **einfaches Dashboard** mit den wichtigsten Kennzahlen
- Funktioniert auf **Deutsch**, ist **DSGVO-konform** und sieht **professionell** aus
- **Multi-Branchen**: 10 Kategorien, 26 Sub-Branchen mit branchenspezifischer Terminologie
- **Multi-Standort**: Mehrere Standorte pro Account (Plan-abhängig)
- **Mitarbeiterbefragung**: Employee-Templates mit eNPS + Anonymitätsschwelle

### Was der MVP NICHT muss:
- ❌ PVS-Integration (zu komplex)
- ❌ SMS/WhatsApp-Versand (regulatorische Hürden)
- ❌ KI-Sentiment-Analyse (v2)
- ❌ QM-PDF-Reports (v2)
- ❌ Tablet Kiosk-Modus
- ❌ Jameda/Doctolib-Integration
- ❌ Mehrsprachigkeit (nur Deutsch im MVP)
- ❌ Mobile App (Web reicht)

---

## 3. Feature-Scope (MVP)

### 3.1 Umfrage-System (Core)

#### 7 Frage-Typen
| Typ | Beschreibung |
|-----|-------------|
| **NPS** | Net Promoter Score (0-10) |
| **eNPS** | Employee NPS (0-10, für Mitarbeiterbefragungen) |
| **Stars** | Sterne-Bewertung (1-5) |
| **Likert** | Likert-Skala (1-5, mit Labels) |
| **Single-Choice** | Einfachauswahl aus Optionen |
| **Yes-No** | Ja/Nein Frage |
| **Freetext** | Freitext-Eingabe |

#### Smart Step-Grouping
```
buildSteps() gruppiert Fragen intelligent:
  - NPS/eNPS → immer allein auf einem Step
  - Stars, Likert, Single-Choice, Yes-No → max 3 pro Step
  - Freetext → immer allein auf letztem Step
```

#### Template-System (DB-backed)
- `survey_templates` Tabelle (nicht Code-Konstante)
- Branchen-gefiltert: Jede Sub-Branche hat passende Templates
- Admin-CRUD: Templates erstellen, bearbeiten, löschen
- System-Templates (isSystem=true) + Custom-Templates
- Kategorien: `customer` + `employee`

#### Umfrage-Flow
```
1. Befragter scannt QR-Code (Wartezimmer / Empfang / Werkstatt / etc.)
2. Mobile-optimierte Web-Umfrage öffnet sich (kein App-Download)
3. Smart-Steps: NPS → Kategorie-Fragen → Freitext
4. Danke-Screen → Routing je nach NPS (Zufriedenheits-Weiche)
Dauer: 60-90 Sekunden
```

#### Technische Anforderungen
| Anforderung | Details |
|-------------|---------|
| Kein Login für Befragte | Direkt über QR-Code/Link aufrufbar |
| Mobile-first | Optimiert für Smartphone, große Touch-Targets |
| Anonym | Kein Name, keine E-Mail, keine IP-Speicherung |
| Deduplizierung | Session-Hash verhindert doppelte Antworten |
| Performance | Umfrage < 2 Sekunden auf mobilem Netz |
| Barrierearm | WCAG 2.1 AA |

### 3.2 Smart Review Routing (Killer-Feature)

```
NPS 9-10 (Promoter) → Google-Review-Button
NPS 7-8  (Passive)  → Danke-Seite (kein Google-Prompt)
NPS 0-6  (Detractor) → Empathie-Seite + E-Mail-Alert
```

Google-Integration: Place ID bei Setup eingeben → Review-Deeplink wird generiert.

### 3.3 Dashboard (Web App)

| Seite | Inhalte |
|-------|---------|
| **Übersicht** | NPS-Score + Trend, Antworten/Woche, letzte Freitexte, Alerts |
| **Umfragen** | Liste aller Surveys mit Status (draft/active/paused/archived), Erstellen, Bearbeiten |
| **Antworten** | Chronologische Liste, filterbar nach Zeitraum und NPS-Kategorie |
| **QR-Codes** | QR-Code pro Survey generieren + Download |
| **Alerts** | Detractor-Feedback mit Lesebestätigung + Notizen |
| **Einstellungen** | Praxisdaten, Google Place ID, Alert-E-Mail, NPS-Schwellenwert |
| **Billing** | Stripe Customer Portal |
| **Profil** | Account-Einstellungen, Passwort ändern |

### 3.4 Multi-Branchen (10 Kategorien, 26 Sub-Branchen)

| Kategorie | Sub-Branchen | Befragungstyp |
|-----------|-------------|--------------|
| Gesundheit & Medizin | Zahnarzt, Hausarzt, Augenarzt, Dermatologe, Physiotherapie, Tierarzt, Apotheke | patient/tierhalter/kunde |
| Handwerk & Technik | KFZ-Werkstatt, SHE, Handwerk allgemein | kunde |
| Beauty & Pflege | Friseur, Kosmetik | kunde |
| Gastronomie & Hotellerie | Restaurant/Café, Hotel/Pension | gast |
| Fitness & Wellness | Fitnessstudio, Yoga/Wellness | mitglied |
| Einzelhandel | Geschäft/Laden, Optiker/Hörakustiker | kunde |
| Bildung & Ausbildung | Fahrschule, Nachhilfe, Schule, Kindergarten | fahrschueler/schueler/eltern |
| Vereine & Organisationen | Sportverein, Verein allgemein | mitglied |
| Beratung & Recht | Steuerberater, Rechtsanwalt | mandant |
| Individuell | Eigene Branche, Private Umfrage | individuell |

- **Terminologie**: `getTerminology(respondentType)` gibt Singular/Plural/Genitiv/Dativ zurück
- **Smart 2-Layer**: Bei 3+ Sub-Branchen wird Layer 2 angezeigt, sonst direkte Auswahl

### 3.5 Survey-Lifecycle (Status-Machine)

```
draft → active → paused → archived
                ↑         ↓
                └─────────┘ (dearchivieren)
```

- **draft**: Neu erstellt, nicht öffentlich erreichbar
- **active**: Öffentlich, sammelt Antworten
- **paused**: Temporär deaktiviert
- **archived**: Aus UI entfernt, Antworten bleiben
- **Soft Delete**: Setzt `deletedAt`, kein Hard-Delete

### 3.6 Onboarding (3 Steps)

```
1. Branche wählen (Karten-Grid, Smart 2-Layer)
2. Google Places verknüpfen (→ Name auto-fill) ODER Name manuell
3. Template wählen (gefiltert nach Branche)
```

### 3.7 Employee Surveys (Mitarbeiterbefragung)

- **Templates**: Kurzcheck (Pulse, ~2 Min), Standard (~5 Min), Ausführlich (jährlich)
- **eNPS**: Employee Net Promoter Score
- **Anonymitätsschwelle**: Ergebnisse erst ab N Antworten sichtbar
- **Kategorie**: `employee` (separate Template-Filterung)

### 3.8 Alerts & Benachrichtigungen

| Trigger | Aktion |
|---------|--------|
| NPS ≤ 5 (Detractor) | E-Mail-Alert mit Score + Freitext |
| Erste 10 Antworten | Gratulations-Hinweis |
| Free-Limit erreicht | Upgrade-Hinweis |

### 3.9 Admin-Bereich

| Seite | Funktion |
|-------|----------|
| **Dashboard** | System-Stats, aktive Praxen, Antworten |
| **Practices** | User-Liste, Plan Override, Suspend/Ban |
| **Templates** | CRUD für Survey-Templates |
| **Audit Log** | Alle Admin-Aktionen |
| **Login History** | Login-Events aller User |

---

## 4. Technische Architektur (MVP)

### 4.1 Tech-Stack

```
Frontend + Backend:
  ├── Framework:     Next.js 15 (App Router, RSC, Server Actions, Turbopack)
  ├── Sprache:       TypeScript (strict mode)
  ├── Styling:       Tailwind CSS + shadcn/ui
  ├── Charts:        Recharts
  ├── QR-Code:       qrcode (npm, serverseitig)
  ├── Validation:    zod
  └── Survey:        In Next.js integriert (SSR, minimaler JS)

Auth:
  └── Supabase Auth  → E-Mail/Passwort, 50k MAU free

Datenbank:
  ├── Haupt-DB:      PostgreSQL (Supabase, Frankfurt Region)
  ├── ORM:           Drizzle ORM + Drizzle Kit (Migrations)
  └── Kein Cache im MVP (DB-Queries reichen)

Externe Dienste:
  ├── Payments:      Stripe (Checkout + Portal + Webhooks)
  ├── E-Mail:        Resend (Transactional)
  └── Google:        Places API (Autocomplete, Review-Link)

Hosting:
  ├── App:           Vercel
  ├── DB + Auth:     Supabase (Frankfurt)
  └── Storage:       Supabase Storage (Logos)

Monitoring:
  ├── Errors:        Sentry
  ├── Analytics:     Plausible (DSGVO-konform)
  └── Health:        /api/health Endpoint
```

### 4.2 Datenmodell (7 Tabellen)

```
practices           — Tenants (Multi-Standort, Branche, Plan, Soft Delete)
survey_templates    — Branchen-Templates (System + Custom, JSONB questions)
surveys             — Umfragen (Status-Lifecycle, respondentType, Scheduling)
responses           — Antworten (JSONB answers, npsScore, kein PII)
alerts              — Detractor-Notifications
login_events        — Login Audit Log
audit_events        — Change Tracking
```

#### Schlüssel-Design-Entscheidungen:
- **JSONB `answers`** als Single Source of Truth (statt fixer Spalten pro Frage)
- **`npsScore`** bleibt als eigene Spalte (Performance für Dashboard-Queries)
- **Status-Enum**: `draft | active | paused | archived` (statt `isActive` Boolean)
- **`respondentType`** auf Survey-Ebene (nicht Practice) — ermöglicht verschiedene Befragungstypen pro Standort
- **Soft Delete** mit `deletedAt` auf practices + surveys

### 4.3 API Endpoints

```
Auth:
  POST  /api/auth/callback           Supabase Auth Callback
  POST  /api/auth/confirm            E-Mail-Bestätigung
  POST  /api/auth/login-event        Login-Event loggen

Practice:
  GET   /api/practice                Eigene Praxis laden
  PUT   /api/practice                Praxis updaten
  POST  /api/practice/logo           Logo hochladen
  POST  /api/practice/logo-from-url  Logo von URL extrahieren
  GET   /api/practice/qr-code        QR-Code generieren
  GET   /api/practice/website-logos  Logos von Website erkennen
  PUT   /api/practice/[id]           Praxis per ID updaten

Surveys:
  GET   /api/surveys/[surveyId]/qr-code  Survey-spezifischer QR-Code

Account:
  DELETE /api/account                Account löschen

Google:
  GET   /api/google/places           Places Autocomplete
  GET   /api/google/photo            Place Photo Proxy

Billing:
  POST  /api/billing/checkout        Stripe Checkout
  POST  /api/billing/portal          Stripe Portal
  GET   /api/billing/invoices        Rechnungen

Public (kein Auth):
  GET   /s/[slug]                    Survey-Seite (SSR)
  POST  /api/public/responses        Antwort einreichen
  POST  /api/public/track-click      Google-Click tracken

Webhooks:
  POST  /api/webhooks/stripe         Stripe Webhook

Admin:
  GET   /api/admin/practices/[id]    Practice Details
  PUT   /api/admin/practices/[id]    Practice updaten
  POST  .../[id]/suspend             Suspend/Unsuspend
  POST  .../[id]/ban-user            User bannen
  POST  .../[id]/set-password        Passwort setzen
  POST  .../[id]/reset-password      Passwort-Reset
  PUT   .../[id]/email               E-Mail ändern
  PUT   .../[id]/google              Google Place ID ändern

Health:
  GET   /api/health                  System-Status
```

### 4.4 Next.js Routes

```
/                                Landing Page
/login                           Login
/register                        Registrierung
/onboarding                      Setup-Wizard (3 Steps)

/dashboard                       Hauptübersicht
/dashboard/surveys               Survey-Liste + Management
/dashboard/responses             Antworten (filterbar)
/dashboard/alerts                Detractor-Alerts
/dashboard/qr-codes              QR-Code Generator
/dashboard/settings              Einstellungen
/dashboard/billing               Stripe Portal
/dashboard/profile               Account-Profil

/admin                           Admin Dashboard
/admin/practices                 Practice-Liste
/admin/practices/[id]            Practice Detail
/admin/templates                 Template-Liste
/admin/templates/new             Template erstellen
/admin/templates/[id]            Template bearbeiten
/admin/stats                     System-Stats
/admin/audit                     Audit Log
/admin/logins                    Login History

/s/[slug]                        Public Survey (SSR)

/impressum                       Legal
/datenschutz                     Legal
/agb                             Legal
```

### 4.5 Projektstruktur

```
praxispuls/
├── src/
│   ├── app/
│   │   ├── (admin)/admin/           # Admin Panel
│   │   ├── (auth)/                  # Login, Register
│   │   ├── (dashboard)/             # Dashboard + Onboarding
│   │   ├── (marketing)/             # Landing, Legal Pages
│   │   ├── s/[slug]/                # Public Survey (SSR)
│   │   ├── api/                     # API Routes
│   │   │   ├── account/
│   │   │   ├── admin/practices/
│   │   │   ├── auth/
│   │   │   ├── billing/
│   │   │   ├── google/
│   │   │   ├── health/
│   │   │   ├── practice/
│   │   │   ├── public/
│   │   │   ├── surveys/
│   │   │   └── webhooks/
│   │   └── global-error.tsx
│   ├── actions/                     # Server Actions
│   ├── components/
│   │   ├── ui/                      # shadcn/ui
│   │   ├── dashboard/
│   │   ├── survey/questions/        # 7 Question-Components
│   │   ├── marketing/
│   │   └── shared/
│   ├── lib/
│   │   ├── __tests__/               # Unit Tests (Vitest)
│   │   ├── db/
│   │   │   ├── schema.ts            # Drizzle Schema (7 Tabellen)
│   │   │   ├── index.ts             # DB Connection
│   │   │   └── queries/             # Query Functions
│   │   ├── supabase/
│   │   ├── auth.ts
│   │   ├── stripe.ts
│   │   ├── email.ts
│   │   ├── google.ts
│   │   ├── review-router.ts
│   │   ├── survey-steps.ts          # buildSteps() Smart Grouping
│   │   ├── survey-validation.ts     # validateAnswers()
│   │   ├── survey-status.ts         # Status Machine
│   │   ├── industries.ts            # Branchen + Terminologie
│   │   ├── validations.ts           # Zod Schemas
│   │   └── url-validation.ts        # SSRF Protection
│   ├── middleware.ts                # Supabase Auth
│   └── types/index.ts
├── e2e/                             # Playwright Tests
├── drizzle/                         # Migrations
├── docs/                            # Scope + Analyse Docs
└── package.json
```

---

## 5. Pricing

| Feature | Free | Starter (49 €/Mo) | Professional (99 €/Mo) |
|---------|------|-------------------|----------------------|
| Antworten/Monat | 30 | 200 | Unbegrenzt |
| Standorte | 1 | 3 | 10 |
| Survey-Templates | System-Templates | Alle + Custom | Alle + Custom |
| Google Review Routing | ✅ | ✅ | ✅ |
| QR-Code Download | ✅ | ✅ | ✅ |
| Dashboard | Basis | Vollständig | Vollständig |
| Detractor Alerts | ❌ | ✅ | ✅ |
| Zeitraum-Filter | 30 Tage | Frei wählbar | Frei wählbar |
| Branding (Logo/Farben) | ❌ | ✅ | ✅ |
| Mitarbeiterbefragung | ❌ | ✅ | ✅ |

**Entscheidung:** Review-Routing in ALLEN Plänen (auch Free) — das ist der Hook.

**Hinweis:** Plan-Limits werden in #74 komplett redesigned für Multi-Survey.

---

## 6. Milestones & Roadmap

### v0.1-MVP (März 2026)
| # | Feature | Status |
|---|---------|--------|
| #60 | Schema + Migration | ✅ |
| #61 | Branchen + Terminologie | ✅ |
| #62 | Template-System | ✅ |
| #63 | Dynamic Survey-Form (7 Typen) | ✅ |
| #64 | Survey-Management UI | ✅ |
| #86 | DB-Migration + Seed | ✅ |
| #66 | Onboarding (3 Steps) | 🔜 |
| #68 | Employee Templates + eNPS | offen |
| #69 | Comparison Dashboard (3 Modi) | offen |
| #70 | Survey Scheduling | offen |
| #71 | Survey Copy | offen |
| #73 | Social Login | offen |
| #74 | Plan-Limits Redesign | offen |
| #75 | DSGVO Response-Management | offen |
| #72 | Tests (Unit + E2E) | offen |
| #58 | Landing Page Animations | offen |
| #9 | Legal Pages | offen |
| #6 | E2E + Security Tests | offen |
| #49 | Supabase SMTP Setup | offen |

### v0.2-Beta (Mai 2026)
| # | Feature |
|---|---------|
| #4 | Mobile UX Polish |
| #5 | Smart-Sticky Header, Caching |
| #7 | Component Tests |
| #8 | A11y, Visual Regression |
| #10 | ESLint Warnings aufräumen |
| #11-#12 | CI/CD Polish |
| #19-#20 | Google Places Verifizierung |
| #79-#85 | Code Review Findings |

### v1.0-Launch (Juli 2026)
- Öffentlicher Launch mit Pilotpraxen
- KI-Sentiment-Analyse (Claude API)
- QM-Report PDF

---

## 7. Zielgruppen-Persona

### Primär: Dr. Sarah Müller (Zahnarztpraxis)
42, Inhaberin in München. 6 Mitarbeiter, 3.9 Sterne auf Google. Will mehr Privatpatienten, hat keine Zeit für Marketing. Budget max. 100 €/Mo.

### Sekundär: Thomas Weber (KFZ-Werkstatt)
38, Meister in Rosenheim. 4 Mitarbeiter, kaum Online-Präsenz. Will Google-Bewertungen steigern, um gegen Ketten zu bestehen.

### Tertiär: Lisa Kramer (Kosmetikstudio)
29, Solo-Selbständige. Will professionell wirken und Feedback für Instagram-Posts nutzen.

---

## 8. DSGVO & Compliance

- Keine PII in responses-Tabelle
- Kein Cookie außer Auth (Session)
- Server in EU/DE (Supabase Frankfurt)
- Anonyme Umfragen
- Session-Hash nur für Deduplizierung
- DSGVO Response-Management: Manuelles + Auto-Löschen (#75)
- AV-Vertrag bereitstellen

---

## 9. Risiken & Mitigierung

| Risiko | Impact | Mitigierung |
|--------|--------|-------------|
| Zu wenige Beta-Tester | Hoch | Eigenes Netzwerk, Fach-Gruppen, kostenloser Start |
| DSGVO-Bedenken | Hoch | Kein PII, Hosting DE, AV-Vertrag, Datenschutzerklärung |
| Survey wird nicht ausgefüllt | Hoch | 60s Ziel, Mobile-first, große Buttons |
| Google ändert Review-API | Hoch | Deeplink-Ansatz stabil (kein API-Zugriff nötig) |
| Solo-Founder Kapazität | Mittel | AI-gestütztes Development, Fokus auf Core |
| Multi-Branchen zu generisch | Mittel | Zahnarzt als Kernbranche, andere schrittweise |

---

## 10. Erfolgskriterien

**North Star:** Anzahl Betriebe mit ≥ 10 Antworten in den letzten 30 Tagen

| KPI | Ziel (3 Monate nach Launch) |
|-----|----------------------------|
| Registrierungen (Free) | 50-100 |
| Zahlende Kunden | 10-15 |
| Ø Antworten pro Betrieb/Monat | 20+ |
| Google-Review-Conversion | 25-35% der Promoter |
| Survey-Completion-Rate | > 80% |
| Survey-Ladezeit (mobile) | < 2 Sekunden |
| Monthly Churn | < 5% |

---

## 11. Wettbewerber (Kurzübersicht)

| Wettbewerber | Stärke | Schwäche | Preis |
|-------------|--------|----------|-------|
| **solvi reviews** | Dental-Ökosystem | Teil größeren Systems | Unbekannt |
| **TOPMEDIS** | MA + PA-Befragung, QR | Kein Review-Mgmt | ~400-900 €/Jahr |
| **Birdeye/Podium** | Marktführer (US) | Nicht DSGVO, teuer | 300-650 $/Mo |

**PraxisPuls-Differenzierung:**
- Befragung + Review-Routing kombiniert
- Multi-Branchen (nicht nur Dental)
- DSGVO by Design, Server in DE
- 49 €/Monat (deutlich günstiger)
- Setup in 5 Minuten
