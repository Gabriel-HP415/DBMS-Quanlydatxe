import { BookingRepository } from '../repositories/booking.repository';
import { BookingRequest, CheDoKhoa } from '../types';

const repo = new BookingRepository();

export class BookingService {
  /**
   * Đặt vé qua sp_DatVe.
   * Transaction + Lock được xử lý hoàn toàn trong SQL Server.
   */
  book(data: BookingRequest) {
    const che_do_khoa = data.che_do_khoa || (process.env.CHE_DO_KHOA_MAC_DINH as CheDoKhoa) || 'BI_QUAN';
    return repo.book({ ...data, che_do_khoa });
  }

  cancel(ma_ve: number, che_do_khoa?: CheDoKhoa, session_id?: string) {
    return repo.cancel(ma_ve, che_do_khoa, session_id);
  }

  changeSeat(ma_ve: number, ma_ghe_moi: number, che_do_khoa?: CheDoKhoa, session_id?: string) {
    return repo.changeSeat(ma_ve, ma_ghe_moi, che_do_khoa, session_id);
  }
}