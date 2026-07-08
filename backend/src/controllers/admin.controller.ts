import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';

const service = new AdminService();

// --- Khách hàng ---
export async function getCustomers(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.getCustomers() });
  } catch (err) { next(err); }
}

export async function createCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.createCustomer(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function updateCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.updateCustomer(Number(req.params.id), req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function deleteCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteCustomer(Number(req.params.id));
    res.json({ success: true, message: 'Đã khóa khách hàng' });
  } catch (err) { next(err); }
}

// --- Xe ---
export async function getBuses(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.getBuses() });
  } catch (err) { next(err); }
}

export async function createBus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.createBus(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function updateBus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.updateBus(Number(req.params.id), req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function deleteBus(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteBus(Number(req.params.id));
    res.json({ success: true, message: 'Đã ngừng xe' });
  } catch (err) { next(err); }
}

// --- Chuyến xe ---
export async function getAdminTrips(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.getTrips() });
  } catch (err) { next(err); }
}

export async function createTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const id = await service.createTrip(req.body);
    res.status(201).json({ success: true, data: { ma_chuyen: id } });
  } catch (err) { next(err); }
}

export async function updateTrip(req: Request, res: Response, next: NextFunction) {
  try {
    await service.updateTrip(Number(req.params.id), req.body);
    res.json({ success: true, message: 'Đã cập nhật chuyến xe' });
  } catch (err) { next(err); }
}

export async function deleteTrip(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteTrip(Number(req.params.id));
    res.json({ success: true, message: 'Đã hủy chuyến xe' });
  } catch (err) { next(err); }
}

export async function getRoutes(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.getRoutes() });
  } catch (err) { next(err); }
}

export async function getAdminTickets(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await service.getTickets() });
  } catch (err) { next(err); }
}