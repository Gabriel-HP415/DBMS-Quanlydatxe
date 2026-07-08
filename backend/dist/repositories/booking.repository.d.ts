import { BookingRequest, BookingResult, CheDoKhoa } from '../types';
export declare class BookingRepository {
    /**
     * Gọi sp_DatVe - Stored Procedure có Transaction và Concurrency Control.
     * @che_do_khoa KHONG_KHOA | BI_QUAN | LE_QUAN
     */
    book(data: BookingRequest): Promise<BookingResult>;
    /**
     * Gọi sp_HuyVe - Hủy vé trong Transaction.
     */
    cancel(ma_ve: number, che_do_khoa?: CheDoKhoa, session_id?: string): Promise<BookingResult>;
    /**
     * Gọi sp_DoiVe - Đổi ghế trong Transaction.
     */
    changeSeat(ma_ve: number, ma_ghe_moi: number, che_do_khoa?: CheDoKhoa, session_id?: string): Promise<BookingResult>;
}
