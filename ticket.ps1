<#
.SYNOPSIS
    TicketOps CLI - Einheitlicher Ticket-Befehl
.DESCRIPTION
    Usage: .\ticket.ps1 <command> [arguments]
.EXAMPLE
    .\ticket.ps1 new feature "Survey Submit Endpoint"
    .\ticket.ps1 pick PP-001
    .\ticket.ps1 list
    .\ticket.ps1 done PP-001
#>

param(
    [Parameter(Position=0)]
    [string]$Command,

    [Parameter(Position=1, ValueFromRemainingArguments)]
    [string[]]$CmdArgs
)

$ErrorActionPreference = "Stop"

# ── Farben ──────────────────────────────────────────────────
function Write-OK($msg)   { Write-Host $msg -ForegroundColor Green }
function Write-Warn($msg) { Write-Host $msg -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host $msg -ForegroundColor Red }
function Write-Info($msg) { Write-Host $msg -ForegroundColor Cyan }

# ── Helpers ─────────────────────────────────────────────────
function Get-ProjectPrefix {
    $json = Get-Content ".tickets/projects.json" -Raw | ConvertFrom-Json
    return $json.settings.default_project
}

function Get-NextCounter {
    $file = ".tickets/COUNTER.txt"
    $counter = [int](Get-Content $file -ErrorAction SilentlyContinue)
    if ($counter -eq 0) { $counter = 1 }
    $num = "{0:D3}" -f $counter
    $next = "{0:D3}" -f ($counter + 1)
    Set-Content -Path $file -Value $next -NoNewline
    return $num
}

function Make-Slug($text) {
    $s = $text.ToLower() -replace '[^a-z0-9]','-' -replace '-+','-' -replace '^-|-$',''
    return $s.Substring(0, [Math]::Min(50, $s.Length))
}

function Get-Today { return Get-Date -Format "yyyy-MM-dd" }

function Find-Ticket($id, [string[]]$dirs) {
    foreach ($dir in $dirs) {
        $found = Get-ChildItem $dir -Filter "$id-*" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) { return $found }
    }
    return $null
}

