"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomers = getCustomers;
exports.createCustomer = createCustomer;
exports.updateCustomer = updateCustomer;
exports.deleteCustomer = deleteCustomer;
exports.getBuses = getBuses;
exports.createBus = createBus;
exports.updateBus = updateBus;
exports.deleteBus = deleteBus;
exports.getAdminTrips = getAdminTrips;
exports.createTrip = createTrip;
exports.updateTrip = updateTrip;
exports.deleteTrip = deleteTrip;
exports.getRoutes = getRoutes;
exports.getAdminTickets = getAdminTickets;
const admin_service_1 = require("../services/admin.service");
const service = new admin_service_1.AdminService();
// --- Khách hàng ---
async function getCustomers(_req, res, next) {
    try {
        res.json({ success: true, data: await service.getCustomers() });
    }
    catch (err) {
        next(err);
    }
}
async function createCustomer(req, res, next) {
    try {
        const data = await service.createCustomer(req.body);
        res.status(201).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function updateCustomer(req, res, next) {
    try {
        const data = await service.updateCustomer(Number(req.params.id), req.body);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function deleteCustomer(req, res, next) {
    try {
        await service.deleteCustomer(Number(req.params.id));
        res.json({ success: true, message: 'Đã khóa khách hàng' });
    }
    catch (err) {
        next(err);
    }
}
// --- Xe ---
async function getBuses(_req, res, next) {
    try {
        res.json({ success: true, data: await service.getBuses() });
    }
    catch (err) {
        next(err);
    }
}
async function createBus(req, res, next) {
    try {
        const data = await service.createBus(req.body);
        res.status(201).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function updateBus(req, res, next) {
    try {
        const data = await service.updateBus(Number(req.params.id), req.body);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function deleteBus(req, res, next) {
    try {
        await service.deleteBus(Number(req.params.id));
        res.json({ success: true, message: 'Đã ngừng xe' });
    }
    catch (err) {
        next(err);
    }
}
// --- Chuyến xe ---
async function getAdminTrips(_req, res, next) {
    try {
        res.json({ success: true, data: await service.getTrips() });
    }
    catch (err) {
        next(err);
    }
}
async function createTrip(req, res, next) {
    try {
        const id = await service.createTrip(req.body);
        res.status(201).json({ success: true, data: { ma_chuyen: id } });
    }
    catch (err) {
        next(err);
    }
}
async function updateTrip(req, res, next) {
    try {
        await service.updateTrip(Number(req.params.id), req.body);
        res.json({ success: true, message: 'Đã cập nhật chuyến xe' });
    }
    catch (err) {
        next(err);
    }
}
async function deleteTrip(req, res, next) {
    try {
        await service.deleteTrip(Number(req.params.id));
        res.json({ success: true, message: 'Đã hủy chuyến xe' });
    }
    catch (err) {
        next(err);
    }
}
async function getRoutes(_req, res, next) {
    try {
        res.json({ success: true, data: await service.getRoutes() });
    }
    catch (err) {
        next(err);
    }
}
async function getAdminTickets(_req, res, next) {
    try {
        res.json({ success: true, data: await service.getTickets() });
    }
    catch (err) {
        next(err);
    }
}
