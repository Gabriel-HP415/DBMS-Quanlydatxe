/*
================================================================================
  TẠO BẢNG - Chuẩn hóa 3NF
  Mỗi bảng có: PK, FK, CHECK, UNIQUE, DEFAULT
================================================================================
*/

USE BusBookingDB;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- ============================================================================
-- BẢNG KHACH_HANG
-- ============================================================================
CREATE TABLE dbo.KHACH_HANG (
    ma_khach_hang   INT             NOT NULL IDENTITY(1,1),
    ho_ten          NVARCHAR(100)   NOT NULL,
    email           NVARCHAR(100)   NOT NULL,
    so_dien_thoai   NVARCHAR(15)    NOT NULL,
    ngay_tao        DATETIME2(0)    NOT NULL CONSTRAINT DF_KHACH_HANG_ngay_tao DEFAULT (SYSDATETIME()),
    trang_thai      NVARCHAR(20)    NOT NULL CONSTRAINT DF_KHACH_HANG_trang_thai DEFAULT (N'HOAT_DONG'),

    CONSTRAINT PK_KHACH_HANG PRIMARY KEY (ma_khach_hang),
    CONSTRAINT UQ_KHACH_HANG_email UNIQUE (email),
    CONSTRAINT UQ_KHACH_HANG_so_dien_thoai UNIQUE (so_dien_thoai),
    CONSTRAINT CK_KHACH_HANG_trang_thai CHECK (trang_thai IN (N'HOAT_DONG', N'KHOA')),
    CONSTRAINT CK_KHACH_HANG_ho_ten CHECK (LEN(LTRIM(RTRIM(ho_ten))) >= 2)
);
GO

-- ============================================================================
-- BẢNG XE
-- ============================================================================
CREATE TABLE dbo.XE (
    ma_xe           INT             NOT NULL IDENTITY(1,1),
    bien_so         NVARCHAR(20)    NOT NULL,
    loai_xe         NVARCHAR(50)    NOT NULL,
    so_ghe          INT             NOT NULL,
    trang_thai      NVARCHAR(20)    NOT NULL CONSTRAINT DF_XE_trang_thai DEFAULT (N'HOAT_DONG'),
    -- rowversion dùng cho Optimistic Locking (chế độ lạc quan)
    row_version     ROWVERSION      NOT NULL,

    CONSTRAINT PK_XE PRIMARY KEY (ma_xe),
    CONSTRAINT UQ_XE_bien_so UNIQUE (bien_so),
    CONSTRAINT CK_XE_so_ghe CHECK (so_ghe BETWEEN 10 AND 60),
    CONSTRAINT CK_XE_trang_thai CHECK (trang_thai IN (N'HOAT_DONG', N'BAO_TRI', N'NGUNG'))
);
GO

-- ============================================================================
-- BẢNG TUYEN_XE
-- ============================================================================
CREATE TABLE dbo.TUYEN_XE (
    ma_tuyen        INT             NOT NULL IDENTITY(1,1),
    ten_tuyen       NVARCHAR(100)   NOT NULL,
    diem_di         NVARCHAR(100)   NOT NULL,
    diem_den        NVARCHAR(100)   NOT NULL,
    khoang_cach_km  DECIMAL(10,2)   NOT NULL,
    thoi_gian_chay  INT             NOT NULL,  -- phút
    trang_thai      NVARCHAR(20)    NOT NULL CONSTRAINT DF_TUYEN_XE_trang_thai DEFAULT (N'HOAT_DONG'),

    CONSTRAINT PK_TUYEN_XE PRIMARY KEY (ma_tuyen),
    CONSTRAINT UQ_TUYEN_XE_ten_tuyen UNIQUE (ten_tuyen),
    CONSTRAINT UQ_TUYEN_XE_diem UNIQUE (diem_di, diem_den),
    CONSTRAINT CK_TUYEN_XE_khoang_cach CHECK (khoang_cach_km > 0),
    CONSTRAINT CK_TUYEN_XE_thoi_gian CHECK (thoi_gian_chay > 0),
    CONSTRAINT CK_TUYEN_XE_trang_thai CHECK (trang_thai IN (N'HOAT_DONG', N'NGUNG'))
);
GO

-- ============================================================================
-- BẢNG CHUYEN_XE
-- ============================================================================
CREATE TABLE dbo.CHUYEN_XE (
    ma_chuyen       INT             NOT NULL IDENTITY(1,1),
    ma_tuyen        INT             NOT NULL,
    ma_xe           INT             NOT NULL,
    gio_khoi_hanh   DATETIME2(0)    NOT NULL,
    gia_ve          DECIMAL(18,2)   NOT NULL,
    trang_thai      NVARCHAR(20)    NOT NULL CONSTRAINT DF_CHUYEN_XE_trang_thai DEFAULT (N'MO'),
    -- rowversion cho Optimistic Locking trên mức chuyến xe
    row_version     ROWVERSION      NOT NULL,

    CONSTRAINT PK_CHUYEN_XE PRIMARY KEY (ma_chuyen),
    CONSTRAINT FK_CHUYEN_XE_TUYEN FOREIGN KEY (ma_tuyen) REFERENCES dbo.TUYEN_XE (ma_tuyen),
    CONSTRAINT FK_CHUYEN_XE_XE FOREIGN KEY (ma_xe) REFERENCES dbo.XE (ma_xe),
    CONSTRAINT UQ_CHUYEN_XE_xe_gio UNIQUE (ma_xe, gio_khoi_hanh),
    CONSTRAINT CK_CHUYEN_XE_gia_ve CHECK (gia_ve >= 0),
    CONSTRAINT CK_CHUYEN_XE_trang_thai CHECK (trang_thai IN (N'MO', N'DONG', N'HUY'))
);
GO

