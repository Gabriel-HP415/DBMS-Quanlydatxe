/*
================================================================================
  CHẠY TẤT CẢ SCRIPT THEO THỨ TỰ
  Mở file này trong SSMS và nhấn Execute (F5)
================================================================================
*/

:r "D:\HOC TAP\DBMS\database\01_create_database.sql"
GO
:r "D:\HOC TAP\DBMS\database\02_create_tables.sql"
GO
:r "D:\HOC TAP\DBMS\database\03_seed_data.sql"
GO
:r "D:\HOC TAP\DBMS\database\04_stored_procedures.sql"
GO

PRINT N'';
PRINT N'========================================';
PRINT N'  DATABASE MODULE HOÀN TẤT!';
PRINT N'  Tiếp theo: chạy 05_deadlock_demo.sql';
PRINT N'            chạy 06_test_concurrency.sql';
PRINT N'========================================';
GO