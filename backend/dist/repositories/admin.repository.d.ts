import { Bus, Customer } from '../types';
export declare class AdminRepository {
    getCustomers(): Promise<Customer[]>;
    createCustomer(data: {
        ho_ten: string;
        email: string;
        so_dien_thoai: string;
    }): Promise<any>;
    updateCustomer(ma_khach_hang: number, data: Partial<Customer>): Promise<any>;
    deleteCustomer(ma_khach_hang: number): Promise<void>;
    getBuses(): Promise<Bus[]>;
    createBus(data: {
        bien_so: string;
        loai_xe: string;
        so_ghe: number;
    }): Promise<any>;
    updateBus(ma_xe: number, data: Partial<Bus>): Promise<any>;
    deleteBus(ma_xe: number): Promise<void>;
    getRoutes(): Promise<import("mssql").IRecordSet<any>>;
    getTickets(): Promise<import("mssql").IRecordSet<any>>;
}
