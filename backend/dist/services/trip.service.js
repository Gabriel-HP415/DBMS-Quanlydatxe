"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripService = void 0;
const trip_repository_1 = require("../repositories/trip.repository");
const repo = new trip_repository_1.TripRepository();
class TripService {
    getAll() {
        return repo.findAll();
    }
    getById(id) {
        return repo.findById(id);
    }
    create(data) {
        return repo.create(data);
    }
    update(id, data) {
        return repo.update(id, data);
    }
    delete(id) {
        return repo.delete(id);
    }
}
exports.TripService = TripService;
