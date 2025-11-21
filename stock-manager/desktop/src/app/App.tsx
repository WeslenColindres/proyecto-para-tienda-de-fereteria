import { useMemo, useState, useEffect, useCallback } from 'react';
import DashboardView from '@/features/dashboard/DashboardView';
import ProductsView from '@/features/products/ProductsView';
import SuppliersView from '@/features/suppliers/SuppliersView';
import CustomersView from '@/features/customers/CustomersView';
import SalesView from '@/features/sales/SalesView';
import ReportsView from '@/features/reports/ReportsView';
import UsersView from '@/features/users/UsersView';
import { useDashboardData } from '@/shared/hooks/useDashboardData';
import { useLayoutState } from '@/shared/hooks/useLayoutState';
import { useRouteSync } from '@/shared/hooks/useRouteSync';
import { useViewport } from '@/shared/hooks/useViewport';
import type { ChartView } from '@/shared/types/dashboard';
import type { AppView } from '@/shared/types/layout';
import type { AppUpdaterAPI } from '@/shared/types/bridge';
import { sidebarSections, VIEW_BY_MENU } from '@/shared/data/sidebar';
import { buildMenuIndex } from '@/shared/utils/menu';
import AppHeader from '@/ui/organisms/AppHeader/AppHeader';
import AppSidebar from '@/ui/organisms/AppSidebar/AppSidebar';

const App = () => {
  const { layout, setLayout } = useLayoutState();
  const viewport = useViewport(layout.sidebarExpanded);
  const { data: dashboardData, loading: isLoadingDashboard, error: dashboardError } = useDashboardData();
  const [chartView, setChartView] = useState<ChartView>('week');
  const [updateLog, setUpdateLog] = useState<string[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const menuIndex = useMemo(() => buildMenuIndex(sidebarSections), []);
  const setActiveItem = useCallback((id: string) => setLayout((prev) => ({ ...prev, activeItem: id })), [setLayout]);
  useRouteSync(layout.activeItem, setActiveItem, menuIndex);

  useEffect(() => {
    const appUpdater: AppUpdaterAPI | undefined = window.appUpdater;
    if (!appUpdater) {
      setUpdateLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] API updater no disponible`]);
      return;
    }

    const unsubscribe = appUpdater.onStatus((data) => {
      const text = data?.message ? `${data.status}: ${data.message}` : data?.status ?? 'estado-desconocido';
      setUpdateLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const activeMeta = menuIndex.metaById.get(layout.activeItem);
  const breadcrumbs = activeMeta ? activeMeta.trail.join(' / ') : 'Inicio';
  const activeView: AppView = VIEW_BY_MENU[layout.activeItem] ?? 'dashboard';
  const viewTitle = activeMeta?.item.label ?? 'Dashboard';

  const toggleSidebar = () => {
    if (viewport.isMobile) {
      setDrawerOpen((prev) => !prev);
      return;
    }
    setLayout((prev) => ({ ...prev, sidebarExpanded: !prev.sidebarExpanded }));
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleMenuSelect = (itemId: string, parentId?: string) => {
    if (parentId) {
      setLayout((prev) => {
        const openSections = prev.openSections.includes(parentId) ? prev.openSections : [...prev.openSections, parentId];
        return { ...prev, openSections, activeItem: itemId };
      });
      return;
    }
    setLayout((prev) => ({ ...prev, activeItem: itemId }));
    closeDrawer();
  };

  const toggleSection = (sectionId: string) => {
    setLayout((prev) => {
      const isOpen = prev.openSections.includes(sectionId);
      const openSections = isOpen ? prev.openSections.filter((id) => id !== sectionId) : [...prev.openSections, sectionId];
      return { ...prev, openSections };
    });
  };

  return (
    <div className="app-shell">
      <AppHeader
        viewTitle={viewTitle}
        onToggleSidebar={toggleSidebar}
        onShowNotifications={() => setUpdateLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Notificaciones`])}
        onToggleTheme={() => setLayout((prev) => ({ ...prev, themeMode: prev.themeMode === 'light' ? 'dark' : 'light' }))}
        onTogglePalette={() => setLayout((prev) => ({ ...prev, colorPalette: prev.colorPalette === 'actual' ? 'legacy' : 'actual' }))}
      />

      <div className="app-body">
        <AppSidebar
          sections={sidebarSections}
          activeItem={layout.activeItem}
          openSections={layout.openSections}
          expanded={!viewport.isMobile && layout.sidebarExpanded}
          isDrawerOpen={isDrawerOpen}
          onToggleSection={toggleSection}
          onSelect={handleMenuSelect}
          onCloseDrawer={closeDrawer}
        />

        <div className="app-content">
          <div className="breadcrumbs">{breadcrumbs}</div>
          {activeView === 'dashboard' && (
            <DashboardView
              data={dashboardData}
              loading={isLoadingDashboard}
              error={dashboardError}
              chartView={chartView}
              onChartViewChange={setChartView}
              updateLog={updateLog}
              onCheckUpdates={() => window.appUpdater?.checkForUpdates()?.catch(console.error)}
            />
          )}
          {activeView === 'products' && <ProductsView />}
          {activeView === 'suppliers' && <SuppliersView />}
          {activeView === 'customers' && <CustomersView />}
          {activeView === 'users' && <UsersView activeItem={layout.activeItem} />}
          {activeView === 'reports' && <ReportsView activeItem={layout.activeItem} />}
          {activeView === 'sales' && <SalesView activeItem={layout.activeItem} />}
        </div>
      </div>

      <div className={`sidebar-overlay ${isDrawerOpen ? 'visible' : ''}`} onClick={closeDrawer} />
      <button className="quick-action" title="Nueva venta rapida" onClick={() => alert('Nueva venta rapida')}>
        +
      </button>
    </div>
  );
};

export default App;
