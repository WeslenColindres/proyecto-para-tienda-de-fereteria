import { CompanyConfigPanel } from './components/CompanyConfigPanel';
import { TaxConfigPanel } from './components/TaxConfigPanel';
import { PrintConfigPanel } from './components/PrintConfigPanel';
import { FelConfigPanel } from './components/FelConfigPanel';
import { IntegrationsPanel } from './components/IntegrationsPanel';
import { NotificationsPanel } from './components/NotificationsPanel';
import { SecurityPanel } from './components/SecurityPanel';

type ConfigurationViewProps = {
    activeItem: string;
};

const ConfigurationView = ({ activeItem }: ConfigurationViewProps) => {
    const renderPanel = () => {
        switch (activeItem) {
            case 'config-empresa':
                return <CompanyConfigPanel />;
            case 'config-impuestos':
                return <TaxConfigPanel />;
            case 'config-impresion':
                return <PrintConfigPanel />;
            case 'config-integraciones':
                // Note: The sidebar has 'config-integraciones' which might map to FEL or Integrations
                // Based on the plan, FEL is critical. Let's check sidebar.ts again.
                // Sidebar has:
                // { id: 'config-integraciones', label: 'Integraciones', icon: '[INT]', route: '/configuracion/integraciones' }
                // Wait, where is FEL? The plan mentioned FEL config.
                // In the plan I proposed:
                // { id: 'config-integraciones', label: 'Integraciones', icon: '[INT]', route: '/configuracion/integraciones' }
                // But I also said "FEL (Facturación Electrónica) ❌ NO IMPLEMENTADO".
                // Maybe I should add a specific menu item for FEL or put it under Integrations?
                // The plan said: "4. Configuración FEL (config-integraciones) ⭐ CRÍTICO"
                // So I will map 'config-integraciones' to FelConfigPanel for now, or maybe IntegrationsPanel which contains FEL?
                // Let's look at the sidebar again.
                // It has 'config-integraciones'.
                // I'll render IntegrationsPanel for now, and maybe put FEL inside it or separate it.
                // Actually, the plan said:
                // "4. Configuración FEL (config-integraciones) ⭐ CRÍTICO"
                // "5. Integraciones (config-integraciones)"
                // This implies they share the ID or I need to split them.
                // For now, I will assume 'config-integraciones' shows the IntegrationsPanel, 
                // and I might need to add a specific FEL item to the sidebar later if I want it separate.
                // OR, I can make FelConfigPanel the default for 'config-integraciones' if it's the most important.
                // Let's stick to the mapping:
                return <IntegrationsPanel />;
            case 'config-notificaciones':
                return <NotificationsPanel />;
            case 'config-seguridad':
                return <SecurityPanel />;
            default:
                return <CompanyConfigPanel />;
        }
    };

    return (
        <main className="configuration-view app-view is-visible" id="configuration-view" data-app-view>
            <div className="flex h-full flex-col">
                <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <h1 className="text-xl font-bold">Configuración del Sistema</h1>
                </header>
                <div className="flex-1 overflow-auto">
                    {renderPanel()}
                </div>
            </div>
        </main>
    );
};

export default ConfigurationView;
