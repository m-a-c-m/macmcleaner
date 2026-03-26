import { motion } from 'framer-motion';
import { CheckIcon } from './Icons';

interface CheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  className?: string;
  indeterminate?: boolean;
}

export function Checkbox({ checked, onChange, label, className = '', indeterminate }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${className}`}>
      <div
        onClick={() => onChange(!checked)}
        className={[
          'relative w-4 h-4 rounded flex items-center justify-center flex-shrink-0',
          'border transition-all duration-150',
          checked || indeterminate
            ? 'border-transparent bg-gradient-brand'
            : 'border-text-subtle bg-surface group-hover:border-text-muted',
        ].join(' ')}
      >
        {(checked || indeterminate) && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            {indeterminate
              ? <div className="w-2 h-0.5 bg-white rounded-full" />
              : <CheckIcon size={10} className="text-white" />
            }
          </motion.div>
        )}
      </div>
      {label && <span className="text-sm text-text-muted group-hover:text-text-primary transition-colors">{label}</span>}
    </label>
  );
}
