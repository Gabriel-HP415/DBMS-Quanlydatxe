export type CheDoKhoa = 'KHONG_KHOA' | 'BI_QUAN' | 'LE_QUAN'

export interface Trip {
  ma_chuyen: number
  ma_tuyen?: number
  ma_xe?: number
  ten_tuyen: string
  diem_di: string
  diem_den: string
  gio_khoi_hanh: string
  gia_ve: number
  trang_thai_chuyen: string
  bien_so: string
  loai_xe: string
  tong_ghe: number
  ghe_da_dat: number
  ghe_con: number
}

export interface Seat {
  ma_ghe: number
  so_ghe: string
  tang: number
  vi_tri: string
  trang_thai_ghe: 'TRONG' | 'DA_DAT' | 'KHOA'
  ma_ve: number | null
  ten_khach_dat: string | null
}

export interface Ticket {
  ma_ve: number
  ma_chuyen: number
  ma_khach_hang: number
  ten_khach_hang: string
  so_ghe: string
  tang: number
  ten_tuyen: string
  diem_di: string
  diem_den: string
  gio_khoi_hanh: string
  gia_thanh_toan: number
  trang_thai: string
  ngay_dat: string
}

export interface BookingResult {
  ma_ve: number | null
  ket_qua: string
  thong_bao: string
}

export interface SimulationStats {
  tong_transaction: number
  dang_chay: number
  bi_block: number
  rollback_count: number
  commit_count: number
  deadlock_count: number
  avg_lock_wait_ms: number
}

export interface TransactionLog {
  ma_log: number
  session_id: string
  ten_thu_tuc: string
  che_do_khoa: CheDoKhoa
  trang_thai: string
  ma_chuyen: number | null
  ma_ghe: number | null
  thong_bao: string | null
  thoi_gian_bat_dau: string
  thoi_gian_ket_thuc: string | null
  thoi_gian_cho_ms: number | null
}

export interface Customer {
  ma_khach_hang: number
  ho_ten: string
  email: string
  so_dien_thoai: string
  trang_thai: string
}

export interface Bus {
  ma_xe: number
  bien_so: string
  loai_xe: string
  so_ghe: number
  trang_thai: string
}

export interface Route {
  ma_tuyen: number
  ten_tuyen: string
  diem_di: string
  diem_den: string
  khoang_cach_km: number
  thoi_gian_chay: number
  trang_thai: string
}

export interface TripInput {
  ma_tuyen: number
  ma_xe: number
  gio_khoi_hanh: string
  gia_ve: number
  trang_thai?: string
}

export interface DeadlockSeatInfo {
  ma_chuyen: number
  ma_ghe_A1: number
  ma_ghe_A2: number
  so_ghe_A1: string
  so_ghe_A2: string
}

export interface DeadlockTxResult {
  vai_tro: string
  ket_qua: string
  thong_bao: string
  spid: number | null
}

export interface DeadlockLog {
  ma_log: number
  session_victim: number
  session_blocker: number | null
  error_code: number
  thong_bao: string
  chi_tiet_wait_graph: string | null
  thoi_gian: string
}

export interface DeadlockRunResult {
  txA: DeadlockTxResult
  txB: DeadlockTxResult
  victim: DeadlockTxResult | null
  survivor: DeadlockTxResult | null
  deadlock_detected: boolean
  deadlock_logs: DeadlockLog[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}