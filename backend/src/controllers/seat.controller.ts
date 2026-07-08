import { Request, Response, NextFunction } from 'express';
import { SeatService } from '../services/seat.service';

const service = new SeatService();

export async function getSeatsByTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const seats = await service.getByTripId(Number(req.params.tripId));
    res.json({ success: true, data: seats });
  } catch (err) {
    next(err);
  }
}