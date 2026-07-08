"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBooking = createBooking;
exports.cancelBooking = cancelBooking;
exports.changeSeat = changeSeat;
const booking_service_1 = require("../services/booking.service");
const service = new booking_service_1.BookingService();
/**
 * POST /booking - Gọi sp_DatVe với Transaction trên SQL Server.
 * Body: { ma_chuyen, ma_ghe, ma_khach_hang, che_do_khoa?, session_id?, delay_ms? }
 */
async function createBooking(req, res, next) {
    try {
        const { ma_chuyen, ma_ghe, ma_khach_hang, che_do_khoa, session_id, delay_ms } = req.body;
        if (!ma_chuyen || !ma_ghe || !ma_khach_hang) {
            res.status(400).json({ success: false, message: 'Thiếu ma_chuyen, ma_ghe hoặc ma_khach_hang' });
            return;
        }
        const result = await service.book({
            ma_chuyen,
            ma_ghe,
            ma_khach_hang,
            che_do_khoa: che_do_khoa,
            session_id,
            delay_ms,
        });
        const statusCode = result.ket_qua === 'COMMIT' ? 201 : 409;
        res.status(statusCode).json({ success: result.ket_qua === 'COMMIT', data: result });
    }
    catch (err) {
        next(err);
    }
}
/** DELETE /booking/:id - Hủy vé qua sp_HuyVe */
async function cancelBooking(req, res, next) {
    try {
        const { che_do_khoa, session_id } = req.body;
        const result = await service.cancel(Number(req.params.id), che_do_khoa, session_id);
        res.json({
            success: result.ket_qua === 'COMMIT',
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
/** PUT /booking/:id/change-seat - Đổi ghế qua sp_DoiVe */
async function changeSeat(req, res, next) {
    try {
        const { ma_ghe_moi, che_do_khoa, session_id } = req.body;
        if (!ma_ghe_moi) {
            res.status(400).json({ success: false, message: 'Thiếu ma_ghe_moi' });
            return;
        }
        const result = await service.changeSeat(Number(req.params.id), ma_ghe_moi, che_do_khoa, session_id);
        res.json({ success: result.ket_qua === 'COMMIT', data: result });
    }
    catch (err) {
        next(err);
    }
}
