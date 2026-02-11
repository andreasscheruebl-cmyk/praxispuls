---
id: PP-010
type: research
title: "Research: Mobile UX Patterns 2026 – Bottom-Nav, Scroll-Verhalten, Touch-Optimierung"
status: done
priority: medium
sprint: survey-engine
parent: PP-009
branch: ""
created: 2026-02-11
updated: 2026-02-11
estimate: 1h
actual: ""
tags: [mobile, ux, research, design-patterns]
---

# PP-010: Research – Mobile UX Patterns 2026 vs. PraxisPuls

## Fragestellung
Wie verhalten sich moderne Mobile-Apps/SaaS 2026 bei Navigation, Scroll-Verhalten und Touch-Interaktion? Wie schneidet PraxisPuls im Vergleich ab?

Konkret zu klären:
1. **Bottom-Nav Scroll-Verhalten:** Hide-on-scroll-down / Show-on-scroll-up — Standard oder Anti-Pattern? Wann sinnvoll?
2. **Bottom-Nav Design:** Größe, Spacing, Iconography, Labels, Active-State, Badges
3. **Mobile Header:** Sticky vs. Scroll-away? Höhe? Hamburger vs. Bottom-Nav?
4. **Touch-Targets:** Aktuelle Empfehlungen (Apple HIG 2026, Material Design 3, WCAG 2.2)
5. **Content-Layout:** Padding, Font-Sizes, Card-Design auf Mobile
6. **Performance-Patterns:** Skeleton Screens, Optimistic UI, Lazy Loading
7. **Gestures:** Pull-to-refresh, Swipe-Navigation, Long-Press — wo sinnvoll?

## Vergleich mit PraxisPuls
Aktueller Stand nach PP-009:
- Bottom-Tabs mit 5 Items, fixiert, `text-xs`, `py-3`, `h-6` Icons
- Kein Hide-on-scroll
- Mobile Header mit Logo + Avatar + Logout
- Safe-Area-Padding für iPhone
- Kein Skeleton Loading, kein Pull-to-refresh

## Recherche-Quellen
- Apple Human Interface Guidelines (HIG) 2026
- Material Design 3 (Google)
- WCAG 2.2 Mobile Accessibility
- Vergleich: Doctolib, Jameda, Dr. Smile, Treatwell (Branchen-Referenz)
- Vergleich: Linear, Notion, Stripe Dashboard (SaaS-Referenz)

## Recherche-Ergebnisse

### 1. Bottom-Nav Scroll-Verhalten: NICHT verstecken

**Apple HIG:** Tab-Bars sollen immer sichtbar bleiben. Verstecken erzeugt "Navigation Uncertainty". Ausnahme nur bei immersiven Inhalten (Kamera, Mediaplayer).

**Material Design 3:** Hide-on-scroll ist *erlaubt* aber nicht Default. Nur für Content-lastige Screens (News-Feed, Artikel-Liste).

**Praxis:** Keines der 6 analysierten Referenz-Apps versteckt die Bottom-Nav:

| App | Tabs | Hide on Scroll | Höhe | Labels |
|-----|------|----------------|------|--------|
| Doctolib | 4 | Nein | ~56px | Immer |
| Linear | 5 | Nein | ~54px | Immer |
| Notion | 5 | Nein | ~56px | Immer |
| Stripe Dashboard | 4 | Nein | ~56px | Immer |
| Treatwell | 4 | Nein | ~56px | Immer |
| Jameda | 4-5 | Nein | ~56px | Immer |

**Empfehlung für PraxisPuls:** Bottom-Nav NICHT verstecken. PraxisPuls ist ein Dashboard — User wechseln häufig zwischen Tabs. Persistente Nav ist der Standard.

### 2. Touch-Target-Größen

| Standard | Minimum |
|----------|---------|
| WCAG 2.2 AA (2.5.8) | 24 × 24 CSS px |
| WCAG 2.2 AAA (2.5.5) | 44 × 44 CSS px |
| Apple HIG | 44 × 44 pt |
| Material Design 3 | 48 × 48 dp |
| **Best Practice** | **48 × 48 px** |

