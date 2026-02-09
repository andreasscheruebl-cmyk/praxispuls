# Wettbewerbsanalyse & Technischer Blueprint
## Patientenumfrage + Review-Management SaaS für Arzt-/Zahnarztpraxen (DE)

---

## 1. Marktüberblick

### Der Markt in Zahlen (Deutschland)

| Kennzahl | Wert |
|----------|------|
| Niedergelassene Zahnärzte | ~72.000 |
| Niedergelassene Ärzte (gesamt) | ~180.000 |
| Praxen mit PVS-Unzufriedenheit | 47,7% (Zi-Umfrage 2024) |
| Patienten, die Online-Bewertungen nutzen | 41,8% (Socialwave/Datapuls) |
| Ø Google-Bewertung Zahnarztpraxen | 4,65 Sterne |
| Praxen mit 4-5 Sternen auf Google Maps | 94,27% |
| QM-Pflicht mit Patientenbefragung | Ja (G-BA-Richtlinie) |

### Kernproblem
94% der Zahnarztpraxen haben gute Google-Bewertungen – die Differenzierung über Sterne allein funktioniert nicht mehr. Die „Patient Journey" von der Google-Suche bis zur Terminbuchung wird zum entscheidenden Wettbewerbsfaktor. Gleichzeitig sind Praxen gesetzlich verpflichtet, im Rahmen des Qualitätsmanagements Patientenbefragungen durchzuführen – viele tun dies aber noch auf Papier oder gar nicht.

---

## 2. Wettbewerbslandschaft

### 2.1 Direkte Wettbewerber: Patientenbefragung + Review-Management (DE)

#### solvi reviews
- **Zielgruppe:** Zahnarzt-/Arztpraxen (primär Dental)
- **Ansatz:** Patientenumfrage + Google-Review-Optimierung
- **Ökosystem:** Teil von solvi (flow, control, connect, pepito) – starkes Cross-Selling
- **Stärke:** 2.000+ Bestandskunden, 30 Jahre Branchenerfahrung
- **Schwäche:** Produkt scheinbar noch in Frühphase (Notion-Landingpage)
- **Preis:** Nicht öffentlich

#### TOPMEDIS
- **Zielgruppe:** Zahnarztpraxen
- **Ansatz:** Kombi-Tool: Mitarbeiter- + Patientenbefragung
- **Besonderheit:** Validierte Fragebögen speziell für Zahnärzte
- **Erfassung:** QR-Code → Smartphone des Patienten
- **Stärke:** Ganzheitlicher Ansatz (Mitarbeiter + Patient), DSGVO-konform
- **Schwäche:** Keine Google-Review-Integration
- **Preis:** Nicht öffentlich, kostenloser Start möglich

#### Blickwinkel.io
- **Zielgruppe:** Arztpraxen allgemein
- **Ansatz:** Tablet-basierte Befragung im Wartezimmer
- **Besonderheit:** App-basiert, 100% digital, anonym
- **Stärke:** Einfache Handhabung, schneller Start
- **Schwäche:** Nur Befragung, kein Review-Management
- **Preis:** 400–900 €/Jahr

#### SayWay
- **Zielgruppe:** Kliniken, Praxen, Altenheime
- **Ansatz:** Hardware-Terminals (Smiley-Buttons) + digitale Nachbefragung
- **Besonderheit:** Adaptive Befragung (zufrieden = kurz, unzufrieden = mehr Fragen)
- **Stärke:** Hohe Teilnahmerate durch physische Terminals
- **Schwäche:** Hohe Einstiegskosten (Hardware), Wartung

#### med2day (kostenlos)
- **Zielgruppe:** Arztpraxen
- **Ansatz:** Kostenlose Patientenbefragung inkl. Auswertung
- **Besonderheit:** Kein Lock-in, keine Folgekosten
- **Stärke:** Preislich unschlagbar, Beratungsansatz
- **Schwäche:** Vermutlich Lead-Generierung für Beratungsleistungen

### 2.2 Indirekte Wettbewerber: Review-Management

#### Reputizer.de
- **Ansatz:** Google-Bewertungsoptimierung für Zahnarztpraxen
- **Fokus:** Positive Bewertungen generieren, negative verhindern

#### PraxReviews
- **Ansatz:** Bewertungssiegel, das alle Portale aggregiert (Google, Jameda, Doctolib)
- **Besonderheit:** Tägliche Synchronisierung, Website-Widget

