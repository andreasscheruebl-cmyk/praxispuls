---
id: PP-008
type: bug
title: "Ticket-Dashboard: Beschreibung und Sektionen nicht sichtbar"
status: review
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

## Analyse
- `parseTicket()` (Zeile 59-107): Extrahiert Frontmatter, Beschreibung und Akzeptanzkriterien
- `\Z` in Regex ist Ruby/Perl — in JS matcht es Literal `Z`, nie End-of-String → Beschreibung und Kriterien werden nicht gefunden
- Nur `desc` und `criteria` werden geparst — alle anderen Sektionen (Analyse, Änderungen, Verifikation, Log) werden ignoriert
- Modal (`openEdit()`, Zeile 619-637): Zeigt nur Edit-Formular (Titel, Typ, Prio, Sprint, Beschreibung-Textarea, Kriterien) — kein Read-Only-Bereich für restliche Sektionen

## Änderungen

### 1. Regex-Fix (`\Z` → `$`)
- `descMatch` Regex: `\Z` → `$`, zusätzlich `Fehlerbeschreibung` als Alternative zu `Beschreibung`
- `critMatch` Regex: `\Z` → `$`

### 2. Body-Extraktion
- Neues `body` Feld in `parseTicket()`: Gesamter Markdown-Inhalt nach Frontmatter
- Regex: `/^---\s*\n[\s\S]*?\n---\s*\n([\s\S]*)$/`
- `body` wird in API-Response mitgeliefert

### 3. Detail-Ansicht im Modal
- `renderMarkdown(md)` — Einfacher Markdown→HTML-Converter für:
  - Headlines (`##`, `###`)
  - Listen (`-`, `*`)
  - Checkbox-Listen (`- [x]`, `- [ ]`)
  - Nummerierte Listen
  - Tabellen (`| col | col |`)
  - Code-Blocks (``` ```)
  - Inline: `**bold**`, `` `code` ``
- `inlineMd(text)` — Inline-Formatting mit HTML-Escaping
- `getDetailSections(ticket)` — Extrahiert Sektionen aus `body`, überspringt Beschreibung/Akzeptanzkriterien (da editierbar)
- `<div id="detailView">` im Modal unterhalb der form-actions
- CSS-Styles für `.detail-view` (Tabellen, Code, Checkboxen, Headlines)

### 4. Modal-Anpassungen
- `max-width: 560px` → `700px` (Platz für Detail-Inhalt)
- `max-height: calc(100vh - 80px)` + `overflow-y: auto` (scrollbar bei langen Tickets)
- `openEdit()` befüllt Detail-View via `getDetailSections()` + `renderMarkdown()`
- `resetForm()` versteckt Detail-View bei neuem Ticket

## Verifikation
- `node -c .tickets/ticket-server.js` — Syntax OK ✅
- Regex-Test mit PP-008 Ticket: DESC found ✅, CRIT count 5 ✅, BODY 10 Sektionen ✅
- `npx next build` — Build sauber ✅ (ticket-server.js ist nicht Teil des Next.js-Builds)
- Manueller Test: Server starten → Ticket klicken → Beschreibung + alle Sektionen prüfen (durch Andi)

## Akzeptanzkriterien
- [x] Beschreibung wird korrekt im Modal angezeigt (Regex-Fix)
- [x] Akzeptanzkriterien werden korrekt geparst (Regex-Fix)
- [x] Ticket-Detail zeigt alle Sektionen (Analyse, Änderungen, Verifikation etc.)
- [x] Log-Tabelle ist lesbar
- [x] Bestehende Edit-Funktionalität (Titel, Typ, Prio, Sprint, Beschreibung, Kriterien) bleibt unverändert

## Betroffene Dateien
- `.tickets/ticket-server.js` (geändert — parseTicket, CSS, Modal-HTML, JS-Funktionen)

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | 3 Bugs in parseTicket() und Modal identifiziert |
| 2026-02-11 | Aktiviert | Status backlog → active, Branch erstellt |
| 2026-02-11 | Bug 1 gefixt | `\Z` → `$` in descMatch + critMatch Regex |
| 2026-02-11 | Bug 2 gefixt | Body-Extraktion nach Frontmatter, `body` Feld in Return |
| 2026-02-11 | Bug 3 gefixt | renderMarkdown(), getDetailSections(), Detail-View im Modal |
| 2026-02-11 | Verifiziert | Syntax OK, Regex-Test bestanden, Next.js Build sauber |
