import type { PropsWithChildren } from 'react';
import styles from './Pill.module.css';

type Tone = 'neutral' | 'good' | 'warn';

type PillProps = PropsWithChildren<{
  tone?: Tone;
  className?: string;
}>;

const Pill = ({ children, tone = 'neutral', className = '' }: PillProps) => {
  const classes = [styles.pill, tone !== 'neutral' ? styles[tone] : '', className].filter(Boolean).join(' ');
  return <span className={classes}>{children}</span>;
};

export default Pill;
