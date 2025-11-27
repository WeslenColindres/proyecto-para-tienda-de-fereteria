import { Supplier } from '../entities/Supplier';
import { SupplierCategory } from '../entities/SupplierCategory';
import { City } from '../entities/City';

export interface SupplierListResult {
    data: Supplier[];
    total: number;
    page: number;
    pageSize: number;
    counters: {
        activo: number;
        inactivo: number;
        moroso: number;
    };
}

export interface ListSuppliersParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: 'activo' | 'inactivo' | 'moroso' | 'all';
    cityId?: string;
    categoryId?: string;
    sortBy?: 'name' | 'nit' | 'balance' | 'creditDays' | 'status';
    sortOrder?: 'asc' | 'desc';
}

export interface SupplierCatalogs {
    cities: City[];
    categories: SupplierCategory[];
}

export interface ISupplierRepository {
    save(supplier: Supplier): Promise<void>;
    findById(id: string): Promise<Supplier | null>;
    findByNit(nit: string): Promise<Supplier | null>;
    findAll(params: ListSuppliersParams): Promise<SupplierListResult>;
    softDelete(id: string): Promise<void>;
    restore(id: string): Promise<void>;
    updateBalance(id: string, balance: number): Promise<void>;
    getCatalogs(): Promise<SupplierCatalogs>;
    getReport(params: { from?: string; to?: string }): Promise<any>;
}
