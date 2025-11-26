import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import ExcelJS from 'exceljs';
import csvParser from 'csv-parser';
import { CreateProduct } from '../../../application/use-cases/products/CreateProduct';
import { DeactivateProduct } from '../../../application/use-cases/products/DeactivateProduct';
import { GetProductDetail } from '../../../application/use-cases/products/GetProductDetail';
import { ListProducts } from '../../../application/use-cases/products/ListProducts';
import { ListProductMovements } from '../../../application/use-cases/products/ListProductMovements';
import { UpdateProduct } from '../../../application/use-cases/products/UpdateProduct';
import type { StoreGateway } from '../../../application/ports/StoreGateway';
import { DomainError } from '../../../domain/errors/DomainError';
import type { WebsocketHub } from '../../../infrastructure/realtime/websocketHub';
import type { ProductStatus } from '../../../domain/entities/Product';
import { roundMoney } from '../../../application/utils/money';
import { syncStockAlerts } from '../../../application/utils/stockAlerts';
import { pushAuditLog } from '../../../application/utils/audit';

const ALLOWED_STATUS: ProductStatus[] = ['activo', 'inactivo', 'descontinuado'];
const ALLOWED_UNITS = ['unidad', 'kg', 'litro', 'caja', 'paquete', 'metro'];
const ALLOWED_TAXES = [12, 0, 15];
const TEMPLATE_RANGE = 500;

export class ProductController {
  constructor(private readonly store: StoreGateway, private readonly realtime?: WebsocketHub) {}

