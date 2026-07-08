"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const database_1 = require("../config/database");
class AdminRepository {
    // --- Khách hàng CRUD ---
    async getCustomers() {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request().query('SELECT * FROM KHACH_HANG ORDER BY ma_khach_hang');
        return result.recordset;
    }
    async createCustomer(data) {
        const pool = await (0, database_1.getPool)();
        const result = await pool
            .request()
            .input('ho_ten', database_1.sql.NVarChar(100), data.ho_ten)
            .input('email', database_1.sql.NVarChar(100), data.email)
            .input('so_dien_thoai', database_1.sql.NVarChar(15), data.so_dien_thoai)
            .query(`
        INSERT INTO KHACH_HANG (ho_ten, email, so_dien_thoai)
        OUTPUT INSERTED.*
        VALUES (@ho_ten, @email, @so_dien_thoai)
      `);
        return result.recordset[0];
    }
    async updateCustomer(ma_khach_hang, data) {
        const pool = await (0, database_1.getPool)();
        const result = await pool
            .request()
            .input('ma_khach_hang', database_1.sql.Int, ma_khach_hang)
            .input('ho_ten', database_1.sql.NVarChar(100), data.ho_ten)
            .input('email', database_1.sql.NVarChar(100), data.email)
            .input('so_dien_thoai', database_1.sql.NVarChar(15), data.so_dien_thoai)
            .input('trang_thai', database_1.sql.NVarChar(20), data.trang_thai)
            .query(`
        UPDATE KHACH_HANG SET
          ho_ten = COALESCE(@ho_ten, ho_ten),
          email = COALESCE(@email, email),
          so_dien_thoai = COALESCE(@so_dien_thoai, so_dien_thoai),
          trang_thai = COALESCE(@trang_thai, trang_thai)
        OUTPUT INSERTED.*
        WHERE ma_khach_hang = @ma_khach_hang
      `);
        return result.recordset[0];
    }
    async deleteCustomer(ma_khach_hang) {
        const pool = await (0, database_1.getPool)();
        await pool
            .request()
            .input('ma_khach_hang', database_1.sql.Int, ma_khach_hang)
            .query('UPDATE KHACH_HANG SET trang_thai = N\'KHOA\' WHERE ma_khach_hang = @ma_khach_hang');
    }
    // --- Xe CRUD ---
    async getBuses() {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request().query('SELECT ma_xe, bien_so, loai_xe, so_ghe, trang_thai FROM XE ORDER BY ma_xe');
        return result.recordset;
    }
    async createBus(data) {
        const pool = await (0, database_1.getPool)();
        const transaction = new database_1.sql.Transaction(pool);
        await transaction.begin();
        try {
            const request = new database_1.sql.Request(transaction);
            const result = await request
                .input('bien_so', database_1.sql.NVarChar(20), data.bien_so)
                .input('loai_xe', database_1.sql.NVarChar(50), data.loai_xe)
                .input('so_ghe', database_1.sql.Int, data.so_ghe)
                .query(`
          INSERT INTO XE (bien_so, loai_xe, so_ghe)
          OUTPUT INSERTED.*
          VALUES (@bien_so, @loai_xe, @so_ghe)
        `);
            const bus = result.recordset[0];
            const ma_xe = bus.ma_xe;
            const rows = Math.ceil(data.so_ghe / 4);
            for (let r = 0; r < rows; r++) {
                const hang = String.fromCharCode(65 + r);
                for (let col = 1; col <= 4; col++) {
                    const seatIndex = r * 4 + col;
                    if (seatIndex > data.so_ghe)
                        break;
                    const seatReq = new database_1.sql.Request(transaction);
                    await seatReq
                        .input('ma_xe', database_1.sql.Int, ma_xe)
                        .input('so_ghe', database_1.sql.NVarChar(10), `${hang}${col}`)
                        .input('tang', database_1.sql.Int, r < Math.ceil(rows / 2) ? 1 : 2)
                        .input('vi_tri', database_1.sql.NVarChar(20), col === 1 || col === 4 ? 'CUA_SO' : col === 2 ? 'GIUA' : 'LOI_DI')
                        .query(`
              INSERT INTO GHE (ma_xe, so_ghe, tang, vi_tri)
              VALUES (@ma_xe, @so_ghe, @tang, @vi_tri)
            `);
                }
            }
            await transaction.commit();
            return bus;
        }
        catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
    async updateBus(ma_xe, data) {
        const pool = await (0, database_1.getPool)();
        const result = await pool
            .request()
            .input('ma_xe', database_1.sql.Int, ma_xe)
            .input('bien_so', database_1.sql.NVarChar(20), data.bien_so)
            .input('loai_xe', database_1.sql.NVarChar(50), data.loai_xe)
            .input('so_ghe', database_1.sql.Int, data.so_ghe)
            .input('trang_thai', database_1.sql.NVarChar(20), data.trang_thai)
            .query(`
        UPDATE XE SET
          bien_so = COALESCE(@bien_so, bien_so),
          loai_xe = COALESCE(@loai_xe, loai_xe),
          so_ghe = COALESCE(@so_ghe, so_ghe),
          trang_thai = COALESCE(@trang_thai, trang_thai)
        OUTPUT INSERTED.*
        WHERE ma_xe = @ma_xe
      `);
        return result.recordset[0];
    }
    async deleteBus(ma_xe) {
        const pool = await (0, database_1.getPool)();
        await pool
            .request()
            .input('ma_xe', database_1.sql.Int, ma_xe)
            .query('UPDATE XE SET trang_thai = N\'NGUNG\' WHERE ma_xe = @ma_xe');
    }
    // --- Tuyến xe ---
    async getRoutes() {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request().query('SELECT * FROM TUYEN_XE ORDER BY ma_tuyen');
        return result.recordset;
    }
    // --- Vé (admin) ---
    async getTickets() {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request().execute('sp_DanhSachVe');
        return result.recordset;
    }
}
exports.AdminRepository = AdminRepository;
