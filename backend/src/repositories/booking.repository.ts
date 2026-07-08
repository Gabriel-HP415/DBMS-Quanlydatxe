import { getPool, sql } from '../config/database';
import { BookingRequest, BookingResult, CheDoKhoa } from '../types';

export class BookingRepository {
  /**
   * Gọi sp_DatVe - Stored Procedure có Transaction và Concurrency Control.
   * @che_do_khoa KHONG_KHOA | BI_QUAN | LE_QUAN
   */
  async book(data: BookingRequest): Promise<BookingResult> {
    const pool = await getPool();
    const request = pool.request();

    request.input('ma_chuyen', sql.Int, data.ma_chuyen);
    request.input('ma_ghe', sql.Int, data.ma_ghe);
    request.input('ma_khach_hang', sql.Int, data.ma_khach_hang);
    request.input('che_do_khoa', sql.NVarChar(20), data.che_do_khoa || 'BI_QUAN');
    request.input('session_id', sql.NVarChar(50), data.session_id || `API_${Date.now()}`);
    request.input('delay_ms', sql.Int, data.delay_ms || 0);
    request.output('ma_ve', sql.Int);
    request.output('ket_qua', sql.NVarChar(20));
    request.output('thong_bao', sql.NVarChar(500));

    const result = await request.execute('sp_DatVe');

    // msnodesqlv8 trả OUTPUT qua result.output
    const output = result.output || {};
    return {
      ma_ve: output.ma_ve ?? request.parameters.ma_ve?.value ?? null,
      ket_qua: output.ket_qua ?? request.parameters.ket_qua?.value ?? 'ROLLBACK',
      thong_bao: output.thong_bao ?? request.parameters.thong_bao?.value ?? '',
    };
  }

  /**
   * Gọi sp_HuyVe - Hủy vé trong Transaction.
   */
  async cancel(ma_ve: number, che_do_khoa: CheDoKhoa = 'BI_QUAN', session_id?: string): Promise<BookingResult> {
    const pool = await getPool();
    const request = pool.request();

    request.input('ma_ve', sql.Int, ma_ve);
    request.input('che_do_khoa', sql.NVarChar(20), che_do_khoa);
    request.input('session_id', sql.NVarChar(50), session_id || `API_CANCEL_${Date.now()}`);
    request.output('ket_qua', sql.NVarChar(20));
    request.output('thong_bao', sql.NVarChar(500));

    const result = await request.execute('sp_HuyVe');
    const output = result.output || {};

    return {
      ma_ve,
      ket_qua: output.ket_qua ?? request.parameters.ket_qua?.value ?? 'ROLLBACK',
      thong_bao: output.thong_bao ?? request.parameters.thong_bao?.value ?? '',
    };
  }

  /**
   * Gọi sp_DoiVe - Đổi ghế trong Transaction.
   */
  async changeSeat(
    ma_ve: number,
    ma_ghe_moi: number,
    che_do_khoa: CheDoKhoa = 'BI_QUAN',
    session_id?: string
  ): Promise<BookingResult> {
    const pool = await getPool();
    const request = pool.request();

    request.input('ma_ve', sql.Int, ma_ve);
    request.input('ma_ghe_moi', sql.Int, ma_ghe_moi);
    request.input('che_do_khoa', sql.NVarChar(20), che_do_khoa);
    request.input('session_id', sql.NVarChar(50), session_id || `API_CHANGE_${Date.now()}`);
    request.output('ket_qua', sql.NVarChar(20));
    request.output('thong_bao', sql.NVarChar(500));

    const result = await request.execute('sp_DoiVe');
    const output = result.output || {};

    return {
      ma_ve,
      ket_qua: output.ket_qua ?? request.parameters.ket_qua?.value ?? 'ROLLBACK',
      thong_bao: output.thong_bao ?? request.parameters.thong_bao?.value ?? '',
    };
  }
}