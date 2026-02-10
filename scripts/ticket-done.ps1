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
