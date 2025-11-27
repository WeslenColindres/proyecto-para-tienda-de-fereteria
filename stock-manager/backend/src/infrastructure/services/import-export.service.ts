import pool from '../database/postgres';
import * as xlsx from 'exceljs';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { Supplier } from '../../domain/entities/Supplier';
import { SuppliersRepository } from '../repositories/suppliers.repository';
import { PostgresProductRepository } from '../repositories/postgres-product.repository';
import { Product } from '../../domain/entities/product.entity';

const productRepository = new PostgresProductRepository();

export interface ParsedProduct {
    code: string;
    name: string;
    category: string;
    cost: number;
    price: number;
    stockToAdd: number;
    // Computed fields
    currentStock: number;
    newTotalStock: number;
    isNew: boolean;
    categoryId?: number;
    errors: string[];
}

export class ImportExportService {
    async importSuppliers(filePath: string, userId: string): Promise<string> {
        // Create job
        // jobs table: id_job, tipo, estado, payload, resultado, progreso, mensaje_error, fecha_creacion
        const jobResult = await pool.query(
            "INSERT INTO jobs (tipo, estado, payload) VALUES ('IMPORT_SUPPLIERS', 'PENDIENTE', $1) RETURNING id_job",
            [JSON.stringify({ filePath, userId })]
        );
        const jobId = jobResult.rows[0].id_job;

        // Start processing asynchronously
        this.processImport(jobId, filePath).catch(err => {
            console.error(`Error processing job ${jobId}:`, err);
            pool.query("UPDATE jobs SET estado = 'FALLIDO', mensaje_error = $1, fecha_fin = NOW() WHERE id_job = $2", [err.message, jobId]);
        });

        return jobId.toString();
    }

