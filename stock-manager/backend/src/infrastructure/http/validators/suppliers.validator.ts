import { z } from 'zod';

const cleanString = (val: unknown) => typeof val === 'string' ? val.trim() : val;
const cleanPhone = (val: unknown) => typeof val === 'string' ? val.replace(/[^\d+]/g, '') : val;
const cleanNit = (val: unknown) => typeof val === 'string' ? val.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '') : val;

export const createSupplierSchema = z.object({
    nit: z.preprocess(cleanNit, z.string().min(2, 'NIT es requerido')),
    name: z.preprocess(cleanString, z.string().min(3, 'Nombre es requerido')),
    commercialName: z.preprocess(cleanString, z.string().optional()),
    contactName: z.preprocess(cleanString, z.string().optional()),
    email: z.preprocess(cleanString, z.string().email('Email inválido').optional().or(z.literal(''))),
    phone: z.preprocess(cleanPhone, z.string().min(8, 'Teléfono inválido').optional().or(z.literal(''))),
    address: z.preprocess(cleanString, z.string().optional()),
    cityId: z.string().optional(),
    categoryId: z.string().optional(),
    creditDays: z.number().min(0).default(0),
    creditLimit: z.number().min(0).default(0),
    status: z.enum(['activo', 'inactivo', 'bloqueado', 'moroso']).default('activo'),
    paymentConditions: z.string().optional(),
    createdBy: z.string().optional() // Usually set by middleware
});

export const updateSupplierSchema = createSupplierSchema.partial().extend({
    version: z.number().min(1, 'Versión es requerida para bloqueo optimista'),
    updatedBy: z.string().optional()
});

export const supplierFilterSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(12),
    search: z.string().optional(),
    status: z.enum(['activo', 'inactivo', 'moroso', 'bloqueado', 'eliminado', 'all']).optional(),
    cityId: z.string().optional(),
    categoryId: z.string().optional(),
    sortBy: z.enum(['name', 'nit', 'balance', 'creditDays', 'status']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
});
