/*
================================================================================
  STORED PROCEDURES - Transaction + Concurrency Control
  Tất cả SP sử dụng: BEGIN TRANSACTION, COMMIT, ROLLBACK, TRY...CATCH

  Ba chế độ khóa (@che_do_khoa):
    KHONG_KHOA  - Không khóa → minh họa Lost Update
    BI_QUAN     - Pessimistic Locking (UPDLOCK, XLOCK, HOLDLOCK)
    LE_QUAN     - Optimistic Locking (rowversion)
================================================================================
*/

USE BusBookingDB;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- ============================================================================
-- HÀM TIỆN ÍCH: Ghi log transaction
-- ============================================================================
CREATE OR ALTER PROCEDURE dbo.sp_GhiLogTransaction
    @session_id     NVARCHAR(50),
    @ten_thu_tuc    NVARCHAR(100),
    @che_do_khoa    NVARCHAR(20),
    @trang_thai     NVARCHAR(20),
    @ma_chuyen      INT = NULL,
    @ma_ghe         INT = NULL,
    @ma_khach_hang  INT = NULL,
    @ma_ve          INT = NULL,
    @thong_bao      NVARCHAR(500) = NULL,
    @error_code     INT = NULL,
    @thoi_gian_cho  INT = NULL,
    @ma_log         BIGINT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.TRANSACTION_LOG (
        session_id, ten_thu_tuc, che_do_khoa, trang_thai,
        ma_chuyen, ma_ghe, ma_khach_hang, ma_ve,
        thong_bao, error_code, thoi_gian_cho_ms
    )
    VALUES (
        @session_id, @ten_thu_tuc, @che_do_khoa, @trang_thai,
        @ma_chuyen, @ma_ghe, @ma_khach_hang, @ma_ve,
        @thong_bao, @error_code, @thoi_gian_cho
    );

    SET @ma_log = SCOPE_IDENTITY();
END
GO

-- ============================================================================
-- sp_DanhSachGhe - Lấy sơ đồ ghế của một chuyến xe
-- ============================================================================
CREATE OR ALTER PROCEDURE dbo.sp_DanhSachGhe
    @ma_chuyen INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ma_xe INT;
    SELECT @ma_xe = ma_xe FROM dbo.CHUYEN_XE WHERE ma_chuyen = @ma_chuyen;

    IF @ma_xe IS NULL
    BEGIN
        RAISERROR(N'Không tìm thấy chuyến xe mã %d.', 16, 1, @ma_chuyen);
        RETURN;
    END

    SELECT
        g.ma_ghe,
        g.so_ghe,
        g.tang,
        g.vi_tri,
        CASE
            WHEN v.ma_ve IS NOT NULL AND v.trang_thai = N'DA_DAT' THEN N'DA_DAT'
            WHEN g.trang_thai = N'KHOA' THEN N'KHOA'
            ELSE N'TRONG'
        END AS trang_thai_ghe,
        v.ma_ve,
        kh.ho_ten AS ten_khach_dat
    FROM dbo.GHE g
    LEFT JOIN dbo.VE v
        ON v.ma_ghe = g.ma_ghe
        AND v.ma_chuyen = @ma_chuyen
        AND v.trang_thai = N'DA_DAT'
    LEFT JOIN dbo.KHACH_HANG kh ON kh.ma_khach_hang = v.ma_khach_hang
    WHERE g.ma_xe = @ma_xe
    ORDER BY g.tang, g.so_ghe;
END
GO

-- ============================================================================
-- sp_DanhSachVe - Danh sách vé (lọc theo khách hàng nếu có)
-- ============================================================================
CREATE OR ALTER PROCEDURE dbo.sp_DanhSachVe
    @ma_khach_hang INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        v.ma_ve,
        v.ma_chuyen,
        kh.ma_khach_hang,
        kh.ho_ten AS ten_khach_hang,
        g.so_ghe,
        g.tang,
        tx.ten_tuyen,
        tx.diem_di,
        tx.diem_den,
        cx.gio_khoi_hanh,
        v.gia_thanh_toan,
        v.trang_thai,
        v.ngay_dat
    FROM dbo.VE v
    INNER JOIN dbo.KHACH_HANG kh ON kh.ma_khach_hang = v.ma_khach_hang
    INNER JOIN dbo.GHE g ON g.ma_ghe = v.ma_ghe
    INNER JOIN dbo.CHUYEN_XE cx ON cx.ma_chuyen = v.ma_chuyen
    INNER JOIN dbo.TUYEN_XE tx ON tx.ma_tuyen = cx.ma_tuyen
    WHERE (@ma_khach_hang IS NULL OR v.ma_khach_hang = @ma_khach_hang)
    ORDER BY v.ngay_dat DESC;
