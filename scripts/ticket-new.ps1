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
