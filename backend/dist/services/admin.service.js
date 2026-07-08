"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const admin_repository_1 = require("../repositories/admin.repository");
const trip_repository_1 = require("../repositories/trip.repository");
const adminRepo = new admin_repository_1.AdminRepository();
const tripRepo = new trip_repository_1.TripRepository();
class AdminService {
    // Khách hàng
    getCustomers() { return adminRepo.getCustomers(); }
    createCustomer(data) {
        return adminRepo.createCustomer(data);
    }
    updateCustomer(id, data) { return adminRepo.updateCustomer(id, data); }
    deleteCustomer(id) { return adminRepo.deleteCustomer(id); }
    // Xe
    getBuses() { return adminRepo.getBuses(); }
    createBus(data) { return adminRepo.createBus(data); }
    updateBus(id, data) { return adminRepo.updateBus(id, data); }
    deleteBus(id) { return adminRepo.deleteBus(id); }
    // Chuyến xe
    getTrips() { return tripRepo.findAllAdmin(); }
    createTrip(data) { return tripRepo.create(data); }
    updateTrip(id, data) { return tripRepo.update(id, data); }
    deleteTrip(id) { return tripRepo.delete(id); }
    // Tuyến xe
    getRoutes() { return adminRepo.getRoutes(); }
    // Vé
    getTickets() { return adminRepo.getTickets(); }
}
exports.AdminService = AdminService;
