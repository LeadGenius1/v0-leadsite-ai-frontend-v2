# PowerShell Database Reset Script for Railway PostgreSQL
# Run with: .\scripts\reset-database.ps1

Write-Host "⚠️  WARNING: DATABASE RESET SCRIPT" -ForegroundColor Red
Write-Host "═" * 50 -ForegroundColor Red
Write-Host "This will permanently delete ALL users and related data!" -ForegroundColor Yellow
Write-Host "This action CANNOT be undone." -ForegroundColor Yellow
Write-Host "═" * 50 -ForegroundColor Red
Write-Host ""

$confirmation = Read-Host "Type 'DELETE ALL USERS' to confirm"

if ($confirmation -ne "DELETE ALL USERS") {
    Write-Host "❌ Cancelled. Database was not modified." -ForegroundColor Green
    exit
}

# Check if DATABASE_URL exists
$DATABASE_URL = $env:DATABASE_URL

if (-not $DATABASE_URL) {
    Write-Host "❌ ERROR: DATABASE_URL environment variable not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Set it with:" -ForegroundColor Yellow
    Write-Host '  $env:DATABASE_URL = "your-railway-database-url"' -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "🔌 Connecting to database..." -ForegroundColor Cyan

# SQL commands to delete all user data
$sqlCommands = @"
BEGIN;
DELETE FROM email_campaigns;
DELETE FROM email_stats;
DELETE FROM prospects;
DELETE FROM activities;
DELETE FROM profiles;
DELETE FROM users;
COMMIT;
"@

# Save SQL to temp file
$tempSqlFile = [System.IO.Path]::GetTempFileName() + ".sql"
$sqlCommands | Out-File -FilePath $tempSqlFile -Encoding UTF8

try {
    # Try using psql if available
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        Write-Host "✅ Found psql, executing SQL..." -ForegroundColor Green
        psql $DATABASE_URL -f $tempSqlFile
        Write-Host ""
        Write-Host "✨ Database reset completed successfully!" -ForegroundColor Green
        Write-Host "All users and related data have been deleted." -ForegroundColor Green
    }
    else {
        Write-Host "❌ psql command not found" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please use one of these methods instead:" -ForegroundColor Yellow
        Write-Host "1. Run the Node.js script: node scripts/reset-database.js" -ForegroundColor Cyan
        Write-Host "2. Install PostgreSQL client tools and re-run this script" -ForegroundColor Cyan
        Write-Host "3. Use the admin UI at /admin/reset-database" -ForegroundColor Cyan
    }
}
finally {
    # Clean up temp file
    Remove-Item $tempSqlFile -ErrorAction SilentlyContinue
}
