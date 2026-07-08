import { Trip, TripInput } from '../types';
export declare class TripRepository {
    findAll(): Promise<Trip[]>;
    /** Admin: bao gồm ma_tuyen, ma_xe để CRUD form */
    findAllAdmin(): Promise<Trip[]>;
    findById(ma_chuyen: number): Promise<Trip | null>;
    create(data: TripInput): Promise<number>;
    update(ma_chuyen: number, data: Partial<TripInput>): Promise<void>;
    delete(ma_chuyen: number): Promise<void>;
}
