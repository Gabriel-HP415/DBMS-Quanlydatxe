import { BookingRequest, CheDoKhoa } from '../types';
export declare class BookingService {
    /**
     * Đặt vé qua sp_DatVe.
     * Transaction + Lock được xử lý hoàn toàn trong SQL Server.
     */
    book(data: BookingRequest): Promise<import("../types").BookingResult>;
    cancel(ma_ve: number, che_do_khoa?: CheDoKhoa, session_id?: string): Promise<import("../types").BookingResult>;
    changeSeat(ma_ve: number, ma_ghe_moi: number, che_do_khoa?: CheDoKhoa, session_id?: string): Promise<import("../types").BookingResult>;
}
