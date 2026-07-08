/*
================================================================================
  DỮ LIỆU MẪU - Phục vụ demo mô phỏng Concurrency & Deadlock
================================================================================
*/

USE BusBookingDB;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;
GO

-- ============================================================================
-- CẤU HÌNH HỆ THỐNG
-- ============================================================================
INSERT INTO dbo.CAU_HINH_HE_THONG (ten_cau_hinh, gia_tri, mo_ta)
VALUES
    (N'CHE_DO_KHOA_MAC_DINH', N'BI_QUAN', N'Chế độ khóa mặc định: KHONG_KHOA | BI_QUAN | LE_QUAN'),
    (N'THOI_GIAN_CHO_MO_PHONG', N'3000', N'Thời gian chờ mô phỏng (ms) giữa READ và WRITE'),
    (N'HIEN_THI_LOG', N'1', N'Bật ghi log transaction (1=bật, 0=tắt)');
GO

-- ============================================================================
-- KHÁCH HÀNG
-- ============================================================================
INSERT INTO dbo.KHACH_HANG (ho_ten, email, so_dien_thoai)
VALUES
    (N'Nguyễn Văn An',    N'an.nguyen@email.com',    N'0901234567'),
    (N'Trần Thị Bình',    N'binh.tran@email.com',    N'0912345678'),
    (N'Lê Hoàng Cường',   N'cuong.le@email.com',     N'0923456789'),
    (N'Phạm Minh Dũng',   N'dung.pham@email.com',    N'0934567890'),
    (N'Hoàng Thị Em',     N'em.hoang@email.com',     N'0945678901');
GO

-- ============================================================================
-- XE (2 xe 40 ghế - dùng cho demo deadlock ghế A1, A2)
-- ============================================================================
INSERT INTO dbo.XE (bien_so, loai_xe, so_ghe)
VALUES
    (N'51B-12345', N'Giường nằm 40 chỗ', 40),
    (N'51B-67890', N'Ghế ngồi 40 chỗ',   40),
    (N'51C-11111', N'Giường nằm 34 chỗ', 34);
GO

-- ============================================================================
-- TUYẾN XE
-- ============================================================================
INSERT INTO dbo.TUYEN_XE (ten_tuyen, diem_di, diem_den, khoang_cach_km, thoi_gian_chay)
VALUES
    (N'HCM - Đà Lạt',     N'TP. Hồ Chí Minh', N'Đà Lạt',     308.00, 480),
    (N'HCM - Nha Trang',  N'TP. Hồ Chí Minh', N'Nha Trang',  448.00, 540),
    (N'HCM - Cần Thơ',    N'TP. Hồ Chí Minh', N'Cần Thơ',    169.00, 240),
    (N'HCM - Vũng Tàu',   N'TP. Hồ Chí Minh', N'Vũng Tàu',   125.00, 180);
GO

-- ============================================================================
-- GHẾ - Tạo ghế cho từng xe
--   Hàng A: A1-A4 (tầng 1, dùng demo deadlock)
--   Hàng B-J: mỗi hàng 4 ghế
-- ============================================================================
DECLARE @ma_xe INT = 1;
DECLARE @hang CHAR(1);
DECLARE @so INT;
DECLARE @so_ghe NVARCHAR(10);

WHILE @ma_xe <= 3
BEGIN
    SET @hang = 'A';
    WHILE @hang <= 'J'
    BEGIN
        SET @so = 1;
        WHILE @so <= 4
        BEGIN
            SET @so_ghe = @hang + CAST(@so AS NVARCHAR(2));
            INSERT INTO dbo.GHE (ma_xe, so_ghe, tang, vi_tri)
            VALUES (
                @ma_xe,
                @so_ghe,
                CASE WHEN @hang <= 'E' THEN 1 ELSE 2 END,
                CASE
                    WHEN @so = 1 OR @so = 4 THEN N'CUA_SO'
                    WHEN @so = 2 THEN N'GIUA'
                    ELSE N'LOI_DI'
                END
            );
            SET @so = @so + 1;
        END
        SET @hang = CHAR(ASCII(@hang) + 1);
    END
    SET @ma_xe = @ma_xe + 1;