END
GO

-- ============================================================================
-- sp_DatVe - Đặt vé với 3 chế độ Concurrency Control
-- ============================================================================
CREATE OR ALTER PROCEDURE dbo.sp_DatVe
    @ma_chuyen          INT,
    @ma_ghe             INT,
    @ma_khach_hang      INT,
    @che_do_khoa        NVARCHAR(20) = N'BI_QUAN',
    @session_id         NVARCHAR(50) = NULL,
    @delay_ms           INT = 0,          -- Thời gian chờ mô phỏng (ms)
    @ma_ve              INT OUTPUT,
    @ket_qua            NVARCHAR(20) OUTPUT,
    @thong_bao          NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT OFF;

    DECLARE @ma_log BIGINT;
    DECLARE @bat_dau DATETIME2(3) = SYSDATETIME();
    DECLARE @gia_ve DECIMAL(18,2);
    DECLARE @ma_xe INT;
    DECLARE @so_ghe NVARCHAR(10);
    DECLARE @da_dat INT = 0;
    DECLARE @row_version_ghe BINARY(8);
    DECLARE @row_version_ghe_moi BINARY(8);
    DECLARE @sid NVARCHAR(50) = ISNULL(@session_id, CAST(@@SPID AS NVARCHAR(50)));
    DECLARE @delay_time VARCHAR(12);

    SET @ma_ve = NULL;
    SET @ket_qua = N'ROLLBACK';
    SET @thong_bao = N'';

    -- Validate chế độ khóa
    IF @che_do_khoa NOT IN (N'KHONG_KHOA', N'BI_QUAN', N'LE_QUAN')
    BEGIN
        SET @thong_bao = N'Chế độ khóa không hợp lệ. Dùng: KHONG_KHOA | BI_QUAN | LE_QUAN';
        RETURN;
    END

    -- Ghi log: bắt đầu
    EXEC dbo.sp_GhiLogTransaction
        @sid, N'sp_DatVe', @che_do_khoa, N'RUNNING',
        @ma_chuyen, @ma_ghe, @ma_khach_hang, NULL,
        N'Bắt đầu transaction đặt vé', NULL, NULL, @ma_log OUTPUT;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Lấy thông tin chuyến xe
        SELECT @gia_ve = gia_ve, @ma_xe = ma_xe
        FROM dbo.CHUYEN_XE
        WHERE ma_chuyen = @ma_chuyen AND trang_thai = N'MO';

        IF @gia_ve IS NULL
        BEGIN
            SET @thong_bao = N'Chuyến xe không tồn tại hoặc đã đóng.';
            ROLLBACK TRANSACTION;
            GOTO FINISH;
        END

        -- ================================================================
        -- CHẾ ĐỘ 1: KHONG_KHOA - Đọc không khóa → dễ xảy ra Lost Update
        -- ================================================================
        IF @che_do_khoa = N'KHONG_KHOA'
        BEGIN
            -- Đọc trạng thái KHÔNG dùng lock hint → transaction khác có thể ghi đồng thời
            SELECT @so_ghe = so_ghe
            FROM dbo.GHE
            WHERE ma_ghe = @ma_ghe AND ma_xe = @ma_xe;

            SELECT @da_dat = COUNT(*)
            FROM dbo.VE
            WHERE ma_chuyen = @ma_chuyen AND ma_ghe = @ma_ghe AND trang_thai = N'DA_DAT';

            -- Mô phỏng độ trễ: trong thời gian này transaction khác có thể chen vào
            IF @delay_ms > 0
            BEGIN
                SET @delay_time = CONVERT(VARCHAR(12), DATEADD(MILLISECOND, @delay_ms, '00:00:00'), 114);
                WAITFOR DELAY @delay_time;
            END

            IF @da_dat > 0
            BEGIN
                SET @thong_bao = N'Ghế đã được đặt (Lost Update có thể xảy ra nếu 2 TX cùng đọc trước khi ghi).';
                ROLLBACK TRANSACTION;
                GOTO FINISH;
            END
        END

        -- ================================================================
        -- CHẾ ĐỘ 2: BI_QUAN - Pessimistic Locking
        -- UPDLOCK: khóa cập nhật, ngăn transaction khác đọc để sửa
        -- HOLDLOCK: giữ khóa đến hết transaction (tương đương SERIALIZABLE scope)
        -- ================================================================
        IF @che_do_khoa = N'BI_QUAN'
        BEGIN
            -- Khóa bản ghi ghế → transaction khác phải CHỜ (WAITING/BLOCKED)
            SELECT @so_ghe = so_ghe
            FROM dbo.GHE WITH (UPDLOCK, HOLDLOCK, ROWLOCK)
            WHERE ma_ghe = @ma_ghe AND ma_xe = @ma_xe;

            IF @so_ghe IS NULL
            BEGIN
                SET @thong_bao = N'Ghế không thuộc xe của chuyến này.';
                ROLLBACK TRANSACTION;
                GOTO FINISH;
            END

            -- Khóa kiểm tra vé hiện có
            SELECT @da_dat = COUNT(*)
            FROM dbo.VE WITH (UPDLOCK, HOLDLOCK, ROWLOCK)
            WHERE ma_chuyen = @ma_chuyen AND ma_ghe = @ma_ghe AND trang_thai = N'DA_DAT';

            IF @delay_ms > 0
            BEGIN
                SET @delay_time = CONVERT(VARCHAR(12), DATEADD(MILLISECOND, @delay_ms, '00:00:00'), 114);
                WAITFOR DELAY @delay_time;
            END

            IF @da_dat > 0
            BEGIN
                SET @thong_bao = N'Ghế đã được đặt. Transaction bị chặn bởi Pessimistic Lock.';
                ROLLBACK TRANSACTION;
                GOTO FINISH;
            END
        END

        -- ================================================================
        -- CHẾ ĐỘ 3: LE_QUAN - Optimistic Locking với rowversion
        -- Đọc rowversion lúc đầu, kiểm tra lại trước khi COMMIT
        -- ================================================================
        IF @che_do_khoa = N'LE_QUAN'
        BEGIN
            SELECT @so_ghe = so_ghe, @row_version_ghe = row_version
            FROM dbo.GHE
            WHERE ma_ghe = @ma_ghe AND ma_xe = @ma_xe;

            SELECT @da_dat = COUNT(*)
            FROM dbo.VE
            WHERE ma_chuyen = @ma_chuyen AND ma_ghe = @ma_ghe AND trang_thai = N'DA_DAT';

            IF @delay_ms > 0
            BEGIN
                SET @delay_time = CONVERT(VARCHAR(12), DATEADD(MILLISECOND, @delay_ms, '00:00:00'), 114);
                WAITFOR DELAY @delay_time;
            END

            -- Kiểm tra rowversion: nếu đã thay đổi → rollback (Optimistic conflict)
            SELECT @row_version_ghe_moi = row_version
            FROM dbo.GHE
            WHERE ma_ghe = @ma_ghe;

            IF @row_version_ghe_moi <> @row_version_ghe OR @da_dat > 0
            BEGIN
                SET @thong_bao = N'Optimistic Lock conflict: dữ liệu đã thay đổi. Transaction rollback.';
                ROLLBACK TRANSACTION;
                GOTO FINISH;
            END
        END

        -- Tạo vé
        INSERT INTO dbo.VE (ma_chuyen, ma_ghe, ma_khach_hang, gia_thanh_toan)
        VALUES (@ma_chuyen, @ma_ghe, @ma_khach_hang, @gia_ve);

        SET @ma_ve = SCOPE_IDENTITY();

        UPDATE dbo.GHE SET trang_thai = N'DA_DAT' WHERE ma_ghe = @ma_ghe;

        COMMIT TRANSACTION;

        SET @ket_qua = N'COMMIT';
        SET @thong_bao = N'Đặt vé thành công. Mã vé: ' + CAST(@ma_ve AS NVARCHAR(20));

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SET @ket_qua = N'ROLLBACK';
        SET @thong_bao = ERROR_MESSAGE();

        -- Ghi nhận Deadlock (Error 1205)
        IF ERROR_NUMBER() = 1205
        BEGIN
            INSERT INTO dbo.DEADLOCK_LOG (session_victim, session_blocker, thong_bao)
            VALUES (@@SPID, NULL, ERROR_MESSAGE());

            UPDATE dbo.TRANSACTION_LOG
            SET trang_thai = N'DEADLOCK', error_code = 1205, thong_bao = ERROR_MESSAGE(),
                thoi_gian_ket_thuc = SYSDATETIME()
            WHERE ma_log = @ma_log;
        END
    END CATCH

    FINISH:
    -- Cập nhật log kết thúc
    UPDATE dbo.TRANSACTION_LOG
    SET
        trang_thai = @ket_qua,
        ma_ve = @ma_ve,
        thong_bao = @thong_bao,
        thoi_gian_ket_thuc = SYSDATETIME(),
        thoi_gian_cho_ms = DATEDIFF(MILLISECOND, @bat_dau, SYSDATETIME())
    WHERE ma_log = @ma_log;
