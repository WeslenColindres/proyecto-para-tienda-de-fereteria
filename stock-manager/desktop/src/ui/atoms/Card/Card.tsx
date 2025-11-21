import type { PropsWithChildren, ReactNode } from 'react';
import styles from './Card.module.css';

type CardProps = PropsWithChildren<{
  title?: ReactNode;
  className?: string;
}>;

const Card = ({ title, children, className = '' }: CardProps) => {
  return (
    <section className={[styles.card, className].filter(Boolean).join(' ')}>
      {title ? <header className={styles.title}>{title}</header> : null}
      {children}
    </section>
  );
};

export default Card;
