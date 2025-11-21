import InventorySnapshot from '@/features/dashboard/components/InventorySnapshot';
import LowStockList from '@/features/dashboard/components/LowStockList';
import RecentMovements from '@/features/dashboard/components/RecentMovements';
import styles from './HomePage.module.css';

const HomePage = () => {
  return (
    <div className={styles.page}>
      <InventorySnapshot />
      <div className={styles.columns}>
        <LowStockList />
        <RecentMovements />
      </div>
    </div>
  );
};

export default HomePage;
