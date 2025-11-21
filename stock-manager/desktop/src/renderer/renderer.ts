type AutoUpdaterPayload = {
  status: string;
  message?: string;
  percent?: number;
  bytesPerSecond?: number;
  total?: number;
  transferred?: number;
};

type AppUpdaterAPI = {
  checkForUpdates: () => Promise<unknown>;
  onStatus: (callback: (data: AutoUpdaterPayload) => void) => (() => void) | void;
};

type StockManagerBridge = {
  apiBaseUrl: string;
};

type ExtendedWindow = Window & {
  appUpdater?: AppUpdaterAPI;
  stockManager?: StockManagerBridge;
};

type ChartView = 'week' | 'month';

type KPICard = {
  id: string;
  title: string;
  amount: number | string;
  subValue: string;
  accent: string;
  icon: string;
  format?: 'currency' | 'text';
};

type WeeklySale = { label: string; amount: number };
type MonthlySale = { label: string; amount: number };
type CategorySlice = { label: string; amount: number; color: string };
type ProductSummary = { name: string; amount: number; units: number };
type ComparisonSeries = { labels: string[]; current: number[]; previous: number[] };
type SaleRow = { datetime: string; customer: string; document: string; total: number };
type StockRow = { product: string; stock: number; min: number };
type MovementRow = { product: string; type: 'in' | 'out'; qty: number; date: string };

type DashboardData = {
  kpis: KPICard[];
  weeklySales: WeeklySale[];
  monthlySales: MonthlySale[];
  categoryBreakdown: CategorySlice[];
  topProducts: ProductSummary[];
  comparison: ComparisonSeries;
  lastSales: SaleRow[];
  lowStock: StockRow[];
  movements: MovementRow[];
};

type SidebarMenuItem = {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: string;
  children?: SidebarMenuItem[];
};

type SidebarSection = {
  id: string;
  title: string;
  items: SidebarMenuItem[];
};

type SidebarMenuMeta = {
  item: SidebarMenuItem;
  trail: string[];
  parentId?: string;
};

type ThemeMode = 'light' | 'dark';
type ColorPalette = 'actual' | 'legacy';

type LayoutState = {
  sidebarExpanded: boolean;
  activeItem: string;
  openSections: string[];
  themeMode: ThemeMode;
  colorPalette: ColorPalette;
};

const extendedWindow = window as ExtendedWindow;
const API_BASE_URL = (extendedWindow.stockManager?.apiBaseUrl ?? 'http://localhost:4000').replace(/\/$/, '');
const DASHBOARD_ENDPOINT = `${API_BASE_URL}/api/dashboard`;
const SIDEBAR_STATE_KEY = 'stock-manager-layout';
const DESKTOP_BREAKPOINT = 1024;
const TABLET_BREAKPOINT = 768;

