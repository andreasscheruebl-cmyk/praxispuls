---
id: PP-002
type: bug
title: "Landingpage Flicker: Funktionsweise-Abschnitt kurz sichtbar"
status: active
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
| 2026-02-10 | Fix implementiert | `min-h-[60vh] md:min-h-[80vh]` + `flex items-center` auf Hero-Section |
| 2026-02-10 | Build geprüft | Build sauber ✅ |
