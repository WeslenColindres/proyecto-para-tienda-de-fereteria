import { Sale } from '../entities/sale.entity';

export interface SaleRepository {
    findById(id: number): Promise<Sale | null>;
    findByDocumentNumber(documentNumber: string): Promise<Sale | null>;
    save(sale: Sale): Promise<Sale>;
    update(sale: Sale): Promise<Sale>;
}
