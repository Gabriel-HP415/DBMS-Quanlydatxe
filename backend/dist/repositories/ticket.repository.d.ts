import { Ticket } from '../types';
export declare class TicketRepository {
    /** Gọi sp_DanhSachVe - danh sách vé */
    findAll(ma_khach_hang?: number): Promise<Ticket[]>;
}