function Read-Field($content, $field) {
    if ($content -match "(?m)^${field}:\s*`"?(.+?)`"?$") {
        return $Matches[1].Trim()
    }
    return ""
}

function Show-Tickets($dir) {
    $files = Get-ChildItem $dir -Filter "*.md" -ErrorAction SilentlyContinue
    if (-not $files -or $files.Count -eq 0) {
        Write-Host "   (keine)" -ForegroundColor DarkGray
        return
    }
    foreach ($f in $files) {
        $c = Get-Content $f.FullName -Raw
        $id    = Read-Field $c "id"
        $title = Read-Field $c "title"
        $prio  = Read-Field $c "priority"
        $type  = Read-Field $c "type"
        $sprint = Read-Field $c "sprint"
        $branch = Read-Field $c "branch"

        $line = "   {0,-10} [{1,-10}] ({2,-8}) {3}" -f $id, $type, $prio, $title
        if ($sprint) { $line += "  #$sprint" }
        Write-Host $line
    }
}

# ── Commands ────────────────────────────────────────────────

function Cmd-New {
    if ($CmdArgs.Count -lt 2) {
        Write-Err "Usage: ticket new <type> `"<title>`" [priority] [sprint]"
        Write-Host ""
        Write-Host "  Types:    feature, bug, task, research, requirement, test, refactor, docs, chore, release"
        Write-Host "  Priority: critical, high, medium, low (default: medium)"
        Write-Host "  Sprint:   foundation, survey-engine, dashboard, qr-onboarding, payments-polish, launch-prep"
        Write-Host ""
        Write-Host "  Beispiele:"
        Write-Host "    ticket new feature `"Survey Submit Endpoint`""
        Write-Host "    ticket new bug `"NPS falsch berechnet`" high"
        Write-Host "    ticket new task `"Drizzle Setup`" medium foundation"
        return
    }

    $type = $CmdArgs[0]
    $title = $CmdArgs[1]
    $priority = if ($CmdArgs.Count -ge 3) { $CmdArgs[2] } else { "medium" }
    $sprint = if ($CmdArgs.Count -ge 4) { $CmdArgs[3] } else { "" }

    $validTypes = @("feature","bug","task","research","requirement","test","refactor","docs","chore","release")
    if ($type -notin $validTypes) {
        Write-Err "Unbekannter Typ: $type"
        Write-Host "  Erlaubt: $($validTypes -join ', ')"
        return
    }

    if ($type -eq "bug" -and $CmdArgs.Count -lt 3) { $priority = "high" }

    $prefix = Get-ProjectPrefix
    $num = Get-NextCounter
    $id = "$prefix-$num"
    $slug = Make-Slug $title
    $branch = "ticket/$id-$slug"
    $today = Get-Today
    $filename = ".tickets/backlog/$id-$slug.md"

    $templateFile = ".tickets/templates/$type.md"
    if (-not (Test-Path $templateFile)) { $templateFile = ".tickets/templates/feature.md" }

    $content = Get-Content $templateFile -Raw
    $content = $content -replace '(?m)^id:.*', "id: $id"
    $content = $content -replace '(?m)^type:.*', "type: $type"
    $content = $content -replace '(?m)^title:.*', "title: `"$title`""
    $content = $content -replace '(?m)^priority:.*', "priority: $priority"
    $content = $content -replace '(?m)^sprint:.*', "sprint: $sprint"
    $content = $content -replace '(?m)^branch:.*', "branch: $branch"
    $content = $content -replace '(?m)^created:.*', "created: $today"
    $content = $content -replace '(?m)^updated:.*', "updated: $today"
    $content = $content -replace '\{ID\}', $id
    $content = $content -replace '\{TITLE\}', $title
    $content += "`r`n| $today | Erstellt | Typ: $type, Prio: $priority |"

    Set-Content -Path $filename -Value $content -Encoding UTF8

    Write-Host ""
    Write-OK "Ticket erstellt: $id"
    Write-Host "   Titel:     $title"
    Write-Host "   Typ:       $type"
    Write-Host "   Prio:      $priority"
    Write-Host "   Branch:    $branch"
    Write-Host "   Datei:     $filename"
    if ($sprint) { Write-Host "   Sprint:    $sprint" }
    Write-Host ""
    Write-Host "   Aktivieren: ticket pick $id"
}

function Cmd-Pick {
    if ($CmdArgs.Count -lt 1) { Write-Err "Usage: ticket pick <TICKET-ID>"; return }

    $id = $CmdArgs[0].ToUpper()
    $ticket = Find-Ticket $id @(".tickets/backlog")

    if (-not $ticket) {
        Write-Err "Ticket $id nicht im Backlog gefunden."
        $alt = Find-Ticket $id @(".tickets/active",".tickets/review",".tickets/done")
        if ($alt) { Write-Warn "   Gefunden in: $($alt.Directory.Name)/" }
        return
    }

    $today = Get-Today
    $dest = ".tickets/active/$($ticket.Name)"
    Move-Item $ticket.FullName $dest

    $content = Get-Content $dest -Raw
    $content = $content -replace '(?m)^status:.*', 'status: active'
    $content = $content -replace '(?m)^updated:.*', "updated: $today"
    $branch = Read-Field $content "branch"
    $content += "`r`n| $today | Aktiviert | Branch: $branch |"
    Set-Content -Path $dest -Value $content -Encoding UTF8

    if (Test-Path ".git") {
        try { git checkout -b $branch 2>$null }
        catch { git checkout $branch 2>$null }
    }

    Write-Host ""
    Write-OK "Ticket $id aktiviert"
    Write-Host "   Branch: $branch"
}

function Cmd-Done {
    if ($CmdArgs.Count -lt 1) { Write-Err "Usage: ticket done <TICKET-ID>"; return }

    $id = $CmdArgs[0].ToUpper()
    $ticket = Find-Ticket $id @(".tickets/active",".tickets/review")

    if (-not $ticket) {
        Write-Err "Ticket $id nicht in active/ oder review/ gefunden."
        return
    }

    $today = Get-Today
    $dest = ".tickets/done/$($ticket.Name)"
    Move-Item $ticket.FullName $dest

    $content = Get-Content $dest -Raw
    $content = $content -replace '(?m)^status:.*', 'status: done'
    $content = $content -replace '(?m)^updated:.*', "updated: $today"
    $content += "`r`n| $today | Abgeschlossen | Moved to done/ |"
    Set-Content -Path $dest -Value $content -Encoding UTF8

    Write-OK "Ticket $id abgeschlossen"
}

function Cmd-List {
    $status = "active"
    $filterSprint = ""

    for ($i=0; $i -lt $CmdArgs.Count; $i++) {
        switch ($CmdArgs[$i]) {
            "--status" { $status = $CmdArgs[++$i] }
            "--sprint" { $filterSprint = $CmdArgs[++$i] }
            "all"      { $status = "all" }
            "active"   { $status = "active" }
            "backlog"  { $status = "backlog" }
            "review"   { $status = "review" }
            "done"     { $status = "done" }
        }
    }

    Write-Host ""
    Write-Info "Tickets ($status)"
    Write-Host "--------------------------------------"

    $statuses = if ($status -eq "all") { @("backlog","active","review","done") } else { @($status) }

    foreach ($s in $statuses) {
        if ($status -eq "all") {
            $icon = switch($s) { "backlog"{"BACKLOG"} "active"{"ACTIVE"} "review"{"REVIEW"} "done"{"DONE"} }
            Write-Host ""
            Write-Info "  $icon"
        }

        $files = Get-ChildItem ".tickets/$s" -Filter "*.md" -ErrorAction SilentlyContinue
        $shown = 0

        if ($files) {
            foreach ($f in $files) {
                $c = Get-Content $f.FullName -Raw
                if ($filterSprint) {
                    $ticketSprint = Read-Field $c "sprint"
                    if ($ticketSprint -ne $filterSprint) { continue }
                }
                $shown++
                $id    = Read-Field $c "id"
                $title = Read-Field $c "title"
                $prio  = Read-Field $c "priority"
                $type  = Read-Field $c "type"
                Write-Host ("   {0,-10} [{1,-10}] ({2,-8}) {3}" -f $id, $type, $prio, $title)
            }
        }

        if ($shown -eq 0) { Write-Host "   (keine)" -ForegroundColor DarkGray }
    }
    Write-Host ""
}

function Cmd-Board {
    # --visual flag opens HTML board in browser
    foreach ($a in $CmdArgs) {
        if ($a -eq "--visual" -or $a -eq "-v") {
            $vScript = Join-Path $PSScriptRoot "scripts/ticket-board-visual.ps1"
            if (-not (Test-Path $vScript)) {
                $vScript = Join-Path $PSScriptRoot "ticket-board-visual.ps1"
            }
            if (Test-Path $vScript) {
                & $vScript
                return
            }
            Write-Err "ticket-board-visual.ps1 nicht gefunden."
            Write-Host "  Erwartet in: scripts/ oder Projekt-Root"
            return
        }
    }

    $output = ".tickets/BOARD.md"
    $lines = @()
    $lines += "# Ticket Board"
    $lines += "> Auto-generiert am $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    $lines += ""

    foreach ($s in "backlog","active","review","done") {
        $icon = switch($s) { "backlog"{"BACKLOG"} "active"{"ACTIVE"} "review"{"REVIEW"} "done"{"DONE"} }
        $lines += "## $icon"
        $lines += ""

        $files = Get-ChildItem ".tickets/$s" -Filter "*.md" -ErrorAction SilentlyContinue
        if (-not $files -or $files.Count -eq 0) {
            $lines += "_(keine)_"
        } else {
            foreach ($f in $files) {
                $c = Get-Content $f.FullName -Raw
                $id     = Read-Field $c "id"
                $title  = Read-Field $c "title"
                $prio   = Read-Field $c "priority"
                $type   = Read-Field $c "type"
                $branch = Read-Field $c "branch"

                if ($s -eq "active" -and $branch) {
                    $lines += "- **$id** [$type] $title ``$branch`` _($prio)_"
                } else {
                    $lines += "- **$id** [$type] $title _($prio)_"
                }
            }
        }
        $lines += ""
    }

    Set-Content -Path $output -Value ($lines -join "`r`n") -Encoding UTF8
    Write-OK "Board generiert: $output"

    foreach ($s in "backlog","active","review","done") {
        $icon = switch($s) { "backlog"{"BACKLOG"} "active"{"ACTIVE"} "review"{"REVIEW"} "done"{"DONE"} }
        Write-Info "`n  $icon"
        Show-Tickets ".tickets/$s"
    }
    Write-Host ""
}

function Cmd-Log {
    if ($CmdArgs.Count -lt 2) { Write-Err "Usage: ticket log <TICKET-ID> `"<message>`""; return }

    $id = $CmdArgs[0].ToUpper()
    $msg = $CmdArgs[1]

    $ticket = Find-Ticket $id @(".tickets/backlog",".tickets/active",".tickets/review",".tickets/done")
    if (-not $ticket) { Write-Err "Ticket $id nicht gefunden."; return }

    $today = Get-Today
    $content = Get-Content $ticket.FullName -Raw
    $content = $content -replace '(?m)^updated:.*', "updated: $today"
    $content += "`r`n| $today | Update | $msg |"
    Set-Content -Path $ticket.FullName -Value $content -Encoding UTF8

    Write-OK "Log zu ${id}: ${msg}"
}

function Cmd-Stats {
    function Count-In($dir) { (Get-ChildItem $dir -Filter "*.md" -ErrorAction SilentlyContinue).Count }

    $b = Count-In ".tickets/backlog"
    $a = Count-In ".tickets/active"
    $r = Count-In ".tickets/review"
    $d = Count-In ".tickets/done"
    $ar = (Get-ChildItem ".tickets/archive" -Filter "*.md" -Recurse -ErrorAction SilentlyContinue).Count
    $total = $b + $a + $r + $d + $ar

    Write-Host ""
    Write-Info "Statistiken"
    Write-Host "--------------------------------------"
    Write-Host "  Backlog:   $b"
    Write-Host "  Active:    $a"
    Write-Host "  Review:    $r"
    Write-Host "  Done:      $d"
    Write-Host "  Archive:   $ar"
    Write-Host "  -----------"
    Write-Host "  Total:     $total"
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
}

function Cmd-Search {
    if ($CmdArgs.Count -lt 1) { Write-Err "Usage: ticket search `"<suchbegriff>`""; return }

    $term = $CmdArgs[0].ToLower()

    Write-Host ""
    Write-Info "Suche: $term"
    Write-Host "--------------------------------------"

    $found = 0
    foreach ($dir in ".tickets/backlog",".tickets/active",".tickets/review",".tickets/done") {
        $status = Split-Path $dir -Leaf
        $files = Get-ChildItem $dir -Filter "*.md" -ErrorAction SilentlyContinue
        if (-not $files) { continue }

        foreach ($f in $files) {
            $c = Get-Content $f.FullName -Raw
            if ($c.ToLower().Contains($term) -or $f.Name.ToLower().Contains($term)) {
                $found++
                $id    = Read-Field $c "id"
                $title = Read-Field $c "title"
                $type  = Read-Field $c "type"
                Write-Host ("   {0,-10} [{1}] ({2}) {3}" -f $id, $type, $status, $title)
            }
        }
    }

    if ($found -eq 0) { Write-Host "   Keine Treffer." -ForegroundColor DarkGray }
    Write-Host ""
}

function Cmd-Release {
    if ($CmdArgs.Count -lt 1) { Write-Err "Usage: ticket release <version>  (z.B. v0.1.0)"; return }

    $version = $CmdArgs[0]
    $prefix = Get-ProjectPrefix
    $num = Get-NextCounter
    $id = "$prefix-$num"
    $slug = "release-$($version -replace '[^a-z0-9]','-')"
    $branch = "release/$version"
    $today = Get-Today
    $filename = ".tickets/backlog/$id-$slug.md"

    $templateFile = ".tickets/templates/release.md"
    if (-not (Test-Path $templateFile)) {
        Write-Err "Template release.md nicht gefunden."
        return
    }

    $content = Get-Content $templateFile -Raw
    $content = $content -replace '(?m)^id:.*', "id: $id"
    $content = $content -replace '(?m)^title:.*', "title: `"Release $version`""
    $content = $content -replace '(?m)^branch:.*', "branch: $branch"
    $content = $content -replace '(?m)^created:.*', "created: $today"
    $content = $content -replace '(?m)^updated:.*', "updated: $today"
    $content = $content -replace '(?m)^version:.*', "version: $version"
    $content = $content -replace '\{ID\}', $id
    $content = $content -replace '\{TITLE\}', "Release $version"

    # Done-Tickets auflisten
    $doneFiles = Get-ChildItem ".tickets/done" -Filter "*.md" -ErrorAction SilentlyContinue
    if ($doneFiles) {
        $feats = ""
        $fixes = ""
        $other = ""
        foreach ($f in $doneFiles) {
            $c = Get-Content $f.FullName -Raw
            $tid  = Read-Field $c "id"
            $tt   = Read-Field $c "title"
            $typ  = Read-Field $c "type"
            $line = "- [x] ${tid}: $tt"
            switch ($typ) {
                "feature" { $feats += "`r`n$line" }
                "bug"     { $fixes += "`r`n$line" }
                default   { $other += "`r`n$line" }
            }
        }
        $content = $content -replace '- \[ \] FEA-xxx:', $feats.TrimStart()
        $content = $content -replace '- \[ \] BUG-xxx:', $fixes.TrimStart()
        $content = $content -replace '- \[ \] TSK-xxx:', $other.TrimStart()
    }

    $content += "`r`n| $today | Erstellt | Release $version vorbereitet |"
    Set-Content -Path $filename -Value $content -Encoding UTF8

    Write-Host ""
    Write-OK "Release-Ticket erstellt: $id"
    Write-Host "   Version:  $version"
    Write-Host "   Branch:   $branch"
    Write-Host "   Datei:    $filename"
    Write-Host ""
    Write-Host "   Done-Tickets werden automatisch eingetragen."
    Write-Host "   Aktivieren: ticket pick $id"
}

function Cmd-Help {
    Write-Host ""
    Write-Info "TicketOps CLI"
    Write-Host "======================================"
    Write-Host ""
    Write-Host "  ticket new <type> `"<title>`" [prio] [sprint]"
    Write-Host "  ticket pick <ID>                     Aktivieren + Branch"
    Write-Host "  ticket done <ID>                     Abschliessen"
    Write-Host "  ticket list [all|backlog|active|done] [--sprint name]"
    Write-Host "  ticket board [--visual]                Kanban Board (--visual = Browser)"
    Write-Host "  ticket log <ID> `"<nachricht>`"       Log-Eintrag"
    Write-Host "  ticket stats                         Statistiken"
    Write-Host "  ticket search `"<begriff>`"            Suchen"
    Write-Host "  ticket release <version>             Release vorbereiten"
    Write-Host "  ticket help                          Diese Hilfe"
    Write-Host ""
    Write-Host "  Types: feature, bug, task, research, requirement,"
    Write-Host "         test, refactor, docs, chore, release"
    Write-Host ""
}


function Cmd-Sprint {
    $sub = if ($CmdArgs.Count -ge 1) { $CmdArgs[0].ToLower() } else { "" }

    $sprintFile = ".tickets/sprints.json"
    if (-not (Test-Path $sprintFile)) {
        Write-Err "sprints.json nicht gefunden in .tickets/"
        return
    }

    $data = Get-Content $sprintFile -Raw | ConvertFrom-Json
    $current = $data.current_sprint

    switch ($sub) {
        "start" {
            if ($CmdArgs.Count -lt 2) {
                Write-Err "Usage: ticket sprint start <sprint-name>"
                Write-Host "  Sprints: $($data.sprints.PSObject.Properties.Name -join ', ')"
                return
            }
            $name = $CmdArgs[1].ToLower()
            $sprint = $data.sprints.$name
            if (-not $sprint) {
                Write-Err "Sprint '$name' nicht gefunden."
                return
            }
            $today = Get-Date -Format "yyyy-MM-dd"
            $data.current_sprint = $name
            $sprint.status = "active"
            $sprint.start_date = $today
            $data.sprints.$name = $sprint
            $data | ConvertTo-Json -Depth 5 | Set-Content $sprintFile -Encoding UTF8
            Generate-SprintMd $data $name
            Write-Host ""
            Write-OK "Sprint gestartet: $($sprint.name)"
            Write-Host "   Ziel: $($sprint.goal)"
            Write-Host "   Deliverables: $($sprint.deliverables.Count)"
            Write-Host ""
            Write-Host "   Tickets im Sprint:"
            $files = Get-ChildItem ".tickets/backlog",".tickets/active",".tickets/review",".tickets/done" -Filter "*.md" -ErrorAction SilentlyContinue
            $count = 0
            foreach ($f in $files) {
                $c = Get-Content $f.FullName -Raw
                $ts = Read-Field $c "sprint"
                if ($ts -eq $name) {
                    $count++
                    $tid = Read-Field $c "id"
                    $ttl = Read-Field $c "title"
                    $st = $f.Directory.Name
                    Write-Host ("      {0,-10} ({1}) {2}" -f $tid, $st, $ttl)
                }
            }
            if ($count -eq 0) {
                Write-Warn "   Noch keine Tickets! Erstelle welche mit: ticket new task `"Titel`" medium $name"
            }
        }

        "end" {
            $sprint = $data.sprints.$current
            if (-not $sprint -or $sprint.status -ne "active") {
                Write-Err "Kein aktiver Sprint."
                return
            }
            $today = Get-Date -Format "yyyy-MM-dd"
            $sprint.status = "done"
            $sprint.end_date = $today

            $activeTickets = @()
            $doneCount = 0
            foreach ($dir in ".tickets/backlog",".tickets/active",".tickets/review") {
                $files = Get-ChildItem $dir -Filter "*.md" -ErrorAction SilentlyContinue
                foreach ($f in $files) {
                    $c = Get-Content $f.FullName -Raw
                    if ((Read-Field $c "sprint") -eq $current) {
                        $activeTickets += [PSCustomObject]@{
                            Id = Read-Field $c "id"
                            Title = Read-Field $c "title"
                            Status = $f.Directory.Name
                            File = $f.FullName
                        }
                    }
                }
            }
            $doneFiles = Get-ChildItem ".tickets/done" -Filter "*.md" -ErrorAction SilentlyContinue
            foreach ($f in $doneFiles) {
                $c = Get-Content $f.FullName -Raw
                if ((Read-Field $c "sprint") -eq $current) { $doneCount++ }
            }

            $data.sprints.$current = $sprint
            $data | ConvertTo-Json -Depth 5 | Set-Content $sprintFile -Encoding UTF8
            Generate-SprintMd $data $current

            Write-Host ""
            Write-OK "Sprint beendet: $($sprint.name)"
            Write-Host "   Done: $doneCount Tickets"
            if ($activeTickets.Count -gt 0) {
                Write-Warn "   Offene Tickets: $($activeTickets.Count)"
                foreach ($t in $activeTickets) {
                    Write-Host "      $($t.Id) ($($t.Status)) $($t.Title)"
                }
                Write-Host ""
                Write-Warn "   Diese Tickets manuell verschieben oder in naechsten Sprint uebernehmen."
            }
        }

        "status" {
            $sprint = $data.sprints.$current
            if (-not $sprint) { Write-Err "Kein Sprint konfiguriert."; return }

            $backlog = 0; $active = 0; $review = 0; $done = 0
            foreach ($dir in "backlog","active","review","done") {
                $files = Get-ChildItem ".tickets/$dir" -Filter "*.md" -ErrorAction SilentlyContinue
                foreach ($f in $files) {
                    $c = Get-Content $f.FullName -Raw
                    if ((Read-Field $c "sprint") -eq $current) {
                        switch ($dir) {
                            "backlog" { $backlog++ }
                            "active"  { $active++ }
                            "review"  { $review++ }
                            "done"    { $done++ }
                        }
                    }
                }
            }
            $total = $backlog + $active + $review + $done
            $pct = if ($total -gt 0) { [math]::Round($done / $total * 100) } else { 0 }

            Write-Host ""
            Write-Info "Sprint: $($sprint.name) (Woche $($sprint.weeks))"
            Write-Host "   Status: $($sprint.status)"
            if ($sprint.start_date) { Write-Host "   Start:  $($sprint.start_date)" }
            Write-Host "   Ziel:   $($sprint.goal)"
            Write-Host ""
            Write-Host "   Fortschritt: $done/$total Tickets ($pct%)"
            $bar = "[" + ("#" * [math]::Floor($pct/5)) + ("." * (20 - [math]::Floor($pct/5))) + "]"
            Write-Host "   $bar $pct%"
            Write-Host ""
            Write-Host "   Backlog: $backlog  |  Active: $active  |  Review: $review  |  Done: $done"
            Write-Host ""

            if ($sprint.deliverables) {
                Write-Host "   Deliverables:"
                foreach ($d in $sprint.deliverables) {
                    Write-Host "      - $d"
                }
            }
            Write-Host ""
        }

        "tickets" {
            $sprint = $data.sprints.$current
            if (-not $sprint) { Write-Err "Kein Sprint konfiguriert."; return }

            Write-Host ""
            Write-Info "Tickets in Sprint: $($sprint.name)"
            Write-Host "--------------------------------------"

            foreach ($dir in "backlog","active","review","done") {
                $icon = switch($dir) { "backlog"{"BACKLOG"} "active"{"ACTIVE"} "review"{"REVIEW"} "done"{"DONE"} }
                $found = $false

                $files = Get-ChildItem ".tickets/$dir" -Filter "*.md" -ErrorAction SilentlyContinue
                foreach ($f in $files) {
                    $c = Get-Content $f.FullName -Raw
                    if ((Read-Field $c "sprint") -eq $current) {
                        if (-not $found) { Write-Info "`n  $icon"; $found = $true }
                        $tid = Read-Field $c "id"
                        $ttl = Read-Field $c "title"
                        $typ = Read-Field $c "type"
                        $pri = Read-Field $c "priority"
                        Write-Host ("   {0,-10} [{1,-10}] ({2,-8}) {3}" -f $tid, $typ, $pri, $ttl)
                    }
                }
            }
            Write-Host ""
        }

        "plan" {
            $targetSprint = if ($CmdArgs.Count -ge 2) { $CmdArgs[1].ToLower() } else { $current }
            $sprint = $data.sprints.$targetSprint
            if (-not $sprint) { Write-Err "Sprint '$targetSprint' nicht gefunden."; return }

            Write-Host ""
            Write-Info "Sprint-Planung: $($sprint.name) (Woche $($sprint.weeks))"
            Write-Host "   Ziel: $($sprint.goal)"
            Write-Host ""
            Write-Host "   Deliverables (als Ticket-Vorschlaege):"
            Write-Host ""
            $i = 1
            foreach ($d in $sprint.deliverables) {
                Write-Host "   $i. $d"
                $i++
            }
            Write-Host ""
            Write-Host "   Erstelle Tickets mit:"
            Write-Host "      ticket new task `"$($sprint.deliverables[0])`" medium $targetSprint"
            Write-Host ""
            Write-Host "   Oder in Claude Code:"
            Write-Host "      > Erstelle alle Tickets fuer Sprint $targetSprint"
        }

        default {
            # Keine Sub-Command → Übersicht aller Sprints
            Write-Host ""
            Write-Info "Sprints"
            Write-Host "======================================"
            Write-Host ""

            foreach ($key in $data.sprints.PSObject.Properties.Name) {
                $s = $data.sprints.$key
                $marker = if ($key -eq $current) { " ◄ aktuell" } else { "" }
                $icon = switch ($s.status) {
                    "active"  { "[*]" }
                    "done"    { "[x]" }
                    default   { "[ ]" }
                }
                $color = switch ($s.status) {
                    "active"  { "Cyan" }
                    "done"    { "Green" }
                    default   { "Gray" }
                }
                Write-Host "  $icon " -NoNewline -ForegroundColor $color
                Write-Host ("{0,-20} Woche {1,-6} {2}{3}" -f $s.name, $s.weeks, $s.status, $marker)
            }
            Write-Host ""
            Write-Host "  Befehle:"
            Write-Host "    ticket sprint status             Aktueller Sprint-Fortschritt"
            Write-Host "    ticket sprint tickets            Tickets im aktuellen Sprint"
            Write-Host "    ticket sprint start <name>       Sprint starten"
            Write-Host "    ticket sprint end                Sprint beenden"
            Write-Host "    ticket sprint plan [name]        Deliverables anzeigen"
            Write-Host ""
        }
    }
}

function Generate-SprintMd($data, $sprintKey) {
    $sprint = $data.sprints.$sprintKey
    $lines = @()
    $lines += "# Sprint: $($sprint.name)"
    $lines += ""
    $lines += "> Auto-generiert am $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    $lines += ""
    $lines += "| Feld | Wert |"
    $lines += "|------|------|"
    $lines += "| Status | $($sprint.status) |"
    $lines += "| Wochen | $($sprint.weeks) |"
    if ($sprint.start_date) { $lines += "| Start | $($sprint.start_date) |" }
    if ($sprint.end_date) { $lines += "| Ende | $($sprint.end_date) |" }
    $lines += ""
    $lines += "## Ziel"
    $lines += $sprint.goal
    $lines += ""
    $lines += "## Deliverables"
    foreach ($d in $sprint.deliverables) { $lines += "- [ ] $d" }
    $lines += ""
    $lines += "## Done-Kriterium"
    $lines += $sprint.done_criteria
    $lines += ""
    $lines += "## Tickets"
    $lines += ""

    foreach ($dir in "backlog","active","review","done") {
        $files = Get-ChildItem ".tickets/$dir" -Filter "*.md" -ErrorAction SilentlyContinue
        foreach ($f in $files) {
            $c = Get-Content $f.FullName -Raw
            if ((Read-Field $c "sprint") -eq $sprintKey) {
                $tid = Read-Field $c "id"
                $ttl = Read-Field $c "title"
                $check = if ($dir -eq "done") { "x" } else { " " }
                $lines += "- [$check] **$tid** ($dir) $ttl"
            }
        }
    }

    Set-Content -Path ".tickets/SPRINT.md" -Value ($lines -join "`r`n") -Encoding UTF8
}

# ── Router ──────────────────────────────────────────────────

if (-not $Command) { Cmd-Help; return }

switch ($Command.ToLower()) {
    "new"     { Cmd-New }
    "pick"    { Cmd-Pick }
    "done"    { Cmd-Done }
    "list"    { Cmd-List }
    "ls"      { Cmd-List }
    "board"   { Cmd-Board }
    "log"     { Cmd-Log }
    "stats"   { Cmd-Stats }
    "search"  { Cmd-Search }
    "find"    { Cmd-Search }
    "release" { Cmd-Release }
    "sprint"  { Cmd-Sprint }
    "help"    { Cmd-Help }
    "--help"  { Cmd-Help }
    "-h"      { Cmd-Help }
    default   { Write-Err "Unbekannter Befehl: $Command"; Cmd-Help }
}
