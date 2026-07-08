import { Request, Response, NextFunction } from 'express';
/** GET /deadlock/info - Thông tin ghế A1/A2 cho demo */
export declare function getDeadlockInfo(req: Request, res: Response, next: NextFunction): Promise<void>;
/** POST /deadlock/run - Kích hoạt deadlock (Tx A + Tx B song song) */
export declare function runDeadlock(req: Request, res: Response, next: NextFunction): Promise<void>;
