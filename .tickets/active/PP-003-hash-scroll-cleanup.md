---
id: PP-003
type: fix
title: "Hash aus URL entfernen nach Anker-Scroll auf Landingpage"
status: active
priority: medium
sprint: launch-prep
branch: ticket/PP-003-hash-scroll-cleanup
created: 2026-02-10
updated: 2026-02-10
---

# PP-003: Hash aus URL entfernen nach Anker-Scroll auf Landingpage

## Fehlerbeschreibung
Wenn man auf der Landingpage "So funktioniert's" klickt, wird `#so-funktionierts` in die URL geschrieben. Scrollt man danach nach oben und refresht, springt der Browser zum Anker – das wirkt wie ein Flicker.

## Akzeptanzkriterien
- [x] Klick auf "So funktioniert's" scrollt smooth zum Abschnitt
- [x] Nach dem Scroll wird `#so-funktionierts` aus der URL entfernt
- [x] Refresh lädt immer die Seite von oben
- [x] Kein Flicker bei Reload

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-10 | Ticket erstellt | Ursache: Browser scroll-to-hash bei Reload |
| 2026-02-10 | Fix implementiert | ScrollLink-Komponente erstellt, Hash wird nach smooth-scroll entfernt |
| 2026-02-10 | Build geprüft | Build sauber |
