import { TicketRepository } from '../repositories/ticket.repository';

const repo = new TicketRepository();

export class TicketService {
  getAll(ma_khach_hang?: number) {
    return repo.findAll(ma_khach_hang);
  }
}