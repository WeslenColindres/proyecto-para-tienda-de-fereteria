import { SaleDetail } from '../entities/sale-detail.entity';

export interface SaleDetailRepository {
    saveAll(saleId: number, details: SaleDetail[]): Promise<SaleDetail[]>;
    findBySaleId(saleId: number): Promise<SaleDetail[]>;
}
