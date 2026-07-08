import { SimulationStats } from '../types';
export declare class SimulationRepository {
    /** Dashboard nghiên cứu - thống kê transaction */
    getStats(): Promise<SimulationStats>;
    reset(): Promise<void>;
    /** Lấy log transaction gần nhất (phục vụ Simulator UI) */
    getRecentLogs(limit?: number): Promise<import("mssql").IRecordSet<any>>;
    /** Lấy log deadlock */
    getDeadlockLogs(limit?: number): Promise<import("mssql").IRecordSet<any>>;
}
