import { getPool, sql } from '../config/database';
import { Seat } from '../types';

export class SeatRepository {
  /** Gọi sp_DanhSachGhe - lấy sơ đồ ghế theo chuyến xe */
  async findByTripId(ma_chuyen: number): Promise<Seat[]> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('ma_chuyen', sql.Int, ma_chuyen)
      .execute('sp_DanhSachGhe');
    return result.recordset;
  }
}