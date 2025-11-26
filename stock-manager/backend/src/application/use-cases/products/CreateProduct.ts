import { randomUUID } from 'crypto';
import { DomainError } from '../../../domain/errors/DomainError';
import { Product } from '../../../domain/entities/Product';
import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { SKU } from '../../../domain/value-objects/SKU';
import { Money } from '../../../domain/value-objects/Money';

export interface CreateProductInput {
  code?: string;
  name: string;
  description?: string;
  categoryId: string;
  barcode?: string;
  cost?: number;
  price?: number;
  tax?: number;
  unit?: string;
  minStock?: number;
  stock?: number;
  status?: 'activo' | 'inactivo' | 'descontinuado';
  createdBy?: string;
  sku?: string;
}

export class CreateProduct {
  constructor(private readonly productRepository: IProductRepository) { }

  async execute(input: CreateProductInput) {
    if (!input.name?.trim()) {
      throw new DomainError('VALIDATION_ERROR', 'Nombre es obligatorio', 400);
    }

    // Auto-generate code if missing
    let code = input.code?.trim();
    if (!code) {
      const count = await this.productRepository.count();
      code = `P-${String(count + 1).padStart(3, '0')}`;
    }

    const sku = SKU.from(input.sku ?? code);

    // Check for duplicates
    const existing = await this.productRepository.findBySku(sku);
    if (existing) {
      throw new DomainError('DUPLICATE_CODE', 'Ya existe un producto con este codigo/SKU', 409);
    }

    // Create rich entity
    const product = new Product({
      id: randomUUID(), // Ideally, let DB generate ID or use UUID
      code: code,
      sku: sku.toString(),
      name: input.name.trim(),
      description: input.description ?? '',
      categoryId: input.categoryId,
      barcode: input.barcode ?? code,
      price: input.price ?? 0,
      cost: input.cost ?? 0,
      tax: input.tax ?? 12,
      unit: input.unit ?? 'unidad',
      minStock: input.minStock ?? 0,
      stock: input.stock ?? 0, // Initial stock
      status: input.status ?? 'activo',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save to repository
    await this.productRepository.save(product);

    // TODO: Handle initial stock movement via Domain Event or explicit service call
    // For now, we assume the repository or a separate service handles the inventory movement creation
    // if stock > 0. In a pure DDD approach, we'd publish a 'ProductCreated' event.

    return product;
  }
}