### 3. Vergleich PraxisPuls vs. Standards

| Eigenschaft | PraxisPuls (nach PP-009) | Empfohlen | Status |
|-------------|--------------------------|-----------|--------|
| Nav-Höhe | ~52px (`py-3` + Icon + Label) | 56-64px | ⚠️ etwas niedrig |
| Icon-Größe | 24px (`h-6 w-6`) | 24px | ✅ |
| Label-Size | 12px (`text-xs`) | 11-12px | ✅ |
| Label-Sichtbarkeit | Immer | Immer | ✅ |
| Touch-Target | ~52px hoch, full-width | 48px min | ✅ |
| Active-State | Farbe (text-primary) | Filled Icon + Farbe + Pill | ⚠️ nur Farbe |
| Safe-Area | `env(safe-area-inset-bottom)` | ✅ | ✅ |
| Hide-on-scroll | Nein | Nein | ✅ |
| Tabs Anzahl | 5 | 4-5 | ✅ |
| Icon-Style Toggle | Nein (gleich) | Outline→Filled | ⚠️ fehlt |

### 4. Mobile Header

**Trend:** Smart-Sticky — Header versteckt sich beim Runterscrollen, erscheint sofort beim Hochscrollen. Maximiert Content-Fläche auf kleinen Screens.

- Linear, Notion, Stripe nutzen dieses Pattern für den Header (nicht für die Bottom-Nav!)
- Empfohlene Höhe: 48-56px (aktuell `h-16` = 64px — etwas hoch)
- Umsetzung: `useScrollDirection()` Hook + `transition-transform` + `-translate-y-full`

**Empfehlung:** Für PraxisPuls optional — Dashboard-Seiten sind nicht so lang dass der Header stört. Kann später nachgerüstet werden.

### 5. Content-Layout auf Mobile

| Element | Aktuell | Empfohlen |
|---------|---------|-----------|
| Card-Padding | `p-6` (24px) | `p-4 sm:p-6` (16px mobile) |
| KPI-Grid | 1-spaltig auf Mobile | `grid-cols-2 gap-3` auch auf Mobile |
| KPI-Zahlen | `text-2xl font-bold` | + `tabular-nums` (Zahlen springen nicht) |
| Card-Spacing | `space-y-8` | `space-y-4 sm:space-y-6` (enger auf Mobile) |
| Bottom-Padding | `pb-24` (96px) | `pb-20` (80px) reicht aus |

### 6. Performance-Patterns (Priorität für wahrgenommene Geschwindigkeit)

#### Skeleton Screens (ESSENTIAL)
- `loading.tsx` in jeder Dashboard-Route → Next.js nutzt sie automatisch als Suspense-Fallback
- `animate-pulse` Platzhalter statt Spinner → User sieht sofort Seitenstruktur
- **Aufwand:** 1-2h für alle Dashboard-Routes

#### Suspense Streaming (HIGH IMPACT)
- Dashboard-Sections in `<Suspense>` wrappen statt `Promise.all` abwarten
- Seiten-Shell erscheint sofort, Daten streamen einzeln rein
- **Aufwand:** 1h

#### Lazy-Load Recharts (HIGH IMPACT)
- `next/dynamic` für Chart-Komponenten → Recharts-Bundle blockiert nicht den Initial Paint
- **Aufwand:** 30min

#### Revalidate-Caching
- `export const revalidate = 60` auf Dashboard-Pages → gecachte Daten sofort, Refresh im Hintergrund
- Zahnarztpraxis-Dashboard ist nicht realtime-kritisch
- **Aufwand:** 15min

### 7. Gestures + Micro-Interactions

