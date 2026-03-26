import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { CheckIcon, AlertIcon, InfoIcon, XIcon } from './Icons';

const icons = {
  success: <CheckIcon size={15} className="text-success" />,
  error: <AlertIcon size={15} className="text-danger" />,
  info: <InfoIcon size={15} className="text-primary" />,
};

const borders = {
  success: 'border-success/30',
  error: 'border-danger/30',
  info: 'border-primary/30',
};

export function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 bg-surface border ${borders[t.type]} rounded-xl shadow-card max-w-xs`}
          >
            {icons[t.type]}
            <span className="text-sm text-text-primary flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="text-text-subtle hover:text-text-muted transition-colors">
              <XIcon size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
