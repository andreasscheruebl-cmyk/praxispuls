---
id: PP-003
type: fix
title: "Hash aus URL entfernen nach Anker-Scroll auf Landingpage"
status: done
priority: medium
sprint: launch-prep
branch: ticket/PP-003-hash-scroll-cleanup
created: 2026-02-10
updated: 2026-02-10
---

# PP-003: Hash aus URL entfernen nach Anker-Scroll auf Landingpage

## Fehlerbeschreibung
Wenn man auf der Landingpage "So funktioniert's" klickt, wird `#so-funktionierts` in die URL geschrieben. Scrollt man danach nach oben und refresht, springt der Browser zum Anker – das wirkt wie ein Flicker.

## Analyse
- **Ist-Zustand:** "So funktioniert's"-Button ist ein `<Link href="#so-funktionierts">` in `src/app/(marketing)/page.tsx`. Browser setzt Hash in URL → bei Reload springt er zum Anker.
- **Ursache:** Standard-Browser-Verhalten bei Hash-Links: URL enthält `#so-funktionierts`, Reload löst scroll-to-hash aus.
- **Ansatz:** Custom `ScrollLink`-Komponente die smooth scrollt und danach den Hash per `history.replaceState()` entfernt.

## Lösungsansatz
Neue Client-Komponente `ScrollLink` erstellen die:
1. `document.getElementById(targetId).scrollIntoView({ behavior: "smooth" })` aufruft
2. Danach `history.replaceState(null, "", window.location.pathname)` — Hash wird aus URL entfernt
3. Als Button mit `variant="outline"` gerendert (gleicher Look wie vorher)

## Änderungen

### `src/components/marketing/scroll-link.tsx` (NEU)
- Client-Komponente mit `targetId` und `children` Props
- `Button variant="outline" size="lg"` als Wrapper
- `onClick`: `scrollIntoView({ behavior: "smooth" })` + `history.replaceState()` zum Hash-Entfernen

### `src/app/(marketing)/page.tsx`
- Import von `ScrollLink` hinzugefügt
- "So funktioniert's"-Button: `<Button asChild><Link href="#so-funktionierts">` → `<ScrollLink targetId="so-funktionierts">`

## Betroffene Dateien
- `src/components/marketing/scroll-link.tsx` (neu erstellt)
- `src/app/(marketing)/page.tsx` (geändert)

## Verifikation
- Build sauber (next build ✅)
- Manueller Test: Klick auf "So funktioniert's" → smooth scroll, kein Hash in URL
- Manueller Test: Refresh nach Scroll → Seite lädt von oben, kein Flicker

## Akzeptanzkriterien
- [x] Klick auf "So funktioniert's" scrollt smooth zum Abschnitt
- [x] Nach dem Scroll wird `#so-funktionierts` aus der URL entfernt
- [x] Refresh lädt immer die Seite von oben
- [x] Kein Flicker bei Reload

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-10 | Ticket erstellt | Ursache: Browser scroll-to-hash bei Reload |
| 2026-02-10 | Analyse | Link-Element in page.tsx identifiziert, Standard-Hash-Verhalten als Ursache bestätigt |
| 2026-02-10 | Fix implementiert | `ScrollLink`-Komponente erstellt (`src/components/marketing/scroll-link.tsx`), page.tsx angepasst |
| 2026-02-10 | Build geprüft | `next build` sauber ✅ |
| 2026-02-10 | Commit | `236715a` fix(marketing): remove URL hash after anchor scroll to prevent flicker on reload [PP-003] |
| 2026-02-10 | Done | Alle Akzeptanzkriterien erfüllt ✅ |
