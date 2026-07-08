import { getPool } from '../config/database';
import { SimulationStats } from '../types';

export class SimulationRepository {
  /** Dashboard nghiên cứu - thống kê transaction */
  async getStats(): Promise<SimulationStats> {
    const pool = await getPool();
    const result = await pool.request().execute('sp_ThongKeMoPhong');
    return result.recordset[0];
  }

  async reset(): Promise<void> {
    const pool = await getPool();
    await pool.request().execute('sp_ResetMoPhong');
  }

  /** Lấy log transaction gần nhất (phục vụ Simulator UI) */
  async getRecentLogs(limit = 50) {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT TOP (${limit}) *
      FROM TRANSACTION_LOG
      ORDER BY ma_log DESC
    `);
    return result.recordset;
  }

  /** Lấy log deadlock */
  async getDeadlockLogs(limit = 20) {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT TOP (${limit}) *
      FROM DEADLOCK_LOG
      ORDER BY thoi_gian DESC
    `);
    return result.recordset;
  }
}