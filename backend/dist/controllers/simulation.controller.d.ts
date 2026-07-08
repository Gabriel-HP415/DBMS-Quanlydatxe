import { Request, Response, NextFunction } from 'express';
/** GET /simulation/status - Dashboard thống kê nghiên cứu */
export declare function getSimulationStatus(_req: Request, res: Response, next: NextFunction): Promise<void>;
/** POST /simulation/reset - Reset log mô phỏng */
export declare function resetSimulation(_req: Request, res: Response, next: NextFunction): Promise<void>;