END
GO

-- ============================================================================
-- sp_HuyVe - Hủy vé
-- ============================================================================
CREATE OR ALTER PROCEDURE dbo.sp_HuyVe
    @ma_ve          INT,
    @che_do_khoa    NVARCHAR(20) = N'BI_QUAN',
    @session_id     NVARCHAR(50) = NULL,
    @ket_qua        NVARCHAR(20) OUTPUT,
    @thong_bao      NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ma_log BIGINT;
    DECLARE @ma_ghe INT;
    DECLARE @ma_chuyen INT;
    DECLARE @sid NVARCHAR(50) = ISNULL(@session_id, CAST(@@SPID AS NVARCHAR(50)));

    SET @ket_qua = N'ROLLBACK';
    SET @thong_bao = N'';

    EXEC dbo.sp_GhiLogTransaction
        @sid, N'sp_HuyVe', @che_do_khoa, N'RUNNING',
        NULL, NULL, NULL, @ma_ve, N'Bắt đầu hủy vé', NULL, NULL, @ma_log OUTPUT;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF @che_do_khoa = N'BI_QUAN'
        BEGIN
            SELECT @ma_ghe = ma_ghe, @ma_chuyen = ma_chuyen
            FROM dbo.VE WITH (UPDLOCK, HOLDLOCK, ROWLOCK)
            WHERE ma_ve = @ma_ve AND trang_thai = N'DA_DAT';
        END
        ELSE
        BEGIN
            SELECT @ma_ghe = ma_ghe, @ma_chuyen = ma_chuyen
            FROM dbo.VE
            WHERE ma_ve = @ma_ve AND trang_thai = N'DA_DAT';
        END

        IF @ma_ghe IS NULL
        BEGIN
            SET @thong_bao = N'Vé không tồn tại hoặc đã bị hủy.';
            ROLLBACK TRANSACTION;
            GOTO FINISH_HUY;
        END

        UPDATE dbo.VE SET trang_thai = N'DA_HUY' WHERE ma_ve = @ma_ve;
        UPDATE dbo.GHE SET trang_thai = N'TRONG' WHERE ma_ghe = @ma_ghe;

        COMMIT TRANSACTION;
        SET @ket_qua = N'COMMIT';
        SET @thong_bao = N'Hủy vé thành công.';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SET @ket_qua = N'ROLLBACK';
        SET @thong_bao = ERROR_MESSAGE();

        IF ERROR_NUMBER() = 1205
            INSERT INTO dbo.DEADLOCK_LOG (session_victim, thong_bao)
            VALUES (@@SPID, ERROR_MESSAGE());
    END CATCH

    FINISH_HUY:
    UPDATE dbo.TRANSACTION_LOG
    SET trang_thai = @ket_qua, thong_bao = @thong_bao, thoi_gian_ket_thuc = SYSDATETIME()
    WHERE ma_log = @ma_log;
