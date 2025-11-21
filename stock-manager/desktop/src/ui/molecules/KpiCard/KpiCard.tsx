import { Card } from '@/ui/atoms/Card';
import { Pill } from '@/ui/atoms/Pill';
import styles from './KpiCard.module.css';

type TrendTone = 'good' | 'warn';

type Trend = {
  value: string;
  tone: TrendTone;
};

type KpiCardProps = {
  label: string;
  value: string;
  hint?: string;
  trend?: Trend;
};

const KpiCard = ({ label, value, hint, trend }: KpiCardProps) => {
  return (
    <Card>
      <div className={styles.layout}>
        <div>
          <p className={styles.label}>{label}</p>
          <p className={styles.value}>{value}</p>
          {hint ? <p className={styles.hint}>{hint}</p> : null}
        </div>
        {trend ? (
          <Pill tone={trend.tone}>
            <span>{trend.value}</span>
          </Pill>
        ) : null}
      </div>
    </Card>
  );
};

export default KpiCard;