const sidebarSections: SidebarSection[] = [
  {
    id: 'principal',
    title: 'Principal',
    items: [
      { id: 'home', label: 'Inicio', icon: '🏠', route: '/inicio' },
      { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    ],
  },
  {
    id: 'operativos',
    title: 'Módulos operativos',
    items: [
      {
        id: 'ventas',
        label: 'Ventas',
        icon: '💰',
        children: [
          { id: 'ventas-pdv', label: 'Punto de Venta (PDV)', icon: '📄', route: '/ventas/pdv' },
          { id: 'ventas-facturas', label: 'Facturas & Comprobantes', icon: '📋', route: '/ventas/facturas' },
          { id: 'ventas-devoluciones', label: 'Devoluciones', icon: '🔄', route: '/ventas/devoluciones' },
        ],
      },
      {
        id: 'productos',
        label: 'Productos',
        icon: '📦',
        badge: '5',
        children: [
          { id: 'productos-catalogo', label: 'Catálogo de Productos', icon: '🗂️', route: '/productos/catalogo' },
          { id: 'productos-categorias', label: 'Gestión de Categorías', icon: '📂', route: '/productos/categorias' },
          { id: 'productos-stock', label: 'Stock y Almacenes', icon: '📊', route: '/productos/stock' },
        ],
      },
      {
        id: 'proveedores',
        label: 'Proveedores',
        icon: '🤝',
        children: [
          { id: 'proveedores-catalogo', label: 'Catálogo Proveedores', icon: '🏢', route: '/proveedores/catalogo' },
          { id: 'proveedores-ordenes', label: 'Órdenes de Compra', icon: '📦', route: '/proveedores/ordenes' },
          { id: 'proveedores-cxp', label: 'Cuentas por Pagar', icon: '💳', route: '/proveedores/cxp' },
        ],
      },
      {
        id: 'clientes',
        label: 'Clientes',
        icon: '👥',
        children: [
          { id: 'clientes-catalogo', label: 'Catálogo Clientes', icon: '📇', route: '/clientes/catalogo' },
          { id: 'clientes-historial', label: 'Historial de Compras', icon: '🛒', route: '/clientes/historial' },
          { id: 'clientes-cxc', label: 'Cuentas por Cobrar', icon: '💰', route: '/clientes/cxc' },
        ],
      },
    ],
  },
  {
    id: 'analisis',
    title: 'Análisis',
    items: [
      {
        id: 'informes',
        label: 'Informes',
        icon: '📈',
        children: [
          { id: 'informes-periodo', label: 'Ventas por período', icon: '📊', route: '/informes/periodo' },
          { id: 'informes-top', label: 'Productos más vendidos', icon: '📉', route: '/informes/top' },
          { id: 'informes-ganancias', label: 'Ganancias y pérdidas', icon: '💹', route: '/informes/ganancias' },
          { id: 'informes-rotacion', label: 'Reporte de rotación', icon: '📅', route: '/informes/rotacion' },
        ],
      },
    ],
  },
  {
    id: 'administracion',
    title: 'Administración',
    items: [
      {
        id: 'usuarios',
        label: 'Usuarios y Roles',
        icon: '👤',
        children: [
          { id: 'usuarios-gestion', label: 'Gestión de Usuarios', icon: '🔐', route: '/usuarios' },
          { id: 'usuarios-permisos', label: 'Permisos y Roles', icon: '🔑', route: '/usuarios/permisos' },
          { id: 'usuarios-auditoria', label: 'Auditoría', icon: '📜', route: '/usuarios/auditoria' },
        ],
      },
      {
        id: 'configuracion',
        label: 'Configuración',
        icon: '⚙️',
        children: [
          { id: 'config-empresa', label: 'Datos de la Empresa', icon: '🏢', route: '/configuracion/empresa' },
          { id: 'config-impuestos', label: 'Impuestos y Moneda', icon: '💵', route: '/configuracion/impuestos' },
          { id: 'config-impresion', label: 'Configuración de Impresión', icon: '🖨️', route: '/configuracion/impresion' },
          { id: 'config-integraciones', label: 'Integraciones', icon: '🔌', route: '/configuracion/integraciones' },
          { id: 'config-notificaciones', label: 'Notificaciones', icon: '📧', route: '/configuracion/notificaciones' },
          { id: 'config-seguridad', label: 'Seguridad', icon: '🔐', route: '/configuracion/seguridad' },
        ],
      },
    ],
  },
  {
    id: 'soporte',
    title: 'Soporte',
    items: [
      { id: 'ayuda', label: 'Ayuda y soporte', icon: '💡', route: '/soporte/ayuda' },
      { id: 'version', label: 'Versión 2.1.3', icon: '🔄', route: '/soporte/version' },
    ],
  },
];

let layoutState: LayoutState = loadLayoutState();
const menuMeta = new Map<string, SidebarMenuMeta>();
let isDrawerOpen = false;
let isUserMenuOpen = false;
let isSubmenuModalOpen = false;
let dashboardData: DashboardData | null = null;
const chartState: { chartView: ChartView } = { chartView: 'week' };

const currencyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('es-GT');

function formatCurrency(value: number): string {
  return currencyFormatter.format(value).replace(/\u00a0/g, ' ');
}

document.addEventListener('DOMContentLoaded', () => {
  initializeLayoutShell();
  setupMainChartControls();
  initAutoUpdaterBridge();
  void loadDashboardData();
});

async function loadDashboardData(): Promise<void> {
  setLoadingState(true, 'Cargando datos desde el backend...');
  try {
    const response = await fetch(DASHBOARD_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Backend respondió con estado ${response.status}`);
    }
    dashboardData = (await response.json()) as DashboardData;
    renderDashboard();
    setLoadingState(false);
  } catch (error) {
    console.error('[Dashboard] Error cargando datos', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    setLoadingState(false); // ocultar banner de "cargando"

    // y opcional: mostrar un mensaje de error en otro sitio
    const errorBox = document.getElementById('dashboard-error');
    if (errorBox) {
      errorBox.textContent = `No se pudo cargar el dashboard: ${message}`;
      errorBox.style.display = 'block';
    }
  } // <-- cierra el catch
}


function renderDashboard() {
  if (!dashboardData) {
    return;
  }

  renderKPIs();
  renderMainChart();
  renderCategoryDonut();
  renderTopProducts();
  renderComparisonChart();
  renderTables();
  presetDateFilter();
}

function setLoadingState(isLoading: boolean, message?: string) {
  const banner = document.getElementById('dashboard-loading');
  if (!banner) return;
  if (isLoading) {
    banner.style.display = 'block';
    banner.textContent = message ?? 'Cargando informacion...';
  } else {
    banner.style.display = 'none';
  }
}

function presetDateFilter() {
  const dateInput = document.getElementById('chart-date-filter') as HTMLInputElement | null;
  if (!dateInput || dateInput.value) return;
  const today = new Date();
  dateInput.value = today.toISOString().split('T')[0];
}

function initializeLayoutShell() {
  applyThemePreferences();
  renderSidebarMenu();
  applySidebarState();
  setupSidebarInteractions();
  setupKeyboardShortcuts();
  setupQuickAction();
  setupHeaderActions();
  setupUserMenu();
  setupSubmenuModal();
  window.addEventListener('resize', handleResize);
  handleResize();
  setActiveMenuItem(layoutState.activeItem, false);
}

function applyThemePreferences() {
  document.body.setAttribute('data-theme-mode', layoutState.themeMode);
  document.body.setAttribute('data-theme-palette', layoutState.colorPalette);
  saveLayoutState();
  updateThemeControls();
}

function toggleThemeMode() {
  layoutState.themeMode = layoutState.themeMode === 'light' ? 'dark' : 'light';
  applyThemePreferences();
}

function toggleColorPalette() {
  layoutState.colorPalette = layoutState.colorPalette === 'actual' ? 'legacy' : 'actual';
  applyThemePreferences();
}

function updateThemeControls() {
  const themeBtn = document.getElementById('user-menu-theme');
  if (themeBtn) {
    themeBtn.textContent = layoutState.themeMode === 'light' ? 'Activar modo oscuro' : 'Activar modo claro';
  }
  const paletteBtn = document.getElementById('user-menu-palette');
  if (paletteBtn) {
    paletteBtn.textContent =
      layoutState.colorPalette === 'actual' ? 'Usar paleta anterior' : 'Usar paleta actual';
  }
}

function renderSidebarMenu() {
  const container = document.getElementById('sidebar-menu');
  if (!container) return;
  container.innerHTML = '';
  menuMeta.clear();

  sidebarSections.forEach((section) => {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'sidebar-section';
    const title = document.createElement('div');
    title.className = 'section-title';
    title.textContent = section.title;
    sectionEl.appendChild(title);

    section.items.forEach((item) => {
      const element = buildMenuItemElement(item, [section.title, item.label]);
      sectionEl.appendChild(element);
    });

    container.appendChild(sectionEl);
  });

  updateActiveMenuStyles();
}

function buildMenuItemElement(item: SidebarMenuItem, trail: string[], parentId?: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'menu-item-wrapper';
  wrapper.dataset.wrapperId = item.id;

  const button = document.createElement('button');
  button.className = 'menu-item';
  button.dataset.itemId = item.id;
  button.title = item.label;
  button.setAttribute('data-tooltip', item.label);
  button.innerHTML = `
    <span class="menu-icon">${item.icon}</span>
    <span class="menu-label">${item.label}</span>
  `;

  if (item.badge) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = item.badge;
    button.appendChild(badge);
  }

  if (item.children?.length) {
    button.classList.add('has-children');
    const chevron = document.createElement('span');
    chevron.className = 'chevron';
    chevron.textContent = '▶';
    button.appendChild(chevron);
    button.addEventListener('click', (event) => {
      event.preventDefault();
      handleParentMenuSelection(item);
    });
  } else {
    button.addEventListener('click', () => {
      setActiveMenuItem(item.id);
    });
  }

  wrapper.appendChild(button);
  menuMeta.set(item.id, { item, trail, parentId });

  if (item.children?.length) {
    const subMenu = document.createElement('div');
    subMenu.className = 'submenu';
    item.children.forEach((child) => {
      const childEl = buildMenuItemElement(child, [...trail, child.label], item.id);
      childEl.classList.add('submenu-item');
      subMenu.appendChild(childEl);
    });
    wrapper.appendChild(subMenu);
    if (layoutState.openSections.includes(item.id)) {
      wrapper.classList.add('open');
    }
  }

  return wrapper;
}

function handleParentMenuSelection(item: SidebarMenuItem) {
  if (!item.children?.length) {
    return;
  }
  if (shouldOpenSubmenuInModal()) {
    openSubmenuModal(item);
    return;
  }
  toggleMenuSection(item.id);
}

function toggleMenuSection(itemId: string) {
  const wrapper = document.querySelector<HTMLElement>(`.menu-item-wrapper[data-wrapper-id="${itemId}"]`);
  if (!wrapper) {
    return;
  }
  const isOpen = wrapper.classList.toggle('open');
  layoutState.openSections = layoutState.openSections.filter((id) => id !== itemId);
  if (isOpen) {
    layoutState.openSections.push(itemId);
  }
  saveLayoutState();
}

function applySidebarState() {
  const sidebar = document.getElementById('app-sidebar');
  if (!sidebar) return;
  const isMobile = window.innerWidth < TABLET_BREAKPOINT;
  const isTablet = !isMobile && window.innerWidth < DESKTOP_BREAKPOINT;
  const collapseOnDesktop = window.innerWidth >= DESKTOP_BREAKPOINT && !layoutState.sidebarExpanded;
  const shouldCollapse = !isMobile && (isTablet || collapseOnDesktop);

  sidebar.classList.toggle('collapsed', shouldCollapse);
  document.body.classList.toggle('sidebar-collapsed', shouldCollapse);
  document.body.classList.toggle('sidebar-tablet', isTablet);
  document.body.classList.toggle('sidebar-mobile', isMobile);
}

function handleResize() {
  if (window.innerWidth >= DESKTOP_BREAKPOINT && isDrawerOpen) {
    setDrawer(false);
  }
  applySidebarState();
  if (!shouldOpenSubmenuInModal() && isSubmenuModalOpen) {
    closeSubmenuModal();
  }
}

function setupSidebarInteractions() {
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => toggleSidebar());
  document.getElementById('sidebar-close')?.addEventListener('click', () => setDrawer(false));
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => setDrawer(false));
}

function toggleSidebar() {
  if (window.innerWidth < DESKTOP_BREAKPOINT) {
    setDrawer(!isDrawerOpen);
    return;
  }
  layoutState.sidebarExpanded = !layoutState.sidebarExpanded;
  applySidebarState();
  saveLayoutState();
}

function setDrawer(open: boolean) {
  isDrawerOpen = open;
  document.getElementById('app-sidebar')?.classList.toggle('drawer-open', open);
  document.getElementById('sidebar-overlay')?.classList.toggle('visible', open);
  document.body.classList.toggle('sidebar-drawer-active', open);
}

function setupSubmenuModal() {
  const modal = document.getElementById('sidebar-modal');
  const closeBtn = document.getElementById('sidebar-modal-close');
  if (!modal || !closeBtn) {
    return;
  }

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeSubmenuModal();
    }
  });

  closeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    closeSubmenuModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isSubmenuModalOpen) {
      closeSubmenuModal();
    }
  });
}

function shouldOpenSubmenuInModal(): boolean {
  if (window.innerWidth < DESKTOP_BREAKPOINT) {
    return true;
  }
  return !layoutState.sidebarExpanded;
}

function openSubmenuModal(item: SidebarMenuItem) {
  if (!item.children?.length) {
    return;
  }
  const modal = document.getElementById('sidebar-modal');
  const title = document.getElementById('sidebar-modal-title');
  const body = document.getElementById('sidebar-modal-body');
  if (!modal || !title || !body) {
    return;
  }
  if (isSubmenuModalOpen) {
    closeSubmenuModal();
  }
  body.innerHTML = '';

  item.children.forEach((child) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'modal-menu-item';
    option.innerHTML = `
      <span class="menu-icon">${child.icon}</span>
      <div class="modal-menu-label">
        <strong>${child.label}</strong>
        <small>${child.route ?? 'Acceso directo'}</small>
      </div>
      <span class="chevron">→</span>
    `;
    option.addEventListener('click', () => {
      setActiveMenuItem(child.id);
      closeSubmenuModal();
    });
    body.appendChild(option);
  });

  title.textContent = item.label;
  modal.classList.add('visible');
  document.body.classList.add('submenu-modal-open');
  isSubmenuModalOpen = true;
}

function closeSubmenuModal() {
  if (!isSubmenuModalOpen) {
    return;
  }
  const modal = document.getElementById('sidebar-modal');
  const body = document.getElementById('sidebar-modal-body');
  modal?.classList.remove('visible');
  if (body) {
    body.innerHTML = '';
  }
  document.body.classList.remove('submenu-modal-open');
  isSubmenuModalOpen = false;
}

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (event) => {
    if (!event.ctrlKey || event.shiftKey) {
      return;
    }
    switch (event.key) {
      case '1':
        event.preventDefault();
        setActiveMenuItem('dashboard');
        break;
      case '2':
        event.preventDefault();
        setActiveMenuItem('ventas-pdv');
        break;
      case '3':
        event.preventDefault();
        setActiveMenuItem('productos-catalogo');
        break;
      case 'm':
      case 'M':
        event.preventDefault();
        toggleSidebar();
        break;
      default:
        break;
    }
  });
}

function setupQuickAction() {
  document.getElementById('quick-action')?.addEventListener('click', () => logAction('Nueva venta rápida'));
}

function setupHeaderActions() {
  document.getElementById('header-notifications')?.addEventListener('click', () => logAction('Ver notificaciones'));
}

function setupUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  const trigger = document.getElementById('user-menu-trigger');
  const chevron = document.getElementById('user-menu-chevron');
  if (!dropdown || !trigger || !chevron) {
    return;
  }

  const toggleMenu = () => {
    isUserMenuOpen = !isUserMenuOpen;
    dropdown.classList.toggle('open', isUserMenuOpen);
    trigger.setAttribute('aria-expanded', String(isUserMenuOpen));
  };

  [trigger, chevron].forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleMenu();
    });
  });

  document.addEventListener('click', (event) => {
    if (!isUserMenuOpen) {
      return;
    }
    if (!dropdown.contains(event.target as Node)) {
      closeUserMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeUserMenu();
    }
  });

  document.getElementById('user-menu-theme')?.addEventListener('click', () => {
    closeUserMenu();
    toggleThemeMode();
  });

  document.getElementById('user-menu-palette')?.addEventListener('click', () => {
    closeUserMenu();
    toggleColorPalette();
  });

  document.getElementById('btn-check-update')?.addEventListener('click', () => {
    closeUserMenu();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-user-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.userAction ?? 'accion';
      handleUserMenuAction(action);
      closeUserMenu();
    });
  });

  updateThemeControls();
}

function closeUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  const trigger = document.getElementById('user-menu-trigger');
  if (!dropdown || !trigger) return;
  isUserMenuOpen = false;
  dropdown.classList.remove('open');
  trigger.setAttribute('aria-expanded', 'false');
}

function handleUserMenuAction(action: string) {
  if (action === 'logout') {
    const confirmed = confirm('¿Está seguro que desea cerrar sesión?');
    if (confirmed) {
      logAction('Cerrar sesión confirmada');
    }
    return;
  }
  logAction(`Acción de usuario: ${action}`);
}

function setActiveMenuItem(itemId: string, persist = true) {
  const meta = menuMeta.get(itemId) ?? menuMeta.get('dashboard');
  if (!meta) {
    return;
  }
  ensureParentsOpen(meta.parentId);
  layoutState.activeItem = meta.item.id;
  updateActiveMenuStyles();
  updateViewTitle(meta.item.label);
  updateBreadcrumbs(meta.trail);
  if (persist) {
    saveLayoutState();
  }
  if (isSubmenuModalOpen) {
    closeSubmenuModal();
  }
  if (window.innerWidth < DESKTOP_BREAKPOINT) {
    setDrawer(false);
  }
}

function ensureParentsOpen(parentId?: string) {
  if (!parentId) return;
  if (!layoutState.openSections.includes(parentId)) {
    layoutState.openSections.push(parentId);
  }
  document.querySelector<HTMLElement>(`.menu-item-wrapper[data-wrapper-id="${parentId}"]`)?.classList.add('open');
  const parentMeta = menuMeta.get(parentId);
  ensureParentsOpen(parentMeta?.parentId);
}

function updateActiveMenuStyles() {
  document.querySelectorAll('.menu-item.active').forEach((item) => item.classList.remove('active'));
  document.querySelector<HTMLButtonElement>(`.menu-item[data-item-id="${layoutState.activeItem}"]`)?.classList.add('active');
}

function updateViewTitle(title: string) {
  const label = document.getElementById('app-view-title');
  if (label) {
    label.textContent = title;
  }
}

function updateBreadcrumbs(trail: string[]) {
  const crumbs = document.getElementById('breadcrumbs');
  if (crumbs) {
    crumbs.textContent = trail.join(' / ');
  }
}

function loadLayoutState(): LayoutState {
  const defaults: LayoutState = {
    sidebarExpanded: true,
    activeItem: 'dashboard',
    openSections: ['ventas', 'productos'],
    themeMode: 'light',
    colorPalette: 'actual',
  };

  try {
    const raw = localStorage.getItem(SIDEBAR_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LayoutState>;
      return { ...defaults, ...parsed };
    }
  } catch (error) {
    console.warn('No se pudo cargar el estado del layout', error);
  }

  return defaults;
}

function saveLayoutState() {
  try {
    localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(layoutState));
  } catch (error) {
    console.warn('No se pudo guardar el estado del layout', error);
  }
}

function setupMainChartControls() {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-chart-view]');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      chartState.chartView = (button.dataset.chartView as ChartView) ?? 'week';
      buttons.forEach((btn) => btn.classList.toggle('active', btn === button));
      renderMainChart();
    });
  });
}

function renderMainChart() {
  const canvas = document.getElementById('main-chart-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  if (!dashboardData) {
    clearCanvas(canvas);
    return;
  }

  if (chartState.chartView === 'week') {
    drawWeeklyBarChart(canvas, dashboardData.weeklySales);
  } else {
    drawMonthlyLineChart(canvas, dashboardData.monthlySales);
  }
}

function renderKPIs() {
  const container = document.getElementById('kpi-grid');
  if (!container || !dashboardData) return;
  container.innerHTML = '';

  dashboardData.kpis.forEach((kpi) => {
    const card = document.createElement('article');
    card.className = 'kpi-card fade-in';
    card.style.setProperty('--accent', kpi.accent);
    const valueText =
      typeof kpi.amount === 'number' && kpi.format !== 'text' ? formatCurrency(kpi.amount) : String(kpi.amount);

    card.innerHTML = `
      <div class="kpi-icon">${kpi.icon}</div>
      <div class="kpi-title">${kpi.title}</div>
      <div class="kpi-value">${valueText}</div>
      <div class="kpi-subvalue">${kpi.subValue}</div>
    `;
    card.addEventListener('click', () => logAction(`Abrir reporte: ${kpi.id}`));
    container.appendChild(card);
  });
}

function renderCategoryDonut() {
  const donut = document.getElementById('category-donut');
  const canvas = document.getElementById('category-donut-canvas') as HTMLCanvasElement | null;
  const legend = document.getElementById('category-legend');
  if (!donut || !canvas || !legend) return;

  if (!dashboardData) {
    donut.setAttribute('data-total', 'Q 0');
    legend.innerHTML = '<p style="color: var(--text-muted);">Sin datos</p>';
    clearCanvas(canvas);
    return;
  }

  const total = dashboardData.categoryBreakdown.reduce((sum, slice) => sum + slice.amount, 0);
  donut.setAttribute('data-total', formatCurrency(total));
  drawDonutChart(canvas, dashboardData.categoryBreakdown, total);

  legend.innerHTML = '';
  dashboardData.categoryBreakdown.forEach((slice) => {
    const percent = Math.round((slice.amount / total) * 100);
    const item = document.createElement('div');
    item.className = 'legend-item fade-in';
    item.innerHTML = `
      <span style="display:flex; align-items:center; gap:8px;">
        <span class="legend-pill" style="background:${slice.color}"></span>
        ${slice.label}
      </span>
      <strong>${percent}%</strong>
    `;
    legend.appendChild(item);
  });
}

function renderTopProducts() {
  const container = document.getElementById('top-products');
  if (!container) return;

  if (!dashboardData) {
    container.innerHTML = '<p style="color: var(--text-muted);">Sin datos</p>';
    return;
  }

  container.innerHTML = '';
  const maxAmount = Math.max(...dashboardData.topProducts.map((product) => product.amount));

  dashboardData.topProducts.forEach((product) => {
    const row = document.createElement('div');
    row.className = 'product-row fade-in';
    row.innerHTML = `
      <header>
        <span>${product.name}</span>
        <span>${formatCurrency(product.amount)}</span>
      </header>
      <div class="product-bar">
        <span style="width:${(product.amount / maxAmount) * 100}%"></span>
      </div>
      <small style="color: var(--text-muted);">${product.units} unidades</small>
    `;
    row.addEventListener('click', () => logAction(`Detalle de producto: ${product.name}`));
    container.appendChild(row);
  });
}

function renderComparisonChart() {
  const canvas = document.getElementById('comparison-chart-canvas') as HTMLCanvasElement | null;
  const container = document.getElementById('comparison-chart');
  if (!canvas || !container) {
    return;
  }

  if (!dashboardData) {
    clearCanvas(canvas);
    container.setAttribute('data-empty', 'true');
    return;
  }

  container.removeAttribute('data-empty');
  drawComparisonChart(canvas, dashboardData.comparison);
}

function drawComparisonChart(canvas: HTMLCanvasElement, data: ComparisonSeries) {
  const ctxConfig = prepareCanvas(canvas);
  if (!ctxConfig) {
    return;
  }

  const { ctx, width, height } = ctxConfig;
  const padding = 40;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  const maxValue = Math.max(...data.current, ...data.previous) * 1.1;
  const step = data.labels.length > 1 ? chartWidth / (data.labels.length - 1) : chartWidth;

  const toPoints = (values: number[]) =>
    values.map((value, idx) => {
      const x = padding + idx * step;
      const y = height - padding - (value / maxValue) * chartHeight;
      return { x, y, value };
    });

  const currentPoints = toPoints(data.current);
  const previousPoints = toPoints(data.previous);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradient.addColorStop(0, 'rgba(44, 62, 80, 0.45)');
  gradient.addColorStop(1, 'rgba(44, 62, 80, 0.05)');

  ctx.beginPath();
  currentPoints.forEach((point, idx) => {
    if (idx === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.lineTo(currentPoints[currentPoints.length - 1].x, height - padding);
  ctx.lineTo(currentPoints[0].x, height - padding);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = '#95a5a6';
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  previousPoints.forEach((point, idx) => {
    if (idx === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 4;
  ctx.beginPath();
  currentPoints.forEach((point, idx) => {
    if (idx === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.stroke();

  ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
  ctx.font = '12px Inter, sans-serif';
  ctx.textAlign = 'center';
  data.labels.forEach((label, idx) => {
    const x = padding + idx * step;
    ctx.fillText(label, x, height - padding + 20);
  });
}

function drawWeeklyBarChart(canvas: HTMLCanvasElement, data: WeeklySale[]) {
  const ctxConfig = prepareCanvas(canvas);
  if (!ctxConfig) {
    return;
  }

  const { ctx, width, height } = ctxConfig;
  const padding = 32;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  const maxValue = Math.max(...data.map((item) => item.amount));
  const step = chartWidth / data.length;
  const barWidth = step * 0.5;

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  data.forEach((item, index) => {
    const barHeight = (item.amount / maxValue) * chartHeight;
    const x = padding + index * step + (step - barWidth) / 2;
    const y = height - padding - barHeight;
    const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
    gradient.addColorStop(1, 'rgba(14, 165, 233, 0.2)');
    ctx.fillStyle = gradient;
    drawRoundedRect(ctx, x, y, barWidth, barHeight, 6);
    ctx.fillStyle = 'rgba(203, 213, 225, 0.85)';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.label, x + barWidth / 2, height - padding + 16);
    ctx.fillText(formatCurrency(item.amount), x + barWidth / 2, y - 6);
  });
}

function drawMonthlyLineChart(canvas: HTMLCanvasElement, data: MonthlySale[]) {
  const ctxConfig = prepareCanvas(canvas);
  if (!ctxConfig) {
    return;
  }

  const { ctx, width, height } = ctxConfig;
  const padding = 32;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  const maxValue = Math.max(...data.map((item) => item.amount)) * 1.1;
  const step = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;
  const points = data.map((item, index) => {
    const x = padding + index * step;
    const y = height - padding - (item.amount / maxValue) * chartHeight;
    return { x, y, value: item.amount, label: item.label };
  });

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradient.addColorStop(0, 'rgba(56, 189, 248, 0.3)');
  gradient.addColorStop(1, 'rgba(14, 165, 233, 0.05)');

  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.lineTo(points[points.length - 1].x, height - padding);
  ctx.lineTo(points[0].x, height - padding);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(203, 213, 225, 0.85)';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(point.label, point.x, height - padding + 18);
    ctx.fillText(formatCurrency(point.value), point.x, point.y - 8);
    ctx.fillStyle = '#38bdf8';
  });
}

function renderTables() {
  renderSalesTable();
  renderStockTable();
  renderMovementsTable();
  setupTableInteractions();
  setupLinkButtons();
}

function renderSalesTable() {
  const table = document.getElementById('table-sales');
  if (!table) {
    return;
  }

  if (!dashboardData) {
    table.innerHTML = '<tbody><tr><td colspan="4">Sin datos</td></tr></tbody>';
    return;
  }

  table.innerHTML = `
    <thead>
      <tr>
        <th>Fecha / Hora</th>
        <th>Cliente</th>
        <th>Doc</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${dashboardData.lastSales
        .map(
          (sale) => `
          <tr data-detail="venta-${sale.document}">
            <td>${sale.datetime}</td>
            <td>${sale.customer}</td>
            <td>${sale.document}</td>
            <td class="text-right">${formatCurrency(sale.total)}</td>
          </tr>
        `,
        )
        .join('')}
    </tbody>
  `;
}

function renderStockTable() {
  const table = document.getElementById('table-stock');
  if (!table) {
    return;
  }

  if (!dashboardData) {
    table.innerHTML = '<tbody><tr><td colspan="3">Sin datos</td></tr></tbody>';
    return;
  }

  table.innerHTML = `
    <thead>
      <tr>
        <th>Producto</th>
        <th>Stock</th>
        <th>M?nimo</th>
      </tr>
    </thead>
    <tbody>
      ${dashboardData.lowStock
        .map((item) => {
          const isDanger = item.stock <= item.min;
          const isWarning = !isDanger && item.stock <= item.min * 1.5;
          const textClass = isDanger ? 'text-danger' : isWarning ? 'text-warning' : '';
          return `
          <tr data-detail="stock-${item.product}">
            <td>${item.product}</td>
            <td class="${textClass}">${numberFormatter.format(item.stock)}</td>
            <td>${numberFormatter.format(item.min)}</td>
          </tr>
        `;
        })
        .join('')}
    </tbody>
  `;
}

function renderMovementsTable() {
  const table = document.getElementById('table-movements');
  if (!table) {
    return;
  }

  if (!dashboardData) {
    table.innerHTML = '<tbody><tr><td colspan="4">Sin datos</td></tr></tbody>';
    return;
  }

  table.innerHTML = `
    <thead>
      <tr>
        <th>Producto</th>
        <th>Tipo</th>
        <th>Cant.</th>
        <th>Fecha</th>
      </tr>
    </thead>
    <tbody>
      ${dashboardData.movements
        .map((movement) => {
          const typeLabel = movement.type === 'in' ? 'Entrada' : 'Salida';
          const icon = movement.type === 'in' ? '??' : '??';
          const pillClass = movement.type === 'in' ? 'status-pill up' : 'status-pill down';
          return `
          <tr data-detail="mov-${movement.product}-${movement.date}">
            <td>${movement.product}</td>
            <td><span class="${pillClass}">${icon} ${typeLabel}</span></td>
            <td>${numberFormatter.format(movement.qty)}</td>
            <td>${movement.date}</td>
          </tr>
        `;
        })
        .join('')}
    </tbody>
  `;
}

function setupTableInteractions() {
  document.querySelectorAll<HTMLTableRowElement>('[data-detail]').forEach((row) => {
    row.addEventListener('click', () => {
      const detail = row.dataset.detail ?? 'detalle';
      logAction(`Abrir detalle: ${detail}`);
    });
  });
}

function setupLinkButtons() {
  document.querySelectorAll<HTMLButtonElement>('button.link-button').forEach((button) => {
    button.addEventListener('click', () => {
      const section = button.dataset.action ?? 'secci?n';
      logAction(`Ver todo ${section}`);
    });
  });
}

type CanvasContextConfig = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
};

function clearCanvas(canvas: HTMLCanvasElement) {
  const ctxConfig = prepareCanvas(canvas);
  if (!ctxConfig) {
    return;
  }

  const { ctx, width, height } = ctxConfig;
  ctx.clearRect(0, 0, width, height);
}

function prepareCanvas(canvas: HTMLCanvasElement): CanvasContextConfig | null {
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function drawDonutChart(canvas: HTMLCanvasElement, slices: CategorySlice[], total: number) {
  const ctxConfig = prepareCanvas(canvas);
  if (!ctxConfig) {
    return;
  }

  const { ctx, width, height } = ctxConfig;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 6;
  const lineWidth = radius * 0.45;
  let startAngle = -Math.PI / 2;

  slices.forEach((slice) => {
    const sliceAngle = (slice.amount / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.strokeStyle = slice.color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.arc(centerX, centerY, radius - lineWidth / 2, startAngle, startAngle + sliceAngle);
    ctx.stroke();
    startAngle += sliceAngle;
  });
}

function logAction(message: string) {
  console.log(`[Dashboard] ${message}`);
}

function initAutoUpdaterBridge() {
  const appUpdater = extendedWindow.appUpdater;
  const btnCheckUpdate = document.getElementById('btn-check-update') as HTMLButtonElement | null;
  const logElement = document.getElementById('update-log');
  if (!logElement) {
    return;
  }

  const appendLogLine = (text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    logElement.textContent += `[${timestamp}] ${text}
`;
    logElement.scrollTop = logElement.scrollHeight;
  };

  if (!appUpdater) {
    appendLogLine('La API de appUpdater no est? disponible (revisa preload.ts).');
    return;
  }

  appUpdater.onStatus((data) => {
    if (data?.message) {
      appendLogLine(`${data.status}: ${data.message}`);
    } else {
      appendLogLine(`${data?.status ?? 'estado-desconocido'} recibido.`);
    }
  });

  btnCheckUpdate?.addEventListener('click', async () => {
    appendLogLine('Lanzando verificaci?n manual de actualizaciones...');
    try {
      await appUpdater.checkForUpdates();
    } catch (error) {
      const err = error as Error;
      appendLogLine(`Error al pedir actualizaci?n: ${err?.message ?? String(error)}`);
    }
  });
}