#### MediEcho
- **Ansatz:** Authentische Bewertungen auf Google, Jameda, Doctolib aufbauen

### 2.3 Generische Survey-Plattformen (horizontal)

#### evasys
- **Zielgruppe:** Kliniken, Reha, große Einrichtungen
- **Ansatz:** Enterprise-Befragungssoftware, auch Papier/Hybrid
- **Stärke:** 1.500+ Institutionen, Benchmark, Ampelsystem
- **Schwäche:** Zu komplex und teuer für Einzelpraxen

#### QuestorPro (Blubbsoft)
- **Ansatz:** Generische Befragungssoftware mit Healthcare-Modulen
- **Stärke:** Mehrsprachig, BITV-konform, Filterlogik
- **Schwäche:** Kein Praxis-/Dental-Fokus

#### Formbricks (Open Source)
- **Ansatz:** Open-Source-Feedback-Plattform, Healthcare-Modul
- **Stärke:** Self-hosted möglich, DSGVO/HIPAA, kostenloser Einstieg
- **Schwäche:** DIY-Charakter, keine Branchen-Fragebögen

### 2.4 Angrenzende Wettbewerber: Digitale Patientenaufnahme

| Anbieter | Fokus | Besonderheit |
|----------|-------|-------------|
| **Nelly** | Digitale Patientenaufnahme + Factoring | 50 Mio. € Series B (2023), PVS-Integration |
| **Simpleprax** | Digitale Formulare + Aufklärung | Schnelle Einrichtung (<1h) |
| **myMedax** | Digitale Anamnese | HL7/FHIR-Schnittstellen |
| **AnaBoard** | Hardware+Software (Tablet) | Offline-fähig |
| **Athena (Dampsoft)** | Digitale Anamnese + KI | Dashboard, 8 Sprachen |

**Warum relevant:** Diese Player könnten Patientenbefragung als Feature hinzufügen (Feature-Creep von Anamnese → Survey).

---

## 3. Wettbewerbsmatrix

```
                    Review-Management
                         ↑
                         |
          Reputizer  ●   |   ● solvi reviews
          PraxReviews ●  |
          MediEcho ●     |
                         |
  Nur Befragung ─────────┼─────────── Befragung + Reviews
                         |
       TOPMEDIS ●        |
    Blickwinkel ●        |
       med2day ●         |
       SayWay ●          |
                         |
                         ↓
                  Interne Qualität
```

**Die Lücke:** Kein Anbieter kombiniert überzeugend alle drei Dimensionen:
1. **Strukturierte Patientenbefragung** (QM-konform, validiert)
2. **Google-Review-Funnel** (zufriedene Patienten → öffentliche Bewertung)
3. **Actionable Analytics** (KI-gestützte Insights, Trend-Erkennung)

---

## 4. Differenzierungsstrategie für dein Produkt

### 4.1 Value Proposition (Vorschlag)

> **„Verwandle Patientenfeedback in Praxiserfolg – automatisch."**
>
> Die einzige Plattform, die QM-konforme Patientenbefragung, intelligentes Google-Review-Management und KI-gestützte Praxisoptimierung in einer Lösung vereint.

### 4.2 Drei Alleinstellungsmerkmale

