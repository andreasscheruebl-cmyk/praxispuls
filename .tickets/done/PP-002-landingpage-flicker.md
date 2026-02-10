---
id: PP-002
type: bug
title: "Landingpage Flicker: Funktionsweise-Abschnitt kurz sichtbar"
status: done
priority: high
sprint: launch-prep
parent: ""
branch: ticket/PP-002-landingpage-flicker
created: 2026-02-10
updated: 2026-02-10
estimate: 0.5h
actual: ""
tags: [ux, cls, font-loading]
---

# PP-002: Landingpage Flicker – Funktionsweise-Abschnitt kurz sichtbar

## Fehlerbeschreibung
Beim Laden der Landingpage wird kurz der "So funktioniert PraxisPuls"-Abschnitt angezeigt, bevor die Seite korrekt rendert. Ursache: Playfair Display Font-Swap verursacht CLS – Hero-Überschrift ist mit Fallback-Font kleiner, nachfolgende Section rutscht kurz in den Viewport.

## Analyse
- **Ist-Zustand:** Hero-Section in `src/app/(marketing)/page.tsx` hat `py-20 md:py-32` als einzige Höhe. Wenn Playfair Display nachgeladen wird (font-swap), ändert sich die Texthöhe → CLS.
- **Ursache:** Fallback-Font (Georgia) rendert die H1 kleiner als Playfair Display. Nachfolgende Section ("So funktioniert PraxisPuls") rutscht kurz in den sichtbaren Bereich, bevor der Font-Swap die Hero-Section vergrößert.
- **Ansatz:** Mindesthöhe auf Hero-Section setzen, die unabhängig vom Font genug Platz reserviert.

## Lösungsansatz
`min-h-[60vh] md:min-h-[80vh]` auf die Hero-Section + `flex items-center` damit der Content bei mehr Platz zentriert bleibt. Einfachste Lösung, kein JavaScript nötig.

## Änderungen

### `src/app/(marketing)/page.tsx`
- Hero `<section>`: `py-20 md:py-32` → `flex min-h-[60vh] items-center py-20 md:min-h-[80vh] md:py-32`
- Garantiert genug Platz für den Hero-Bereich unabhängig von Font-Loading-State

## Betroffene Dateien
- `src/app/(marketing)/page.tsx`

## Verifikation
- Build sauber (next build ✅)
- Manueller Test: Seite laden mit leerem Cache → kein Flicker der Funktionsweise-Section
- Mobile + Desktop responsive

## Reproduktion
1. Landingpage `/` im Browser öffnen (Cache leeren)
2. → "So funktioniert PraxisPuls"-Section flickert kurz im Viewport

## Erwartetes Verhalten
Kein sichtbarer Layout-Shift. Hero nimmt sofort genug Platz ein, nachfolgende Sections sind nie kurz sichtbar.

## Tatsächliches Verhalten
Font-Swap von Georgia → Playfair Display verursacht Layout-Shift. Hero-Bereich wächst nach Font-Load, "Funktionsweise"-Section wird kurz angezeigt und dann nach unten geschoben.

## Umgebung
- Browser/OS: Alle (Chrome, Firefox, Safari)
- Route/Seite: `/` (Marketing Landingpage)

## Fix-Strategie
- `min-h-[80vh]` auf Hero-Section → garantiert genug Platz unabhängig von Font-Loading
- Responsive: `min-h-[60vh] md:min-h-[80vh]` für Mobile/Desktop
- Flexbox centering damit Content bei mehr Platz zentriert bleibt

## Akzeptanzkriterien
- [x] Hero-Section hat Mindesthöhe, die Font-Swap-CLS verhindert
- [x] Funktionsweise-Abschnitt ist beim Laden nie kurz sichtbar
- [x] Mobile + Desktop responsive
- [x] Build bleibt sauber

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-10 | Ticket erstellt | Analyse: Font-Swap CLS als Ursache identifiziert |
| 2026-02-10 | Analyse | Hero-Section in `src/app/(marketing)/page.tsx` hat keine Mindesthöhe, Font-Swap verursacht CLS |
| 2026-02-10 | Fix implementiert | `min-h-[60vh] md:min-h-[80vh]` + `flex items-center` auf Hero-Section in page.tsx |
| 2026-02-10 | Build geprüft | `next build` sauber ✅ |
| 2026-02-10 | Commit | `c5172a5` (Teil des TicketOps-Commits) |
| 2026-02-10 | Done | Alle Akzeptanzkriterien erfüllt ✅ |
