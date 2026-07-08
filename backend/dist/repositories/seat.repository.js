"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatRepository = void 0;
const database_1 = require("../config/database");
class SeatRepository {
    /** Gọi sp_DanhSachGhe - lấy sơ đồ ghế theo chuyến xe */
    async findByTripId(ma_chuyen) {
        const pool = await (0, database_1.getPool)();
        const result = await pool
            .request()
            .input('ma_chuyen', database_1.sql.Int, ma_chuyen)
            .execute('sp_DanhSachGhe');
        return result.recordset;
    }
}
exports.SeatRepository = SeatRepository;
