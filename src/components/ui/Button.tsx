import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { SpinnerIcon } from './Icons';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-gradient-brand text-white shadow-glow-sm hover:shadow-glow-brand',
  secondary: 'bg-surface border border-border text-text-primary hover:bg-surface-hover hover:border-primary/30',
  danger:    'bg-danger text-white hover:bg-danger-hover',
  ghost:     'bg-transparent text-text-muted hover:text-text-primary hover:bg-surface',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export function Button({
  children, onClick, variant = 'secondary', size = 'md',
  loading, disabled, icon, fullWidth, type = 'button', className = '',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.12 }}
      className={[
        'inline-flex items-center justify-center font-medium rounded-xl',
        'transition-all duration-200 cursor-pointer select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {loading ? <SpinnerIcon size={size === 'lg' ? 18 : 15} /> : icon}
      {children}
    </motion.button>
  );
}