  exportTemplate = async (req: Request, res: Response) => {
    try {
      const format = ((req.query.format as string) ?? 'xlsx').toLowerCase();
      const store = await this.store.readStore();
      const categoryCodes = store.categories.filter((c) => !c.deletedAt).map((c) => c.code ?? '').filter(Boolean);

      if (format === 'csv') {
        const headers =
          'code,name,description,categoryCode,cost,price,tax,unit,minStock,status,barcode\n';
        const example = 'P001,Producto ejemplo,Descripcion,BEB,10,15,12,unidad,5,activo,1234567890123\n';
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="plantilla_productos.csv"');
        res.send(headers + example);
        return;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'stock-manager';

      const catalogSheet = workbook.addWorksheet('Catalogos');
      catalogSheet.columns = [
        { header: 'Categorias (categoryCode)', key: 'category', width: 28 },
        { header: 'Unidades (unit)', key: 'unit', width: 18 },
        { header: 'Estados (status)', key: 'status', width: 18 },
        { header: 'Impuestos (tax)', key: 'tax', width: 14 },
      ];
      const maxRows = Math.max(categoryCodes.length, ALLOWED_UNITS.length, ALLOWED_STATUS.length, ALLOWED_TAXES.length, 1);
      for (let i = 0; i < maxRows; i += 1) {
        catalogSheet.addRow({
          category: categoryCodes[i] ?? null,
          unit: ALLOWED_UNITS[i] ?? null,
          status: ALLOWED_STATUS[i] ?? null,
          tax: ALLOWED_TAXES[i] ?? null,
        });
      }
      catalogSheet.getRow(1).font = { bold: true };

      const productsSheet = workbook.addWorksheet('Productos');
      productsSheet.columns = [
        { header: 'code', key: 'code', width: 16 },
        { header: 'name', key: 'name', width: 28 },
        { header: 'description', key: 'description', width: 30 },
        { header: 'categoryCode', key: 'categoryCode', width: 18 },
        { header: 'cost', key: 'cost', width: 12 },
        { header: 'price', key: 'price', width: 12 },
        { header: 'tax', key: 'tax', width: 10 },
        { header: 'unit', key: 'unit', width: 12 },
        { header: 'minStock', key: 'minStock', width: 12 },
        { header: 'status', key: 'status', width: 16 },
        { header: 'barcode', key: 'barcode', width: 20 },
      ];
      productsSheet.views = [{ state: 'frozen', ySplit: 1 }];
      productsSheet.getRow(1).font = { bold: true };
      productsSheet.addRow({
        code: 'P001',
        name: 'Producto demo',
        description: 'Ejemplo de linea',
        categoryCode: categoryCodes[0] ?? 'GEN',
        cost: 10,
        price: 15,
        tax: 12,
        unit: ALLOWED_UNITS[0],
        minStock: 5,
        status: 'activo',
        barcode: '1234567890123',
      });

      const categoryRange = `Catalogos!$A$2:$A$${Math.max(categoryCodes.length, 1) + 1}`;
      const unitRange = `Catalogos!$B$2:$B$${ALLOWED_UNITS.length + 1}`;
      const statusRange = `Catalogos!$C$2:$C$${ALLOWED_STATUS.length + 1}`;
      const taxRange = `Catalogos!$D$2:$D$${ALLOWED_TAXES.length + 1}`;
      const validations = (productsSheet as any).dataValidations;

      validations.add(`D2:D${TEMPLATE_RANGE}`, {
        type: 'list',
        allowBlank: true,
        formulae: [categoryRange],
        showErrorMessage: true,
        error: 'Usa un codigo de categoria de la hoja Catalogos',
      });
      validations.add(`G2:G${TEMPLATE_RANGE}`, {
        type: 'list',
        allowBlank: true,
        formulae: [taxRange],
        showErrorMessage: true,
        error: 'Selecciona un valor de impuesto valido',
      });
      validations.add(`H2:H${TEMPLATE_RANGE}`, {
        type: 'list',
        allowBlank: true,
        formulae: [unitRange],
        showErrorMessage: true,
        error: 'Selecciona una unidad listada',
      });
      validations.add(`J2:J${TEMPLATE_RANGE}`, {
        type: 'list',
        allowBlank: true,
        formulae: [statusRange],
        showErrorMessage: true,
        error: 'Selecciona un estado permitido',
      });

      const buffer = (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="plantilla_productos.xlsx"');
      res.send(buffer);
    } catch (err) {
      this.handleError(err, res);
    }
  };

  exportData = async (req: Request, res: Response) => {
    try {
      const data = await this.store.readStore();
      const categoryById = new Map(data.categories.map((c) => [c.id, c.code ?? '']));

      const filtered = data.products
        .filter((product) =>
          req.query.includeInactive === 'true'
            ? !product.deletedAt
            : product.status !== 'descontinuado' && !product.deletedAt,
        )
        .filter((product) =>
          req.query.categoryId ? product.categoryId === (req.query.categoryId as string) : true,
        )
        .filter((product) =>
          req.query.status && req.query.status !== 'all'
            ? product.status === req.query.status
            : true,
        )
        .filter((product) => {
          const stockState = req.query.stockState;
          if (!stockState || stockState === 'all') return true;
          if (stockState === 'with-stock') return product.stock > 0;
          if (stockState === 'no-stock') return product.stock === 0;
          if (stockState === 'low') return product.stock < product.minStock;
          if (stockState === 'preventive') return product.stock < product.minStock * 1.5;
          return true;
        })
        .filter((product) => {
          const search = (req.query.search as string | undefined)?.trim().toLowerCase();
          if (!search) return true;
          const haystack = `${product.code} ${product.name} ${product.barcode ?? ''}`.toLowerCase();
          return haystack.includes(search);
        });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="productos_actuales.csv"');

      const headers = [
        'code',
        'name',
        'description',
        'categoryCode',
        'cost',
        'price',
        'tax',
        'unit',
        'minStock',
        'stock',
        'status',
        'barcode',
        'createdAt',
        'updatedAt',
      ];
      res.write(`${headers.join(',')}\n`);

      filtered.forEach((product) => {
        const row = [
          product.code,
          product.name,
          product.description ?? '',
          categoryById.get(product.categoryId ?? '') ?? '',
          product.cost ?? '',
          product.price ?? '',
          product.tax ?? '',
          product.unit ?? '',
          product.minStock ?? '',
          product.stock ?? '',
          product.status,
          product.barcode ?? '',
          product.createdAt ?? '',
          product.updatedAt ?? '',
        ];
        res.write(`${row.map((value) => this.csvEscape(value)).join(',')}\n`);
      });

      res.end();
    } catch (err) {
      this.handleError(err, res);
    }
  };

  importCsv = async (req: Request, res: Response) => {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) {
        return res
          .status(400)
          .json({ error: 'FILE_REQUIRED', message: 'Se requiere un archivo CSV o XLSX' });
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return res
          .status(400)
          .json({ error: 'FILE_TOO_LARGE', message: 'El archivo excede el limite permitido (10MB)' });
      }

      const importMode = ((req.query.mode as string) ?? 'regular').toLowerCase() === 'initial' ? 'initial' : 'regular';
      const allowStock = importMode === 'initial';

      const summary: ImportSummary = { totalRows: 0, inserted: 0, updated: 0, errors: [] };
      const validRows: NormalizedCsvRow[] = [];
      const currentStore = await this.store.readStore();
      const catalogs = this.buildCatalogs(currentStore);

      const parsedRows = this.isExcelFile(file)
        ? await this.parseXlsxBuffer(file.buffer)
        : await this.parseCsvBuffer(file.buffer);

      parsedRows.forEach(({ data, rowNumber }) => {
        if (this.isRowEmpty(data)) return;
        summary.totalRows += 1;
        const normalized = this.normalizeCsvRow(
          data,
          rowNumber,
          catalogs.categoryMap,
          catalogs.defaultCategoryId,
          summary,
          { allowedStatus: ALLOWED_STATUS, allowedUnits: catalogs.units, allowedTaxes: catalogs.taxes },
          allowStock,
        );
        if (normalized) validRows.push(normalized);
      });

      await this.store.withStoreLock((store) => {
        const now = new Date().toISOString();
        const defaultWarehouse = this.ensureWarehouse(store, now);

        validRows.forEach((row) => {
          const categoryId =
            row.categoryId ??
            catalogs.categoryMap.get(row.categoryCode?.toLowerCase?.() ?? '') ??
            store.categories.find((c) => c.id === catalogs.defaultCategoryId)?.id ??
            store.categories[0]?.id ??
            catalogs.defaultCategoryId ??
            'cat-default';

          const stockValue = allowStock && row.stock !== undefined ? row.stock : undefined;
          const unit = row.unit ?? catalogs.units[0] ?? 'unidad';
          const tax = row.tax ?? catalogs.taxes[0] ?? 0;

          const existing = store.products.find((p) => p.code === row.code);
          if (!existing) {
            const product = {
              id: randomUUID(),
              code: row.code,
              name: row.name,
              description: row.description ?? '',
              categoryId,
              barcode: row.barcode ?? row.code,
              cost: roundMoney(row.cost ?? row.price * 0.6),
              price: roundMoney(row.price),
              tax,
              unit,
              status: row.status ?? 'activo',
              stock: stockValue ?? 0,
              minStock: row.minStock ?? 0,
              createdAt: now,
              updatedAt: now,
              deletedAt: null,
              createdBy: 'import',
              updatedBy: 'import',
            };
            store.products.push(product);
            store.productStock.push({
              id: randomUUID(),
              productId: product.id,
              warehouseId: defaultWarehouse.id,
              branchId: defaultWarehouse.id,
              stock: stockValue ?? 0,
              available: stockValue ?? 0,
              reserved: 0,
              inTransit: 0,
              lastMovementAt: now,
              lastUpdated: now,
            });
            syncStockAlerts(store, product);
            pushAuditLog(store, {
              action: 'product_import_create',
              entityType: 'product',
              entityId: product.id,
              before: null,
              after: product,
            });
            summary.inserted += 1;
          } else {
            const before = { ...existing };
            existing.name = row.name;
            existing.description = row.description ?? '';
            existing.categoryId = categoryId;
            existing.barcode = row.barcode ?? existing.barcode ?? row.code;
            existing.cost = row.cost !== undefined ? roundMoney(row.cost) : existing.cost;
            existing.price = roundMoney(row.price ?? existing.price);
            existing.tax = tax ?? existing.tax ?? 12;
            existing.unit = unit ?? existing.unit ?? 'unidad';
            existing.minStock = row.minStock ?? existing.minStock ?? 0;
            existing.status = row.status ?? existing.status ?? 'activo';
            existing.deletedAt = null;
            if (stockValue !== undefined) {
              existing.stock = stockValue;
              const stockEntry = store.productStock.find((s) => s.productId === existing.id);
              if (stockEntry) {
                stockEntry.stock = stockValue;
                stockEntry.available = stockValue;
                stockEntry.lastMovementAt = now;
                stockEntry.lastUpdated = now;
              } else {
                store.productStock.push({
                  id: randomUUID(),
                  productId: existing.id,
                  warehouseId: defaultWarehouse.id,
                  branchId: defaultWarehouse.id,
                  stock: stockValue,
                  available: stockValue,
                  reserved: 0,
                  inTransit: 0,
                  lastMovementAt: now,
                  lastUpdated: now,
                });
              }
            }
            existing.updatedAt = now;
            existing.updatedBy = 'import';

            syncStockAlerts(store, existing);
            pushAuditLog(store, {
              action: 'product_import_update',
              entityType: 'product',
              entityId: existing.id,
              before,
              after: existing,
            });
            summary.updated += 1;
          }
        });

        return summary;
      });

      res.json(summary);
    } catch (err) {
      this.handleError(err, res);
    }
  };

