import { AdminRepository } from '../repositories/admin.repository';
import { Bus, Customer } from '../types';
import { TripRepository } from '../repositories/trip.repository';
import { TripInput } from '../types';

const adminRepo = new AdminRepository();
const tripRepo = new TripRepository();

export class AdminService {
  // Khách hàng
  getCustomers() { return adminRepo.getCustomers(); }
  createCustomer(data: { ho_ten: string; email: string; so_dien_thoai: string }) {
    return adminRepo.createCustomer(data);
  }
  updateCustomer(id: number, data: Partial<Customer>) { return adminRepo.updateCustomer(id, data); }
  deleteCustomer(id: number) { return adminRepo.deleteCustomer(id); }

  // Xe
  getBuses() { return adminRepo.getBuses(); }
  createBus(data: { bien_so: string; loai_xe: string; so_ghe: number }) { return adminRepo.createBus(data); }
  updateBus(id: number, data: Partial<Bus>) { return adminRepo.updateBus(id, data); }
  deleteBus(id: number) { return adminRepo.deleteBus(id); }

  // Chuyến xe
  getTrips() { return tripRepo.findAllAdmin(); }
  createTrip(data: TripInput) { return tripRepo.create(data); }
  updateTrip(id: number, data: Partial<TripInput>) { return tripRepo.update(id, data); }
  deleteTrip(id: number) { return tripRepo.delete(id); }

  // Tuyến xe
  getRoutes() { return adminRepo.getRoutes(); }

  // Vé
  getTickets() { return adminRepo.getTickets(); }
}