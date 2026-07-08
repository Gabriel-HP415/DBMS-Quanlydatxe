"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const ticket_repository_1 = require("../repositories/ticket.repository");
const repo = new ticket_repository_1.TicketRepository();
class TicketService {
    getAll(ma_khach_hang) {
        return repo.findAll(ma_khach_hang);
    }
}
exports.TicketService = TicketService;
