import type { AppView, SidebarSection } from '../types/layout';

export const VIEW_BY_MENU: Record<string, AppView> = {
  home: 'dashboard',
  dashboard: 'dashboard',
  'informes-periodo': 'reports',
  'informes-top': 'reports',
  'informes-ganancias': 'reports',
  'informes-rotacion': 'reports',
  'ventas-pdv': 'sales',
  'ventas-facturas': 'sales',
  'ventas-comprobantes': 'sales',
  'ventas-devoluciones': 'sales',
  'productos-catalogo': 'products',
  'productos-categorias': 'products',
  'productos-stock': 'products',
  'proveedores-catalogo': 'suppliers',
  'proveedores-ordenes': 'suppliers',
  'proveedores-cxp': 'suppliers',
  'clientes-catalogo': 'customers',
  'clientes-historial': 'customers',
  'clientes-cxc': 'customers',
  'usuarios-gestion': 'users',
  'usuarios-permisos': 'users',
  'usuarios-auditoria': 'users',
  'config-empresa': 'configuration',
  'config-impuestos': 'configuration',
  'config-impresion': 'configuration',
  'config-integraciones': 'configuration',
  'config-notificaciones': 'configuration',
  'config-seguridad': 'configuration'
};

export const sidebarSections: SidebarSection[] = [
  {
    id: 'principal',
    title: 'Principal',
    items: [
      { id: 'home', label: 'Inicio', icon: '[H]', route: '/inicio' },
      { id: 'dashboard', label: 'Dashboard', icon: '[DB]', route: '/dashboard' }
    ]
  },
  {
    id: 'operativos',
    title: 'Modulos operativos',
    items: [
      {
        id: 'ventas',
        label: 'Ventas',
        icon: '[VT]',
        children: [
          { id: 'ventas-pdv', label: 'Punto de Venta (PDV)', icon: '[PDV]', route: '/ventas/pdv' },
          { id: 'ventas-facturas', label: 'Facturas', icon: '[FAC]', route: '/ventas/facturas' },
          { id: 'ventas-comprobantes', label: 'Comprobantes', icon: '[COM]', route: '/ventas/comprobantes' },
          { id: 'ventas-devoluciones', label: 'Devoluciones', icon: '[DEV]', route: '/ventas/devoluciones' }
        ]
      },
      {
        id: 'productos',
        label: 'Productos',
        icon: '[PRD]',
        badge: '5',
        children: [
          { id: 'productos-catalogo', label: 'Catalogo de Productos', icon: '[CAT]', route: '/productos/catalogo' },
          { id: 'productos-categorias', label: 'Gestion de Categorias', icon: '[TAG]', route: '/productos/categorias' },
          { id: 'productos-stock', label: 'Stock y Almacenes', icon: '[STK]', route: '/productos/stock' }
        ]
      },
      {
        id: 'proveedores',
        label: 'Proveedores',
        icon: '[PROV]',
        children: [
          { id: 'proveedores-catalogo', label: 'Catalogo Proveedores', icon: '[CP]', route: '/proveedores/catalogo' },
          { id: 'proveedores-ordenes', label: 'Ordenes de Compra', icon: '[OC]', route: '/proveedores/ordenes' },
          { id: 'proveedores-cxp', label: 'Cuentas por Pagar', icon: '[CXP]', route: '/proveedores/cxp' }
        ]
      },
      {
        id: 'clientes',
        label: 'Clientes',
        icon: '[CL]',
        children: [
          { id: 'clientes-catalogo', label: 'Catalogo Clientes', icon: '[CC]', route: '/clientes/catalogo' },
          { id: 'clientes-historial', label: 'Historial de Compras', icon: '[HC]', route: '/clientes/historial' },
          { id: 'clientes-cxc', label: 'Cuentas por Cobrar', icon: '[CXC]', route: '/clientes/cxc' }
        ]
      }
    ]
  },
  {
    id: 'analisis',
    title: 'Analisis',
    items: [
      {
        id: 'informes',
        label: 'Informes',
        icon: '[INF]',
        children: [
          { id: 'informes-periodo', label: 'Ventas por periodo', icon: '[VP]', route: '/informes/periodo' },
          { id: 'informes-top', label: 'Productos mas vendidos', icon: '[TOP]', route: '/informes/top' },
          { id: 'informes-ganancias', label: 'Ganancias y perdidas', icon: '[GP]', route: '/informes/ganancias' },
          { id: 'informes-rotacion', label: 'Reporte de rotacion', icon: '[ROT]', route: '/informes/rotacion' }
        ]
      }
    ]
  },
  {
    id: 'administracion',
    title: 'Administracion',
    items: [
      {
        id: 'usuarios',
        label: 'Usuarios y Roles',
        icon: '[USR]',
        children: [
          { id: 'usuarios-gestion', label: 'Gestion de Usuarios', icon: '[GU]', route: '/usuarios' },
          { id: 'usuarios-permisos', label: 'Permisos y Roles', icon: '[PR]', route: '/usuarios/permisos' },
          { id: 'usuarios-auditoria', label: 'Auditoria', icon: '[AUD]', route: '/usuarios/auditoria' }
        ]
      },
      {
        id: 'configuracion',
        label: 'Configuracion',
        icon: '[CFG]',
        children: [
          { id: 'config-empresa', label: 'Datos de la Empresa', icon: '[EMP]', route: '/configuracion/empresa' },
          { id: 'config-impuestos', label: 'Impuestos y Moneda', icon: '[IMP]', route: '/configuracion/impuestos' },
          { id: 'config-impresion', label: 'Configuracion de Impresion', icon: '[IMPRES]', route: '/configuracion/impresion' },
          { id: 'config-integraciones', label: 'Integraciones', icon: '[INT]', route: '/configuracion/integraciones' },
          { id: 'config-notificaciones', label: 'Notificaciones', icon: '[NOTI]', route: '/configuracion/notificaciones' },
          { id: 'config-seguridad', label: 'Seguridad', icon: '[SEC]', route: '/configuracion/seguridad' }
        ]
      }
    ]
  },
  {
    id: 'soporte',
    title: 'Soporte',
    items: [
      { id: 'ayuda', label: 'Ayuda y soporte', icon: '[AY]', route: '/soporte/ayuda' },
      { id: 'version', label: 'Version 2.1.3', icon: '[VER]', route: '/soporte/version' }
    ]
  }
];