END
GO

-- ============================================================================
-- sp_DoiVe - Đổi ghế
-- ============================================================================
CREATE OR ALTER PROCEDURE dbo.sp_DoiVe
    @ma_ve              INT,
    @ma_ghe_moi         INT,
    @che_do_khoa        NVARCHAR(20) = N'BI_QUAN',
    @session_id         NVARCHAR(50) = NULL,
    @ket_qua            NVARCHAR(20) OUTPUT,
    @thong_bao          NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ma_log BIGINT;
    DECLARE @ma_ghe_cu INT;
    DECLARE @ma_chuyen INT;
    DECLARE @ma_xe INT;
    DECLARE @da_dat INT = 0;
    DECLARE @sid NVARCHAR(50) = ISNULL(@session_id, CAST(@@SPID AS NVARCHAR(50)));

    SET @ket_qua = N'ROLLBACK';

    EXEC dbo.sp_GhiLogTransaction
        @sid, N'sp_DoiVe', @che_do_khoa, N'RUNNING',
        NULL, @ma_ghe_moi, NULL, @ma_ve, N'Bắt đầu đổi vé', NULL, NULL, @ma_log OUTPUT;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Khóa vé hiện tại
        IF @che_do_khoa = N'BI_QUAN'
            SELECT @ma_ghe_cu = ma_ghe, @ma_chuyen = ma_chuyen
            FROM dbo.VE WITH (UPDLOCK, HOLDLOCK, ROWLOCK)
            WHERE ma_ve = @ma_ve AND trang_thai = N'DA_DAT';
        ELSE
            SELECT @ma_ghe_cu = ma_ghe, @ma_chuyen = ma_chuyen
            FROM dbo.VE WHERE ma_ve = @ma_ve AND trang_thai = N'DA_DAT';

        IF @ma_ghe_cu IS NULL
        BEGIN
            SET @thong_bao = N'Vé không hợp lệ.';
            ROLLBACK TRANSACTION;
            GOTO FINISH_DOI;
        END

        SELECT @ma_xe = ma_xe FROM dbo.CHUYEN_XE WHERE ma_chuyen = @ma_chuyen;

        -- Kiểm tra ghế mới
        IF @che_do_khoa = N'BI_QUAN'
        BEGIN
            SELECT @da_dat = COUNT(*)
            FROM dbo.VE WITH (UPDLOCK, HOLDLOCK, ROWLOCK)
            WHERE ma_chuyen = @ma_chuyen AND ma_ghe = @ma_ghe_moi AND trang_thai = N'DA_DAT';

            SELECT 1 FROM dbo.GHE WITH (UPDLOCK, HOLDLOCK, ROWLOCK)
            WHERE ma_ghe = @ma_ghe_moi AND ma_xe = @ma_xe;
        END
        ELSE
            SELECT @da_dat = COUNT(*)
            FROM dbo.VE
            WHERE ma_chuyen = @ma_chuyen AND ma_ghe = @ma_ghe_moi AND trang_thai = N'DA_DAT';

        IF @da_dat > 0
        BEGIN
            SET @thong_bao = N'Ghế mới đã được đặt.';
            ROLLBACK TRANSACTION;
            GOTO FINISH_DOI;
        END

        -- Đổi ghế
        UPDATE dbo.VE SET ma_ghe = @ma_ghe_moi, trang_thai = N'DA_DOI' WHERE ma_ve = @ma_ve;
        UPDATE dbo.VE SET trang_thai = N'DA_DAT' WHERE ma_ve = @ma_ve;
        UPDATE dbo.GHE SET trang_thai = N'TRONG' WHERE ma_ghe = @ma_ghe_cu;
        UPDATE dbo.GHE SET trang_thai = N'DA_DAT' WHERE ma_ghe = @ma_ghe_moi;

        COMMIT TRANSACTION;
        SET @ket_qua = N'COMMIT';
        SET @thong_bao = N'Đổi vé thành công.';

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SET @ket_qua = N'ROLLBACK';
        SET @thong_bao = ERROR_MESSAGE();
    END CATCH

    FINISH_DOI:
    UPDATE dbo.TRANSACTION_LOG
    SET trang_thai = @ket_qua, thong_bao = @thong_bao, thoi_gian_ket_thuc = SYSDATETIME()
    WHERE ma_log = @ma_log;
END
GO

-- ============================================================================
-- sp_ResetMoPhong - Reset log mô phỏng
-- ============================================================================
CREATE OR ALTER PROCEDURE dbo.sp_ResetMoPhong
AS
BEGIN
    SET NOCOUNT ON;
    TRUNCATE TABLE dbo.TRANSACTION_LOG;
    TRUNCATE TABLE dbo.DEADLOCK_LOG;
    SELECT N'OK' AS ket_qua, N'Đã reset log mô phỏng.' AS thong_bao;
END
GO

-- ============================================================================
-- sp_ThongKeMoPhong - Dashboard nghiên cứu
-- ============================================================================
CREATE OR ALTER PROCEDURE dbo.sp_ThongKeMoPhong
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM dbo.v_ThongKeMoPhong;
END
GO

PRINT N'[OK] Tất cả Stored Procedures đã được tạo.';
GO