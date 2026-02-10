# ============================================================
# TicketOps – Quick Setup (Windows PowerShell)
# Erstellt die komplette Ticket-Infrastruktur in < 5 Minuten
# ============================================================
# Usage: .\setup.ps1
# Requires: PowerShell 5.1+ (Windows) oder PowerShell 7+ (Cross-Platform)
# ============================================================

$ErrorActionPreference = "Stop"

# ── Farben-Helper ───────────────────────────────────────────
function Write-ColorLine($text, $color = "White") {
    Write-Host $text -ForegroundColor $color
}

Write-Host ""
Write-ColorLine "╔══════════════════════════════════════════════╗" Cyan
Write-ColorLine "║        TicketOps – Setup                     ║" Cyan
Write-ColorLine "║   Change Management für AI-Coding            ║" Cyan
Write-ColorLine "╚══════════════════════════════════════════════╝" Cyan
Write-Host ""

# ── Konfiguration ──────────────────────────────────────────
$ProjectPrefix = Read-Host "Projekt-Prefix (z.B. PP für PraxisPuls)"
if ([string]::IsNullOrWhiteSpace($ProjectPrefix)) { $ProjectPrefix = "PP" }
$ProjectPrefix = $ProjectPrefix.ToUpper()

$ProjectName = Read-Host "Projektname (z.B. PraxisPuls)"
if ([string]::IsNullOrWhiteSpace($ProjectName)) { $ProjectName = "MyProject" }

Write-Host ""
Write-ColorLine "▸ Erstelle Verzeichnisstruktur..." Yellow

# ── 1. Verzeichnisse erstellen ─────────────────────────────
$dirs = @(
    ".tickets/backlog",
    ".tickets/active",
    ".tickets/review",
    ".tickets/done",
    ".tickets/archive",
    ".tickets/templates",
    "scripts/git-hooks"
)
foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}
Set-Content -Path ".tickets/COUNTER.txt" -Value "001" -NoNewline
Write-ColorLine "  ✅ .tickets/ Struktur erstellt" Green

# ── 2. Projekt-Registry ───────────────────────────────────
$today = Get-Date -Format "yyyy-MM-dd"
$projectsJson = @"
{
  "projects": [
    {
      "id": "$ProjectPrefix",
      "name": "$ProjectName",
      "path": ".",
      "created": "$today"
    }
  ],
  "settings": {
    "default_project": "$ProjectPrefix",
    "auto_branch": true,
    "require_tests": true,
    "require_ticket_in_commit": true
  }
}
"@
Set-Content -Path ".tickets/projects.json" -Value $projectsJson -Encoding UTF8
Write-ColorLine "  ✅ projects.json erstellt" Green

# ── 3. Templates erstellen ─────────────────────────────────
Write-ColorLine "▸ Erstelle Ticket-Templates..." Yellow

# Alle Templates als Hashtable
$templates = @{}

$templates["feature"] = @'
---
id: ""
type: feature
title: ""
status: backlog
priority: medium
sprint: ""
parent: ""
branch: ""
created: ""
updated: ""
estimate: ""
actual: ""
tags: []
---

# {ID}: {TITLE}

## Beschreibung
<!-- Was soll implementiert werden? Warum? -->

## Akzeptanzkriterien
- [ ] Kriterium 1
- [ ] Kriterium 2
- [ ] Kriterium 3

## Technische Details
<!-- Betroffene Dateien, APIs, Datenmodell -->

## Test-Plan
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] Manueller Test

## Abhängigkeiten
<!-- Andere Tickets, externe APIs, etc. -->

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
'@

$templates["bug"] = @'
---
id: ""
type: bug
title: ""
status: backlog
priority: high
sprint: ""
parent: ""
branch: ""
created: ""
updated: ""
estimate: ""
actual: ""
tags: []
---

# {ID}: {TITLE}

## Fehlerbeschreibung
<!-- Was passiert? Was sollte stattdessen passieren? -->