**1. Smart Review Routing (Der „Zufriedenheits-Weiche")**
```
Patient füllt Umfrage aus
    ├─ Score ≥ 8/10 → „Würden Sie uns auf Google bewerten?" → Direktlink
    ├─ Score 5-7/10 → „Was können wir verbessern?" → Internes Feedback
    └─ Score < 5/10 → „Wir möchten Sie kontaktieren" → Alert an Praxis
```
Zufriedene Patienten werden zu Google-Botschaftern, unzufriedene werden intern aufgefangen – BEVOR eine negative Bewertung entsteht.

**2. KI-Analyse statt Zahlenfriedhof**
- Sentiment-Analyse der Freitextantworten
- Automatische Kategorisierung (Wartezeit, Freundlichkeit, Behandlung, Praxisausstattung)
- Trend-Erkennung: „Wartezeit-Beschwerden haben in den letzten 4 Wochen um 40% zugenommen"
- Vergleichswerte (anonym) zu anderen Praxen in der Region

**3. QM-Autopilot**
- Vorkonfigurierte, validierte Fragebögen (angelehnt an G-BA / ÄZQ-Standards)
- Automatische QM-Berichte als PDF für Praxis-Audits
- Dokumentation der Verbesserungsmaßnahmen (PDCA-Zyklus)

---

## 5. Technische Architektur (Blueprint)

### 5.1 System-Übersicht

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                        │
├──────────┬──────────────┬──────────────┬────────────────┤
│ Patienten│   Praxis-    │   Admin-     │    Public      │
│ Survey   │  Dashboard   │   Panel      │   Widget       │
│ (Mobile) │  (Web App)   │              │  (Embeddable)  │
│ PWA/Web  │  React/Next  │  React/Next  │  Web Component │
└────┬─────┴──────┬───────┴──────┬───────┴───────┬────────┘
     │            │              │               │
┌────▼────────────▼──────────────▼───────────────▼────────┐
│                     API GATEWAY                          │
│              (REST + WebSocket + Auth)                    │
│                  Node.js / Fastify                        │
└────┬────────────┬──────────────┬───────────────┬────────┘
     │            │              │               │
┌────▼──────┐ ┌──▼────────┐ ┌──▼──────────┐ ┌──▼────────┐
│  Survey   │ │ Analytics │ │   Review    │ │   QM      │
│  Engine   │ │  Engine   │ │   Router    │ │  Report   │
│           │ │           │ │             │ │  Generator│
│ • Fragen  │ │ • NPS     │ │ • Google    │ │ • PDF     │
│ • Logik   │ │ • CSAT    │ │   Places    │ │ • PDCA    │
│ • Scoring │ │ • Trends  │ │   API       │ │ • Export  │
│ • Multi-  │ │ • KI-     │ │ • Routing   │ │ • Archiv  │
│   lang    │ │   Analyse │ │ • Alerts    │ │           │
└────┬──────┘ └──┬────────┘ └──┬──────────┘ └──┬────────┘
     │            │              │               │
┌────▼────────────▼──────────────▼───────────────▼────────┐
│                    DATA LAYER                            │
│  PostgreSQL (Haupt-DB) │ Redis (Cache/Queue) │ S3 (PDF) │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Kernkomponenten

#### A. Survey Engine
```
Tech: TypeScript, Formular-DSL (JSON Schema)
Features:
  - Drag&Drop Fragebogen-Editor
  - Conditional Logic (Frage X → wenn Antwort Y → Frage Z)
  - Fragentypen: NPS (0-10), Sterne, Likert, Freitext, Multiple Choice
  - Mehrsprachig (DE, EN, TR, AR, RU – wichtig für diverse Patientenschaft)
  - Barrierefreiheit (WCAG 2.1 AA)
  - Offline-fähig (Service Worker)
  
Delivery Channels:
  - QR-Code (Wartezimmer, Rezeption, Behandlungszimmer)
  - SMS/WhatsApp-Link (post-visit)
  - E-Mail-Link
  - Tablet Kiosk-Modus (praxiseigenes Tablet)
  - NFC-Tag (Aufsteller an der Rezeption)
```

#### B. Review Router (Herzstück)
```python
# Pseudocode: Smart Review Routing
def route_feedback(survey_response):
    nps_score = survey_response.nps
    
    if nps_score >= 9:  # Promoter
        # Sofort Google-Review anfragen
        send_google_review_request(
            patient=survey_response.patient,
            google_place_id=practice.google_place_id,
            message="Vielen Dank! Würden Sie Ihre Erfahrung auch auf Google teilen?",
            direct_link=generate_google_review_link(practice)
        )
        track_event("promoter_identified", survey_response)
        
    elif nps_score >= 7:  # Passive
        # Bedanken + optional Review nach 24h Delay
        send_thank_you(survey_response.patient)
        schedule_delayed_review_request(
            patient=survey_response.patient,
            delay_hours=24,
            condition="only_if_no_negative_followup"
        )
        
    else:  # Detractor (0-6)
        # Internes Alert + Eskalation
        create_internal_alert(
            practice=practice,
            severity="high" if nps_score <= 3 else "medium",
            survey_response=survey_response
        )
        send_empathy_response(
            patient=survey_response.patient,
            message="Danke für Ihr ehrliches Feedback. Wir nehmen das ernst."
        )
        # KEIN Google-Review-Request!
```

#### C. Analytics Engine
```
Tech: Python (FastAPI) + PostgreSQL + Redis

Metriken:
  - NPS Score (gesamt + Zeitverlauf)
  - CSAT pro Kategorie (Wartezeit, Freundlichkeit, Behandlung, Räumlichkeit)
  - Response Rate
  - Google Review Conversion Rate
  - Sentiment Score (aus Freitexten)
  - Benchmark vs. Vergleichspraxen

KI-Features:
  - Sentiment Analysis: Claude API oder lokales Modell (z.B. German BERT)
  - Topic Extraction: Automatische Kategorisierung von Freitextantworten
  - Anomalie-Erkennung: "Wartezeit-Beschwerden +40% vs. Vormonat"
  - Zusammenfassung: Monatlicher KI-generierter Report
```

#### D. QM Report Generator
```
Tech: Python + WeasyPrint/ReportLab für PDF

Output:
  - Monatlicher QM-Bericht (PDF, DSGVO-konform)
  - Auswertung nach G-BA Qualitätsindikatoren
  - PDCA-Dokumentation (Plan-Do-Check-Act)
  - Exportformate: PDF, CSV, XLSX
  - Automatischer Versand an Praxisinhaber/QM-Beauftragten
```

### 5.3 Tech-Stack Empfehlung

| Schicht | Technologie | Begründung |
|---------|-------------|------------|
| **Frontend (Dashboard)** | Next.js 14+ (App Router) | SSR, TypeScript, schnell, React-Ökosystem |
| **Frontend (Survey)** | Preact oder Vanilla + Web Components | Minimales Bundle (<30kb), Ladezeit kritisch |
| **API** | Fastify (Node.js) oder FastAPI (Python) | Performance + DX |
| **Auth** | Clerk oder Auth.js | Multi-Tenant, RBAC, SSO für größere Praxen |
| **Datenbank** | PostgreSQL + Drizzle ORM | Relational, JSON-Support für Survey-Schemas |
| **Cache/Queue** | Redis + BullMQ | Survey-Verarbeitung, Delayed Review Requests |
| **KI/NLP** | Claude API (Sentiment) + German BERT (lokal) | Freitext-Analyse, DSGVO-konform möglich |
| **PDF** | WeasyPrint (Python) | QM-Reports, Audit-Dokumente |
| **Hosting** | Hetzner Cloud (DE) oder AWS Frankfurt | DSGVO, Datensouveränität |
| **Monitoring** | Sentry + Grafana | Error Tracking + Metriken |

### 5.4 Datenmodell (Kern)

```sql
-- Mandantenfähig: Jede Praxis ist ein Tenant
CREATE TABLE practices (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    google_place_id TEXT,          -- für Review-Integration
    subscription_tier TEXT,         -- free/starter/pro/enterprise
    settings JSONB,                 -- Branding, Farben, Sprache
    created_at TIMESTAMPTZ
);

CREATE TABLE surveys (
    id UUID PRIMARY KEY,
    practice_id UUID REFERENCES practices(id),
    title TEXT NOT NULL,
    schema JSONB NOT NULL,          -- Fragen-Definition (JSON Schema)
    is_active BOOLEAN DEFAULT true,
    delivery_channels TEXT[],       -- {'qr','sms','email','tablet'}
    created_at TIMESTAMPTZ
);

CREATE TABLE responses (
    id UUID PRIMARY KEY,
    survey_id UUID REFERENCES surveys(id),
    practice_id UUID REFERENCES practices(id),
    answers JSONB NOT NULL,
    nps_score SMALLINT,             -- 0-10, denormalisiert für schnelle Queries
    channel TEXT,                   -- 'qr', 'sms', 'email', 'tablet'
    language TEXT DEFAULT 'de',
    sentiment_score FLOAT,          -- -1.0 bis +1.0 (KI-generiert)
    topics TEXT[],                  -- KI-extrahierte Themen
    review_routed_to TEXT,          -- 'google', 'internal', 'alert', NULL
    google_review_clicked BOOLEAN,
    created_at TIMESTAMPTZ,
    -- Keine PII! Patient bleibt anonym
    session_hash TEXT               -- pseudonymisierter Hash für Deduplizierung
);

CREATE TABLE review_requests (
    id UUID PRIMARY KEY,
    response_id UUID REFERENCES responses(id),
    practice_id UUID REFERENCES practices(id),
    channel TEXT,                   -- 'sms', 'email', 'in_survey'
    status TEXT,                    -- 'sent', 'clicked', 'reviewed', 'expired'
    google_review_url TEXT,
    sent_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ
);

CREATE TABLE qm_reports (
    id UUID PRIMARY KEY,
    practice_id UUID REFERENCES practices(id),
    period_start DATE,
    period_end DATE,
    report_data JSONB,              -- aggregierte Daten
    pdf_url TEXT,                   -- S3-Link
    generated_at TIMESTAMPTZ
);

-- Indexes für Performance
CREATE INDEX idx_responses_practice_date ON responses(practice_id, created_at DESC);
CREATE INDEX idx_responses_nps ON responses(practice_id, nps_score);
CREATE INDEX idx_responses_sentiment ON responses(practice_id, sentiment_score);
```

---

## 6. Pricing-Strategie

### Vergleich am Markt

| Segment | Preisrange | Beispiele |
|---------|-----------|-----------|
| Kostenlos | 0 € | med2day (Lead-Gen), Formbricks (Open Source) |
| Einstieg | 29–49 €/Monat | Digitale Anamnese-Tools |
| Mittelfeld | 50–100 €/Monat | Blickwinkel.io, solvi-Produkte |
| Enterprise | 100–300 €/Monat | evasys, SayWay |

### Vorgeschlagenes Pricing

| Plan | Preis | Features |
|------|-------|----------|
| **Free** | 0 € | 1 Umfrage, 50 Antworten/Monat, Basis-Dashboard |
| **Starter** | 49 €/Monat | Unbegrenzte Umfragen, Google-Review-Routing, QR-Codes, Basis-Analytics |
| **Pro** | 99 €/Monat | + KI-Analyse, QM-Reports, SMS-Versand, Multi-Standort, Benchmark |
| **Enterprise** | 199 €/Monat | + API, PVS-Integration, White-Label, Priority Support, SLA |

**Jahres-Rabatt:** 2 Monate gratis bei Jahresabonnement.

---

## 7. Go-to-Market

### Phase 1: MVP (Monat 1–3)
- Survey Engine (QR-Code + Web)
- Basis-Dashboard (NPS, CSAT)
- Google-Review-Routing (einfach)
- 3 validierte Fragebogen-Templates (Zahnarzt, Hausarzt, Facharzt)

### Phase 2: Wachstum (Monat 4–6)
- KI-Sentiment-Analyse
- QM-Report-Generator (PDF)
- SMS/WhatsApp-Versand
- Tablet Kiosk-Modus

### Phase 3: Skalierung (Monat 7–12)
- PVS-Integrationen (Top 5: CGM, Medatixx, Turbomed, Dampsoft, Charly)
- Multi-Standort / MVZ-Support
- API für Drittanbieter
- Benchmark-Datenbank

### Vertriebskanäle
1. **Dental-Messen** (IDS Köln, id infotage dental)
2. **PVS-Partnerschaften** (als Zusatzmodul)
3. **Content Marketing** (Blog: „Patientenbefragung richtig machen", Podcast-Gastbeiträge)
4. **Dental-Influencer** (Instagram/LinkedIn in der Zahnarzt-Bubble)
5. **Steuerberater-Netzwerk** (die beraten Praxen zur Digitalisierung)

---

## 8. Risiken & Mitigierung

| Risiko | Wahrscheinlichkeit | Impact | Mitigierung |
|--------|-------------------|--------|-------------|
| Google ändert Places API / Review-Richtlinien | Mittel | Hoch | Multi-Plattform (Jameda, Doctolib) als Fallback |
| PVS-Hersteller bauen Feature selbst | Mittel | Hoch | Schneller Markteintritt, Netzwerkeffekte, bessere UX |
| DSGVO-Risiko bei Patientendaten | Niedrig | Sehr hoch | Privacy-by-Design, keine PII, Hosting in DE, Audit |
| Niedrige Adoption durch konservative Ärzte | Hoch | Mittel | Freemium-Modell, Partnerschaft mit Berufsverbänden |
| Nelly/Doctolib expandieren in Survey-Bereich | Mittel | Hoch | Spezialisierung auf Review-Routing + QM als Differenzierung |

---

## 9. Zusammenfassung

**Der Sweet Spot liegt in der Kombination aus drei Welten:**

```
┌─────────────────────┐
│  QM & Compliance    │  → Pflicht für jede Praxis (G-BA)
│  (Patientenbefragung)│  → „Must-have"
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Review-Management  │  → Google-Sichtbarkeit = Neupatientengewinnung
│  (Google/Jameda)    │  → „Revenue Driver"
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  KI-Insights        │  → Automatische Handlungsempfehlungen
│  (Sentiment, Trends)│  → „Wow-Faktor"
└─────────────────────┘
```

Die meisten Wettbewerber decken nur eine dieser Dimensionen ab. Ein Produkt, das alle drei nahtlos verbindet, hat eine starke Position im Markt.
