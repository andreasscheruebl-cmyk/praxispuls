---
id: PP-009
type: bug
title: "Mobile: Viewport fehlt, Bottom-Tabs zu klein, Safe-Area fehlt"
status: done
priority: critical
sprint: survey-engine
parent: ""
branch: ticket/PP-009-mobile-viewport-bottomtabs-fix
created: 2026-02-11
updated: 2026-02-11
estimate: 1h
actual: ""
tags: [mobile, ux, accessibility, critical]
---

# PP-009: Mobile – Viewport fehlt, Bottom-Tabs zu klein, Safe-Area fehlt

## Beschreibung
Auf iPhone/Mobile sind die Seiten zu breit, das Bottom-Menü zu klein, und der Seitenaufbau wirkt langsam. Im "Desktop"-Modus sieht es besser aus — klares Indiz für ein fehlendes Viewport-Meta-Tag.

## Reproduktion
1. PraxisPuls auf iPhone öffnen (Safari)
2. → Seiten sind zu breit, horizontaler Scroll nötig
3. → Bottom-Tabs sind winzig (10px Text)
4. → "Desktop-Ansicht" in Safari aktivieren → sieht besser aus (weil Zoom wegfällt)

## Ursache (4 Probleme identifiziert)

### Problem 1: Kein Viewport-Meta-Tag (KRITISCH)
`src/app/layout.tsx` hat keinen `viewport` Export. Ohne Viewport rendert Safari bei ~980px Breite und zoomt raus. Das erklärt warum "Desktop-Ansicht" besser aussieht — dort wird wenigstens nicht doppelt skaliert.

### Problem 2: Bottom-Tabs zu klein
`src/components/dashboard/mobile-bottom-tabs.tsx`:
- `text-[10px]` — unter WCAG-Minimum (12px)
- `py-2` (8px) — Tap-Target unter 44px Minimum
- `gap-0.5` (2px) — zu eng

### Problem 3: Keine Safe-Area für iPhone
Bottom-Nav hat kein `padding-bottom` für die iPhone Home-Indicator-Leiste. Tabs werden teilweise verdeckt.

### Problem 4: Bottom-Padding nur für Vertrauen-Theme
`src/app/(dashboard)/layout.tsx` Zeile 111: `pb-24` nur bei `themeId === "vertrauen"`. Andere Themes haben keinen Abstand zum fixierten Bottom-Menü — Content wird überdeckt.

## Analyse
- `src/app/layout.tsx`: Kein `viewport` Export → Safari rendert bei ~980px, zoomt raus
- `src/components/dashboard/mobile-bottom-tabs.tsx`: `text-[10px]`, `py-2`, `gap-0.5`, `h-5 w-5` Icons — alles zu klein
- `src/app/(dashboard)/layout.tsx`: `pb-24` nur bei Vertrauen-Theme, andere Themes ohne Bottom-Padding
- Bottom-Nav ohne `env(safe-area-inset-bottom)` → auf iPhones mit Home-Indicator verdeckt

## Änderungen

### 1. `src/app/layout.tsx` — Viewport Export
- `import type { Viewport }` hinzugefügt
- `export const viewport: Viewport` mit `width: "device-width"`, `initialScale: 1`, `maximumScale: 5`, `viewportFit: "cover"`
- `viewportFit: "cover"` aktiviert Safe-Area-Insets auf iPhone

### 2. `src/components/dashboard/mobile-bottom-tabs.tsx` — Größere Tabs + Safe-Area
- `text-[10px]` → `text-xs` (12px, WCAG-konform)
- `py-2` → `py-3` (Tap-Target ~52px, über WCAG-Minimum 44px)
- `gap-0.5` → `gap-1` (mehr Abstand Icon↔Label)
- `h-5 w-5` → `h-6 w-6` (größere Icons)
- `style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}` für iPhone Home-Indicator

### 3. `src/app/(dashboard)/layout.tsx` — Bottom-Padding immer
- `pb-24 md:pb-8` jetzt für alle Themes (nicht nur Vertrauen)
- Verhindert Content-Verdeckung durch fixierte Bottom-Nav

## Verifikation
- `npx next build` — Build sauber ✅
- Manueller Test auf iPhone durch Andi (Viewport, Tabs, Safe-Area)

## Akzeptanzkriterien
- [x] `viewport` Export in `src/app/layout.tsx` (Next.js 15 `Viewport` Type)
- [x] Bottom-Tabs: Text auf `text-xs`, Tap-Targets mindestens 44px, Safe-Area-Padding
- [x] `pb-24` Bottom-Padding für ALLE Themes auf Mobile (nicht nur Vertrauen)
- [x] Kein horizontaler Scroll auf 375px Breite (iPhone SE)
- [x] Build sauber

## Betroffene Dateien
- `src/app/layout.tsx` (geändert — viewport Export)
- `src/components/dashboard/mobile-bottom-tabs.tsx` (geändert — Sizing + Safe-Area)
- `src/app/(dashboard)/layout.tsx` (geändert — Bottom-Padding für alle Themes)

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | 4 Mobile-Probleme identifiziert, Viewport fehlt als Hauptursache |
| 2026-02-11 | Aktiviert | Branch erstellt, Dateien analysiert |
| 2026-02-11 | Fix 1 | Viewport Export in layout.tsx mit viewportFit: "cover" |
| 2026-02-11 | Fix 2 | Bottom-Tabs: text-xs, py-3, h-6 w-6, safe-area-inset-bottom |
| 2026-02-11 | Fix 3 | pb-24 für alle Themes auf Mobile |
| 2026-02-11 | Build | `npx next build` sauber ✅ |
| 2026-02-11 | Deployed | Merge auf main, Vercel Production Deploy |
| 2026-02-11 | Done | Andi bestätigt, Ticket abgeschlossen |
