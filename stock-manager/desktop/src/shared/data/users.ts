import type { PermissionNode, RoleItem, RolePermissions, UserItem, UserStatus } from '../types/users';

export const USER_STATUSES: { id: UserStatus; label: string }[] = [
  { id: 'activo', label: 'Activo' },
  { id: 'inactivo', label: 'Inactivo' },
  { id: 'bloqueado', label: 'Bloqueado' }
];

export const USERS: UserItem[] = [
  {
    id: 'u1',
    username: 'juan.perez',
    fullName: 'Juan Perez Garcia',
    roleId: 'supervisor',
    status: 'activo',
    email: 'juan.perez@corp.com',
    phone: '5555-1234',
    branch: 'Central',
    lastAccess: 'Hace 2 horas'
  },
  {
    id: 'u2',
    username: 'ana.garcia',
    fullName: 'Ana Garcia',
    roleId: 'vendedor',
    status: 'inactivo',
    email: 'ana.garcia@corp.com',
    phone: '5555-4321',
    branch: 'Sucursal 1',
    lastAccess: '22/11/2024 08:30'
  },
  {
    id: 'u3',
    username: 'luis.martinez',
    fullName: 'Luis Martinez',
    roleId: 'admin',
    status: 'activo',
    email: 'luis.martinez@corp.com',
    phone: '5555-2211',
    branch: 'Central',
    lastAccess: 'Hace 10 minutos'
  },
  {
    id: 'u4',
    username: 'carlos.hernandez',
    fullName: 'Carlos Hernandez',
    roleId: 'vendedor',
    status: 'bloqueado',
    email: 'carlos.h@corp.com',
    phone: '5555-9911',
    branch: 'Sucursal 2',
    lastAccess: 'Nunca'
  },
  {
    id: 'u5',
    username: 'mariana.ramos',
    fullName: 'Mariana Ramos',
    roleId: 'supervisor',
    status: 'activo',
    email: 'mariana.r@corp.com',
    phone: '5555-7744',
    branch: 'Sucursal 1',
    lastAccess: 'Hoy 09:10'
  }
];

export const ROLES: RoleItem[] = [
  { id: 'admin', name: 'Administrador', users: 3, description: 'Acceso total', createdAt: '01/01/2024' },
  { id: 'supervisor', name: 'Supervisor', users: 8, description: 'Ventas, reportes y consultas', createdAt: '15/03/2024' },
  { id: 'vendedor', name: 'Vendedor', users: 14, description: 'Ventas y stock basico', createdAt: '20/05/2024' }
];

const permVentas: PermissionNode[] = [
  {
    id: 'ventas',
    label: 'Modulo Ventas',
    state: 'checked',
    children: [
      { id: 'ventas-ver', label: 'Ver ventas', state: 'checked' },
      { id: 'ventas-crear', label: 'Crear ventas', state: 'checked' },
      { id: 'ventas-modificar', label: 'Modificar ventas', state: 'partial', note: 'Precio y descuentos requieren auth' },
      { id: 'ventas-anular', label: 'Anular ventas', state: 'locked', note: 'Requiere supervisor' },
      { id: 'ventas-reimprimir', label: 'Reimprimir tickets', state: 'checked' }
    ]
  }
];

const permProductos: PermissionNode[] = [
  {
    id: 'productos',
    label: 'Modulo Productos',
    state: 'checked',
    children: [
      { id: 'productos-ver', label: 'Ver productos', state: 'checked' },
      { id: 'productos-crear', label: 'Crear producto', state: 'partial' },
      { id: 'productos-modificar', label: 'Modificar producto', state: 'partial' },
      { id: 'productos-eliminar', label: 'Eliminar producto', state: 'unchecked' }
    ]
  }
];

const permInformes: PermissionNode[] = [
  {
    id: 'informes',
    label: 'Modulo Informes',
    state: 'partial',
    children: [
      { id: 'informes-ver', label: 'Ver informes', state: 'checked' },
      { id: 'informes-exportar', label: 'Exportar datos', state: 'checked' },
      { id: 'informes-programar', label: 'Programar envios', state: 'partial', note: 'Solo supervisor y admin' }
    ]
  }
];

const permUsuarios: PermissionNode[] = [
  {
    id: 'usuarios',
    label: 'Modulo Usuarios',
    state: 'partial',
    children: [
      { id: 'usuarios-ver', label: 'Ver usuarios', state: 'checked' },
      { id: 'usuarios-crear', label: 'Crear usuario', state: 'partial' },
      { id: 'usuarios-editar', label: 'Modificar basico', state: 'partial' },
      { id: 'usuarios-permisos', label: 'Asignar permisos', state: 'locked', note: 'Admin solamente' }
    ]
  }
];

const permSeguridad: PermissionNode[] = [
  {
    id: 'seguridad',
    label: 'Seguridad y auditoria',
    state: 'partial',
    children: [
      { id: 'seguridad-reporte', label: 'Reporte auditoria', state: 'checked' },
      { id: 'seguridad-session', label: 'Forzar cierre de sesion', state: 'locked' },
      { id: 'seguridad-politicas', label: 'Configurar politicas', state: 'locked' }
    ]
  }
];

export const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    { id: 'global', label: 'Acceso total', state: 'checked', children: [] },
    ...permVentas.map((p) => ({ ...p, state: 'checked', children: p.children?.map((c) => ({ ...c, state: 'checked' })) })),
    ...permProductos.map((p) => ({ ...p, state: 'checked', children: p.children?.map((c) => ({ ...c, state: 'checked' })) })),
    ...permInformes.map((p) => ({ ...p, state: 'checked', children: p.children?.map((c) => ({ ...c, state: 'checked' })) })),
    ...permUsuarios.map((p) => ({ ...p, state: 'checked', children: p.children?.map((c) => ({ ...c, state: 'checked' })) })),
    ...permSeguridad.map((p) => ({ ...p, state: 'checked', children: p.children?.map((c) => ({ ...c, state: 'checked' })) }))
  ],
  supervisor: [...permVentas, ...permProductos, ...permInformes, { ...permUsuarios[0], state: 'partial' }, permSeguridad[0]],
  vendedor: [
    {
      ...permVentas[0],
      children: [
        { id: 'ventas-ver', label: 'Ver ventas', state: 'checked' },
        { id: 'ventas-crear', label: 'Crear ventas', state: 'checked' },
        { id: 'ventas-modificar', label: 'Modificar ventas', state: 'unchecked' },
        { id: 'ventas-anular', label: 'Anular ventas', state: 'unchecked' },
        { id: 'ventas-reimprimir', label: 'Reimprimir tickets', state: 'checked' }
      ]
    },
    {
      ...permProductos[0],
      children: [
        { id: 'productos-ver', label: 'Ver productos', state: 'checked' },
        { id: 'productos-crear', label: 'Crear producto', state: 'unchecked' },
        { id: 'productos-modificar', label: 'Modificar producto', state: 'unchecked' },
        { id: 'productos-eliminar', label: 'Eliminar producto', state: 'unchecked' }
      ]
    },
    {
      ...permInformes[0],
      state: 'unchecked',
      children: [
        { id: 'informes-ver', label: 'Ver informes', state: 'unchecked' },
        { id: 'informes-exportar', label: 'Exportar datos', state: 'unchecked' },
        { id: 'informes-programar', label: 'Programar envios', state: 'unchecked' }
      ]
    }
  ]
};
