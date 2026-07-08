"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadlockRepository = void 0;
const database_1 = require("../config/database");
class DeadlockRepository {
    async getSeatInfo(ma_chuyen = 1) {
        const pool = await (0, database_1.getPool)();
        const result = await pool
            .request()
            .input('ma_chuyen', database_1.sql.Int, ma_chuyen)
            .query(`
        SELECT
          @ma_chuyen AS ma_chuyen,
          MAX(CASE WHEN g.so_ghe = N'A1' THEN g.ma_ghe END) AS ma_ghe_A1,
          MAX(CASE WHEN g.so_ghe = N'A2' THEN g.ma_ghe END) AS ma_ghe_A2,
          MAX(CASE WHEN g.so_ghe = N'A1' THEN g.so_ghe END) AS so_ghe_A1,
          MAX(CASE WHEN g.so_ghe = N'A2' THEN g.so_ghe END) AS so_ghe_A2
        FROM dbo.GHE g
        INNER JOIN dbo.CHUYEN_XE cx ON cx.ma_xe = g.ma_xe
        WHERE cx.ma_chuyen = @ma_chuyen AND g.so_ghe IN (N'A1', N'A2')
      `);
        const row = result.recordset[0];
        if (!row?.ma_ghe_A1 || !row?.ma_ghe_A2)
            return null;
        return row;
    }
    async runRole(vaiTro, ma_chuyen, delay_giay) {
        const pool = await (0, database_1.getPool)();
        const request = pool.request();
        request.input('vai_tro', database_1.sql.NVarChar(1), vaiTro);
        request.input('ma_chuyen', database_1.sql.Int, ma_chuyen);
        request.input('delay_giay', database_1.sql.Int, delay_giay);
        request.input('session_label', database_1.sql.NVarChar(50), `Deadlock-Tx${vaiTro}`);
        request.output('ket_qua', database_1.sql.NVarChar(20));
        request.output('thong_bao', database_1.sql.NVarChar(500));
        request.output('spid', database_1.sql.Int);
        const result = await request.execute('sp_DeadlockDemo');
        const output = result.output || {};
        return {
            vai_tro: vaiTro,
            ket_qua: String(output.ket_qua ?? request.parameters.ket_qua?.value ?? 'ROLLBACK'),
            thong_bao: String(output.thong_bao ?? request.parameters.thong_bao?.value ?? ''),
            spid: output.spid != null ? Number(output.spid) : request.parameters.spid?.value ?? null,
        };
    }
    async getDeadlockLogs(limit = 10) {
        const pool = await (0, database_1.getPool)();
        const result = await pool.request().query(`
      SELECT TOP (${limit}) *
      FROM dbo.DEADLOCK_LOG
      ORDER BY thoi_gian DESC
    `);
        return result.recordset;
    }
}
exports.DeadlockRepository = DeadlockRepository;
