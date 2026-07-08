export interface DeadlockTxResult {
    vai_tro: string;
    ket_qua: string;
    thong_bao: string;
    spid: number | null;
}
export interface DeadlockSeatInfo {
    ma_chuyen: number;
    ma_ghe_A1: number;
    ma_ghe_A2: number;
    so_ghe_A1: string;
    so_ghe_A2: string;
}
export declare class DeadlockRepository {
    getSeatInfo(ma_chuyen?: number): Promise<DeadlockSeatInfo | null>;
    runRole(vaiTro: 'A' | 'B', ma_chuyen: number, delay_giay: number): Promise<DeadlockTxResult>;
    getDeadlockLogs(limit?: number): Promise<import("mssql").IRecordSet<any>>;
}
