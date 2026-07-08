import { Request, Response, NextFunction } from 'express';
/**
 * POST /booking - Gọi sp_DatVe với Transaction trên SQL Server.
 * Body: { ma_chuyen, ma_ghe, ma_khach_hang, che_do_khoa?, session_id?, delay_ms? }
 */
export declare function createBooking(req: Request, res: Response, next: NextFunction): Promise<void>;
/** DELETE /booking/:id - Hủy vé qua sp_HuyVe */
export declare function cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void>;
/** PUT /booking/:id/change-seat - Đổi ghế qua sp_DoiVe */
export declare function changeSeat(req: Request, res: Response, next: NextFunction): Promise<void>;
