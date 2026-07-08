import { Seat } from '../types';
export declare class SeatRepository {
    /** Gọi sp_DanhSachGhe - lấy sơ đồ ghế theo chuyến xe */
    findByTripId(ma_chuyen: number): Promise<Seat[]>;
}