END
GO

-- ============================================================================
-- CHUYẾN XE
-- ============================================================================
INSERT INTO dbo.CHUYEN_XE (ma_tuyen, ma_xe, gio_khoi_hanh, gia_ve, trang_thai)
VALUES
    (1, 1, DATEADD(HOUR, 6,  CAST(CAST(GETDATE() AS DATE) AS DATETIME2)), 350000, N'MO'),  -- HCM-ĐL sáng mai
    (1, 2, DATEADD(HOUR, 14, CAST(CAST(GETDATE() AS DATE) AS DATETIME2)), 320000, N'MO'), -- HCM-ĐL chiều
    (2, 1, DATEADD(HOUR, 7,  CAST(CAST(GETDATE() AS DATE) AS DATETIME2)), 280000, N'MO'),  -- HCM-NT
    (3, 3, DATEADD(HOUR, 8,  CAST(CAST(GETDATE() AS DATE) AS DATETIME2)), 180000, N'MO'),  -- HCM-CT
    (4, 2, DATEADD(HOUR, 10, CAST(CAST(GETDATE() AS DATE) AS DATETIME2)), 150000, N'MO');  -- HCM-VT
GO

-- ============================================================================
-- VÉ MẪU (một số ghế đã đặt sẵn để demo UI)
-- ============================================================================
-- Chuyến 1 (xe 1): ghế B1, B2 đã đặt
INSERT INTO dbo.VE (ma_chuyen, ma_ghe, ma_khach_hang, gia_thanh_toan)
SELECT 1, ma_ghe, 1, 350000
FROM dbo.GHE
WHERE ma_xe = 1 AND so_ghe IN (N'B1', N'B2');

UPDATE dbo.GHE SET trang_thai = N'DA_DAT'
WHERE ma_xe = 1 AND so_ghe IN (N'B1', N'B2');

-- Chuyến 1: ghế C3 đã đặt bởi khách 2
INSERT INTO dbo.VE (ma_chuyen, ma_ghe, ma_khach_hang, gia_thanh_toan)
SELECT 1, ma_ghe, 2, 350000
FROM dbo.GHE WHERE ma_xe = 1 AND so_ghe = N'C3';

UPDATE dbo.GHE SET trang_thai = N'DA_DAT'
WHERE ma_xe = 1 AND so_ghe = N'C3';

-- Chuyến 3: ghế A3 đã đặt
INSERT INTO dbo.VE (ma_chuyen, ma_ghe, ma_khach_hang, gia_thanh_toan)
SELECT 3, ma_ghe, 3, 280000
FROM dbo.GHE WHERE ma_xe = 1 AND so_ghe = N'A3';

UPDATE dbo.GHE SET trang_thai = N'DA_DAT'
WHERE ma_xe = 1 AND so_ghe = N'A3';
GO

PRINT N'[OK] Dữ liệu mẫu đã được nạp.';
PRINT N'';
PRINT N'--- Thông tin demo Deadlock ---';
PRINT N'Chuyến xe mã 1 (HCM-Đà Lạt) - Xe 51B-12345';
PRINT N'Ghế A1, A2 còn TRỐNG - dùng cho Deadlock Simulator';
PRINT N'';
PRINT N'--- Thống kê ---';

SELECT N'Khách hàng' AS bang, COUNT(*) AS so_luong FROM dbo.KHACH_HANG
UNION ALL SELECT N'Xe', COUNT(*) FROM dbo.XE
UNION ALL SELECT N'Tuyến xe', COUNT(*) FROM dbo.TUYEN_XE
UNION ALL SELECT N'Ghế', COUNT(*) FROM dbo.GHE
UNION ALL SELECT N'Chuyến xe', COUNT(*) FROM dbo.CHUYEN_XE
UNION ALL SELECT N'Vé', COUNT(*) FROM dbo.VE WHERE trang_thai = N'DA_DAT';
GO