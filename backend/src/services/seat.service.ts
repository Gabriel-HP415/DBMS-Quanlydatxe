import { SeatRepository } from '../repositories/seat.repository';

const repo = new SeatRepository();

export class SeatService {
  getByTripId(tripId: number) {
    return repo.findByTripId(tripId);
  }
}