import { Supplier } from '../entities/Supplier';

export interface ISupplierRepository {
    save(supplier: Supplier): Promise<void>;
    findById(id: string): Promise<Supplier | null>;
    findByNit(nit: string): Promise<Supplier | null>;
    findAll(): Promise<Supplier[]>;
}
