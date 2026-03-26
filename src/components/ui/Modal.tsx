import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from './Icons';

type ModalSize = 'sm' | 'md' | 'lg';
const sizes: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  closable?: boolean;
}

export function Modal({ isOpen, onClose, title, children, size = 'md', closable = true }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(5, 5, 8, 0.85)', backdropFilter: 'blur(4px)' }}
          onClick={closable ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${sizes[size]} bg-surface border border-border rounded-2xl shadow-card overflow-hidden`}
          >
            {(title || (closable && onClose)) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                {title && <h2 className="text-base font-semibold text-text-primary">{title}</h2>}
                {closable && onClose && (
                  <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-border transition-colors ml-auto">
                    <XIcon size={16} />
                  </button>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
