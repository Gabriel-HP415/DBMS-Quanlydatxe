"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketRepository = void 0;
const database_1 = require("../config/database");
class TicketRepository {
    /** Gọi sp_DanhSachVe - danh sách vé */
    async findAll(ma_khach_hang) {
        const pool = await (0, database_1.getPool)();
        const request = pool.request();
        if (ma_khach_hang) {
            request.input('ma_khach_hang', database_1.sql.Int, ma_khach_hang);
        }
        else {
            request.input('ma_khach_hang', database_1.sql.Int, null);
        }
        const result = await request.execute('sp_DanhSachVe');
        return result.recordset;
    }
}
exports.TicketRepository = TicketRepository;