## Reproduktion
1. Schritt 1
2. Schritt 2
3. → Fehler tritt auf

## Erwartetes Verhalten
<!-- Was ist das korrekte Verhalten? -->

## Tatsächliches Verhalten
<!-- Was passiert stattdessen? -->

## Umgebung
- Browser/OS:
- Version:
- Route/Seite:

## Fix-Strategie
<!-- Ansatz zur Behebung -->

## Akzeptanzkriterien
- [ ] Bug ist behoben
- [ ] Regression-Test geschrieben
- [ ] Kein Seiteneffekt auf andere Features

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
'@

$templates["task"] = @'
---
id: ""
type: task
title: ""
status: backlog
priority: medium
sprint: ""
parent: ""
branch: ""
created: ""
updated: ""
estimate: ""
actual: ""
tags: []
---

# {ID}: {TITLE}

## Beschreibung
<!-- Technische Aufgabe, kein User-facing Feature -->

## Schritte
- [ ] Schritt 1
- [ ] Schritt 2
- [ ] Schritt 3

## Akzeptanzkriterien
- [ ] Aufgabe erledigt
- [ ] Dokumentiert (falls nötig)

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
'@

$templates["research"] = @'
---
id: ""
type: research
title: ""
status: backlog
priority: medium
sprint: ""
parent: ""
branch: ""
created: ""
updated: ""
estimate: ""
actual: ""
tags: []
---

# {ID}: {TITLE}

## Fragestellung
<!-- Was soll recherchiert/evaluiert werden? -->

## Kontext
<!-- Warum ist das relevant? -->

## Recherche-Ergebnisse

### Option A:
- Pro:
- Contra:

### Option B:
- Pro:
- Contra:

## Empfehlung
<!-- Welche Option und warum? -->

## Quellen
-

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
'@

$templates["requirement"] = @'
---
id: ""
type: requirement
title: ""
status: backlog
priority: medium
sprint: ""
parent: ""
branch: ""
created: ""
updated: ""
estimate: ""
actual: ""
tags: []
---

# {ID}: {TITLE}

## User Story
> Als [Rolle] möchte ich [Funktion], damit [Nutzen].

## Beschreibung
<!-- Detaillierte Anforderung -->

## Akzeptanzkriterien
- [ ] Kriterium 1
- [ ] Kriterium 2

## Abgeleitete Tickets
- [ ] FEA-xxx:
- [ ] TSK-xxx:

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
'@

$templates["test"] = @'
---
id: ""
type: test
title: ""
status: backlog
priority: medium
sprint: ""
parent: ""
branch: ""
created: ""
updated: ""
estimate: ""
actual: ""
tags: []
---

# {ID}: {TITLE}

## Test-Ziel
<!-- Was wird getestet? -->

## Test-Fälle
- [ ] Test 1: Beschreibung → Erwartetes Ergebnis
- [ ] Test 2: Beschreibung → Erwartetes Ergebnis

## Ergebnisse
| Durchlauf | Datum | Bestanden | Fehlgeschlagen | Details |
|-----------|-------|-----------|----------------|---------|

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
'@

$templates["release"] = @'
---
id: ""
type: release
title: ""
status: backlog
priority: high
sprint: ""
parent: ""
branch: ""
created: ""
updated: ""
estimate: ""
actual: ""
tags: [release]
version: ""
---

# {ID}: {TITLE}

## Enthaltene Tickets
### Features
- [ ] FEA-xxx:

### Bug Fixes
- [ ] BUG-xxx:

## Checkliste
- [ ] Alle Tickets DONE
- [ ] Alle Tests grün
- [ ] TypeScript fehlerfrei
- [ ] CHANGELOG.md aktualisiert
- [ ] package.json Version aktualisiert
- [ ] Git Tag erstellt
- [ ] Deployment erfolgreich
- [ ] Smoke-Test auf Production

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
'@

