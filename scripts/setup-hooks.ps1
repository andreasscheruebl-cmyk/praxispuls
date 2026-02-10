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
