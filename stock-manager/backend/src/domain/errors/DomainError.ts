export class DomainError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class SupplierNotFoundError extends DomainError {
  constructor(id: string) {
    super('SUPPLIER_NOT_FOUND', `Proveedor ${id} no encontrado`, 404);
  }
}

export class DuplicateNITError extends DomainError {
  constructor(nit: string) {
    super('DUPLICATE_NIT', `Ya existe un proveedor con NIT ${nit}`, 409);
  }
}

export class SupplierHasPurchasesError extends DomainError {
  constructor(id: string) {
    super(
      'SUPPLIER_HAS_PURCHASES',
      `No se puede eliminar el proveedor porque tiene compras asociadas`,
      409
    );
  }
}

export class InvalidFileTypeError extends DomainError {
  constructor(allowedTypes: string[]) {
    super(
      'INVALID_FILE_TYPE',
      `Tipo de archivo no permitido. Tipos válidos: ${allowedTypes.join(', ')}`,
      400
    );
  }
}

export class PurchaseOrderNotFoundError extends DomainError {
  constructor(id: string) {
    super('PURCHASE_ORDER_NOT_FOUND', `Orden de compra ${id} no encontrada`, 404);
  }
}

export class InvalidOrderStatusError extends DomainError {
  constructor(currentStatus: string, action: string) {
    super(
      'INVALID_ORDER_STATUS',
      `No se puede ${action} una orden en estado ${currentStatus}`,
      400
    );
  }
}

