import { Bus, Customer } from '../types';
import { TripInput } from '../types';
export declare class AdminService {
    getCustomers(): Promise<Customer[]>;
    createCustomer(data: {
        ho_ten: string;
        email: string;
        so_dien_thoai: string;
    }): Promise<any>;
    updateCustomer(id: number, data: Partial<Customer>): Promise<any>;
    deleteCustomer(id: number): Promise<void>;
    getBuses(): Promise<Bus[]>;
    createBus(data: {
        bien_so: string;
        loai_xe: string;
        so_ghe: number;
    }): Promise<any>;
    updateBus(id: number, data: Partial<Bus>): Promise<any>;
    deleteBus(id: number): Promise<void>;
    getTrips(): Promise<import("../types").Trip[]>;
    createTrip(data: TripInput): Promise<number>;
    updateTrip(id: number, data: Partial<TripInput>): Promise<void>;
    deleteTrip(id: number): Promise<void>;
    getRoutes(): Promise<import("mssql").IRecordSet<any>>;
    getTickets(): Promise<import("mssql").IRecordSet<any>>;
}
