import type { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'muted';

const styles: Record<BadgeVariant, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-success/10 text-success border-success/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  muted: 'bg-border/50 text-text-muted border-border',
};

export function Badge({ children, variant = 'muted' }: { children: ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {children}
    </span>
  );
}
