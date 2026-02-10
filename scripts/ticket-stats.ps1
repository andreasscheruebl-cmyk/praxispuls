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
