/*
================================================================================
  TEST CONCURRENCY - Chạy trên 2 cửa sổ SSMS để so sánh 3 chế độ khóa
================================================================================

  KỊCH BẢN: 2 transaction cùng đặt ghế A1 trên chuyến 1

  KHONG_KHOA: Cả 2 có thể đọc "ghế trống" → 1 COMMIT, 1 lỗi unique (hoặc cả 2 commit nếu không có unique)
  BI_QUAN:    Transaction thứ 2 phải CHỜ → chỉ 1 COMMIT
  LE_QUAN:    Transaction đến sau bị ROLLBACK do rowversion conflict
================================================================================
*/

USE BusBookingDB;
GO

-- Reset log trước khi test
EXEC dbo.sp_ResetMoPhong;
GO

PRINT N'';
PRINT N'=== TEST 1: KHONG_KHOA (Lost Update) ===';
PRINT N'Chạy 2 lần đồng thời trên 2 cửa sổ SSMS:';
PRINT N'';

-- Script chạy trên CẢ 2 cửa sổ (thay @ma_khach_hang khác nhau)
DECLARE @ma_ve INT, @ket_qua NVARCHAR(20), @thong_bao NVARCHAR(500);
DECLARE @ma_ghe_A1 INT;

SELECT @ma_ghe_A1 = g.ma_ghe
FROM dbo.GHE g
INNER JOIN dbo.CHUYEN_XE cx ON cx.ma_xe = g.ma_xe
WHERE cx.ma_chuyen = 1 AND g.so_ghe = N'A1';

-- Đảm bảo ghế A1 trống trước test
UPDATE dbo.VE SET trang_thai = N'DA_HUY' WHERE ma_chuyen = 1 AND ma_ghe = @ma_ghe_A1 AND trang_thai = N'DA_DAT';
UPDATE dbo.GHE SET trang_thai = N'TRONG' WHERE ma_ghe = @ma_ghe_A1;

EXEC dbo.sp_DatVe
    @ma_chuyen = 1,
    @ma_ghe = @ma_ghe_A1,
    @ma_khach_hang = 1,          -- Cửa sổ 2 đổi thành 2
    @che_do_khoa = N'KHONG_KHOA',
    @session_id = N'TX_TEST_A',
    @delay_ms = 3000,           -- 3 giây delay để tạo race condition
    @ma_ve = @ma_ve OUTPUT,
    @ket_qua = @ket_qua OUTPUT,
    @thong_bao = @thong_bao OUTPUT;

SELECT @ket_qua AS ket_qua, @thong_bao AS thong_bao, @ma_ve AS ma_ve;
GO

/*
-- Cửa sổ 2: chạy ngay sau cửa sổ 1 (trong vòng 3 giây)
DECLARE @ma_ve INT, @ket_qua NVARCHAR(20), @thong_bao NVARCHAR(500);
DECLARE @ma_ghe_A1 INT;

SELECT @ma_ghe_A1 = g.ma_ghe
FROM dbo.GHE g INNER JOIN dbo.CHUYEN_XE cx ON cx.ma_xe = g.ma_xe
WHERE cx.ma_chuyen = 1 AND g.so_ghe = N'A1';

EXEC dbo.sp_DatVe
    @ma_chuyen = 1, @ma_ghe = @ma_ghe_A1, @ma_khach_hang = 2,
    @che_do_khoa = N'KHONG_KHOA', @session_id = N'TX_TEST_B',
    @delay_ms = 3000,
    @ma_ve = @ma_ve OUTPUT, @ket_qua = @ket_qua OUTPUT, @thong_bao = @thong_bao OUTPUT;

SELECT @ket_qua AS ket_qua, @thong_bao AS thong_bao;
*/

PRINT N'';
PRINT N'=== TEST 2: BI_QUAN (Pessimistic Locking) ===';
GO

-- Reset ghế A1
DECLARE @ma_ghe_A1 INT;
SELECT @ma_ghe_A1 = g.ma_ghe FROM dbo.GHE g
INNER JOIN dbo.CHUYEN_XE cx ON cx.ma_xe = g.ma_xe WHERE cx.ma_chuyen = 1 AND g.so_ghe = N'A1';
UPDATE dbo.VE SET trang_thai = N'DA_HUY' WHERE ma_chuyen = 1 AND ma_ghe = @ma_ghe_A1;
UPDATE dbo.GHE SET trang_thai = N'TRONG' WHERE ma_ghe = @ma_ghe_A1;
GO

DECLARE @ma_ve INT, @ket_qua NVARCHAR(20), @thong_bao NVARCHAR(500);
DECLARE @ma_ghe_A1 INT;
SELECT @ma_ghe_A1 = g.ma_ghe FROM dbo.GHE g
INNER JOIN dbo.CHUYEN_XE cx ON cx.ma_xe = g.ma_xe WHERE cx.ma_chuyen = 1 AND g.so_ghe = N'A1';

EXEC dbo.sp_DatVe
    @ma_chuyen = 1, @ma_ghe = @ma_ghe_A1, @ma_khach_hang = 3,
    @che_do_khoa = N'BI_QUAN', @session_id = N'TX_PESS_A', @delay_ms = 5000,
    @ma_ve = @ma_ve OUTPUT, @ket_qua = @ket_qua OUTPUT, @thong_bao = @thong_bao OUTPUT;

SELECT @ket_qua AS ket_qua, @thong_bao AS thong_bao;
-- Cửa sổ 2 chạy tương tự với @ma_khach_hang = 4 → sẽ thấy WAITING/BLOCKED
GO

PRINT N'';
PRINT N'=== XEM KẾT QUẢ LOG ===';
SELECT * FROM dbo.TRANSACTION_LOG ORDER BY ma_log DESC;
EXEC dbo.sp_ThongKeMoPhong;
GO