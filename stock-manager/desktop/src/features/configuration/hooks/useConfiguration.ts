import { useState, useEffect, useCallback } from 'react';
import type {
    ConfigurationState,
    CompanyConfig,
    FelConfig,
    TaxConfig
} from '@/shared/types/configuration';

// Mock initial data
const MOCK_COMPANY: CompanyConfig = {
    id: 1,
    nit: '1234567-8',
    businessName: 'Ferretería El Constructor S.A.',
    tradeName: 'Ferretería El Constructor',
    address: 'Zona 1, Ciudad de Guatemala',
    phone: '2222-3333',
    email: 'contacto@elconstructor.com',
    taxRegime: 'GENERAL',
    legalRepresentative: 'Juan Pérez'
};

const MOCK_FEL: FelConfig = {
    id: 1,
    branchId: 1,
    certifierProvider: 'INFILE',
    authToken: '****************',
    endpointUrl: 'https://certificador.com/api',
    environmentType: 'PRUEBAS',
    ivaAffiliation: 'GEN',
    establishmentCode: 1,
    isActive: false
};

const MOCK_TAXES: TaxConfig[] = [
    { id: 1, name: 'IVA', satCode: 'IVA', percentage: 12, type: 'INCLUDED', isActive: true }
];

export const useConfiguration = () => {
    const [state, setState] = useState<ConfigurationState>({
        company: null,
        branches: [],
        taxes: [],
        paymentMethods: [],
        fel: null,
        documentSeries: [],
        print: {
            paperSize: 'TICKET',
            orientation: 'PORTRAIT',
            margins: { top: 0, right: 0, bottom: 0, left: 0 },
            showLogo: true,
            showQr: true,
            printers: []
        },
        notifications: {
            stockAlerts: true,
            stockThreshold: 10,
            expirationAlerts: true,
            expirationDays: 30,
            paymentAlerts: true,
            email: {
                enabled: false,
                host: '',
                port: 587,
                user: '',
                secure: true
            }
        },
        security: {
            minPasswordLength: 8,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialChars: false,
            sessionTimeoutMinutes: 30,
            maxConcurrentSessions: 1,
            logRetentionDays: 90
        },
        loading: false,
        error: null
    });

    const loadConfiguration = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            setState(prev => ({
                ...prev,
                company: MOCK_COMPANY,
                taxes: MOCK_TAXES,
                fel: MOCK_FEL,
                loading: false
            }));
        } catch (err) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Error al cargar la configuración'
            }));
        }
    }, []);

    const updateCompany = async (data: Partial<CompanyConfig>) => {
        // Simulate update
        setState(prev => ({
            ...prev,
            company: prev.company ? { ...prev.company, ...data } : null
        }));
    };

    const updateFel = async (data: Partial<FelConfig>) => {
        setState(prev => ({
            ...prev,
            fel: prev.fel ? { ...prev.fel, ...data } : null
        }));
    };

    useEffect(() => {
        loadConfiguration();
    }, [loadConfiguration]);

    return {
        ...state,
        refresh: loadConfiguration,
        updateCompany,
        updateFel
    };
};
