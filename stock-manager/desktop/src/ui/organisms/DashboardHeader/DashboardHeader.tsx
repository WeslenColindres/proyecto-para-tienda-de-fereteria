import { useDesktopInfo } from '@/shared/hooks/useDesktopInfo';
import { Button } from '@/ui/atoms/Button';
import { Pill } from '@/ui/atoms/Pill';
import styles from './DashboardHeader.module.css';

const DashboardHeader = () => {
  const { platform, versions } = useDesktopInfo();

  return (
    <div className={styles.header}>
      <div className={styles.titles}>
        <p className={styles.kicker}>Stock Manager</p>
        <h1 className={styles.title}>Panel de control</h1>
        <p className={styles.subtitle}>Monitorea compras, ventas y alertas críticas.</p>
        <div className={styles.badges}>
          <Pill tone="good">Desktop • {platform}</Pill>
          <Pill tone="warn">Electron {versions?.electron ?? ''}</Pill>
        </div>
      </div>
      <div className={styles.actions}>
        <Button>Agregar compra</Button>
        <Button variant="ghost" size="sm">
          Exportar reporte
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
