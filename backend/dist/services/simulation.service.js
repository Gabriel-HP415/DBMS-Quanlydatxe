"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationService = void 0;
const simulation_repository_1 = require("../repositories/simulation.repository");
const repo = new simulation_repository_1.SimulationRepository();
class SimulationService {
    getStatus() {
        return repo.getStats();
    }
    reset() {
        return repo.reset();
    }
    getLogs(limit) {
        return repo.getRecentLogs(limit);
    }
    getDeadlockLogs(limit) {
        return repo.getDeadlockLogs(limit);
    }
}
exports.SimulationService = SimulationService;
