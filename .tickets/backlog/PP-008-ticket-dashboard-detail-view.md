---
id: PP-008
type: bug
title: "Ticket-Dashboard: Beschreibung und Sektionen nicht sichtbar"
status: backlog
priority: high
sprint: survey-engine
parent: ""
branch: ticket/PP-008-ticket-dashboard-detail-view
created: 2026-02-11
updated: 2026-02-11
estimate: 1.5h
actual: ""
tags: [dx, ticket-server, ui]
---

# PP-008: Ticket-Dashboard – Beschreibung und Sektionen nicht sichtbar

## Fehlerbeschreibung
Im TicketOps Board (`ticket-server.js`) zeigt das Ticket-Detail-Modal unter "Beschreibung" nichts an. Weitere Sektionen (Analyse, Änderungen, Verifikation, Log-Tabelle) werden komplett ignoriert — weder geparst noch angezeigt.

## Reproduktion
1. `node .tickets/ticket-server.js` starten
2. Auf ein Ticket klicken (z.B. PP-001)
3. → Beschreibung-Textarea ist leer
4. → Analyse, Änderungen, Verifikation, Log sind nirgends sichtbar

## Erwartetes Verhalten
- Beschreibung wird korrekt angezeigt
- Alle Ticket-Sektionen (Analyse, Lösungsansatz, Änderungen, Verifikation, Log etc.) sind im Detail sichtbar
- Log-Tabelle ist lesbar

## Tatsächliches Verhalten
- Beschreibung ist leer (Regex-Bug)
- Alle Sektionen außer Akzeptanzkriterien werden ignoriert

## Ursache (3 Bugs identifiziert)

### Bug 1: `\Z` ist kein gültiger JS-Regex-Anchor
`parseTicket()` Zeile 71-74:
```js
const descMatch = content.match(/## Beschreibung\s*\n([\s\S]*?)(\n## |\n---|\Z)/);
```
`\Z` ist Ruby/Perl, nicht JavaScript. In JS matcht es als Literal `Z` und nie als End-of-String. Muss `$` sein.

Gleicher Bug in `critMatch` Zeile 78-80:
```js
const critMatch = content.match(/## Akzeptanzkriterien\s*\n([\s\S]*?)(\n## |\n---|\Z)/);
```

### Bug 2: Nur "Beschreibung" wird geparst
Tickets haben jetzt viele Sektionen (Analyse, Lösungsansatz, Änderungen, Betroffene Dateien, Verifikation, Log). Diese werden weder geparst noch angezeigt.

### Bug 3: Modal zeigt nur Textarea für Beschreibung
Das Edit-Modal hat nur ein `<textarea>` für `desc`. Es gibt keinen Read-Only-Bereich für die restlichen Sektionen. Das ist OK für den Edit-Modus, aber es fehlt eine Detail-Ansicht.

## Fix-Strategie

### Minimal-Fix (Bugs 1+2+3)
1. **Regex fixen:** `\Z` → `$` in beiden Regex-Ausdrücken
2. **Vollständigen Markdown-Body parsen:** Alles nach dem Frontmatter (`---`) als `body` speichern
3. **Detail-Ansicht im Modal:** Unterhalb des Edit-Formulars den restlichen Markdown-Inhalt als formatiertes HTML rendern (einfacher Markdown→HTML-Converter für Headlines, Listen, Tabellen, Code-Blocks)
4. **Log-Tabelle sichtbar:** Markdown-Tabelle parsen und als HTML `<table>` rendern

## Akzeptanzkriterien
- [ ] Beschreibung wird korrekt im Modal angezeigt (Regex-Fix)
- [ ] Akzeptanzkriterien werden korrekt geparst (Regex-Fix)
- [ ] Ticket-Detail zeigt alle Sektionen (Analyse, Änderungen, Verifikation etc.)
- [ ] Log-Tabelle ist lesbar
- [ ] Bestehende Edit-Funktionalität (Titel, Typ, Prio, Sprint, Beschreibung, Kriterien) bleibt unverändert

## Betroffene Dateien
- `.tickets/ticket-server.js` (geändert)

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | 3 Bugs in parseTicket() und Modal identifiziert |
