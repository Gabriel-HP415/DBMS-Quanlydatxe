"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const booking_repository_1 = require("../repositories/booking.repository");
const repo = new booking_repository_1.BookingRepository();
class BookingService {
    /**
     * Đặt vé qua sp_DatVe.
     * Transaction + Lock được xử lý hoàn toàn trong SQL Server.
     */
    book(data) {
        const che_do_khoa = data.che_do_khoa || process.env.CHE_DO_KHOA_MAC_DINH || 'BI_QUAN';
        return repo.book({ ...data, che_do_khoa });
    }
    cancel(ma_ve, che_do_khoa, session_id) {
        return repo.cancel(ma_ve, che_do_khoa, session_id);
    }
    changeSeat(ma_ve, ma_ghe_moi, che_do_khoa, session_id) {
        return repo.changeSeat(ma_ve, ma_ghe_moi, che_do_khoa, session_id);
    }
}
exports.BookingService = BookingService;
