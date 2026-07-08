/*
================================================================================
  DEADLOCK DEMO - Chạy trên 2 cửa sổ SSMS
================================================================================

  KỊCH BẢN:
    Transaction A (Cửa sổ 1): Khóa ghế A1 → Đợi ghế A2
    Transaction B (Cửa sổ 2): Khóa ghế A2 → Đợi ghế A1
    → SQL Server phát hiện Deadlock qua Wait-For Graph
    → Chọn 1 transaction làm VICTIM → Error 1205

  HƯỚNG DẪN:
    1. Mở 2 cửa sổ Query trong SSMS, cùng kết nối database BusBookingDB
    2. Cửa sổ 1: Chạy từng khối SCRIPT A (từng bước, dừng ở WAITFOR)
    3. Cửa sổ 2: Chạy từng khối SCRIPT B tương tự
    4. Khi cả 2 cùng chờ nhau → Deadlock xảy ra

  LƯU Ý: Chạy phần SETUP trước khi demo.
================================================================================
*/

USE BusBookingDB;
GO

-- ============================================================================
-- SETUP: Lấy mã ghế A1, A2 của chuyến xe 1 (HCM - Đà Lạt)
-- ============================================================================
PRINT N'=== THÔNG TIN GHẾ DEMO DEADLOCK ===';

SELECT
    cx.ma_chuyen,
    tx.ten_tuyen,
    g.ma_ghe,
    g.so_ghe,
    g.trang_thai
FROM dbo.CHUYEN_XE cx
INNER JOIN dbo.TUYEN_XE tx ON tx.ma_tuyen = cx.ma_tuyen
INNER JOIN dbo.XE x ON x.ma_xe = cx.ma_xe
INNER JOIN dbo.GHE g ON g.ma_xe = x.ma_xe
WHERE cx.ma_chuyen = 1 AND g.so_ghe IN (N'A1', N'A2');
GO

/*
================================================================================
  SCRIPT A - Chạy trong CỬA SỔ SSMS THỨ 1
  Transaction A: Khóa A1 trước, sau đó đợi A2
================================================================================
*/

-- BƯỚC A1: Bắt đầu transaction, khóa ghế A1
BEGIN TRANSACTION TxA;

DECLARE @ma_ghe_A1 INT, @ma_ghe_A2 INT, @ma_chuyen INT = 1;

SELECT @ma_ghe_A1 = g.ma_ghe
FROM dbo.GHE g
INNER JOIN dbo.CHUYEN_XE cx ON cx.ma_xe = g.ma_xe
WHERE cx.ma_chuyen = @ma_chuyen AND g.so_ghe = N'A1';

-- Khóa ghế A1 bằng XLOCK (Exclusive Lock)
SELECT g.so_ghe, g.trang_thai
FROM dbo.GHE g WITH (XLOCK, ROWLOCK)
WHERE g.ma_ghe = @ma_ghe_A1;

PRINT N'[Tx A] Đã khóa ghế A1. Session ID: ' + CAST(@@SPID AS NVARCHAR(10));
PRINT N'[Tx A] Chờ 10 giây trước khi yêu cầu khóa A2...';
WAITFOR DELAY '00:00:10';

-- BƯỚC A2: Cố gắng khóa ghế A2 → Sẽ bị BLOCK nếu Tx B đã khóa A2
SELECT @ma_ghe_A2 = g.ma_ghe
FROM dbo.GHE g
INNER JOIN dbo.CHUYEN_XE cx ON cx.ma_xe = g.ma_xe
WHERE cx.ma_chuyen = @ma_chuyen AND g.so_ghe = N'A2';

SELECT g.so_ghe, g.trang_thai
FROM dbo.GHE g WITH (XLOCK, ROWLOCK)
WHERE g.ma_ghe = @ma_ghe_A2;

PRINT N'[Tx A] Đã khóa cả A1 và A2.';
COMMIT TRANSACTION TxA;
GO

/*
================================================================================
  SCRIPT B - Chạy trong CỬA SỔ SSMS THỨ 2
  Transaction B: Khóa A2 trước, sau đó đợi A1
================================================================================
*/

-- BƯỚC B1: Bắt đầu transaction, khóa ghế A2
BEGIN TRANSACTION TxB;

DECLARE @ma_ghe_A1 INT, @ma_ghe_A2 INT, @ma_chuyen INT = 1;

SELECT @ma_ghe_A2 = g.ma_ghe
FROM dbo.GHE g
INNER JOIN dbo.CHUYEN_XE cx ON cx.ma_xe = g.ma_xe
WHERE cx.ma_chuyen = @ma_chuyen AND g.so_ghe = N'A2';

-- Khóa ghế A2 bằng XLOCK
SELECT g.so_ghe, g.trang_thai
FROM dbo.GHE g WITH (XLOCK, ROWLOCK)
WHERE g.ma_ghe = @ma_ghe_A2;

PRINT N'[Tx B] Đã khóa ghế A2. Session ID: ' + CAST(@@SPID AS NVARCHAR(10));
PRINT N'[Tx B] Chờ 10 giây trước khi yêu cầu khóa A1...';
WAITFOR DELAY '00:00:10';

-- BƯỚC B2: Cố gắng khóa ghế A1 → DEADLOCK!
SELECT @ma_ghe_A1 = g.ma_ghe
FROM dbo.GHE g
INNER JOIN dbo.CHUYEN_XE cx ON cx.ma_xe = g.ma_xe
WHERE cx.ma_chuyen = @ma_chuyen AND g.so_ghe = N'A1';

SELECT g.so_ghe, g.trang_thai
FROM dbo.GHE g WITH (XLOCK, ROWLOCK)
WHERE g.ma_ghe = @ma_ghe_A1;

PRINT N'[Tx B] Đã khóa cả A2 và A1.';
COMMIT TRANSACTION TxB;
GO

/*
================================================================================
  GIẢI THÍCH LÝ THUYẾT (Wait-For Graph)
================================================================================

  Wait-For Graph là đồ thị có hướng mà SQL Server dùng để phát hiện Deadlock:

    [Tx A] ──đợi──> [Lock A2] <──giữ── [Tx B]
    [Tx B] ──đợi──> [Lock A1] <──giữ── [Tx A]

  → Tồn tại chu trình (cycle) → Deadlock detected!

  Deadlock Victim:
    - SQL Server chọn 1 transaction làm "nạn nhân" (victim)
    - Tiêu chí: transaction ít tốn kém rollback nhất (thường là SPID nhỏ hơn)
    - Victim nhận Error 1205: "Transaction was deadlocked on lock resources
      with another process and has been chosen as the deadlock victim."

  Khắc phục:
    - Đặt thứ tự khóa nhất quán (luôn khóa A1 trước A2)
    - Giảm thời gian giữ lock (transaction ngắn)
    - Dùng READ COMMITTED SNAPSHOT (RCSI)
    - Retry logic khi gặp Error 1205
================================================================================
*/

-- ============================================================================
-- TRUY VẤN KIỂM TRA SAU KHI DEADLOCK
-- ============================================================================
SELECT TOP 20 * FROM dbo.DEADLOCK_LOG ORDER BY thoi_gian DESC;
SELECT TOP 20 * FROM dbo.TRANSACTION_LOG WHERE trang_thai = N'DEADLOCK' ORDER BY thoi_gian_bat_dau DESC;
GO