type HeaderProps = {
  viewTitle: string;
  onToggleSidebar: () => void;
  onShowNotifications: () => void;
  onToggleTheme: () => void;
  onTogglePalette: () => void;
};

const AppHeader = ({ viewTitle, onToggleSidebar, onShowNotifications, onToggleTheme, onTogglePalette }: HeaderProps) => {
  return (
    <nav className="app-header">
      <div className="header-left">
        <button className="icon-button" id="sidebar-toggle" aria-label="Menu principal" onClick={onToggleSidebar}>
          ☰
        </button>
        <div className="logo">POS 360</div>
        <div className="view-title">{viewTitle}</div>
      </div>
      <div className="header-right">
        <button className="icon-button" aria-label="Buscar">
          🔍
        </button>
        <button className="icon-button has-badge" aria-label="Notificaciones" onClick={onShowNotifications}>
          🔔
          <span className="badge">3</span>
        </button>
        <div className="user-dropdown">
          <button className="user-avatar" aria-haspopup="true" aria-expanded="false">
            JC
          </button>
          <div className="user-info">
            <strong>Julio Colindres</strong>
            <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: 12 }}>Administrador</small>
          </div>
          <button className="icon-button user-menu-chevron" aria-label="Tema" onClick={onToggleTheme}>
            🌓
          </button>
          <button className="icon-button user-menu-chevron" aria-label="Paleta" onClick={onTogglePalette}>
            🎨
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AppHeader;
