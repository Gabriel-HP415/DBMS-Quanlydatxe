import { getPool, sql } from '../config/database';
import { Trip, TripInput } from '../types';

export class TripRepository {
  async findAll(): Promise<Trip[]> {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM v_DanhSachChuyenXe ORDER BY gio_khoi_hanh');
    return result.recordset;
  }

  /** Admin: bao gồm ma_tuyen, ma_xe để CRUD form */
  async findAllAdmin(): Promise<Trip[]> {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        cx.ma_chuyen, cx.ma_tuyen, cx.ma_xe,
        tx.ten_tuyen, tx.diem_di, tx.diem_den,
        cx.gio_khoi_hanh, cx.gia_ve,
        cx.trang_thai AS trang_thai_chuyen,
        x.bien_so, x.loai_xe, x.so_ghe AS tong_ghe,
        COUNT(CASE WHEN v.trang_thai = N'DA_DAT' THEN 1 END) AS ghe_da_dat,
        x.so_ghe - COUNT(CASE WHEN v.trang_thai = N'DA_DAT' THEN 1 END) AS ghe_con
      FROM CHUYEN_XE cx
      INNER JOIN TUYEN_XE tx ON tx.ma_tuyen = cx.ma_tuyen
      INNER JOIN XE x ON x.ma_xe = cx.ma_xe
      LEFT JOIN VE v ON v.ma_chuyen = cx.ma_chuyen
      GROUP BY
        cx.ma_chuyen, cx.ma_tuyen, cx.ma_xe,
        tx.ten_tuyen, tx.diem_di, tx.diem_den,
        cx.gio_khoi_hanh, cx.gia_ve, cx.trang_thai,
        x.bien_so, x.loai_xe, x.so_ghe
      ORDER BY cx.gio_khoi_hanh
    `);
    return result.recordset;
  }

  async findById(ma_chuyen: number): Promise<Trip | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('ma_chuyen', sql.Int, ma_chuyen)
      .query('SELECT * FROM v_DanhSachChuyenXe WHERE ma_chuyen = @ma_chuyen');
    return result.recordset[0] || null;
  }

  async create(data: TripInput): Promise<number> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('ma_tuyen', sql.Int, data.ma_tuyen)
      .input('ma_xe', sql.Int, data.ma_xe)
      .input('gio_khoi_hanh', sql.DateTime2, new Date(data.gio_khoi_hanh))
      .input('gia_ve', sql.Decimal(18, 2), data.gia_ve)
      .input('trang_thai', sql.NVarChar(20), data.trang_thai || 'MO')
      .query(`
        INSERT INTO CHUYEN_XE (ma_tuyen, ma_xe, gio_khoi_hanh, gia_ve, trang_thai)
        OUTPUT INSERTED.ma_chuyen
        VALUES (@ma_tuyen, @ma_xe, @gio_khoi_hanh, @gia_ve, @trang_thai)
      `);
    return result.recordset[0].ma_chuyen;
  }

  async update(ma_chuyen: number, data: Partial<TripInput>): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('ma_chuyen', sql.Int, ma_chuyen)
      .input('ma_tuyen', sql.Int, data.ma_tuyen)
      .input('ma_xe', sql.Int, data.ma_xe)
      .input('gio_khoi_hanh', sql.DateTime2, data.gio_khoi_hanh ? new Date(data.gio_khoi_hanh) : null)
      .input('gia_ve', sql.Decimal(18, 2), data.gia_ve)
      .input('trang_thai', sql.NVarChar(20), data.trang_thai)
      .query(`
        UPDATE CHUYEN_XE SET
          ma_tuyen = COALESCE(@ma_tuyen, ma_tuyen),
          ma_xe = COALESCE(@ma_xe, ma_xe),
          gio_khoi_hanh = COALESCE(@gio_khoi_hanh, gio_khoi_hanh),
          gia_ve = COALESCE(@gia_ve, gia_ve),
          trang_thai = COALESCE(@trang_thai, trang_thai)
        WHERE ma_chuyen = @ma_chuyen
      `);
  }

  async delete(ma_chuyen: number): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('ma_chuyen', sql.Int, ma_chuyen)
      .query('UPDATE CHUYEN_XE SET trang_thai = N\'HUY\' WHERE ma_chuyen = @ma_chuyen');
  }
}