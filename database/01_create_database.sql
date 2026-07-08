/*
================================================================================
  HỆ THỐNG MÔ PHỎNG ĐẶT VÉ XE KHÁCH - MODULE DATABASE
  Đề tài: Nghiên cứu Concurrency Control & Deadlock trên SQL Server
================================================================================
  Chạy script này trên SQL Server Management Studio (SSMS) với quyền sysadmin
  hoặc quyền tạo database.
================================================================================
*/

USE master;
GO

-- Xóa database cũ nếu tồn tại (chỉ dùng khi cần reset toàn bộ)
IF DB_ID(N'BusBookingDB') IS NOT NULL
BEGIN
    ALTER DATABASE BusBookingDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE BusBookingDB;
END
GO

CREATE DATABASE BusBookingDB
    COLLATE Vietnamese_CI_AS;
GO

USE BusBookingDB;
GO

PRINT N'[OK] Database BusBookingDB đã được tạo.';
GO