$templates["docs"] = @'
---
id: ""
type: docs
title: ""
status: backlog
priority: low
sprint: ""
parent: ""
branch: ""
created: ""
updated: ""
estimate: ""
actual: ""
tags: [docs]
---

# {ID}: {TITLE}

## Was wird dokumentiert?

## Akzeptanzkriterien
- [ ] Dokumentation geschrieben
- [ ] Review durchgeführt

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
'@

$templates["refactor"] = @'
---
id: ""
type: refactor
title: ""
status: backlog
priority: medium
sprint: ""
parent: ""
branch: ""
created: ""
updated: ""
estimate: ""
actual: ""
tags: [refactor]
---

# {ID}: {TITLE}

## Motivation
<!-- Warum refactoren? -->

## Ist-Zustand

## Soll-Zustand

## Akzeptanzkriterien
- [ ] Refactoring durchgeführt
- [ ] Alle bestehenden Tests grün
- [ ] Keine Funktionsänderung

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
'@

$templates["chore"] = @'
---
id: ""
type: chore
title: ""
status: backlog
priority: low
sprint: ""
parent: ""
branch: ""
created: ""
updated: ""
estimate: ""
actual: ""
tags: [chore]
---

# {ID}: {TITLE}

## Beschreibung
<!-- DevOps, Config, Dependencies -->

## Schritte
- [ ] Schritt 1
- [ ] Schritt 2

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
'@

foreach ($key in $templates.Keys) {
    Set-Content -Path ".tickets/templates/$key.md" -Value $templates[$key] -Encoding UTF8
}
Write-ColorLine "  ✅ $($templates.Count) Templates erstellt" Green

# ── 4. Git Hooks erstellen ─────────────────────────────────
Write-ColorLine "▸ Erstelle Git Hooks..." Yellow

# Pre-Commit Hook (bash – Git für Windows nutzt bash auch unter Windows)
$preCommit = @'
#!/bin/bash
# TicketOps – Pre-Commit Hook

if git rev-parse -q --verify MERGE_HEAD > /dev/null 2>&1; then exit 0; fi

CODE_CHANGES=$(git diff --cached --name-only | grep -v "^\.tickets/" | grep -v "^CLAUDE\.md" | grep -v "^scripts/git-hooks/" | wc -l)
if [ "$CODE_CHANGES" -eq 0 ]; then exit 0; fi

BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null)

