import type { PropsWithChildren, ReactNode } from 'react';
import { Card } from '@/ui/atoms/Card';
import styles from './MainTemplate.module.css';

type Props = PropsWithChildren<{
  header?: ReactNode;
  sidebar?: ReactNode;
}>;

const DefaultSidebar = () => {
  return (
    <div className={styles.navCard}>
      <div className={styles.navItem}>
        <span>Inventario</span>
        <strong>412</strong>
      </div>
      <div className={styles.navItem}>
        <span>Alertas</span>
        <strong>6</strong>
      </div>
      <div className={styles.navItem}>
        <span>Ordenes abiertas</span>
        <strong>18</strong>
      </div>
    </div>
  );
};

const MainTemplate = ({ header, sidebar, children }: Props) => {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>{sidebar ?? <DefaultSidebar />}</aside>
      <main className={styles.content}>
        {header ? <div className={styles.header}>{header}</div> : null}
        <Card className={styles.body}>{children}</Card>
      </main>
    </div>
  );
};

export default MainTemplate;
