import { TripInput } from '../types';
export declare class TripService {
    getAll(): Promise<import("../types").Trip[]>;
    getById(id: number): Promise<import("../types").Trip | null>;
    create(data: TripInput): Promise<number>;
    update(id: number, data: Partial<TripInput>): Promise<void>;
    delete(id: number): Promise<void>;
}