case "$BRANCH" in
    main|develop|release/*)
        echo "❌ Direkte Commits auf '$BRANCH' sind nicht erlaubt."
        echo "   Erstelle einen Ticket-Branch: ticket/{ID}-{slug}"
        echo "   Bypass (nur Notfall): git commit --no-verify"
        exit 1 ;;
esac

if [[ ! "$BRANCH" =~ ^ticket/[A-Z]+-[0-9]+ ]]; then
    echo "❌ Branch '$BRANCH' folgt nicht dem Ticket-Pattern."
    echo "   Erwartet: ticket/{ID}-{slug}"
    echo "   Bypass (nur Notfall): git commit --no-verify"
    exit 1
fi

TICKET_ID=$(echo "$BRANCH" | grep -oP '[A-Z]+-[0-9]+')
FOUND=$(find .tickets/active .tickets/review -name "${TICKET_ID}-*" 2>/dev/null | head -1)

if [ -z "$FOUND" ]; then
    echo "❌ Kein aktives Ticket '${TICKET_ID}' gefunden."
    echo "   Bypass (nur Notfall): git commit --no-verify"
    exit 1
fi

echo "✅ Ticket ${TICKET_ID} aktiv → Commit erlaubt"
exit 0
'@
Set-Content -Path "scripts/git-hooks/pre-commit" -Value $preCommit -Encoding UTF8 -NoNewline

# Commit-Message Hook
$commitMsg = @'
#!/bin/bash
# TicketOps – Commit-Message Hook

MSG_FILE=$1
MSG=$(head -1 "$MSG_FILE")

if echo "$MSG" | grep -qP "^Merge"; then exit 0; fi

PATTERN="^(feat|fix|chore|docs|refactor|test|perf|ci|style)\(.+\): .+ \[[A-Z]+-[0-9]+\]$"

if ! echo "$MSG" | grep -qP "$PATTERN"; then
    echo ""
    echo "❌ Commit-Message ungültig!"
    echo "   Format: type(scope): beschreibung [TICKET-ID]"
    echo "   Beispiel: feat(survey): add NPS component [PP-042]"
    echo "   Dein Commit: ${MSG}"
    echo "   Bypass: git commit --no-verify"
    exit 1
fi
exit 0
'@
Set-Content -Path "scripts/git-hooks/commit-msg" -Value $commitMsg -Encoding UTF8 -NoNewline

# Pre-Push Hook
$prePush = @'
#!/bin/bash
# TicketOps – Pre-Push Hook

BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null)
if [[ ! "$BRANCH" =~ ^ticket/ ]]; then exit 0; fi

echo "🧪 TicketOps Pre-Push Check..."

if [ -f "tsconfig.json" ]; then
    echo "▸ TypeScript Check..."
    npx tsc --noEmit 2>&1
    if [ $? -ne 0 ]; then
        echo "❌ TypeScript Fehler. Push abgebrochen."
        echo "   Bypass: git push --no-verify"
        exit 1
    fi
    echo "  ✅ TypeScript OK"
fi

if [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then
    echo "▸ Vitest..."
    npx vitest run --reporter=verbose 2>&1
    TEST_EXIT=$?
elif [ -f "jest.config.ts" ] || [ -f "jest.config.js" ]; then
    echo "▸ Jest..."
    npx jest --passWithNoTests 2>&1
    TEST_EXIT=$?
else
    echo "⚠️  Kein Test-Runner erkannt. Überspringe Tests."
    TEST_EXIT=0
fi

if [ $TEST_EXIT -ne 0 ]; then
    echo "❌ Tests fehlgeschlagen. Push abgebrochen."
    echo "   Bypass: git push --no-verify"
    exit 1
fi

echo "✅ Alle Checks bestanden"
exit 0
'@
Set-Content -Path "scripts/git-hooks/pre-push" -Value $prePush -Encoding UTF8 -NoNewline

Write-ColorLine "  ✅ 3 Git Hooks erstellt" Green

# ── 5. PowerShell CLI Scripts ──────────────────────────────
Write-ColorLine "▸ Erstelle PowerShell CLI Scripts..." Yellow

# ticket-new.ps1
$ticketNew = @'
# TicketOps – Neues Ticket erstellen
# Usage: .\scripts\ticket-new.ps1 -Type feature -Title "Survey Submit Endpoint" [-Priority high] [-Sprint "survey-engine"]
param(
    [Parameter(Mandatory)][ValidateSet("feature","bug","task","research","requirement","test","refactor","docs","chore","release")]
    [string]$Type,
    [Parameter(Mandatory)][string]$Title,
    [ValidateSet("critical","high","medium","low")]
    [string]$Priority = "medium",
    [string]$Sprint = ""
)

$ErrorActionPreference = "Stop"

# Projekt-Prefix
$projectsJson = Get-Content ".tickets/projects.json" -Raw | ConvertFrom-Json
$ProjectPrefix = $projectsJson.settings.default_project

# Counter
$counterFile = ".tickets/COUNTER.txt"
$counter = [int](Get-Content $counterFile -ErrorAction SilentlyContinue)
if ($counter -eq 0) { $counter = 1 }
$ticketNum = "{0:D3}" -f $counter
$next = "{0:D3}" -f ($counter + 1)
Set-Content -Path $counterFile -Value $next -NoNewline

$ticketId = "$ProjectPrefix-$ticketNum"

# Slug
$slug = ($Title.ToLower() -replace '[^a-z0-9]','-' -replace '-+','-' -replace '^-|-$','').Substring(0, [Math]::Min(50, ($Title.ToLower() -replace '[^a-z0-9]','-' -replace '-+','-' -replace '^-|-$','').Length))
$filename = ".tickets/backlog/$ticketId-$slug.md"
$branch = "ticket/$ticketId-$slug"
$today = Get-Date -Format "yyyy-MM-dd"

# Template kopieren
$templateFile = ".tickets/templates/$Type.md"
if (-not (Test-Path $templateFile)) { $templateFile = ".tickets/templates/feature.md" }

$content = Get-Content $templateFile -Raw

# Frontmatter ersetzen
$content = $content -replace '(?m)^id:.*', "id: $ticketId"
$content = $content -replace '(?m)^type:.*', "type: $Type"
$content = $content -replace '(?m)^title:.*', "title: `"$Title`""
$content = $content -replace '(?m)^priority:.*', "priority: $Priority"
$content = $content -replace '(?m)^sprint:.*', "sprint: $Sprint"
$content = $content -replace '(?m)^branch:.*', "branch: $branch"
$content = $content -replace '(?m)^created:.*', "created: $today"
$content = $content -replace '(?m)^updated:.*', "updated: $today"
$content = $content -replace '\{ID\}', $ticketId
$content = $content -replace '\{TITLE\}', $Title

# Log-Eintrag
$content += "`n| $today | Erstellt | Typ: $Type, Prio: $Priority |"

Set-Content -Path $filename -Value $content -Encoding UTF8

Write-Host ""
Write-Host "✅ Ticket erstellt: $ticketId" -ForegroundColor Green
Write-Host "   Datei:     $filename"
Write-Host "   Branch:    $branch"
Write-Host "   Typ:       $Type"
Write-Host "   Priorität: $Priority"
Write-Host ""
Write-Host "Nächster Schritt: .\scripts\ticket-pick.ps1 -TicketId $ticketId"
'@
Set-Content -Path "scripts/ticket-new.ps1" -Value $ticketNew -Encoding UTF8

# ticket-pick.ps1
$ticketPick = @'
# TicketOps – Ticket aktivieren + Branch erstellen
# Usage: .\scripts\ticket-pick.ps1 -TicketId PP-042
param(
    [Parameter(Mandatory)][string]$TicketId
)

$ErrorActionPreference = "Stop"

$ticketFile = Get-ChildItem ".tickets/backlog" -Filter "$TicketId-*" -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $ticketFile) {
    Write-Host "❌ Ticket $TicketId nicht im Backlog gefunden." -ForegroundColor Red
    Write-Host "   Vorhandene:"
    Get-ChildItem ".tickets/backlog" -Filter "*.md" | ForEach-Object { Write-Host "   $($_.Name)" }
    exit 1
}

$content = Get-Content $ticketFile.FullName -Raw
$branch = if ($content -match '(?m)^branch:\s*(.+)$') { $Matches[1].Trim() } else { "ticket/$TicketId" }
$today = Get-Date -Format "yyyy-MM-dd"

# Verschieben
$destPath = ".tickets/active/$($ticketFile.Name)"
Move-Item $ticketFile.FullName $destPath

# Status updaten
$content = Get-Content $destPath -Raw
$content = $content -replace '(?m)^status:.*', 'status: active'
$content = $content -replace '(?m)^updated:.*', "updated: $today"
$content += "`n| $today | Aktiviert | Branch: $branch |"
Set-Content -Path $destPath -Value $content -Encoding UTF8

# Branch erstellen
if (Test-Path ".git") {
    try {
        git checkout -b $branch 2>$null
    } catch {
        git checkout $branch 2>$null
    }
    Write-Host "✅ Ticket $TicketId aktiviert → Branch: $branch" -ForegroundColor Green
} else {
    Write-Host "✅ Ticket $TicketId aktiviert (kein Git-Repo, Branch manuell erstellen: $branch)" -ForegroundColor Yellow
}
'@
Set-Content -Path "scripts/ticket-pick.ps1" -Value $ticketPick -Encoding UTF8

# ticket-done.ps1
$ticketDone = @'
# TicketOps – Ticket abschließen
# Usage: .\scripts\ticket-done.ps1 -TicketId PP-042
param(
    [Parameter(Mandatory)][string]$TicketId
)

$ticketFile = Get-ChildItem ".tickets/active",".tickets/review" -Filter "$TicketId-*" -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $ticketFile) {
    Write-Host "❌ Ticket $TicketId nicht in active/ oder review/ gefunden." -ForegroundColor Red
    exit 1
}

$today = Get-Date -Format "yyyy-MM-dd"
$destPath = ".tickets/done/$($ticketFile.Name)"
Move-Item $ticketFile.FullName $destPath

$content = Get-Content $destPath -Raw
$content = $content -replace '(?m)^status:.*', 'status: done'
$content = $content -replace '(?m)^updated:.*', "updated: $today"
$content += "`n| $today | Abgeschlossen | Moved to done/ |"
Set-Content -Path $destPath -Value $content -Encoding UTF8

Write-Host "✅ Ticket $TicketId abgeschlossen → .tickets/done/$($ticketFile.Name)" -ForegroundColor Green
'@
Set-Content -Path "scripts/ticket-done.ps1" -Value $ticketDone -Encoding UTF8

# ticket-list.ps1
$ticketList = @'
# TicketOps – Tickets auflisten
# Usage: .\scripts\ticket-list.ps1 [-Status active] (backlog|active|review|done|all)
param(
    [ValidateSet("backlog","active","review","done","all")]
    [string]$Status = "active"
)

function Show-Tickets($dir, $label) {
    $files = Get-ChildItem $dir -Filter "*.md" -ErrorAction SilentlyContinue
    if (-not $files -or $files.Count -eq 0) {
        Write-Host "   (keine)" -ForegroundColor DarkGray
        return
    }
    foreach ($f in $files) {
        $content = Get-Content $f.FullName -Raw
        $id    = if ($content -match '(?m)^id:\s*(.+)$')       { $Matches[1].Trim() } else { "?" }
        $title = if ($content -match '(?m)^title:\s*"?(.+?)"?$') { $Matches[1].Trim() } else { "?" }
        $prio  = if ($content -match '(?m)^priority:\s*(.+)$')  { $Matches[1].Trim() } else { "?" }
        $type  = if ($content -match '(?m)^type:\s*(.+)$')      { $Matches[1].Trim() } else { "?" }
        Write-Host ("   {0,-10} [{1,-10}] ({2,-8}) {3}" -f $id, $type, $prio, $title)
    }
}

Write-Host ""
Write-Host "📋 TicketOps – Tickets ($Status)" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════"
Write-Host ""

if ($Status -eq "all") {
    foreach ($s in "backlog","active","review","done") {
        $icon = switch($s) { "backlog"{"📥"} "active"{"🔄"} "review"{"👀"} "done"{"✅"} }
        Write-Host "── $icon $($s.ToUpper()) ──"
        Show-Tickets ".tickets/$s" $s
        Write-Host ""
    }
} else {
    Show-Tickets ".tickets/$Status" $Status
}
'@
Set-Content -Path "scripts/ticket-list.ps1" -Value $ticketList -Encoding UTF8

# ticket-board.ps1
$ticketBoard = @'
# TicketOps – Board generieren
# Usage: .\scripts\ticket-board.ps1

$output = ".tickets/BOARD.md"
$lines = @()
$lines += "# 📋 Ticket Board"
$lines += "> Auto-generiert. Nicht manuell editieren."
$lines += "> Aktualisieren: ``.\scripts\ticket-board.ps1``"
$lines += ""

foreach ($status in "backlog","active","review","done") {
    $icon = switch($status) { "backlog"{"📥 Backlog"} "active"{"🔄 Active"} "review"{"👀 Review"} "done"{"✅ Done"} }
    $lines += "## $icon"
    $lines += ""

    $files = Get-ChildItem ".tickets/$status" -Filter "*.md" -ErrorAction SilentlyContinue
    if (-not $files -or $files.Count -eq 0) {
        $lines += "_(keine)_"
    } else {
        foreach ($f in $files) {
            $c = Get-Content $f.FullName -Raw
            $id     = if ($c -match '(?m)^id:\s*(.+)$')         { $Matches[1].Trim() } else { "?" }
            $title  = if ($c -match '(?m)^title:\s*"?(.+?)"?$') { $Matches[1].Trim() } else { "?" }
            $prio   = if ($c -match '(?m)^priority:\s*(.+)$')   { $Matches[1].Trim() } else { "?" }
            $type   = if ($c -match '(?m)^type:\s*(.+)$')       { $Matches[1].Trim() } else { "?" }
            $branch = if ($c -match '(?m)^branch:\s*(.+)$')     { $Matches[1].Trim() } else { "" }

            if ($status -eq "active" -and $branch) {
                $lines += "- **$id** [$type] $title → ``$branch`` _($prio)_"
            } else {
                $lines += "- **$id** [$type] $title _($prio)_"
            }
        }
    }
    $lines += ""
}

$lines += "---"
$lines += "_Aktualisiert: $(Get-Date -Format 'yyyy-MM-dd HH:mm')_"

Set-Content -Path $output -Value ($lines -join "`n") -Encoding UTF8
Write-Host "✅ Board aktualisiert: $output" -ForegroundColor Green
'@
Set-Content -Path "scripts/ticket-board.ps1" -Value $ticketBoard -Encoding UTF8

# ticket-stats.ps1
$ticketStats = @'
# TicketOps – Statistiken
# Usage: .\scripts\ticket-stats.ps1

function Count-Tickets($dir) {
    (Get-ChildItem $dir -Filter "*.md" -ErrorAction SilentlyContinue).Count
}

$backlog = Count-Tickets ".tickets/backlog"
$active  = Count-Tickets ".tickets/active"
$review  = Count-Tickets ".tickets/review"
$done    = Count-Tickets ".tickets/done"
$archive = (Get-ChildItem ".tickets/archive" -Filter "*.md" -Recurse -ErrorAction SilentlyContinue).Count
$total   = $backlog + $active + $review + $done + $archive

Write-Host ""
Write-Host "📊 TicketOps – Statistiken" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════"
Write-Host ""
Write-Host "  📥 Backlog:  $backlog"
Write-Host "  🔄 Active:   $active"
Write-Host "  👀 Review:   $review"
Write-Host "  ✅ Done:     $done"
Write-Host "  📦 Archive:  $archive"
Write-Host "  ─────────────────"
Write-Host "  Σ  Total:    $total"
Write-Host ""

Write-Host "  Nach Typ:"
foreach ($type in "feature","bug","task","research","requirement","test","refactor","docs","chore","release") {
    $count = (Get-ChildItem ".tickets/backlog",".tickets/active",".tickets/review",".tickets/done" -Filter "*.md" -ErrorAction SilentlyContinue |
        Where-Object { (Get-Content $_.FullName -Raw) -match "(?m)^type:\s*$type" }).Count
    if ($count -gt 0) {
        Write-Host ("    {0,-12} {1}" -f $type, $count)
    }
}
Write-Host ""
'@
Set-Content -Path "scripts/ticket-stats.ps1" -Value $ticketStats -Encoding UTF8

# ticket-log.ps1
$ticketLog = @'
# TicketOps – Log-Eintrag hinzufügen
# Usage: .\scripts\ticket-log.ps1 -TicketId PP-042 -Message "Zod Schema implementiert"
param(
    [Parameter(Mandatory)][string]$TicketId,
    [Parameter(Mandatory)][string]$Message
)

$ticketFile = Get-ChildItem ".tickets" -Filter "$TicketId-*" -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch "archive" } | Select-Object -First 1

if (-not $ticketFile) {
    Write-Host "❌ Ticket $TicketId nicht gefunden." -ForegroundColor Red
    exit 1
}

$today = Get-Date -Format "yyyy-MM-dd"
$content = Get-Content $ticketFile.FullName -Raw
$content = $content -replace '(?m)^updated:.*', "updated: $today"
$content += "`n| $today | Update | $Message |"
Set-Content -Path $ticketFile.FullName -Value $content -Encoding UTF8

Write-Host "✅ Log-Eintrag zu $TicketId hinzugefügt" -ForegroundColor Green
'@
Set-Content -Path "scripts/ticket-log.ps1" -Value $ticketLog -Encoding UTF8

# setup-hooks.ps1
$setupHooks = @'
# TicketOps – Git Hooks installieren (Windows)
# Usage: .\scripts\setup-hooks.ps1

if (-not (Test-Path ".git")) {
    Write-Host "❌ Kein Git-Repository. Bitte zuerst 'git init' ausführen." -ForegroundColor Red
    exit 1
}

$hooksDir = ".git/hooks"
$scriptsDir = "scripts/git-hooks"

Write-Host "📎 Installing TicketOps git hooks..."

foreach ($hook in "pre-commit","commit-msg","pre-push") {
    $src = Join-Path $scriptsDir $hook
    if (Test-Path $src) {
        Copy-Item $src (Join-Path $hooksDir $hook) -Force
        Write-Host "  ✅ $hook" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 Git Hooks aktiv! Ticket-Pflicht ist jetzt enforced." -ForegroundColor Green
'@
Set-Content -Path "scripts/setup-hooks.ps1" -Value $setupHooks -Encoding UTF8

Write-ColorLine "  ✅ 7 PowerShell CLI Scripts erstellt" Green

# ── 6. Board generieren ───────────────────────────────────
& ".\scripts\ticket-board.ps1" | Out-Null
Write-ColorLine "  ✅ BOARD.md generiert" Green

# ── 7. Git Hooks installieren ──────────────────────────────
Write-ColorLine "▸ Installiere Git Hooks..." Yellow
if (Test-Path ".git") {
    & ".\scripts\setup-hooks.ps1"
} else {
    Write-ColorLine "  ⚠️  Kein Git-Repo. Nach 'git init' ausführen: .\scripts\setup-hooks.ps1" Yellow
}

# ── 8. Fertig ──────────────────────────────────────────────
Write-Host ""
Write-ColorLine "╔══════════════════════════════════════════════╗" Green
Write-ColorLine "║   🎉 TicketOps Setup abgeschlossen!          ║" Green
Write-ColorLine "╚══════════════════════════════════════════════╝" Green
Write-Host ""
Write-Host "  Projekt:    $ProjectName ($ProjectPrefix)"
Write-Host '  Tickets:    .tickets'
Write-Host '  Scripts:    scripts'
Write-Host '  Hooks:      scripts\git-hooks'
Write-Host ''
Write-Host '  Erste Schritte:'
Write-Host '    1. .\scripts\ticket-new.ps1 -Type feature -Title MeinFeature'
$pickCmd = '    2. .\scripts\ticket-pick.ps1 -TicketId {0}-001' -f $ProjectPrefix
Write-Host $pickCmd
Write-Host '    3. Code schreiben + committen'
$doneCmd = '    4. .\scripts\ticket-done.ps1 -TicketId {0}-001' -f $ProjectPrefix
Write-Host $doneCmd
Write-Host ''
Write-Host '  Board anzeigen:  .\scripts\ticket-board.ps1'
Write-Host '  Tickets listen:  .\scripts\ticket-list.ps1 -Status all'
Write-Host '  Statistiken:     .\scripts\ticket-stats.ps1'
Write-Host ''
