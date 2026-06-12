# ─────────────────────────────────────────────────────────────────────────────
# start-local.ps1  —  Finance Tracker backend launcher
#
# Usage:  cd backend\  then  .\start-local.ps1
# Optional: set $env:DB_PASSWORD = "yourpass" before running if not "root"
# ─────────────────────────────────────────────────────────────────────────────

# ── Java 21 (Eclipse Adoptium / Temurin) ─────────────────────────────────────
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.5.11-hotspot"
$env:PATH      = "$env:JAVA_HOME\bin;" + $env:PATH

# ── MySQL helper ─────────────────────────────────────────────────────────────
$mysqlBin      = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$mysqlPassword = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "root" }

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Finance Tracker — Local Backend Startup"              -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# ── Step 1: Create database ───────────────────────────────────────────────────
Write-Host ""
Write-Host "[1/2] Ensuring MySQL database 'expensetracker' exists..." -ForegroundColor Yellow

$sql = "CREATE DATABASE IF NOT EXISTS expensetracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

try {
    $out = echo $sql | & $mysqlBin -u root "-p$mysqlPassword" 2>&1
    Write-Host "      Database ready." -ForegroundColor Green
} catch {
    Write-Host "      Could not auto-create DB — run this SQL manually:" -ForegroundColor Red
    Write-Host "      $sql"
}

# ── Step 2: Launch Spring Boot ────────────────────────────────────────────────
Write-Host ""
Write-Host "[2/2] Starting Spring Boot on http://localhost:8082 ..." -ForegroundColor Yellow
Write-Host "      Profile: local  |  Mail: console (no SMTP needed)"  -ForegroundColor DarkGray
Write-Host "      Verification codes will be printed in this console." -ForegroundColor DarkGray
Write-Host ""

.\mvnw.cmd spring-boot:run
