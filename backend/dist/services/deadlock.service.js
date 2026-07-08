"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadlockService = void 0;
const deadlock_repository_1 = require("../repositories/deadlock.repository");
const repo = new deadlock_repository_1.DeadlockRepository();
class DeadlockService {
    getInfo(ma_chuyen) {
        return repo.getSeatInfo(ma_chuyen ?? 1);
    }
    /**
     * Chạy Tx A và Tx B song song trên 2 connection pool → kích hoạt deadlock.
     */
    async runDemo(ma_chuyen = 1, delay_giay = 5) {
        const [txA, txB] = await Promise.all([
            repo.runRole('A', ma_chuyen, delay_giay),
            repo.runRole('B', ma_chuyen, delay_giay),
        ]);
        const deadlock_logs = await repo.getDeadlockLogs(5);
        const victim = [txA, txB].find((t) => t.ket_qua === 'DEADLOCK') ?? null;
        const survivor = [txA, txB].find((t) => t.ket_qua === 'COMMIT') ?? null;
        return {
            txA,
            txB,
            victim,
            survivor,
            deadlock_detected: victim !== null,
            deadlock_logs,
        };
    }
}
exports.DeadlockService = DeadlockService;