-- ============================================================================
-- BẢNG GHE
-- ============================================================================
CREATE TABLE dbo.GHE (
    ma_ghe          INT             NOT NULL IDENTITY(1,1),
    ma_xe           INT             NOT NULL,
    so_ghe          NVARCHAR(10)    NOT NULL,   -- VD: A1, A2, B1
    tang            INT             NOT NULL CONSTRAINT DF_GHE_tang DEFAULT (1),
    vi_tri          NVARCHAR(20)    NOT NULL CONSTRAINT DF_GHE_vi_tri DEFAULT (N'GIUA'),
    trang_thai      NVARCHAR(20)    NOT NULL CONSTRAINT DF_GHE_trang_thai DEFAULT (N'TRONG'),
    -- rowversion cho Optimistic Locking khi đặt ghế
    row_version     ROWVERSION      NOT NULL,

    CONSTRAINT PK_GHE PRIMARY KEY (ma_ghe),
    CONSTRAINT FK_GHE_XE FOREIGN KEY (ma_xe) REFERENCES dbo.XE (ma_xe),
    CONSTRAINT UQ_GHE_xe_so_ghe UNIQUE (ma_xe, so_ghe),
    CONSTRAINT CK_GHE_tang CHECK (tang IN (1, 2)),
    CONSTRAINT CK_GHE_vi_tri CHECK (vi_tri IN (N'CUA_SO', N'GIUA', N'LOI_DI')),
    CONSTRAINT CK_GHE_trang_thai CHECK (trang_thai IN (N'TRONG', N'DA_DAT', N'KHOA'))
);
GO

-- ============================================================================
-- BẢNG VE
-- ============================================================================
CREATE TABLE dbo.VE (
    ma_ve               INT             NOT NULL IDENTITY(1,1),
    ma_chuyen           INT             NOT NULL,
    ma_ghe              INT             NOT NULL,
    ma_khach_hang       INT             NOT NULL,
    ngay_dat            DATETIME2(0)    NOT NULL CONSTRAINT DF_VE_ngay_dat DEFAULT (SYSDATETIME()),
    gia_thanh_toan      DECIMAL(18,2)   NOT NULL,
    trang_thai          NVARCHAR(20)    NOT NULL CONSTRAINT DF_VE_trang_thai DEFAULT (N'DA_DAT'),
    ghi_chu             NVARCHAR(255)   NULL,

    CONSTRAINT PK_VE PRIMARY KEY (ma_ve),
    CONSTRAINT FK_VE_CHUYEN FOREIGN KEY (ma_chuyen) REFERENCES dbo.CHUYEN_XE (ma_chuyen),
    CONSTRAINT FK_VE_GHE FOREIGN KEY (ma_ghe) REFERENCES dbo.GHE (ma_ghe),
    CONSTRAINT FK_VE_KHACH_HANG FOREIGN KEY (ma_khach_hang) REFERENCES dbo.KHACH_HANG (ma_khach_hang),
    CONSTRAINT CK_VE_gia_thanh_toan CHECK (gia_thanh_toan >= 0),
    CONSTRAINT CK_VE_trang_thai CHECK (trang_thai IN (N'DA_DAT', N'DA_HUY', N'DA_DOI'))
);
GO

-- Mỗi ghế chỉ có 1 vé đang hoạt động trên 1 chuyến (Filtered Unique Index)
CREATE UNIQUE INDEX UQ_VE_chuyen_ghe_active
    ON dbo.VE (ma_chuyen, ma_ghe)
    WHERE trang_thai = N'DA_DAT';
GO

-- ============================================================================
-- BẢNG CAU_HINH_HE_THONG - Cấu hình chế độ khóa mặc định
-- ============================================================================
CREATE TABLE dbo.CAU_HINH_HE_THONG (
    ma_cau_hinh     INT             NOT NULL IDENTITY(1,1),
    ten_cau_hinh    NVARCHAR(50)    NOT NULL,
    gia_tri         NVARCHAR(100)   NOT NULL,
    mo_ta           NVARCHAR(255)   NULL,
    ngay_cap_nhat   DATETIME2(0)    NOT NULL CONSTRAINT DF_CAU_HINH_ngay_cap_nhat DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_CAU_HINH PRIMARY KEY (ma_cau_hinh),
    CONSTRAINT UQ_CAU_HINH_ten UNIQUE (ten_cau_hinh)
);
GO

