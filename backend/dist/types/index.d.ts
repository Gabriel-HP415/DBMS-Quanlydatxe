export type CheDoKhoa = 'KHONG_KHOA' | 'BI_QUAN' | 'LE_QUAN';
export type KetQuaTransaction = 'COMMIT' | 'ROLLBACK' | 'WAITING' | 'BLOCKED' | 'DEADLOCK';
export interface Trip {
    ma_chuyen: number;
    ma_tuyen?: number;
    ma_xe?: number;
    ten_tuyen: string;
    diem_di: string;
    diem_den: string;
    gio_khoi_hanh: Date;
    gia_ve: number;
    trang_thai_chuyen: string;
    bien_so: string;
    loai_xe: string;
    tong_ghe: number;
    ghe_da_dat: number;
    ghe_con: number;
}
export interface Seat {
    ma_ghe: number;
    so_ghe: string;
    tang: number;
    vi_tri: string;
    trang_thai_ghe: 'TRONG' | 'DA_DAT' | 'KHOA';
    ma_ve: number | null;
    ten_khach_dat: string | null;
}
export interface Ticket {
    ma_ve: number;
    ma_chuyen: number;
    ma_khach_hang: number;
    ten_khach_hang: string;
    so_ghe: string;
    tang: number;
    ten_tuyen: string;
    diem_di: string;
    diem_den: string;
    gio_khoi_hanh: Date;
    gia_thanh_toan: number;
    trang_thai: string;
    ngay_dat: Date;
}
export interface BookingRequest {
    ma_chuyen: number;
    ma_ghe: number;
    ma_khach_hang: number;
    che_do_khoa?: CheDoKhoa;
    session_id?: string;
    delay_ms?: number;
}
export interface BookingResult {
    ma_ve: number | null;
    ket_qua: KetQuaTransaction;
    thong_bao: string;
}
export interface SimulationStats {
    tong_transaction: number;
    dang_chay: number;
    bi_block: number;
    rollback_count: number;
    commit_count: number;
    deadlock_count: number;
    avg_lock_wait_ms: number;
}
export interface Customer {
    ma_khach_hang: number;
    ho_ten: string;
    email: string;
    so_dien_thoai: string;
    ngay_tao: Date;
    trang_thai: string;
}
export interface Bus {
    ma_xe: number;
    bien_so: string;
    loai_xe: string;
    so_ghe: number;
    trang_thai: string;
}
export interface TripInput {
    ma_tuyen: number;
    ma_xe: number;
    gio_khoi_hanh: string;
    gia_ve: number;
    trang_thai?: string;
}