  list = async (req: Request, res: Response) => {
    try {
      const useCase = new ListProducts(this.store);
      const result = await useCase.execute({
        includeInactive: req.query.includeInactive === 'true',
        search: req.query.search as string | undefined,
        categoryId: req.query.categoryId as string | undefined,
        status: (req.query.status as any) ?? 'all',
        stockState: (req.query.stockState as any) ?? 'all',
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        preloadChunks: req.query.preloadChunks ? Number(req.query.preloadChunks) : undefined,
      });

      res.json({
        ...result,
        data: result.data.map((p) => p.toJSON()),
        chunks: result.chunks.map((chunk) => ({ ...chunk, data: chunk.data.map((p) => p.toJSON()) })),
      });
    } catch (err) {
      this.handleError(err, res);
    }
  };

  movements = async (req: Request, res: Response) => {
    try {
      const useCase = new ListProductMovements(this.store);
      const result = await useCase.execute({
        productId: req.params.id,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      });
      res.json(result);
    } catch (err) {
      this.handleError(err, res);
    }
  };

  detail = async (req: Request, res: Response) => {
    try {
      const useCase = new GetProductDetail(this.store);
      const result = await useCase.execute(req.params.id);
      res.json(result);
    } catch (err) {
      this.handleError(err, res);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const useCase = new CreateProduct(this.store);
      const product = await useCase.execute(req.body);
      const payload = product.toJSON();
      res.status(201).json(payload);
      this.realtime?.broadcast({ type: 'product.updated', payload });
      this.realtime?.broadcast({ type: 'inventory.updated', payload: [{ id: payload.id, stock: payload.stock }] });
      const store = await this.store.readStore();
      const alerts = store.alerts.filter((a) => a.productId === payload.id);
      if (alerts.length) this.realtime?.broadcast({ type: 'alert.created', payload: alerts });
    } catch (err) {
      this.handleError(err, res);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const useCase = new UpdateProduct(this.store);
      const updated = await useCase.execute({ id: req.params.id, ...req.body });
      res.json(updated);
      this.realtime?.broadcast({ type: 'product.updated', payload: updated });
      this.realtime?.broadcast({ type: 'inventory.updated', payload: [{ id: updated.id, stock: updated.stock }] });
      const store = await this.store.readStore();
      const alerts = store.alerts.filter((a) => a.productId === updated.id);
      if (alerts.length) this.realtime?.broadcast({ type: 'alert.created', payload: alerts });
    } catch (err) {
      this.handleError(err, res);
    }
  };

