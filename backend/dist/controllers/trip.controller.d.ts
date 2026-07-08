import { Request, Response, NextFunction } from 'express';
export declare function getTrips(_req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getTripById(req: Request, res: Response, next: NextFunction): Promise<void>;
