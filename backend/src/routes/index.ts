import { Router } from 'express';
import { getTrips, getTripById } from '../controllers/trip.controller';
import { getSeatsByTrip } from '../controllers/seat.controller';
import { createBooking, cancelBooking, changeSeat } from '../controllers/booking.controller';
import { getTickets } from '../controllers/ticket.controller';
import { getSimulationStatus, resetSimulation } from '../controllers/simulation.controller';
import { getDeadlockInfo, runDeadlock } from '../controllers/deadlock.controller';
import {
  getCustomers, createCustomer, updateCustomer, deleteCustomer,
  getBuses, createBus, updateBus, deleteBus,
  getAdminTrips, createTrip, updateTrip, deleteTrip,
  getRoutes, getAdminTickets,
} from '../controllers/admin.controller';

const router = Router();

// --- API công khai (mô phỏng) ---
router.get('/trips', getTrips);
router.get('/trips/:id', getTripById);
router.get('/seats/:tripId', getSeatsByTrip);
router.post('/booking', createBooking);
router.delete('/booking/:id', cancelBooking);
router.put('/booking/:id/change-seat', changeSeat);
router.get('/tickets', getTickets);

// --- Simulation Dashboard ---
router.get('/simulation/status', getSimulationStatus);
router.post('/simulation/reset', resetSimulation);

// --- Deadlock Simulator (Web) ---
router.get('/deadlock/info', getDeadlockInfo);
router.post('/deadlock/run', runDeadlock);

// --- Admin CRUD ---
router.get('/admin/customers', getCustomers);
router.post('/admin/customers', createCustomer);
router.put('/admin/customers/:id', updateCustomer);
router.delete('/admin/customers/:id', deleteCustomer);

router.get('/admin/buses', getBuses);
router.post('/admin/buses', createBus);
router.put('/admin/buses/:id', updateBus);
router.delete('/admin/buses/:id', deleteBus);

router.get('/admin/trips', getAdminTrips);
router.post('/admin/trips', createTrip);
router.put('/admin/trips/:id', updateTrip);
router.delete('/admin/trips/:id', deleteTrip);

router.get('/admin/routes', getRoutes);

router.get('/admin/tickets', getAdminTickets);

export default router;