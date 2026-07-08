import { Request, Response, NextFunction } from 'express';
import { TicketService } from '../services/ticket.service';

const service = new TicketService();

export async function getTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const ma_khach_hang = req.query.ma_khach_hang ? Number(req.query.ma_khach_hang) : undefined;
    const tickets = await service.getAll(ma_khach_hang);
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
}