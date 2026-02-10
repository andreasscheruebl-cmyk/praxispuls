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
