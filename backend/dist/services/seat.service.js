"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatService = void 0;
const seat_repository_1 = require("../repositories/seat.repository");
const repo = new seat_repository_1.SeatRepository();
class SeatService {
    getByTripId(tripId) {
        return repo.findByTripId(tripId);
    }
}
exports.SeatService = SeatService;
