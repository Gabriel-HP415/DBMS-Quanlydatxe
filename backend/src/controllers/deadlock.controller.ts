import { Request, Response, NextFunction } from 'express';
import { DeadlockService } from '../services/deadlock.service';

const service = new DeadlockService();

/** GET /deadlock/info - Thông tin ghế A1/A2 cho demo */
export async function getDeadlockInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const ma_chuyen = req.query.ma_chuyen ? Number(req.query.ma_chuyen) : 1;
    const info = await service.getInfo(ma_chuyen);
    if (!info) {
      res.status(404).json({ success: false, message: 'Không tìm thấy ghế A1/A2 cho chuyến này' });
      return;
    }
    res.json({ success: true, data: info });
  } catch (err) {
    next(err);
  }
}

/** POST /deadlock/run - Kích hoạt deadlock (Tx A + Tx B song song) */
export async function runDeadlock(req: Request, res: Response, next: NextFunction) {
  try {
    const ma_chuyen = req.body.ma_chuyen ? Number(req.body.ma_chuyen) : 1;
    const delay_giay = req.body.delay_giay ? Number(req.body.delay_giay) : 5;

    if (delay_giay < 2 || delay_giay > 30) {
      res.status(400).json({ success: false, message: 'delay_giay phải từ 2 đến 30 giây' });
      return;
    }

    const result = await service.runDemo(ma_chuyen, delay_giay);

    res.json({
      success: true,
      data: result,
      message: result.deadlock_detected
        ? `Deadlock phát hiện! Victim: Tx ${result.victim?.vai_tro} (SPID ${result.victim?.spid})`
        : 'Chưa phát hiện deadlock — thử lại hoặc tăng delay',
    });
  } catch (err) {
    next(err);
  }
}