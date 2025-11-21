import { useEffect, useMemo, useState } from 'react';
import { DESKTOP_BREAKPOINT, TABLET_BREAKPOINT } from '@/shared/constants/layout';
import { USER_STATUSES, USERS, ROLES, ROLE_PERMISSIONS } from '@/shared/data/users';
import type { PermissionNode, UserItem } from '@/shared/types/users';

type UsersViewProps = {
  activeItem: string;
};

const stateLabels: Record<string, string> = {
  checked: 'Permitido',
  partial: 'Parcial',
  locked: 'Auth',
  unchecked: 'Denegado'
};

const statusChipClass: Record<string, string> = {
  activo: 'status-active',
  inactivo: 'status-inactive',
  bloqueado: 'status-blocked'
};

const UsersView = ({ activeItem }: UsersViewProps) => {
  const [viewport, setViewport] = useState({ isMobile: false, isTablet: false });
  const [selectedUserId, setSelectedUserId] = useState(USERS[0].id);
  const [selectedRoleId, setSelectedRoleId] = useState('supervisor');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'inactivo' | 'bloqueado'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | string>('all');
  const [activePanel, setActivePanel] = useState<'usuarios' | 'roles' | 'permisos'>('usuarios');
  const [status, setStatus] = useState('Listo');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const handle = () => {
      const width = window.innerWidth;
      const isMobile = width < TABLET_BREAKPOINT;
      const isTablet = width >= TABLET_BREAKPOINT && width < DESKTOP_BREAKPOINT;
      setViewport({ isMobile, isTablet });
      if (!isMobile) setActivePanel('usuarios');
    };
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  useEffect(() => {
    if (activeItem === 'usuarios-gestion') setActivePanel('usuarios');
    if (activeItem === 'usuarios-permisos') setActivePanel('permisos');
    if (activeItem === 'usuarios-auditoria') setActivePanel('roles');
  }, [activeItem]);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase().trim();
    return USERS.filter((user) => {
      const haystack = `${user.username} ${user.fullName} ${user.email}`.toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user.roleId === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [search, statusFilter, roleFilter]);

  const selectedUser: UserItem = useMemo(() => {
    const fallback = filteredUsers[0] ?? USERS[0];
    return filteredUsers.find((u) => u.id === selectedUserId) ?? fallback;
  }, [filteredUsers, selectedUserId]);

  useEffect(() => {
    if (!filteredUsers.some((u) => u.id === selectedUserId) && filteredUsers.length) {
      setSelectedUserId(filteredUsers[0].id);
    }
  }, [filteredUsers, selectedUserId]);

  useEffect(() => {
    setSelectedRoleId(selectedUser.roleId);
  }, [selectedUser]);

  const stats = {
    total: USERS.length,
    activos: USERS.filter((u) => u.status === 'activo').length,
    inactivos: USERS.filter((u) => u.status !== 'activo').length
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setStatus('Actualizando usuarios...');
    setTimeout(() => {
      setRefreshing(false);
      setStatus('Usuarios actualizados');
    }, 900);
  };

  const renderPermNode = (node: PermissionNode) => {
    return (
      <div key={node.id} className={`perm-row state-${node.state}`}>
        <div className="perm-label">{node.label}</div>
        <div className="perm-state">
          <span className="badge ghost">{stateLabels[node.state]}</span>
          {node.note ? <small className="muted">{node.note}</small> : null}
        </div>
        {node.children ? <div className="perm-children">{node.children.map(renderPermNode)}</div> : null}
      </div>
    );
  };

  const showColumn = (panel: 'usuarios' | 'roles' | 'permisos') => {
    if (viewport.isMobile || viewport.isTablet) {
      return activePanel === panel ? '' : 'hidden-panel';
    }
    return '';
  };

  return (
    <main className="users-view app-view is-visible" id="users-view" data-app-view>
      <section className="users-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-eyebrow">Gestion de usuarios, roles y permisos</div>
          <div className="toolbar-actions">
            <button className="btn primary">+ Nuevo usuario</button>
            <button className="btn secondary">+ Nuevo rol</button>
            <button className="btn ghost">Exportar</button>
            <button className={`btn ghost ${refreshing ? 'is-loading' : ''}`} onClick={handleRefresh}>
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
        {(viewport.isMobile || viewport.isTablet) && (
          <div className="users-tabs">
            <button className={activePanel === 'usuarios' ? 'active' : ''} onClick={() => setActivePanel('usuarios')}>
              Usuarios
            </button>
            <button className={activePanel === 'roles' ? 'active' : ''} onClick={() => setActivePanel('roles')}>
              Roles
            </button>
            <button className={activePanel === 'permisos' ? 'active' : ''} onClick={() => setActivePanel('permisos')}>
              Permisos
            </button>
          </div>
        )}
      </section>

      <section className="users-grid">
        <aside className={`users-list ${showColumn('usuarios')}`}>
          <header className="panel-header">
            <h3>Listado de usuarios</h3>
            <small className="muted">Paginacion 20 por pagina · scroll infinito en movil</small>
          </header>
          <div className="filters-row">
            <input
              type="text"
              placeholder="Buscar username, nombre, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">Rol: Todos</option>
              {ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="all">Estado: Todos</option>
              {USER_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="user-stats">
            <div className="stat-card">
              <div>Total</div>
              <strong>{stats.total}</strong>
            </div>
            <div className="stat-card">
              <div>Activos</div>
              <strong>{stats.activos}</strong>
            </div>
            <div className="stat-card">
              <div>Inactivos/Bloq.</div>
              <strong>{stats.inactivos}</strong>
            </div>
          </div>

          <div className="user-list">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                className={`user-row ${user.id === selectedUser.id ? 'active' : ''}`}
                onClick={() => setSelectedUserId(user.id)}
              >
                <span className="avatar">{user.username.slice(0, 2).toUpperCase()}</span>
                <div className="user-row-info">
                  <div className="user-row-main">
                    <strong>{user.username}</strong>
                    <span className="role-badge">{ROLES.find((r) => r.id === user.roleId)?.name ?? 'Rol'}</span>
                  </div>
                  <div className="muted">{user.fullName}</div>
                  <div className="user-row-meta">
                    <span className={`status-chip ${statusChipClass[user.status]}`}>{user.status}</span>
                    <span className="muted">{user.lastAccess}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className={`user-detail ${showColumn('roles')}`}>
          <header className="panel-header">
            <h3>Detalle / Edicion</h3>
            <small className="muted">Username bloqueado en edicion</small>
          </header>
          <div className="detail-form">
            <div className="field-grid">
              <label>
                <span>Username</span>
                <input type="text" value={selectedUser.username} readOnly />
              </label>
              <label>
                <span>Rol</span>
                <select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)}>
                  {ROLES.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="field-grid">
              <label>
                <span>Nombre</span>
                <input type="text" defaultValue={selectedUser.fullName} />
              </label>
              <label>
                <span>Email</span>
                <input type="email" defaultValue={selectedUser.email} />
              </label>
            </div>
            <div className="field-grid">
              <label>
                <span>Telefono</span>
                <input type="text" defaultValue={selectedUser.phone} />
              </label>
              <label>
                <span>Sucursal</span>
                <input type="text" defaultValue={selectedUser.branch} />
              </label>
            </div>
            <div className="field-grid">
              <label className="checkbox-line">
                <input type="checkbox" defaultChecked={selectedUser.status === 'activo'} />
                <span>Activo</span>
              </label>
              <label className="checkbox-line">
                <input type="checkbox" defaultChecked={selectedUser.status === 'bloqueado'} />
                <span>Bloqueado</span>
              </label>
            </div>
            <div className="detail-actions">
              <button className="btn primary">Guardar</button>
              <button className="btn ghost">Cancelar</button>
              <button className="btn danger">Eliminar</button>
            </div>
            <p className="muted">Historial: Rol actualizado el 15/11/2024 por admin · Ultimo acceso: {selectedUser.lastAccess}</p>
          </div>
        </section>

        <aside className={`permissions-panel ${showColumn('permisos')}`}>
          <header className="panel-header">
            <h3>Permisos por rol</h3>
            <small className="muted">Seleccione rol para ver permisos</small>
          </header>
          <div className="roles-list">
            {ROLES.map((role) => (
              <button
                key={role.id}
                className={`role-row ${role.id === selectedRoleId ? 'active' : ''}`}
                onClick={() => setSelectedRoleId(role.id)}
              >
                <div className="role-title">{role.name}</div>
                <div className="muted">{role.description}</div>
                <div className="muted">Usuarios: {role.users} · Creado: {role.createdAt}</div>
              </button>
            ))}
          </div>
          <div className="perm-tree">
            {(ROLE_PERMISSIONS[selectedRoleId] ?? []).map((node) => renderPermNode(node))}
          </div>
          <div className="detail-actions">
            <button className="btn primary">Guardar permisos</button>
            <button className="btn ghost">Cancelar</button>
          </div>
        </aside>
      </section>
      <div className="users-status">{status}</div>
    </main>
  );
};

export default UsersView;
