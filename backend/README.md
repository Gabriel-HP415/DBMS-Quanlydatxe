# Backend API - Bus Booking Simulation

REST API kết nối SQL Server qua Stored Procedures, phục vụ mô phỏng Concurrency Control & Deadlock.

## Cấu hình

| Thông số | Giá trị |
|----------|---------|
| Server | `localhost` |
| Database | `BusBookingDB` |
| Auth | Windows Authentication |
| Port API | `3001` |

File `.env`:
```
PORT=3001
DB_SERVER=localhost
DB_NAME=BusBookingDB
CHE_DO_KHOA_MAC_DINH=BI_QUAN
```

## Cài đặt

```bash
cd backend
npm install
npm run dev
```

## Cấu trúc thư mục

```
src/
  config/       - Kết nối SQL Server (msnodesqlv8 + Windows Auth)
  controllers/  - Xử lý HTTP request/response
  services/     - Business logic
  repositories/ - Gọi Stored Procedure / SQL query
  routes/       - Định nghĩa REST endpoints
  middleware/   - Error handler (Deadlock 1205)
  types/        - TypeScript interfaces
```

## API Endpoints

### Công khai

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/trips` | Danh sách chuyến xe |
| GET | `/api/trips/:id` | Chi tiết chuyến |
| GET | `/api/seats/:tripId` | Sơ đồ ghế |
| POST | `/api/booking` | Đặt vé (sp_DatVe) |
| DELETE | `/api/booking/:id` | Hủy vé (sp_HuyVe) |
| PUT | `/api/booking/:id/change-seat` | Đổi ghế (sp_DoiVe) |
| GET | `/api/tickets` | Danh sách vé |

### Simulation

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/simulation/status` | Dashboard thống kê |
| POST | `/api/simulation/reset` | Reset log |

### Admin

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET/POST/PUT/DELETE | `/api/admin/customers` | CRUD khách hàng |
| GET/POST/PUT/DELETE | `/api/admin/buses` | CRUD xe |
| GET/POST/PUT/DELETE | `/api/admin/trips` | CRUD chuyến xe |
| GET | `/api/admin/routes` | Danh sách tuyến |

## Ví dụ đặt vé

```bash
curl -X POST http://localhost:3001/api/booking \
  -H "Content-Type: application/json" \
  -d '{
    "ma_chuyen": 1,
    "ma_ghe": 1,
    "ma_khach_hang": 1,
    "che_do_khoa": "BI_QUAN",
    "session_id": "TX_A",
    "delay_ms": 3000
  }'
```

### Chế độ khóa (`che_do_khoa`)

- `KHONG_KHOA` - Không khóa → Lost Update
- `BI_QUAN` - Pessimistic (UPDLOCK, HOLDLOCK)
- `LE_QUAN` - Optimistic (rowversion)

## Module tiếp theo

**Frontend** (React + Vite + TypeScript + Tailwind + shadcn/ui) tích hợp giao diện Stitch.