-- ============================================================================
-- BẢNG TRANSACTION_LOG - Ghi log mô phỏng (phục vụ Dashboard nghiên cứu)
-- ============================================================================
CREATE TABLE dbo.TRANSACTION_LOG (
    ma_log              BIGINT          NOT NULL IDENTITY(1,1),
    session_id          NVARCHAR(50)    NOT NULL,
    ten_thu_tuc         NVARCHAR(100)   NOT NULL,
    che_do_khoa         NVARCHAR(20)    NOT NULL,
    trang_thai          NVARCHAR(20)    NOT NULL,  -- COMMIT | ROLLBACK | WAITING | BLOCKED | RUNNING
    ma_chuyen           INT             NULL,
    ma_ghe              INT             NULL,
    ma_khach_hang       INT             NULL,
    ma_ve               INT             NULL,
    thong_bao           NVARCHAR(500)   NULL,
    error_code          INT             NULL,
    thoi_gian_bat_dau   DATETIME2(3)    NOT NULL CONSTRAINT DF_TX_LOG_bat_dau DEFAULT (SYSDATETIME()),
    thoi_gian_ket_thuc  DATETIME2(3)    NULL,
    thoi_gian_cho_ms    INT             NULL,

    CONSTRAINT PK_TRANSACTION_LOG PRIMARY KEY (ma_log),
    CONSTRAINT CK_TX_LOG_che_do CHECK (che_do_khoa IN (N'KHONG_KHOA', N'BI_QUAN', N'LE_QUAN')),
    CONSTRAINT CK_TX_LOG_trang_thai CHECK (trang_thai IN (N'RUNNING', N'WAITING', N'BLOCKED', N'COMMIT', N'ROLLBACK', N'DEADLOCK'))
);
GO

-- ============================================================================
-- BẢNG DEADLOCK_LOG - Ghi nhận sự kiện Deadlock
-- ============================================================================
CREATE TABLE dbo.DEADLOCK_LOG (
    ma_log              BIGINT          NOT NULL IDENTITY(1,1),
    session_victim      INT             NOT NULL,
    session_blocker     INT             NULL,
    error_code          INT             NOT NULL CONSTRAINT DF_DL_LOG_error DEFAULT (1205),
    thong_bao           NVARCHAR(500)   NOT NULL,
    chi_tiet_wait_graph NVARCHAR(MAX)   NULL,
    thoi_gian           DATETIME2(3)    NOT NULL CONSTRAINT DF_DL_LOG_thoi_gian DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_DEADLOCK_LOG PRIMARY KEY (ma_log),
    CONSTRAINT CK_DL_LOG_error CHECK (error_code = 1205)
);
GO

-- ============================================================================
-- VIEW hỗ trợ truy vấn nhanh
-- ============================================================================
CREATE VIEW dbo.v_DanhSachChuyenXe
AS
SELECT
    cx.ma_chuyen,
    tx.ten_tuyen,
    tx.diem_di,
    tx.diem_den,
    cx.gio_khoi_hanh,
    cx.gia_ve,
    cx.trang_thai AS trang_thai_chuyen,
    x.bien_so,
    x.loai_xe,
    x.so_ghe AS tong_ghe,
    COUNT(CASE WHEN v.trang_thai = N'DA_DAT' THEN 1 END) AS ghe_da_dat,
    x.so_ghe - COUNT(CASE WHEN v.trang_thai = N'DA_DAT' THEN 1 END) AS ghe_con
FROM dbo.CHUYEN_XE cx
INNER JOIN dbo.TUYEN_XE tx ON tx.ma_tuyen = cx.ma_tuyen
INNER JOIN dbo.XE x ON x.ma_xe = cx.ma_xe
LEFT JOIN dbo.VE v ON v.ma_chuyen = cx.ma_chuyen
GROUP BY
    cx.ma_chuyen, tx.ten_tuyen, tx.diem_di, tx.diem_den,
    cx.gio_khoi_hanh, cx.gia_ve, cx.trang_thai,
    x.bien_so, x.loai_xe, x.so_ghe;
GO

CREATE VIEW dbo.v_ThongKeMoPhong
AS
SELECT
    (SELECT COUNT(*) FROM dbo.TRANSACTION_LOG) AS tong_transaction,
    (SELECT COUNT(*) FROM dbo.TRANSACTION_LOG WHERE trang_thai = N'RUNNING') AS dang_chay,
    (SELECT COUNT(*) FROM dbo.TRANSACTION_LOG WHERE trang_thai IN (N'WAITING', N'BLOCKED')) AS bi_block,
    (SELECT COUNT(*) FROM dbo.TRANSACTION_LOG WHERE trang_thai = N'ROLLBACK') AS rollback_count,
    (SELECT COUNT(*) FROM dbo.TRANSACTION_LOG WHERE trang_thai = N'COMMIT') AS commit_count,
    (SELECT COUNT(*) FROM dbo.DEADLOCK_LOG) AS deadlock_count,
    (SELECT ISNULL(AVG(thoi_gian_cho_ms), 0) FROM dbo.TRANSACTION_LOG WHERE thoi_gian_cho_ms IS NOT NULL) AS avg_lock_wait_ms;
GO

PRINT N'[OK] Tất cả bảng, index, view đã được tạo.';
GO