  deactivate = async (req: Request, res: Response) => {
    try {
      const useCase = new DeactivateProduct(this.store);
      const product = await useCase.execute(req.params.id);
      res.json(product);
      this.realtime?.broadcast({ type: 'product.deleted', payload: { id: req.params.id } });
      const store = await this.store.readStore();
      const alerts = store.alerts.filter((a) => a.productId === product.id);
      if (alerts.length) this.realtime?.broadcast({ type: 'alert.created', payload: alerts });
    } catch (err) {
      this.handleError(err, res);
    }
  };

  private handleError(err: unknown, res: Response) {
    if (err instanceof DomainError) {
      return res.status(err.status).json({ error: err.code, message: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Error interno del servidor' });
  }

  private buildCatalogs(store: any) {
    const categoryMap: Map<string, string> = new Map(
      (store.categories ?? [])
        .map((cat: any) => [String(cat.code ?? '').toLowerCase(), String(cat.id ?? '')] as [string, string])
        .filter(([code, id]: [string, string]) => Boolean(code) && Boolean(id)),
    );
    return {
      categoryMap,
      defaultCategoryId: store.categories[0]?.id,
      units: ALLOWED_UNITS,
      taxes: ALLOWED_TAXES,
    };
  }

  private ensureWarehouse(store: any, now: string) {
    if (store.warehouses?.length) return store.warehouses[0];
    const warehouse = {
      id: 'wh-main',
      code: 'WH-01',
      name: 'Almacen Principal',
      createdAt: now,
      updatedAt: now,
    };
    store.warehouses = [warehouse];
    return warehouse;
  }

  private isExcelFile(file: Express.Multer.File): boolean {
    const name = file.originalname?.toLowerCase?.() ?? '';
    const mime = file.mimetype?.toLowerCase?.() ?? '';
    return name.endsWith('.xlsx') || mime.includes('spreadsheet');
  }

  private async parseCsvBuffer(buffer: Buffer): Promise<ParsedRow[]> {
    const rows: ParsedRow[] = [];
    const parser = Readable.from(buffer).pipe(
      csvParser({
        mapHeaders: ({ header }) => header.trim().toLowerCase(),
        skipLines: 0,
        separator: ',',
        strict: false,
      }),
    );

    let rowIndex = 2; // datos empiezan en la fila 2 (fila 1 = encabezados)
    for await (const row of parser) {
      rows.push({ rowNumber: rowIndex, data: row });
      rowIndex += 1;
    }
    return rows;
  }

  private async parseXlsxBuffer(buffer: Buffer): Promise<ParsedRow[]> {
    const rows: ParsedRow[] = [];
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.getWorksheet('Productos') ?? workbook.worksheets[0];
    if (!sheet) return rows;

    const headerValues = sheet.getRow(1).values as Array<string | number | null>;
    const headers: string[] = [];
    headerValues.forEach((value, idx) => {
      if (idx === 0) return;
      const name = this.cellToString(value).trim();
      headers[idx] = name;
    });

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const data: Record<string, string> = {};
      headers.forEach((header, idx) => {
        if (!header) return;
        const cellValue = this.cellToString(row.getCell(idx).value);
        data[header] = cellValue;
      });
      rows.push({ rowNumber, data });
    });

    return rows;
  }

  private isRowEmpty(row: Record<string, string>): boolean {
    return Object.values(row).every((value) => this.cellToString(value).trim() === '');
  }

  private cellToString(value: any): string {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object' && 'text' in value) return String((value as any).text ?? '');
    return String(value);
  }

  private csvEscape(value: unknown): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  private normalizeCsvRow(
    rawRow: Record<string, string>,
    rowIndex: number,
    categoryMap: Map<string, string>,
    defaultCategoryId: string | undefined,
    summary: ImportSummary,
    catalogs: { allowedStatus: ProductStatus[]; allowedUnits: string[]; allowedTaxes: number[] },
    allowStock: boolean,
  ): NormalizedCsvRow | null {
    const getField = (key: string) => rawRow[key] ?? rawRow[key.toLowerCase()] ?? rawRow[key.toUpperCase()];
    const code = (getField('code') ?? getField('codigo') ?? '').trim();
    const name = (getField('name') ?? getField('nombre') ?? '').trim();
    const description = (getField('description') ?? '').trim();
    const categoryCode = (getField('categoryCode') ?? getField('category') ?? getField('categoria') ?? '').trim();
    const barcode = (getField('barcode') ?? '').trim();
    const statusRaw = (getField('status') ?? 'activo').trim().toLowerCase();
    const status = catalogs.allowedStatus.includes(statusRaw as ProductStatus)
      ? (statusRaw as ProductStatus)
      : null;

    const priceValue = this.parseNumber(getField('price') ?? getField('precio') ?? '', 'Precio');
    const cost = this.parseNumber(getField('cost') ?? getField('costo') ?? '', 'Costo', true);
    const tax = this.parseNumber(getField('tax') ?? getField('impuesto') ?? '12', 'Impuesto', true);
    const minStock = this.parseNumber(
      getField('minStock') ?? getField('stockMin') ?? getField('minimo') ?? '',
      'Stock minimo',
      true,
    );
    const stock = allowStock ? this.parseNumber(getField('stock') ?? '', 'Stock', true) : undefined;
    const unitRaw = (getField('unit') ?? getField('unidad') ?? '').trim();
    const unit =
      unitRaw === ''
        ? undefined
        : catalogs.allowedUnits.find((opt) => opt.toLowerCase() === unitRaw.toLowerCase());

    if (!code || !name || priceValue === null || priceValue === undefined || status === null) {
      this.pushError(
        summary,
        rowIndex,
        !code
          ? 'Codigo obligatorio'
          : !name
          ? 'Nombre obligatorio'
          : priceValue === null || priceValue === undefined
          ? 'Precio invalido'
          : 'Estado invalido',
      );
      return null;
    }

    if (priceValue <= 0) {
      this.pushError(summary, rowIndex, 'Precio debe ser mayor que 0');
      return null;
    }

    if (tax !== null && tax !== undefined && !catalogs.allowedTaxes.includes(tax)) {
      this.pushError(summary, rowIndex, 'Impuesto no permitido en catalogo');
      return null;
    }

    if (cost !== null && cost !== undefined && cost < 0) {
      this.pushError(summary, rowIndex, 'Costo no puede ser negativo');
      return null;
    }

    if (allowStock && stock !== null && stock !== undefined && stock < 0) {
      this.pushError(summary, rowIndex, 'Stock no puede ser negativo');
      return null;
    }

    if (minStock !== null && minStock !== undefined && minStock < 0) {
      this.pushError(summary, rowIndex, 'Stock minimo no puede ser negativo');
      return null;
    }

    if (cost !== null && priceValue !== null && cost !== undefined && priceValue !== undefined && cost > priceValue) {
      this.pushError(summary, rowIndex, 'Costo no puede ser mayor que precio');
      return null;
    }

    if (categoryCode && !categoryMap.get(categoryCode.toLowerCase())) {
      this.pushError(summary, rowIndex, 'Categoria no encontrada');
      return null;
    }

    if (unitRaw && !unit) {
      this.pushError(summary, rowIndex, 'Unidad no encontrada en catalogo');
      return null;
    }

    return {
      code,
      name,
      description,
      categoryCode: categoryCode || undefined,
      categoryId: categoryCode ? categoryMap.get(categoryCode.toLowerCase()) : defaultCategoryId,
      barcode: barcode || undefined,
      status,
      price: priceValue ?? 0,
      cost: cost ?? undefined,
      tax: tax ?? undefined,
      unit,
      minStock: minStock ?? undefined,
      stock: allowStock ? stock ?? undefined : undefined,
    };
  }

  private parseNumber(value: string, _label: string, allowEmpty = false): number | null | undefined {
    if (allowEmpty && (value === undefined || value === null || value === '')) return undefined;
    const num = Number(String(value).replace(/,/g, '.'));
    if (Number.isNaN(num)) return null;
    return num;
  }

  private pushError(summary: ImportSummary, row: number, message: string) {
    if (summary.errors.length < 100) summary.errors.push({ row, message });
  }
}

type NormalizedCsvRow = {
  code: string;
  name: string;
  description?: string;
  categoryCode?: string;
  categoryId?: string;
  barcode?: string;
  status: ProductStatus;
  price: number;
  cost?: number;
  tax?: number;
  unit?: string;
  minStock?: number;
  stock?: number;
};

export type ImportSummary = {
  totalRows: number;
  inserted: number;
  updated: number;
  errors: Array<{ row: number; message: string }>;
};

type ParsedRow = {
  rowNumber: number;
  data: Record<string, string>;
};