    private async processImport(jobId: number, filePath: string) {
        try {
            await pool.query("UPDATE jobs SET estado = 'PROCESANDO', fecha_inicio = NOW() WHERE id_job = $1", [jobId]);

            const suppliers: any[] = [];
            const errors: any[] = [];

            if (filePath.endsWith('.csv')) {
                await new Promise((resolve, reject) => {
                    fs.createReadStream(filePath)
                        .pipe(csv())
                        .on('data', (data) => suppliers.push(data))
                        .on('end', resolve)
                        .on('error', reject);
                });
            } else {
                const workbook = new xlsx.Workbook();
                await workbook.xlsx.readFile(filePath);
                const worksheet = workbook.getWorksheet(1);

                if (worksheet) {
                    const headers: string[] = [];
                    worksheet.getRow(1).eachCell((cell, colNumber) => {
                        headers[colNumber] = cell.text;
                    });

                    worksheet.eachRow((row, rowNumber) => {
                        if (rowNumber === 1) return;
                        const supplier: any = {};
                        row.eachCell((cell, colNumber) => {
                            const header = headers[colNumber];
                            if (header) supplier[header] = cell.text;
                        });
                        suppliers.push(supplier);
                    });
                }
            }

            let processed = 0;
            const total = suppliers.length;

            for (const data of suppliers) {
                try {
                    // Map data to Supplier entity props
                    // Expected headers: NIT, Nombre, Nombre Comercial, Email, Telefono, Direccion, Dias Credito, Limite Credito
                    const supplier = new Supplier({
                        id: '', // New supplier
                        nit: data['NIT'] || data['nit'],
                        name: data['Nombre'] || data['nombre'],
                        commercialName: data['Nombre Comercial'] || data['nombre_comercial'],
                        email: data['Email'] || data['email'],
                        phone: data['Telefono'] || data['telefono'],
                        address: data['Direccion'] || data['direccion'],
                        creditDays: parseInt(data['Dias Credito'] || data['dias_credito'] || '0'),
                        creditLimit: parseFloat(data['Limite Credito'] || data['limite_credito'] || '0'),
                        status: 'activo',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });

                    // Check if exists
                    const existing = await SuppliersRepository.findByNit(supplier.props.nit);
                    if (existing) {
                        // Update
                        const updatedProps = { ...existing.props, ...supplier.props, id: existing.id };
                        await SuppliersRepository.save(new Supplier(updatedProps));
                    } else {
                        // Create
                        await SuppliersRepository.save(supplier);
                    }
                    processed++;

                    // Update progress every 10 items
                    if (processed % 10 === 0) {
                        const progress = Math.round((processed / total) * 100);
                        await pool.query("UPDATE jobs SET progreso = $1 WHERE id_job = $2", [progress, jobId]);
                    }

                } catch (e: any) {
                    errors.push({ row: data, error: e.message });
                }
            }

            await pool.query(
                "UPDATE jobs SET estado = 'COMPLETADO', resultado = $1, progreso = 100, fecha_fin = NOW() WHERE id_job = $2",
                [JSON.stringify({ processed, errors }), jobId]
            );

        } catch (e: any) {
            await pool.query(
                "UPDATE jobs SET estado = 'FALLIDO', mensaje_error = $1, fecha_fin = NOW() WHERE id_job = $2",
                [e.message, jobId]
            );
            throw e;
        } finally {
            // Cleanup file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }

    async exportSuppliers(format: 'xlsx' | 'csv'): Promise<string> {
        const result = await SuppliersRepository.findAll({ pageSize: 100000, status: 'all' });
        const suppliers = result.data;

        const filename = `proveedores_${Date.now()}.${format}`;
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filepath = path.join(uploadDir, filename);

        if (format === 'csv') {
            throw new Error('CSV export not implemented yet');
        } else {
            const workbook = new xlsx.Workbook();
            const worksheet = workbook.addWorksheet('Proveedores');

            worksheet.columns = [
                { header: 'NIT', key: 'nit', width: 15 },
                { header: 'Nombre', key: 'name', width: 30 },
                { header: 'Nombre Comercial', key: 'commercialName', width: 30 },
                { header: 'Contacto', key: 'contactName', width: 25 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'Teléfono', key: 'phone', width: 15 },
                { header: 'Dirección', key: 'address', width: 40 },
                { header: 'Ciudad', key: 'cityName', width: 20 },
                { header: 'Categoría', key: 'categoryName', width: 20 },
                { header: 'Días Crédito', key: 'creditDays', width: 15 },
                { header: 'Límite Crédito', key: 'creditLimit', width: 15 },
                { header: 'Saldo', key: 'balance', width: 15 },
                { header: 'Estado', key: 'status', width: 10 }
            ];

            worksheet.addRows(suppliers.map(s => ({
                nit: s.props.nit,
                name: s.props.name,
                commercialName: s.props.commercialName,
                contactName: s.props.contactName,
                email: s.props.email,
                phone: s.props.phone,
                address: s.props.address,
                cityName: s.props.cityName,
                categoryName: s.props.categoryName,
                creditDays: s.props.creditDays,
                creditLimit: s.props.creditLimit,
                balance: s.props.balance,
                status: s.props.status
            })));

            await workbook.xlsx.writeFile(filepath);
        }

        return `/uploads/${filename}`;
    }

    async getJobStatus(jobId: string) {
        const result = await pool.query('SELECT * FROM jobs WHERE id_job = $1', [jobId]);
        return result.rows[0];
    }

    async parseProductFile(filePath: string, originalName: string = ''): Promise<ParsedProduct[]> {
        const rows: any[] = [];
        const isCsv = originalName.toLowerCase().endsWith('.csv') || filePath.endsWith('.csv');

        if (isCsv) {
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (data) => rows.push(data))
                    .on('end', resolve)
                    .on('error', reject);
            });
        } else {
            const workbook = new xlsx.Workbook();
            await workbook.xlsx.readFile(filePath);
            const worksheet = workbook.getWorksheet(1);

            if (worksheet) {
                const headers: string[] = [];
                worksheet.getRow(1).eachCell((cell, colNumber) => {
                    headers[colNumber] = cell.text;
                });

                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber === 1) return;
                    const item: any = {};
                    row.eachCell((cell, colNumber) => {
                        const header = headers[colNumber];
                        if (header) item[header] = cell.text;
                    });
                    rows.push(item);
                });
            }
        }

        // Clean up file after reading
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        const parsedProducts: ParsedProduct[] = [];

        for (const row of rows) {
            const code = row['Codigo'] || row['codigo'] || row['Code'] || row['code'] || '';
            const name = row['Nombre'] || row['nombre'] || row['Name'] || row['name'] || '';
            const category = row['Categoria'] || row['categoria'] || row['Category'] || row['category'] || '';
            const cost = parseFloat(row['Costo'] || row['costo'] || row['Cost'] || row['cost'] || '0');
            const price = parseFloat(row['Precio'] || row['precio'] || row['Price'] || row['price'] || '0');
            const stockToAdd = parseInt(row['Stock'] || row['stock'] || '0');

            const errors: string[] = [];
            if (!code) errors.push('Codigo es requerido');
            if (!name) errors.push('Nombre es requerido');

            let currentStock = 0;
            let isNew = true;
            let categoryId: number | undefined;

            // Check if product exists
            if (code) {
                const existing = await productRepository.findBySku(code);
                if (existing) {
                    isNew = false;
                    // Get current stock (assuming branch 1 for now, or sum all)
                    // For simplicity, we'll just show 0 if we can't easily get it without branch context, 
                    // but let's try to get it if possible.
                    // We'll assume a default branch or just show 0.
                    // Actually, let's fetch stock for branch 1 (Main)
                    const stock = await productRepository.getStock(existing.id!, 1);
                    currentStock = stock ? stock.quantityAvailable : 0;
                }
            }

            parsedProducts.push({
                code,
                name,
                category,
                cost,
                price,
                stockToAdd,
                currentStock,
                newTotalStock: currentStock + stockToAdd,
                isNew,
                categoryId,
                errors
            });
        }

        return parsedProducts;
    }

    async processProductImport(products: ParsedProduct[], userId: string): Promise<{ processed: number, errors: any[] }> {
        let processed = 0;
        const errors: any[] = [];

        for (const item of products) {
            try {
                if (item.errors.length > 0) {
                    throw new Error(item.errors.join(', '));
                }

                let productId: number | undefined;

                if (item.isNew) {
                    const productToSave = new Product({
                        sku: item.code,
                        name: item.name,
                        description: item.category,
                        categoryId: 1,
                        unitOfMeasureId: 1,
                        mainProviderId: null,
                        isInventoriable: true,
                        isSellable: true,
                        isBuyable: true,
                        isActive: true
                    });

                    const saved = await productRepository.save(productToSave);
                    productId = saved.id;
                } else {
                    const existing = await productRepository.findBySku(item.code);
                    if (existing) {
                        productId = existing.id;
                    }
                }

                if (productId && item.stockToAdd > 0) {
                    const currentStock = await productRepository.getStock(productId, 1);
                    const currentQty = currentStock ? currentStock.quantityAvailable : 0;

                    const stockMock = {
                        props: {
                            productId,
                            branchId: 1,
                            quantityReserved: 0,
                            quantityInTransit: 0
                        },
                        quantityAvailable: currentQty + item.stockToAdd
                    };

                    await productRepository.updateStock(stockMock as any);
                }

                if (productId && item.price > 0) {
                    await productRepository.updatePrice(productId, item.price);
                }

                processed++;
            } catch (err: any) {
                errors.push({ code: item.code, error: err.message });
            }
        }

        return { processed, errors };
    }
}

export const importExportService = new ImportExportService();
