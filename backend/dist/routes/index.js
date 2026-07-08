"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trip_controller_1 = require("../controllers/trip.controller");
const seat_controller_1 = require("../controllers/seat.controller");
const booking_controller_1 = require("../controllers/booking.controller");
const ticket_controller_1 = require("../controllers/ticket.controller");
const simulation_controller_1 = require("../controllers/simulation.controller");
const deadlock_controller_1 = require("../controllers/deadlock.controller");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// --- API công khai (mô phỏng) ---
router.get('/trips', trip_controller_1.getTrips);
router.get('/trips/:id', trip_controller_1.getTripById);
router.get('/seats/:tripId', seat_controller_1.getSeatsByTrip);
router.post('/booking', booking_controller_1.createBooking);
router.delete('/booking/:id', booking_controller_1.cancelBooking);
router.put('/booking/:id/change-seat', booking_controller_1.changeSeat);
router.get('/tickets', ticket_controller_1.getTickets);
// --- Simulation Dashboard ---
router.get('/simulation/status', simulation_controller_1.getSimulationStatus);
router.post('/simulation/reset', simulation_controller_1.resetSimulation);
// --- Deadlock Simulator (Web) ---
router.get('/deadlock/info', deadlock_controller_1.getDeadlockInfo);
router.post('/deadlock/run', deadlock_controller_1.runDeadlock);
// --- Admin CRUD ---
router.get('/admin/customers', admin_controller_1.getCustomers);
router.post('/admin/customers', admin_controller_1.createCustomer);
router.put('/admin/customers/:id', admin_controller_1.updateCustomer);
router.delete('/admin/customers/:id', admin_controller_1.deleteCustomer);
router.get('/admin/buses', admin_controller_1.getBuses);
router.post('/admin/buses', admin_controller_1.createBus);
router.put('/admin/buses/:id', admin_controller_1.updateBus);
router.delete('/admin/buses/:id', admin_controller_1.deleteBus);
router.get('/admin/trips', admin_controller_1.getAdminTrips);
router.post('/admin/trips', admin_controller_1.createTrip);
router.put('/admin/trips/:id', admin_controller_1.updateTrip);
router.delete('/admin/trips/:id', admin_controller_1.deleteTrip);
router.get('/admin/routes', admin_controller_1.getRoutes);
router.get('/admin/tickets', admin_controller_1.getAdminTickets);
exports.default = router;
