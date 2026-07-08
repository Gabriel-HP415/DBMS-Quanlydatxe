"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSimulationStatus = getSimulationStatus;
exports.resetSimulation = resetSimulation;
const simulation_service_1 = require("../services/simulation.service");
const service = new simulation_service_1.SimulationService();
/** GET /simulation/status - Dashboard thống kê nghiên cứu */
async function getSimulationStatus(_req, res, next) {
    try {
        const [stats, logs, deadlockLogs] = await Promise.all([
            service.getStatus(),
            service.getLogs(30),
            service.getDeadlockLogs(10),
        ]);
        res.json({
            success: true,
            data: {
                stats,
                recent_logs: logs,
                deadlock_logs: deadlockLogs,
            },
        });
    }
    catch (err) {
        next(err);
    }
}
/** POST /simulation/reset - Reset log mô phỏng */
async function resetSimulation(_req, res, next) {
    try {
        await service.reset();
        res.json({ success: true, message: 'Đã reset log mô phỏng' });
    }
    catch (err) {
        next(err);
    }
}
