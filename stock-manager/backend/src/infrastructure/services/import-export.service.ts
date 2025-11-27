import pool from '../database/postgres';
import * as xlsx from 'exceljs';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { Supplier } from '../../domain/entities/Supplier';
import { SuppliersRepository } from '../repositories/suppliers.repository';

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
}

export const importExportService = new ImportExportService();
