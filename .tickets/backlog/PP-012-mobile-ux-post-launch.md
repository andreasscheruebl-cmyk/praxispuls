---
id: PP-012
type: feature
title: "Mobile UX v1.1: Smart-Sticky Header, Animated Numbers, Caching"
status: backlog
priority: low
sprint: ""
parent: PP-010
branch: ticket/PP-012-mobile-ux-post-launch
created: 2026-02-11
updated: 2026-02-11
estimate: 3h
actual: ""
tags: [mobile, ux, performance, polish]
---

# PP-012: Mobile UX v1.1 – Nach Launch

## Beschreibung
Verbesserungen aus PP-010 Research die nach dem Launch umgesetzt werden. Niedrigere Priorität, aber sorgen für ein poliertes Produkt-Gefühl.

## Änderungen

### 1. Smart-Sticky Header (1-2h)
- `useScrollDirection()` Hook: trackt Scroll-Richtung
- Mobile Header: `sticky top-0` + `transition-transform duration-200`
- Scroll runter → Header gleitet nach oben weg (`-translate-y-full`)
- Scroll hoch → Header erscheint sofort wieder
- Mehr Content-Fläche auf kleinen Screens
- **Nur Header** — Bottom-Nav bleibt immer sichtbar (Apple HIG)

### 2. Animated Number Count-up (1h)
- `AnimatedNumber` Komponente mit `requestAnimationFrame`
- KPI-Zahlen zählen beim Laden von 0 zum Zielwert (600ms)
- `tabular-nums` für stabiles Layout während Animation
- Gibt dem Dashboard ein professionelles, lebendiges Gefühl

### 3. Revalidate-Caching (15min)
- `export const revalidate = 60` auf Dashboard-Page
- Gecachte Daten werden sofort angezeigt, Refresh im Hintergrund
- Zahnarztpraxis-Dashboard ist nicht realtime-kritisch
- Navigation zwischen Pages fühlt sich instant an

### 4. Refresh-Button (30min)
- Kleiner "Aktualisieren"-Button/Icon im Dashboard-Header
- `router.refresh()` bei Klick
- Einfacher als Pull-to-refresh, kein Library nötig
- Visuelles Feedback (Rotation-Animation auf Icon)

## Akzeptanzkriterien
- [ ] Header versteckt sich beim Runterscrollen, erscheint beim Hochscrollen
- [ ] KPI-Zahlen animieren von 0 zum Zielwert beim Laden
- [ ] Dashboard-Daten werden aus Cache serviert (< 100ms Navigation)
- [ ] Refresh-Button aktualisiert Dashboard-Daten
- [ ] Build sauber

## Betroffene Dateien
- `src/hooks/use-scroll-direction.ts` (neu)
- `src/app/(dashboard)/layout.tsx` (geändert — Smart-Sticky Header)
- `src/components/dashboard/animated-number.tsx` (neu)
- `src/app/(dashboard)/dashboard/page.tsx` (geändert — AnimatedNumber, revalidate)

## Abhängigkeiten
- PP-011 (Pre-Launch Polish — sollte zuerst done sein)

## Explizit NICHT in diesem Ticket
- Dark Mode (v2 — Zielgruppe nutzt App tagsüber)
- Haptic Feedback (unzuverlässig im Web)
- Swipe-to-dismiss (hoher Aufwand)
- Long-Press Menus (Browser-Konflikte)

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | 4 Post-Launch-Maßnahmen aus PP-010 Research |
