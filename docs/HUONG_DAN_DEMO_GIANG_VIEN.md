# HƯỚNG DẪN DEMO ĐỀ TÀI DBMS

## Nghiên cứu Concurrency Control & Deadlock trên Hệ thống Đặt Vé Xe Khách

**Dự án:** BusTicket Pro — Mô phỏng trên SQL Server  
**Database:** BusBookingDB  
**Thời lượng demo đề xuất:** 20–25 phút

---

## MỤC LỤC

1. [Giới thiệu đề tài](#1-giới-thiệu-đề-tài)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Chuẩn bị trước buổi demo](#3-chuẩn-bị-trước-buổi-demo)
4. [Kịch bản trình bày (timeline)](#4-kịch-bản-trình-bày-timeline)
5. [Demo 1: Chức năng cơ bản](#5-demo-1-chức-năng-cơ-bản)
6. [Demo 2: Concurrency Control — 3 chế độ khóa](#6-demo-2-concurrency-control--3-chế-độ-khóa)
7. [Demo 3: Deadlock (Error 1205)](#7-demo-3-deadlock-error-1205)
8. [Dashboard nghiên cứu](#8-dashboard-nghiên-cứu)
9. [Câu hỏi thường gặp từ giảng viên](#9-câu-hỏi-thường-gặp-từ-giảng-viên)
10. [Phụ lục kỹ thuật](#10-phụ-lục-kỹ-thuật)

---

## 1. Giới thiệu đề tài

### 1.1. Tên đề tài

> **Nghiên cứu các giải thuật kiểm soát đồng thời (Concurrency Control) và kịch bản xử lý bế tắc (Deadlock) trong bài toán đặt chỗ thời gian thực — Thực nghiệm mô phỏng trên Hệ thống đặt vé xe khách trực tuyến.**

### 1.2. Mục tiêu

| Mục tiêu | Mô tả |
|----------|-------|
| **Không phải** website thương mại | Website chỉ là công cụ tạo giao dịch đồng thời |
| **Minh họa Transaction** | BEGIN / COMMIT / ROLLBACK / TRY-CATCH trên SQL Server |
| **So sánh 3 chế độ khóa** | Không khóa, Pessimistic, Optimistic |
| **Tạo Deadlock có chủ đích** | Wait-For Graph, Victim, Error 1205 |

### 1.3. Công nghệ sử dụng

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express.js + mssql
- **Database:** Microsoft SQL Server (BusBookingDB)
- **Xử lý nghiệp vụ:** Stored Procedure + Transaction

---

## 2. Kiến trúc hệ thống

```
┌─────────────┐     REST API      ┌─────────────┐     SP + TX     ┌─────────────┐
│   React     │ ───────────────►  │   Express   │ ─────────────►  │ SQL Server  │
│  (Client)   │   localhost:5173  │  (API)      │  localhost:3001│ BusBookingDB│
└─────────────┘                   └─────────────┘                 └─────────────┘
```

### Luồng đặt vé (quan trọng khi trình bày)

1. Người dùng bấm **Đặt vé** trên giao diện
2. API `POST /api/booking` gọi **`sp_DatVe`**
3. Stored Procedure mở **Transaction**, áp dụng chế độ khóa
4. Kết quả **COMMIT** hoặc **ROLLBACK** được ghi vào `TRANSACTION_LOG`

---

## 3. Chuẩn bị trước buổi demo

### 3.1. Yêu cầu phần mềm

- SQL Server + SSMS (đã cài)
- Node.js 18+
- Trình duyệt Chrome/Edge (mở nhiều tab)

### 3.2. Khởi động hệ thống (theo thứ tự)

**Bước 1 — Kiểm tra database** (nếu chưa có, chạy lại script):

```powershell
sqlcmd -S localhost -E -C -i "D:\HOC TAP\DBMS\database\01_create_database.sql"
sqlcmd -S localhost -E -C -i "D:\HOC TAP\DBMS\database\02_create_tables.sql"
sqlcmd -S localhost -E -C -i "D:\HOC TAP\DBMS\database\03_seed_data.sql"
sqlcmd -S localhost -E -C -i "D:\HOC TAP\DBMS\database\04_stored_procedures.sql"
```

**Bước 2 — Backend:**

```powershell
cd "D:\HOC TAP\DBMS\backend"
npm run dev
```

→ Kiểm tra: http://localhost:3001/health

**Bước 3 — Frontend:**

```powershell
cd "D:\HOC TAP\DBMS\frontend"
npm run dev
```

→ Mở: http://localhost:5173

### 3.3. Reset log trước khi demo concurrency

- Vào **Mô phỏng TX** → bấm **Reset log**
- Hoặc: `POST http://localhost:3001/api/simulation/reset`

### 3.4. Dữ liệu demo quan trọng

| Thông tin | Giá trị |
|-----------|---------|
| Chuyến demo | Mã **1** (HCM → Đà Lạt) |
| Ghế demo Deadlock | **A1**, **A2** (còn trống sau reset) |
| Ghế demo Concurrency | **A1** hoặc **A3** (`ma_ghe` = 1 hoặc 3) |
| Khách hàng mẫu | Mã 1, 2, 3, 4, 5 |

---

## 4. Kịch bản trình bày (timeline)

| Thời gian | Nội dung | Trang / Công cụ |
|-----------|---------|-----------------|
| 0:00–2:00 | Giới thiệu đề tài, kiến trúc | Trang chủ `/` |
| 2:00–5:00 | Đặt vé, sơ đồ ghế, CRUD admin | `/trips`, `/admin` |
| 5:00–13:00 | **Concurrency Control** (3 chế độ) | `/simulation` |
| 13:00–18:00 | **Deadlock** (SSMS + giải thích) | SSMS + `/deadlock` |
| 18:00–20:00 | Dashboard thống kê, kết luận | `/simulation` |
| 20:00–25:00 | Hỏi đáp | — |

---

## 5. Demo 1: Chức năng cơ bản

### 5.1. Trang chủ

- Giới thiệu đề tài, nút **Bắt đầu mô phỏng**
- Nhấn mạnh: *đây là hệ thống mô phỏng, không phải TMĐT*

### 5.2. Danh sách chuyến xe

1. Vào `/trips`
2. Chỉ cho giảng viên thấy dữ liệu lấy từ **view `v_DanhSachChuyenXe`**
3. Bấm **Đặt vé** chuyến 1

### 5.3. Chọn ghế & đặt vé

1. Sơ đồ ghế: xanh (trống), đỏ (đã đặt), vàng (đang chọn)
2. Chọn ghế trống → **Xác nhận đặt vé**
3. Giải thích: gọi `sp_DatVe` với `che_do_khoa = BI_QUAN` (mặc định)

### 5.4. Quản trị (CRUD)

1. Vào `/admin`
2. Demo nhanh: xem Khách hàng / Xe / Chuyến / Vé
3. Có thể **Thêm khách hàng** hoặc **Hủy vé** để chứng minh CRUD + Transaction

---

## 6. Demo 2: Concurrency Control — 3 chế độ khóa

> **Đây là phần quan trọng nhất của buổi demo.**

### 6.1. Chuẩn bị

1. Mở **3 tab trình duyệt** cùng URL: `http://localhost:5173/simulation`
2. Reset log
3. Cấu hình: Chuyến **1**, Ghế **A1** (`ma_ghe = 1`), delay 3000ms (mặc định trong SP)

### 6.2. Chế độ 1: KHONG_KHOA (Lost Update)

**Lý thuyết nói trước:**
- Đọc/ghi **không dùng lock hint**
- Hai transaction có thể cùng đọc "ghế trống" → **Lost Update**

**Thực hiện:**
1. Chọn chế độ **KHONG_KHOA**
2. Tab 1: bấm **Transaction A** (khách 1)
3. Tab 2: bấm **Transaction B** (khách 2) **trong vòng 3 giây**
4. Quan sát log: có thể 1 COMMIT, 1 ROLLBACK (hoặc lỗi unique index)

**Giải thích cho giảng viên:**
> "Không khóa dẫn đến race condition — transaction sau có thể ghi đè hoặc bị constraint chặn."

### 6.3. Chế độ 2: BI_QUAN (Pessimistic Locking)

**Lý thuyết:**
- Dùng `WITH (UPDLOCK, HOLDLOCK, ROWLOCK)` trong `sp_DatVe`
- Transaction thứ 2 phải **chờ** (WAITING/BLOCKED)

**Thực hiện:**
1. Reset log, đảm bảo ghế A1 trống (hủy vé nếu cần)
2. Chọn **BI_QUAN**
3. Tab 1: **Transaction A** → đang giữ lock 3 giây
4. Tab 2: **Transaction B** ngay sau đó → phải chờ
5. Kết quả: chỉ **1 COMMIT**, transaction kia ROLLBACK hoặc chờ xong mới báo ghế đã đặt

**Giải thích:**
> "Pessimistic lock đảm bảo tính nhất quán — transaction đến sau bị chặn cho đến khi transaction trước COMMIT hoặc ROLLBACK."

### 6.4. Chế độ 3: LE_QUAN (Optimistic Locking)

**Lý thuyết:**
- Dùng cột **`rowversion`** trên bảng `GHE`
- Kiểm tra version trước COMMIT → conflict thì ROLLBACK

**Thực hiện:**
1. Chọn **LE_QUAN**
2. Lặp lại kịch bản 2 tab như trên
3. Transaction đến sau nhận **ROLLBACK** do rowversion thay đổi

**Giải thích:**
> "Optimistic locking phù hợp khi xung đột ít — không khóa khi đọc, chỉ kiểm tra khi ghi."

### 6.5. Bảng so sánh (trình bày miệng)

| Chế độ | Cơ chế | Ưu điểm | Nhược điểm |
|--------|--------|---------|------------|
| KHONG_KHOA | Không lock | Nhanh | Lost Update |
| BI_QUAN | UPDLOCK, HOLDLOCK | An toàn | Chờ lâu, dễ block |
| LE_QUAN | rowversion | Ít block | Rollback khi conflict |

---

## 7. Demo 3: Deadlock (Error 1205)

### 7.1. Trình bày lý thuyết trên web

1. Vào `/deadlock`
2. Giải thích **Wait-For Graph** (sơ đồ trên trang)
3. Đọc nội dung **Error 1205**

### 7.2. Demo thực tế trên SSMS (khuyến nghị)

**Mở file:** `D:\HOC TAP\DBMS\database\05_deadlock_demo.sql`

**Cửa sổ 1 — SCRIPT A:**
```sql
BEGIN TRANSACTION TxA;
-- Khóa ghế A1, WAITFOR 10 giây, rồi khóa ghế A2
```

**Cửa sổ 2 — SCRIPT B** (chạy trong 10 giây):
```sql
BEGIN TRANSACTION TxB;
-- Khóa ghế A2, WAITFOR 10 giây, rồi khóa ghế A1
```

**Kết quả mong đợi:**
- Một cửa sổ báo: `Transaction was deadlocked... chosen as the deadlock victim (Error 1205)`
- Cửa sổ còn lại COMMIT thành công

### 7.3. Giải thích Wait-For Graph

```
Tx A ──đợi──► Lock A2 ◄──giữ── Tx B
Tx B ──đợi──► Lock A1 ◄──giữ── Tx A
         ⟳ Chu trình → DEADLOCK!
```

- SQL Server chọn 1 transaction làm **Victim** (thường ít tốn kém rollback hơn)
- Victim bị **ROLLBACK** toàn bộ
- Survivor tiếp tục

### 7.4. Khắc phục Deadlock (nói khi kết thúc)

1. **Thứ tự khóa nhất quán** — luôn khóa A1 trước A2
2. **Transaction ngắn** — giảm thời gian giữ lock
3. **Retry** khi gặp Error 1205

---

## 8. Dashboard nghiên cứu

Trang `/simulation` hiển thị:

| Chỉ số | Ý nghĩa |
|--------|---------|
| Tổng TX | Số lần gọi SP |
| Đang chạy | Transaction RUNNING |
| Bị Block | WAITING / BLOCKED |
| Rollback / Commit | Kết quả cuối |
| Deadlock Count | Từ `DEADLOCK_LOG` |
| Chờ TB (ms) | Thời gian lock trung bình |

Dữ liệu lấy từ bảng `TRANSACTION_LOG` và `DEADLOCK_LOG`.

---

## 9. Câu hỏi thường gặp từ giảng viên

### Q1: Tại sao chọn bài toán đặt vé?

**Trả lời:** Bài toán có tính **cạnh tranh tài nguyên** (ghế) rõ ràng, dễ mô phỏng nhiều user cùng đặt 1 ghế — phù hợp minh họa concurrency và deadlock.

### Q2: Transaction xử lý ở đâu — app hay database?

**Trả lời:** Ở **Stored Procedure** (`sp_DatVe`, `sp_HuyVe`...) với `BEGIN TRANSACTION`, `COMMIT`, `ROLLBACK`, `TRY...CATCH`. Backend chỉ gọi SP, không tự quản lý transaction.

### Q3: Pessimistic và Optimistic khác nhau thế nào?

**Trả lời:**
- **Pessimistic:** Khóa khi đọc → chặn transaction khác sửa
- **Optimistic:** Không khóa khi đọc → kiểm tra `rowversion` khi ghi

### Q4: Deadlock và Block khác nhau?

**Trả lời:**
- **Block:** Transaction chờ lock do transaction khác giữ (chưa có chu trình)
- **Deadlock:** Hai transaction chờ nhau tạo **chu trình** → SQL Server chọn victim

### Q5: Error 1205 là gì?

**Trả lời:** SQL Server báo transaction bị chọn làm **deadlock victim** và đã rollback. Ứng dụng nên retry.

### Q6: Database chuẩn hóa thế nào?

**Trả lời:** Chuẩn hóa **3NF** — 6 bảng nghiệp vụ (KHACH_HANG, XE, TUYEN_XE, CHUYEN_XE, GHE, VE) + bảng log mô phỏng.

### Q7: Làm sao chứng minh Lost Update?

**Trả lời:** Chạy `sp_DatVe` với `che_do_khoa = KHONG_KHOA`, 2 session cùng đặt 1 ghế với `delay_ms = 3000` — cả hai đọc "trống" trước khi ghi.

---

## 10. Phụ lục kỹ thuật

### 10.1. Stored Procedures

| SP | Chức năng |
|----|-----------|
| `sp_DatVe` | Đặt vé — 3 chế độ khóa |
| `sp_HuyVe` | Hủy vé |
| `sp_DoiVe` | Đổi ghế |
| `sp_DanhSachVe` | Danh sách vé |
| `sp_DanhSachGhe` | Sơ đồ ghế |
| `sp_ThongKeMoPhong` | Dashboard |
| `sp_ResetMoPhong` | Reset log |

### 10.2. API chính

| Method | Endpoint |
|--------|----------|
| GET | `/api/trips` |
| GET | `/api/seats/:tripId` |
| POST | `/api/booking` |
| DELETE | `/api/booking/:id` |
| GET | `/api/simulation/status` |
| POST | `/api/simulation/reset` |
| GET/POST/PUT/DELETE | `/api/admin/*` |

### 10.3. Tham số đặt vé (POST /api/booking)

```json
{
  "ma_chuyen": 1,
  "ma_ghe": 1,
  "ma_khach_hang": 1,
  "che_do_khoa": "BI_QUAN",
  "session_id": "TX_A",
  "delay_ms": 3000
}
```

### 10.4. Cấu trúc thư mục dự án

```
D:\HOC TAP\DBMS\
├── database\          # Script SQL, SP, Deadlock demo
├── backend\           # Express API
├── frontend\          # React UI
├── docs\              # Tài liệu demo (file này)
└── stitch_...\        # Giao diện mẫu Stitch
```

---

## CHECKLIST TRƯỚC KHI VÀO PHÒNG DEMO

- [ ] SQL Server đang chạy, database BusBookingDB có dữ liệu
- [ ] Backend `npm run dev` — port 3001 OK
- [ ] Frontend `npm run dev` — port 5173 OK
- [ ] SSMS mở sẵn file `05_deadlock_demo.sql`
- [ ] Đã reset TRANSACTION_LOG
- [ ] Ghế A1 trống (chuyến 1)
- [ ] 3 tab trình duyệt mở sẵn trang `/simulation`

---

*Tài liệu thuộc dự án BusTicket Pro — Đề tài DBMS, 2026.*