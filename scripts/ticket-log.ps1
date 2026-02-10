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
