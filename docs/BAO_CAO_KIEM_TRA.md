# BÁO CÁO KIỂM TRA HỆ THỐNG

**Ngày kiểm tra:** 06/07/2026  
**Dự án:** BusTicket Pro — Đề tài DBMS  
**Phạm vi:** Database, Backend, Frontend, API, CRUD, Concurrency, Build

---

## Tổng kết

| Hạng mục | Kết quả |
|----------|---------|
| SQL Server / BusBookingDB | ✅ PASS |
| Database — 9 bảng, 8 SP | ✅ PASS |
| Backend health + 9 API GET | ✅ PASS — HTTP 200 |
| Đặt vé — 3 chế độ khóa | ✅ PASS — COMMIT |
| Hủy vé (Transaction) | ✅ PASS — COMMIT |
| CRUD Admin (khách hàng) | ✅ PASS |
| Frontend dev + proxy | ✅ PASS |
| Backend build (`tsc`) | ✅ PASS |
| Frontend build (`vite build`) | ✅ PASS |

**Kết quả tự động:** `PASS: 22 | FAIL: 0 | WARN: 0`  
**Kết luận: Hệ thống sẵn sàng demo.**

---

## Chi tiết kiểm tra tự động

Script: `scripts/health-check.ps1`

```
[PASS] SQL Server - BusBookingDB
[PASS] Database - 8 Stored Procedures
[PASS] Database - 9 tables
[PASS] Backend - Health (port 3001)
[PASS] API GET /api/trips
[PASS] API GET /api/tickets
[PASS] API GET /api/simulation/status
[PASS] API GET /api/admin/customers
[PASS] API GET /api/admin/buses
[PASS] API GET /api/admin/trips
[PASS] API GET /api/admin/tickets
[PASS] API GET /api/admin/routes
[PASS] API GET /api/seats/1
[PASS] API POST booking (KHONG_KHOA)
[PASS] API POST booking (BI_QUAN)
[PASS] API POST booking (LE_QUAN)
[PASS] API DELETE booking (huy ve)
[PASS] API CRUD admin - customer
[PASS] Frontend dev server (port 5173)
[PASS] Frontend API proxy
[PASS] Backend TypeScript build
[PASS] Frontend production build
```

---

## Chi tiết theo module

### 1. Database

- Database `BusBookingDB` tồn tại
- **9 bảng:** CAU_HINH_HE_THONG, CHUYEN_XE, DEADLOCK_LOG, GHE, KHACH_HANG, TUYEN_XE, TRANSACTION_LOG, VE, XE
- **8 Stored Procedures:** sp_DatVe, sp_HuyVe, sp_DoiVe, sp_DanhSachVe, sp_DanhSachGhe, sp_GhiLogTransaction, sp_ResetMoPhong, sp_ThongKeMoPhong

### 2. Backend API

| Endpoint | Status |
|----------|--------|
| GET /health | 200 |
| GET /api/trips | 200 |
| GET /api/seats/1 | 200 |
| GET /api/tickets | 200 |
| GET /api/simulation/status | 200 |
| GET /api/admin/customers | 200 |
| GET /api/admin/buses | 200 |
| GET /api/admin/trips | 200 |
| GET /api/admin/tickets | 200 |
| GET /api/admin/routes | 200 |
| POST /api/booking (3 chế độ) | COMMIT |
| DELETE /api/booking/:id | COMMIT |
| POST/PUT/DELETE /api/admin/customers | OK |

### 3. Concurrency Control

| Chế độ | Kết quả test |
|--------|--------------|
| KHONG_KHOA | COMMIT |
| BI_QUAN | COMMIT |
| LE_QUAN | COMMIT |

### 4. Frontend

- Dev server port 5173 — HTTP 200
- Proxy `/api` → `localhost:3001` hoạt động
- Production build thành công
- 7 trang: Home, Trips, Booking, Tickets, Simulation, Deadlock, Admin

---

## Lỗi đã phát hiện và sửa

### Lỗi 1: Backend `npm run build` thất bại

- **File:** `backend/src/config/database.ts`
- **Lỗi:** `TS2353: connectionString does not exist in type 'config'`
- **Sửa:** Dùng type assertion `as sql.config & { connectionString: string }`
- **Trạng thái:** ✅ Đã sửa

### Lỗi 2: Log kết nối DB sai

- **File:** `backend/src/config/database.ts`
- **Lỗi:** `config.server` / `config.database` undefined khi dùng connectionString
- **Sửa:** Log trực tiếp biến `server` / `database`
- **Trạng thái:** ✅ Đã sửa

### Lỗi 3: Health-check parse `sqlcmd` sai

- **File:** `scripts/health-check.ps1`
- **Lỗi:** `USE BusBookingDB` tạo thêm dòng `(1 rows affected)` → `Select-Object -Last 1` lấy nhầm, không parse được số
- **Sửa:** Thêm hàm `Get-SqlCmdScalar` — dùng `-d BusBookingDB` và lọc dòng chỉ chứa số
- **Trạng thái:** ✅ Đã sửa

### Lỗi 4: Health-check CRUD khách hàng lỗi 500 khi chạy lại

- **File:** `scripts/health-check.ps1`
- **Lỗi:** Email/SĐT cố định (`qa@test.local`) vi phạm UNIQUE; soft-delete (`KHOA`) không giải phóng constraint
- **Sửa:** Xóa cứng khách QA cũ trước test; dùng email/SĐT unique theo timestamp; xóa cứng sau test
- **Trạng thái:** ✅ Đã sửa — script chạy lặp được nhiều lần

### Lỗi 5 (trước đó): SQL `QUOTED_IDENTIFIER`, `WAITFOR DELAY`, mssql OUTPUT params, Admin edit trip

- Đã sửa trong các module trước — không tái phát khi kiểm tra lần này.

---

## Cách chạy kiểm tra tự động

```powershell
# Yêu cầu: backend (3001) và frontend (5173) đang chạy
cd "D:\HOC TAP\DBMS\backend"  ; npm run dev
cd "D:\HOC TAP\DBMS\frontend" ; npm run dev

# Chạy kiểm tra (bao gồm build backend + frontend)
powershell -File "D:\HOC TAP\DBMS\scripts\health-check.ps1"
```

Exit code `0` = sẵn sàng demo; `1` = còn lỗi cần xử lý.

---

## Checklist trước demo (thủ công)

- [ ] `sqlcmd -S localhost -E -C -d BusBookingDB -Q "SELECT 1"` → OK
- [ ] Backend: http://localhost:3001/health → `{"status":"ok"}`
- [ ] Frontend: http://localhost:5173 → load được
- [ ] Reset log tại `/simulation`
- [ ] Ghế A1 chuyến 1 còn trống (cho demo concurrency)
- [ ] SSMS mở `database/05_deadlock_demo.sql`

---

## Ghi chú

- Script kiểm tra tự tạo/xóa khách hàng QA (`QA HealthCheck`) — không ảnh hưởng dữ liệu demo
- Mỗi lần chạy health-check có thể đặt thêm 3 vé test (3 chế độ khóa) và hủy 1 vé — nên reset mô phỏng trước demo nếu cần số liệu sạch
- Khuyến nghị: luôn chạy `npm run build` (hoặc `health-check.ps1`) trước khi nộp đồ án