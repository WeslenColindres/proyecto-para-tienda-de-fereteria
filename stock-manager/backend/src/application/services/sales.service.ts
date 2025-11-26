import { SaleRepository } from '../../domain/ports/sale.repository';
import { ProductRepository } from '../../domain/ports/product.repository';
import { Sale } from '../../domain/entities/sale.entity';
import { SaleDetail } from '../../domain/entities/sale-detail.entity';

export class SalesService {
    constructor(
        private readonly saleRepository: SaleRepository,
        private readonly productRepository: ProductRepository
    ) { }

    async createSale(saleData: any, items: any[]): Promise<Sale> {
        // 1. Validate items and calculate totals
        let subtotal = 0;
        let totalTaxes = 0;

        // This is a simplified logic. In a real scenario, we'd check stock availability for all items first.

        // 2. Create Sale entity
        const sale = new Sale({
            ...saleData,
            subtotal: 0, // Will be updated
            totalTaxes: 0,
            finalTotal: 0,
            status: 'BORRADOR',
            saleDate: new Date(),
        });

        // 3. Save Sale (to get ID)
        const savedSale = await this.saleRepository.save(sale);

        // 4. Save Details and Update Stock (simplified)
        // In a real app, this should be transactional.

        return savedSale;
    }

    async getSaleById(id: number): Promise<Sale | null> {
        return this.saleRepository.findById(id);
    }
}
