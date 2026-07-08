export declare class DeadlockService {
    getInfo(ma_chuyen?: number): Promise<import("../repositories/deadlock.repository").DeadlockSeatInfo | null>;
    /**
     * Chạy Tx A và Tx B song song trên 2 connection pool → kích hoạt deadlock.
     */
    runDemo(ma_chuyen?: number, delay_giay?: number): Promise<{
        txA: import("../repositories/deadlock.repository").DeadlockTxResult;
        txB: import("../repositories/deadlock.repository").DeadlockTxResult;
        victim: import("../repositories/deadlock.repository").DeadlockTxResult | null;
        survivor: import("../repositories/deadlock.repository").DeadlockTxResult | null;
        deadlock_detected: boolean;
        deadlock_logs: import("mssql").IRecordSet<any>;
    }>;
}
