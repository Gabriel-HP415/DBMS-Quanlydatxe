import { Request, Response, NextFunction } from 'express';
import { TripService } from '../services/trip.service';

const service = new TripService();

export async function getTrips(_req: Request, res: Response, next: NextFunction) {
  try {
    const trips = await service.getAll();
    res.json({ success: true, data: trips });
  } catch (err) {
    next(err);
  }
}

export async function getTripById(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await service.getById(Number(req.params.id));
    if (!trip) {
      res.status(404).json({ success: false, message: 'Không tìm thấy chuyến xe' });
      return;
    }
    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
}