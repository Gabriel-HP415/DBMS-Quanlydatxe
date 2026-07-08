import { Request, Response, NextFunction } from 'express';
import { SimulationService } from '../services/simulation.service';

const service = new SimulationService();

/** GET /simulation/status - Dashboard thống kê nghiên cứu */
export async function getSimulationStatus(_req: Request, res: Response, next: NextFunction) {
  try {
    const [stats, logs, deadlockLogs] = await Promise.all([
      service.getStatus(),
      service.getLogs(30),
      service.getDeadlockLogs(10),
    ]);

    res.json({
      success: true,
      data: {
        stats,
        recent_logs: logs,
        deadlock_logs: deadlockLogs,
      },
    });
  } catch (err) {
    next(err);
  }
}

/** POST /simulation/reset - Reset log mô phỏng */
export async function resetSimulation(_req: Request, res: Response, next: NextFunction) {
  try {
    await service.reset();
    res.json({ success: true, message: 'Đã reset log mô phỏng' });
  } catch (err) {
    next(err);
  }
}