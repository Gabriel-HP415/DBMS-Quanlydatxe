import { TripRepository } from '../repositories/trip.repository';
import { TripInput } from '../types';

const repo = new TripRepository();

export class TripService {
  getAll() {
    return repo.findAll();
  }

  getById(id: number) {
    return repo.findById(id);
  }

  create(data: TripInput) {
    return repo.create(data);
  }

  update(id: number, data: Partial<TripInput>) {
    return repo.update(id, data);
  }

  delete(id: number) {
    return repo.delete(id);
  }
}