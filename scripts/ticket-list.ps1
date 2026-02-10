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
