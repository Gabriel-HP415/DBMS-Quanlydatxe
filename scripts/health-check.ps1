# =============================================================================
# KIỂM TRA SỨC KHỎE HỆ THỐNG - BusTicket Pro
# Chạy: powershell -File "D:\HOC TAP\DBMS\scripts\health-check.ps1"
# =============================================================================

$ErrorActionPreference = "Continue"
$API = "http://localhost:3001"
$FE  = "http://localhost:5173"
$passed = 0
$failed = 0
$warnings = 0

function Test-Item($name, $script) {
    try {
        $ok = & $script
        if ($ok) {
            Write-Host "[PASS] $name" -ForegroundColor Green
            $script:passed++
        } else {
            Write-Host "[FAIL] $name" -ForegroundColor Red
            $script:failed++
        }
    } catch {
        Write-Host "[FAIL] $name - $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
    }
}

function Test-Warn($name, $script) {
    try {
        $ok = & $script
        if ($ok) {
            Write-Host "[PASS] $name" -ForegroundColor Green
            $script:passed++
        } else {
            Write-Host "[WARN] $name" -ForegroundColor Yellow
            $script:warnings++
        }
    } catch {
        Write-Host "[WARN] $name - $($_.Exception.Message)" -ForegroundColor Yellow
        $script:warnings++
    }
}

function Get-SqlCmdScalar($query) {
    $lines = sqlcmd -S localhost -E -C -d BusBookingDB -Q $query -W -h-1 2>&1
    foreach ($line in $lines) {
        $t = "$line".Trim()
        if ($t -match '^\d+$') { return [int]$t }
    }
    return $null
}

Write-Host "`n=== KIEM TRA HE THONG BUSTICKET PRO ===`n" -ForegroundColor Cyan

# Database
Test-Item "SQL Server - BusBookingDB" {
    $out = sqlcmd -S localhost -E -C -Q "SELECT DB_ID('BusBookingDB')" -W -h-1 2>&1 | Select-Object -Last 1
    $out -and $out.Trim() -ne "" -and $out.Trim() -ne "NULL"
}

Test-Item "Database - 8 Stored Procedures" {
    $n = Get-SqlCmdScalar "SELECT COUNT(*) FROM sys.procedures WHERE name LIKE 'sp_%'"
    $n -and $n -ge 8
}

Test-Item "Database - 9 tables" {
    $n = Get-SqlCmdScalar "SELECT COUNT(*) FROM sys.tables"
    $n -and $n -ge 9
}

# Backend
Test-Item "Backend - Health (port 3001)" {
    $r = Invoke-RestMethod -Uri "$API/health" -TimeoutSec 5
    $r.status -eq "ok"
}

$endpoints = @("/api/trips", "/api/tickets", "/api/simulation/status",
               "/api/admin/customers", "/api/admin/buses", "/api/admin/trips",
               "/api/admin/tickets", "/api/admin/routes", "/api/seats/1")
foreach ($ep in $endpoints) {
    Test-Item "API GET $ep" {
        $r = Invoke-WebRequest -Uri "$API$ep" -TimeoutSec 5 -UseBasicParsing
        $r.StatusCode -eq 200
    }
}

function Book-FreeSeat($cheDo) {
    $seats = Invoke-RestMethod -Uri "$API/api/seats/1"
    $free = $seats.data | Where-Object { $_.trang_thai_ghe -eq "TRONG" } | Select-Object -First 1
    if (-not $free) { return $null }
    $body = @{ ma_chuyen=1; ma_ghe=$free.ma_ghe; ma_khach_hang=1; che_do_khoa=$cheDo } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$API/api/booking" -Method POST -Body $body -ContentType "application/json"
    if ($r.data.ket_qua -eq "COMMIT") { return $r.data }
    return $null
}

foreach ($mode in @("KHONG_KHOA", "BI_QUAN", "LE_QUAN")) {
    Test-Item "API POST booking ($mode)" {
        $r = Book-FreeSeat $mode
        $r -ne $null
    }
}

Test-Item "API DELETE booking (huy ve)" {
    $tickets = Invoke-RestMethod -Uri "$API/api/tickets"
    $ticket = $tickets.data | Where-Object { $_.trang_thai -eq "DA_DAT" } | Select-Object -First 1
    if (-not $ticket) { return $false }
    $r = Invoke-RestMethod -Uri "$API/api/booking/$($ticket.ma_ve)" -Method DELETE
    $r.data.ket_qua -eq "COMMIT"
}

Test-Item "API CRUD admin - customer" {
    # Don du lieu QA cu (soft-delete khong giai phong UNIQUE email/sdt)
    sqlcmd -S localhost -E -C -d BusBookingDB -Q "DELETE FROM dbo.KHACH_HANG WHERE ho_ten LIKE N'QA%'" -W -h-1 | Out-Null

    $ts = Get-Date -Format 'yyyyMMddHHmmss'
    $body = @{
        ho_ten = "QA HealthCheck"
        so_dien_thoai = "09$ts".Substring(0, 10)
        email = "qa-$ts@test.local"
    } | ConvertTo-Json
    $created = Invoke-RestMethod -Uri "$API/api/admin/customers" -Method POST -Body $body -ContentType "application/json"
    $id = $created.data.ma_khach_hang
    $updated = Invoke-RestMethod -Uri "$API/api/admin/customers/$id" -Method PUT -Body (@{
        ho_ten = "QA Updated"
        so_dien_thoai = "08$ts".Substring(0, 10)
        email = "qa-upd-$ts@test.local"
    } | ConvertTo-Json) -ContentType "application/json"
    $deleted = Invoke-RestMethod -Uri "$API/api/admin/customers/$id" -Method DELETE
    sqlcmd -S localhost -E -C -d BusBookingDB -Q "DELETE FROM dbo.KHACH_HANG WHERE ma_khach_hang = $id" -W -h-1 | Out-Null
    $created.success -and $updated.success -and $deleted.success
}

# Frontend
Test-Warn "Frontend dev server (port 5173)" {
    $r = Invoke-WebRequest -Uri $FE -TimeoutSec 5 -UseBasicParsing
    $r.StatusCode -eq 200
}

Test-Warn "Frontend API proxy" {
    $r = Invoke-RestMethod -Uri "$FE/api/trips" -TimeoutSec 5
    $r.success -eq $true
}

# Build
Test-Warn "Backend TypeScript build" {
    Push-Location "D:\HOC TAP\DBMS\backend"
    $out = npm run build 2>&1
    Pop-Location
    $LASTEXITCODE -eq 0
}

Test-Warn "Frontend production build" {
    Push-Location "D:\HOC TAP\DBMS\frontend"
    $out = npm run build 2>&1
    Pop-Location
    $LASTEXITCODE -eq 0
}

Write-Host "`n=== KET QUA ===" -ForegroundColor Cyan
Write-Host "PASS: $passed | FAIL: $failed | WARN: $warnings"
if ($failed -eq 0) {
    Write-Host "He thong san sang demo!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Co loi can xu ly truoc khi demo." -ForegroundColor Red
    exit 1
}