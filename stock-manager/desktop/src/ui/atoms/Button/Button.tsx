import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'ghost';
type Size = 'md' | 'sm';

export type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
  }
>;

const Button = ({ children, className = '', variant = 'primary', size = 'md', ...rest }: ButtonProps) => {
  const classes = [styles.base, variant === 'ghost' ? styles.ghost : '', size === 'sm' ? styles.small : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};

export default Button;
