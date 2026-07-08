/*
================================================================================
  sp_DeadlockDemo - Deadlock Simulator trên Web
  Tx A: khóa A1 → đợi → khóa A2
  Tx B: khóa A2 → đợi → khóa A1  →  Wait-For Graph cycle → Error 1205
================================================================================
*/

USE BusBookingDB;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.sp_DeadlockDemo
    @vai_tro        NVARCHAR(1),        -- 'A' hoặc 'B'
    @ma_chuyen      INT = 1,
    @delay_giay     INT = 5,
    @session_label  NVARCHAR(50) = NULL,
    @ket_qua        NVARCHAR(20) OUTPUT,
    @thong_bao      NVARCHAR(500) OUTPUT,
    @spid           INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT OFF;

    DECLARE @ma_ghe_A1 INT;
    DECLARE @ma_ghe_A2 INT;
    DECLARE @ma_log BIGINT;
    DECLARE @delay_time VARCHAR(8);
    DECLARE @bat_dau DATETIME2(3) = SYSDATETIME();
    DECLARE @ghe_dau INT;
    DECLARE @ghe_sau INT;

    SET @session_label = COALESCE(@session_label, N'Deadlock-Tx' + @vai_tro);
    SET @spid = @@SPID;
    SET @delay_time = CONVERT(VARCHAR(8), DATEADD(SECOND, @delay_giay, CAST('00:00:00' AS TIME)), 108);

    SELECT @ma_ghe_A1 = g.ma_ghe
    FROM dbo.GHE g
    INNER JOIN dbo.CHUYEN_XE cx ON cx.ma_xe = g.ma_xe
    WHERE cx.ma_chuyen = @ma_chuyen AND g.so_ghe = N'A1';

    SELECT @ma_ghe_A2 = g.ma_ghe
    FROM dbo.GHE g
    INNER JOIN dbo.CHUYEN_XE cx ON cx.ma_xe = g.ma_xe
    WHERE cx.ma_chuyen = @ma_chuyen AND g.so_ghe = N'A2';

    IF @ma_ghe_A1 IS NULL OR @ma_ghe_A2 IS NULL
    BEGIN
        SET @ket_qua = N'ROLLBACK';
        SET @thong_bao = N'Không tìm thấy ghế A1/A2 cho chuyến ' + CAST(@ma_chuyen AS NVARCHAR(10));
        RETURN;
    END

    IF @vai_tro = N'A'
    BEGIN
        SET @ghe_dau = @ma_ghe_A1;
        SET @ghe_sau = @ma_ghe_A2;
    END
    ELSE
    BEGIN
        SET @ghe_dau = @ma_ghe_A2;
        SET @ghe_sau = @ma_ghe_A1;
    END

    EXEC dbo.sp_GhiLogTransaction
        @session_id = @session_label,
        @ten_thu_tuc = N'sp_DeadlockDemo',
        @che_do_khoa = N'BI_QUAN',
        @trang_thai = N'RUNNING',
        @ma_chuyen = @ma_chuyen,
        @ma_ghe = @ghe_dau,
        @thong_bao = N'Bắt đầu — khóa ghế đầu tiên',
        @ma_log = @ma_log OUTPUT;

    BEGIN TRY
        BEGIN TRANSACTION;

        SELECT g.so_ghe, g.trang_thai
        FROM dbo.GHE g WITH (XLOCK, ROWLOCK)
        WHERE g.ma_ghe = @ghe_dau;

        UPDATE dbo.TRANSACTION_LOG
        SET thong_bao = N'Đã khóa ghế đầu (SPID ' + CAST(@@SPID AS NVARCHAR(10)) + N') — chờ ' + CAST(@delay_giay AS NVARCHAR(10)) + N's',
            trang_thai = N'RUNNING'
        WHERE ma_log = @ma_log;

        WAITFOR DELAY @delay_time;

        UPDATE dbo.TRANSACTION_LOG
        SET trang_thai = N'BLOCKED',
            thong_bao = N'Đang cố khóa ghế thứ hai...'
        WHERE ma_log = @ma_log;

        SELECT g.so_ghe, g.trang_thai
        FROM dbo.GHE g WITH (XLOCK, ROWLOCK)
        WHERE g.ma_ghe = @ghe_sau;

        COMMIT TRANSACTION;

        SET @ket_qua = N'COMMIT';
        SET @thong_bao = N'Tx ' + @vai_tro + N' hoàn tất (survivor) — đã khóa cả 2 ghế. SPID: ' + CAST(@@SPID AS NVARCHAR(10));

        UPDATE dbo.TRANSACTION_LOG
        SET trang_thai = N'COMMIT',
            thong_bao = @thong_bao,
            thoi_gian_ket_thuc = SYSDATETIME(),
            thoi_gian_cho_ms = DATEDIFF(MILLISECOND, @bat_dau, SYSDATETIME())
        WHERE ma_log = @ma_log;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        IF ERROR_NUMBER() = 1205
        BEGIN
            SET @ket_qua = N'DEADLOCK';
            SET @thong_bao = N'Error 1205 — Tx ' + @vai_tro + N' là DEADLOCK VICTIM. SPID: ' + CAST(@@SPID AS NVARCHAR(10));

            INSERT INTO dbo.DEADLOCK_LOG (session_victim, session_blocker, thong_bao, chi_tiet_wait_graph)
            VALUES (
                @@SPID,
                NULL,
                ERROR_MESSAGE(),
                N'Wait-For: Tx' + @vai_tro + N' đợi ghế ' + CASE WHEN @vai_tro = N'A' THEN N'A2' ELSE N'A1' END
                    + N' (đang giữ bởi Tx' + CASE WHEN @vai_tro = N'A' THEN N'B' ELSE N'A' END + N')'
            );

            UPDATE dbo.TRANSACTION_LOG
            SET trang_thai = N'DEADLOCK',
                error_code = 1205,
                thong_bao = @thong_bao,
                thoi_gian_ket_thuc = SYSDATETIME(),
                thoi_gian_cho_ms = DATEDIFF(MILLISECOND, @bat_dau, SYSDATETIME())
            WHERE ma_log = @ma_log;
        END
        ELSE
        BEGIN
            SET @ket_qua = N'ROLLBACK';
            SET @thong_bao = ERROR_MESSAGE();

            UPDATE dbo.TRANSACTION_LOG
            SET trang_thai = N'ROLLBACK',
                thong_bao = @thong_bao,
                thoi_gian_ket_thuc = SYSDATETIME(),
                thoi_gian_cho_ms = DATEDIFF(MILLISECOND, @bat_dau, SYSDATETIME())
            WHERE ma_log = @ma_log;
        END
    END CATCH
END
GO

PRINT N'[OK] sp_DeadlockDemo đã được tạo.';
GO