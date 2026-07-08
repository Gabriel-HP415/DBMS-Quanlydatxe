import { getPool, sql } from '../config/database';

export interface DeadlockTxResult {
  vai_tro: string;
  ket_qua: string;
  thong_bao: string;
  spid: number | null;
}

export interface DeadlockSeatInfo {
  ma_chuyen: number;
  ma_ghe_A1: number;
  ma_ghe_A2: number;
  so_ghe_A1: string;
  so_ghe_A2: string;
}

export class DeadlockRepository {
  async getSeatInfo(ma_chuyen = 1): Promise<DeadlockSeatInfo | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('ma_chuyen', sql.Int, ma_chuyen)
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
    if (!row?.ma_ghe_A1 || !row?.ma_ghe_A2) return null;
    return row as DeadlockSeatInfo;
  }

  async runRole(vaiTro: 'A' | 'B', ma_chuyen: number, delay_giay: number): Promise<DeadlockTxResult> {
    const pool = await getPool();
    const request = pool.request();

    request.input('vai_tro', sql.NVarChar(1), vaiTro);
    request.input('ma_chuyen', sql.Int, ma_chuyen);
    request.input('delay_giay', sql.Int, delay_giay);
    request.input('session_label', sql.NVarChar(50), `Deadlock-Tx${vaiTro}`);
    request.output('ket_qua', sql.NVarChar(20));
    request.output('thong_bao', sql.NVarChar(500));
    request.output('spid', sql.Int);

    const result = await request.execute('sp_DeadlockDemo');
    const output = result.output || {};

    return {
      vai_tro: vaiTro,
      ket_qua: String(output.ket_qua ?? request.parameters.ket_qua?.value ?? 'ROLLBACK'),
      thong_bao: String(output.thong_bao ?? request.parameters.thong_bao?.value ?? ''),
      spid: output.spid != null ? Number(output.spid) : (request.parameters.spid?.value as number | null) ?? null,
    };
  }

  async getDeadlockLogs(limit = 10) {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT TOP (${limit}) *
      FROM dbo.DEADLOCK_LOG
      ORDER BY thoi_gian DESC
    `);
    return result.recordset;
  }
}