# Khoi dong demo BusTicket Pro bang Docker
# Chay: powershell -File "D:\HOC TAP\DBMS\scripts\docker-start.ps1"

$ProjectRoot = "D:\HOC TAP\DBMS"
Set-Location $ProjectRoot

if (-not (Test-Path ".env")) {
    Copy-Item ".env.docker" ".env"
    Write-Host "[INFO] Da tao .env tu .env.docker" -ForegroundColor Cyan
}

Write-Host "`n=== BUILD & START DOCKER ===" -ForegroundColor Cyan
docker compose up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] docker compose that bai" -ForegroundColor Red
    exit 1
}

Write-Host "`nDang cho cac service san sang..." -ForegroundColor Yellow
$max = 120
for ($i = 1; $i -le $max; $i++) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 3
        if ($health.status -eq "ok") { break }
    } catch { }
    Start-Sleep -Seconds 2
    if ($i -eq $max) {
        Write-Host "[WARN] Backend chua san sang — xem log: docker compose logs backend" -ForegroundColor Yellow
    }
}

$fePort = (Get-Content ".env" | Where-Object { $_ -match "^FRONTEND_PORT=" }) -replace "FRONTEND_PORT=", ""
if (-not $fePort) { $fePort = "8080" }

Write-Host "`n=== DEMO SAN SANG ===" -ForegroundColor Green
Write-Host "  Frontend:  http://localhost:$fePort"
Write-Host "  Backend:   http://localhost:3001/health"
Write-Host "  SQL Server: localhost:1433 (sa / xem .env)"
Write-Host "`nLenh huu ich:"
Write-Host "  docker compose logs -f"
Write-Host "  docker compose down"
Write-Host "  docker compose down -v   # xoa du lieu SQL"