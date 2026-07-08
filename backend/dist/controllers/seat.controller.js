"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeatsByTrip = getSeatsByTrip;
const seat_service_1 = require("../services/seat.service");
const service = new seat_service_1.SeatService();
async function getSeatsByTrip(req, res, next) {
    try {
        const seats = await service.getByTripId(Number(req.params.tripId));
        res.json({ success: true, data: seats });
    }
    catch (err) {
        next(err);
    }
}