| Pattern | Empfehlung | Begründung |
|---------|------------|------------|
| Pull-to-refresh | Optional | Einfacher "Aktualisieren"-Button reicht für Dashboard |
| Swipe-to-dismiss | Skip (v2) | Hoher Aufwand, geringer Payoff für MVP |
| Long-Press | Skip | Konflikte mit Browser-Verhalten |
| `active:scale-[0.98]` auf Tabs/Cards | Ja (Quick Win) | Taktiles Feedback, 1 Zeile CSS |
| `tabular-nums` auf KPI-Zahlen | Ja (Quick Win) | Zahlen springen nicht beim Update |
| Animated Number Count-up | Nice-to-Have | KPI-Zahlen zählen beim Laden hoch |
| Dark Mode | Skip (v2) | Zielgruppe: Büro tagsüber, kein Bedarf |

### 8. Verbesserungsvorschläge — Prioritäts-Matrix

#### Vor Launch (PP-011 Ticket)

| Maßnahme | Aufwand | Impact |
|----------|---------|--------|
| `loading.tsx` Skeleton Screens für Dashboard-Routes | 1-2h | Sehr hoch |
| Suspense Streaming für Dashboard-Sections | 1h | Hoch |
| Lazy-Load Recharts via `next/dynamic` | 30min | Hoch |
| Nav-Höhe auf 64px (`h-16`) | 15min | Mittel |
| Active-State: Outline→Filled Icon-Toggle | 30min | Mittel |
| `active:scale-[0.98]` auf Tabs + Cards | 15min | Mittel |
| `tabular-nums` auf KPI-Zahlen | 10min | Gering (Polish) |
| Card-Padding `p-4 sm:p-6` auf Mobile | 30min | Mittel |

#### Nach Launch (v1.1)

| Maßnahme | Aufwand | Impact |
|----------|---------|--------|
| Smart-Sticky Header (hide on scroll-down) | 1-2h | Mittel |
| Animated Number Count-up | 1h | Gering (Polish) |
| `revalidate` Caching | 15min | Hoch |
| Pull-to-refresh Button | 30min | Gering |

#### Skip (v2+)

| Maßnahme | Grund |
|----------|-------|
| Dark Mode | Zielgruppe nutzt App tagsüber im Büro |
| Haptic Feedback | Unzuverlässig im Web |
| Swipe-to-dismiss | Hoher Aufwand für MVP |
| Long-Press Menus | Browser-Konflikte |

### 5. Empfohlene Bottom-Nav Spezifikation

```
Höhe:             64px Content + env(safe-area-inset-bottom)
Background:       white, border-top 1px #E5E7EB
Tabs:             4-5 Items
Touch-Target:     min 48×48px (natürlich ~78×64px bei 5 Tabs/390px Screen)
Icons:            24px, Outline (inaktiv) → Filled (aktiv)
Icon-Farbe:       Aktiv: brand primary, Inaktiv: gray-500
Label:            11-12px, immer sichtbar
Active-Indicator: Farbiges Icon + fetter Label (oder Pill hinter Icon)
Scroll-Verhalten: IMMER sichtbar (nie verstecken)
Safe-Area:        padding-bottom: env(safe-area-inset-bottom)
```

## Akzeptanzkriterien
- [x] Bottom-Nav Scroll-Verhalten: Empfehlung mit Begründung
- [x] Touch-Target-Größen: aktuelle Standards zusammengefasst
- [x] Vergleich PraxisPuls vs. 3+ Referenz-Apps (Tabelle)
- [x] Konkrete Verbesserungsvorschläge priorisiert (quick wins vs. nice-to-have)
- [x] Implementierungs-Ticket(s) als Ergebnis vorgeschlagen

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Andi fragt nach Hide-on-scroll + generellem Mobile UX Review |
| 2026-02-11 | Recherche | Apple HIG, Material Design 3, WCAG 2.2, 6 Referenz-Apps analysiert |
| 2026-02-11 | Ergebnis | Hide-on-scroll NICHT empfohlen, 4 Quick Wins + 4 Nice-to-Haves identifiziert |
| 2026-02-11 | Ergänzt | Performance-Patterns, Content-Layout, Gestures, Priority-Matrix hinzugefügt |
| 2026-02-11 | Tickets | PP-011 (Pre-Launch) + PP-012 (Post-Launch) erstellt |
| 2026-02-11 | Done | Andi bestätigt, Research abgeschlossen |
