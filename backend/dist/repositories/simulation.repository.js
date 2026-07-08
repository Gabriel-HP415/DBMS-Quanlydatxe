"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationRepository = void 0;
const database_1 = require("../config/database");
class SimulationRepository {
    /** Dashboard nghiên cứu - thống kê transaction */
    async getStats() {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request().execute('sp_ThongKeMoPhong');
        return result.recordset[0];
    }
    async reset() {
        const pool = await (0, database_1.getPool)();
        await pool.request().execute('sp_ResetMoPhong');
    }
    /** Lấy log transaction gần nhất (phục vụ Simulator UI) */
    async getRecentLogs(limit = 50) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request().query(`
      SELECT TOP (${limit}) *
      FROM TRANSACTION_LOG
      ORDER BY ma_log DESC
    `);
        return result.recordset;
    }
    /** Lấy log deadlock */
    async getDeadlockLogs(limit = 20) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request().query(`
      SELECT TOP (${limit}) *
      FROM DEADLOCK_LOG
      ORDER BY thoi_gian DESC
    `);
        return result.recordset;
    }
}
exports.SimulationRepository = SimulationRepository;
