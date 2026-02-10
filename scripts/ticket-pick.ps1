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
