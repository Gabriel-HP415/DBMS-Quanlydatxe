import { getPool, sql } from '../config/database';
import { Ticket } from '../types';

export class TicketRepository {
  /** Gọi sp_DanhSachVe - danh sách vé */
  async findAll(ma_khach_hang?: number): Promise<Ticket[]> {
    const pool = await getPool();
    const request = pool.request();

    if (ma_khach_hang) {
      request.input('ma_khach_hang', sql.Int, ma_khach_hang);
    } else {
      request.input('ma_khach_hang', sql.Int, null);
    }

    const result = await request.execute('sp_DanhSachVe');
    return result.recordset;
  }
}