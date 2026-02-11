---
id: PP-011
type: feature
title: "Mobile UX Polish: Skeleton Screens, Lazy Loading, Bottom-Nav Feinschliff"
status: backlog
priority: high
sprint: survey-engine
parent: PP-010
branch: ticket/PP-011-mobile-ux-polish-pre-launch
created: 2026-02-11
updated: 2026-02-11
estimate: 4h
actual: ""
tags: [mobile, ux, performance, accessibility]
---

# PP-011: Mobile UX Polish – Vor Launch

## Beschreibung
Basierend auf PP-010 Research: Performance-Patterns und Bottom-Nav-Feinschliff implementieren, die vor Launch den größten Impact haben. Fokus auf wahrgenommene Geschwindigkeit (Skeleton Screens, Suspense Streaming, Lazy Loading) und Bottom-Nav-Polish (Höhe, Active-State, Feedback).

## Änderungen

### 1. Skeleton Screens (`loading.tsx`)
- `src/app/(dashboard)/dashboard/loading.tsx` — KPI-Grid + Chart-Platzhalter
- `src/app/(dashboard)/dashboard/responses/loading.tsx` — Response-Liste
- `src/app/(dashboard)/dashboard/alerts/loading.tsx` — Alert-Liste
- `src/app/(dashboard)/dashboard/qr-codes/loading.tsx` — QR-Bereich
- `src/app/(dashboard)/dashboard/settings/loading.tsx` — Settings
- Alle mit `animate-pulse` Platzhaltern, kein Spinner

### 2. Suspense Streaming für Dashboard
- Dashboard-Page: KPI-Cards, NPS-Chart, Review-Funnel in separate `<Suspense>` Boundaries wrappen
- Seiten-Shell (Titel, Layout) erscheint sofort, Daten streamen einzeln

### 3. Lazy-Load Recharts
- `next/dynamic` für `NpsChart` und `ReviewFunnel`
- Skeleton-Fallback während Chart-Bundle lädt
- Recharts blockiert nicht mehr den Initial Paint

### 4. Bottom-Nav: Höhe 64px
- `mobile-bottom-tabs.tsx`: Container-Höhe auf `h-16` (64px)
- Konsistent mit Doctolib, Notion, Stripe (alle ~56-64px)

### 5. Bottom-Nav: Active-State mit Filled/Outline Icons
- Lucide bietet für viele Icons Filled-Varianten (oder Stroke-Width-Trick)
- Aktiver Tab: Icon filled/bold + `font-semibold` Label
- Inaktiver Tab: Icon outline + `font-normal` Label

### 6. Tap-Feedback auf interaktive Elemente
- `active:scale-[0.98] transition-transform duration-100` auf Bottom-Tabs
- Gleiches Pattern auf Dashboard-Cards die klickbar sind

### 7. KPI-Zahlen: `tabular-nums`
- `tabular-nums` Klasse auf alle KPI-Zahlenwerte
- Verhindert Layout-Shift wenn sich Zahlen ändern

### 8. Card-Padding Mobile
- Dashboard-Cards: `p-4 sm:p-6` statt durchgehend `p-6`
- Mehr Content-Platz auf kleinen Screens

## Akzeptanzkriterien
- [ ] Skeleton Screens in mindestens 3 Dashboard-Routes
- [ ] Dashboard-Sections mit Suspense Streaming (KPIs, Charts separat)
- [ ] Recharts lazy-loaded via `next/dynamic`
- [ ] Bottom-Nav 64px Höhe + Active-State mit Icon-Wechsel
- [ ] `active:scale-[0.98]` auf Tabs
- [ ] `tabular-nums` auf KPI-Zahlen
- [ ] Card-Padding responsive (`p-4 sm:p-6`)
- [ ] Build sauber

## Betroffene Dateien
- `src/app/(dashboard)/dashboard/loading.tsx` (neu)
- `src/app/(dashboard)/dashboard/responses/loading.tsx` (neu)
- `src/app/(dashboard)/dashboard/alerts/loading.tsx` (neu)
- `src/app/(dashboard)/dashboard/qr-codes/loading.tsx` (neu)
- `src/app/(dashboard)/dashboard/settings/loading.tsx` (neu)
- `src/app/(dashboard)/dashboard/page.tsx` (geändert — Suspense)
- `src/components/dashboard/mobile-bottom-tabs.tsx` (geändert — Höhe, Active-State, Feedback)
- `src/components/dashboard/nps-chart.tsx` oder Wrapper (geändert — lazy load)
- `src/components/dashboard/review-funnel.tsx` oder Wrapper (geändert — lazy load)

## Abhängigkeiten
- PP-010 (Research — done)
- PP-009 (Viewport + Bottom-Tabs Basis — done)

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | 8 Maßnahmen aus PP-010 Research priorisiert |
