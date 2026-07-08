"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTickets = getTickets;
const ticket_service_1 = require("../services/ticket.service");
const service = new ticket_service_1.TicketService();
async function getTickets(req, res, next) {
    try {
        const ma_khach_hang = req.query.ma_khach_hang ? Number(req.query.ma_khach_hang) : undefined;
        const tickets = await service.getAll(ma_khach_hang);
        res.json({ success: true, data: tickets });
    }
    catch (err) {
        next(err);
    }
}
