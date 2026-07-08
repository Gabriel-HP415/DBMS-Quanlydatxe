# Module Database - Hệ thống Mô phỏng Đặt Vé Xe Khách

## Mục tiêu

Database phục vụ đề tài nghiên cứu **Concurrency Control** và **Deadlock** trên SQL Server, không phải website thương mại hoàn chỉnh.

## Cấu trúc file

| File | Mô tả |
|------|-------|
| `01_create_database.sql` | Tạo database `BusBookingDB` |
| `02_create_tables.sql` | 8 bảng + view (3NF, đầy đủ constraints) |
| `03_seed_data.sql` | Dữ liệu mẫu demo |
| `04_stored_procedures.sql` | 7 stored procedures + transaction |
| `05_deadlock_demo.sql` | Script A/B tạo Deadlock trên SSMS |
| `06_test_concurrency.sql` | Test 3 chế độ khóa |
| `run_all.sql` | Chạy tất cả script theo thứ tự |

## Sơ đồ Database (3NF)

```
KHACH_HANG ──┐
             ├──> VE <── GHE <── XE
TUYEN_XE ──> CHUYEN_XE ──┘
```

### Bảng nghiệp vụ

- **KHACH_HANG** - Thông tin khách hàng
- **XE** - Xe khách (có `row_version` cho Optimistic Locking)
- **TUYEN_XE** - Tuyến đường
- **CHUYEN_XE** - Chuyến xe cụ thể
- **GHE** - Ghế trên từng xe (A1, A2, B1...)
- **VE** - Vé đã đặt

### Bảng mô phỏng

- **TRANSACTION_LOG** - Log từng transaction (COMMIT/ROLLBACK/BLOCKED)
- **DEADLOCK_LOG** - Log sự kiện Deadlock (Error 1205)
- **CAU_HINH_HE_THONG** - Cấu hình chế độ khóa

## Stored Procedures

| SP | Chức năng |
|----|-----------|
| `sp_DatVe` | Đặt vé - 3 chế độ khóa |
| `sp_HuyVe` | Hủy vé |
| `sp_DoiVe` | Đổi ghế |
| `sp_DanhSachVe` | Danh sách vé |
| `sp_DanhSachGhe` | Sơ đồ ghế theo chuyến |
| `sp_ThongKeMoPhong` | Dashboard thống kê |
| `sp_ResetMoPhong` | Reset log mô phỏng |

## Ba chế độ Concurrency Control

### 1. KHONG_KHOA
- Đọc/ghi **không dùng lock hint**
- Minh họa **Lost Update**: 2 transaction cùng đọc "ghế trống" rồi cùng ghi

### 2. BI_QUAN (Pessimistic)
- Dùng `WITH (UPDLOCK, HOLDLOCK, ROWLOCK)`
- Transaction thứ 2 phải **chờ** (WAITING/BLOCKED)

### 3. LE_QUAN (Optimistic)
- Dùng cột `rowversion` trên bảng GHE
- Kiểm tra version trước COMMIT → conflict thì **ROLLBACK**

## Hướng dẫn cài đặt

### Yêu cầu
- SQL Server 2019+ (hoặc SQL Server Express)
- SQL Server Management Studio (SSMS)

### Cách 1: Chạy từng file
1. Mở SSMS, kết nối SQL Server
2. Chạy lần lượt: `01` → `02` → `03` → `04`

### Cách 2: Chạy run_all.sql
```sql
-- Trong SSMS, mở run_all.sql và Execute
```

### Kiểm tra
```sql
USE BusBookingDB;
SELECT * FROM v_DanhSachChuyenXe;
EXEC sp_DanhSachGhe @ma_chuyen = 1;
EXEC sp_ThongKeMoPhong;
```

## Demo Deadlock

1. Mở **2 cửa sổ Query** trong SSMS
2. Cửa sổ 1: Chạy **SCRIPT A** trong `05_deadlock_demo.sql`
3. Cửa sổ 2: Chạy **SCRIPT B** (trong vòng 10 giây)
4. Quan sát Error **1205** trên 1 cửa sổ

```
Tx A: Khóa A1 ──đợi──> A2
Tx B: Khóa A2 ──đợi──> A1  →  DEADLOCK!
```

## Module tiếp theo

Sau khi database chạy ổn định, module tiếp theo là **Backend (Node.js + Express + mssql)**.