"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrips = getTrips;
exports.getTripById = getTripById;
const trip_service_1 = require("../services/trip.service");
const service = new trip_service_1.TripService();
async function getTrips(_req, res, next) {
    try {
        const trips = await service.getAll();
        res.json({ success: true, data: trips });
    }
    catch (err) {
        next(err);
    }
}
async function getTripById(req, res, next) {
    try {
        const trip = await service.getById(Number(req.params.id));
        if (!trip) {
            res.status(404).json({ success: false, message: 'Không tìm thấy chuyến xe' });
            return;
        }
        res.json({ success: true, data: trip });
    }
    catch (err) {
        next(err);
    }
}
