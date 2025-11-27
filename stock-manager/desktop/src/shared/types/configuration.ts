export interface CompanyConfig {
    id: number;
    nit: string;
    businessName: string;
    tradeName: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    logo?: string;
    taxRegime: string;
    legalRepresentative: string;
    constitutionDate?: string;
}

export interface BranchConfig {
    id: number;
    companyId: number;
    code: string;
    name: string;
    address: string;
    phone: string;
    manager: string;
    isActive: boolean;
}

export interface TaxConfig {
    id: number;
    name: string;
    satCode: string;
    percentage: number;
    type: 'INCLUDED' | 'EXCLUDED';
    isActive: boolean;
}

export interface PaymentMethodConfig {
    id: number;
    name: string;
    code: string;
    requiresReference: boolean;
    isActive: boolean;
}

export interface FelConfig {
    id: number;
    branchId: number;
    certifierProvider: string;
    certifierNit?: string;
    certifierUser?: string;
    authToken: string;
    endpointUrl: string;
    backupUrl?: string;
    environmentType: 'PRODUCCION' | 'PRUEBAS';
    ivaAffiliation: string;
    establishmentCode: number;
    isActive: boolean;
    activationDate?: string;
    expirationDate?: string;
}

export interface DocumentSeriesConfig {
    id: number;
    branchId: number;
    documentType: string;
    series: string;
    startNumber: number;
    currentNumber: number;
    endNumber: number;
    isActive: boolean;
}

export interface PrintConfig {
    paperSize: 'LETTER' | 'TICKET' | 'A4';
    orientation: 'PORTRAIT' | 'LANDSCAPE';
    margins: { top: number; right: number; bottom: number; left: number };
    showLogo: boolean;
    showQr: boolean;
    headerText?: string;
    footerText?: string;
    printers: {
        id: string;
        name: string;
        type: 'THERMAL' | 'LASER';
        isDefault: boolean;
    }[];
}

export interface NotificationConfig {
    stockAlerts: boolean;
    stockThreshold: number;
    expirationAlerts: boolean;
    expirationDays: number;
    paymentAlerts: boolean;
    email: {
        enabled: boolean;
        host: string;
        port: number;
        user: string;
        secure: boolean;
    };
}

export interface SecurityConfig {
    minPasswordLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    sessionTimeoutMinutes: number;
    maxConcurrentSessions: number;
    logRetentionDays: number;
}

export interface ConfigurationState {
    company: CompanyConfig | null;
    branches: BranchConfig[];
    taxes: TaxConfig[];
    paymentMethods: PaymentMethodConfig[];
    fel: FelConfig | null;
    documentSeries: DocumentSeriesConfig[];
    print: PrintConfig;
    notifications: NotificationConfig;
    security: SecurityConfig;
    loading: boolean;
    error: string | null;
}
