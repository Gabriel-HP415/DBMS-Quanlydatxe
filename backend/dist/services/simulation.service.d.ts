export declare class SimulationService {
    getStatus(): Promise<import("../types").SimulationStats>;
    reset(): Promise<void>;
    getLogs(limit?: number): Promise<import("mssql").IRecordSet<any>>;
    getDeadlockLogs(limit?: number): Promise<import("mssql").IRecordSet<any>>;
}
