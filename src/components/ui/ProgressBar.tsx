import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
  height?: number;
  className?: string;
}

export function ProgressBar({ value, label, showPercent, height = 6, className = '' }: ProgressBarProps) {
  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-text-muted">{label}</span>}
          {showPercent && (
            <span className="text-xs font-medium text-primary"
              style={{ textShadow: '0 0 8px rgba(0,212,255,0.6)' }}>
              {Math.round(value)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-border rounded-full overflow-hidden" style={{ height }}>
        <motion.div
          className="h-full bg-gradient-brand rounded-full"
          style={{ boxShadow: '0 0 10px rgba(0,212,255,0.7), 0 0 20px rgba(0,212,255,0.25)' }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
