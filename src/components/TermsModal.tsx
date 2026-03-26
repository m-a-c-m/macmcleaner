import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useAppStore } from '../store/useAppStore';
import { useTauri } from '../hooks/useTauri';
import { Button } from './ui/Button';
import { Checkbox } from './ui/Checkbox';
import { ShieldIcon } from './ui/Icons';

export function TermsModal() {
  const { t } = useTranslation();
  const { setShowTerms, config, setConfig } = useAppStore();
  const tauri = useTauri();
  const [accepted, setAccepted] = useState(false);

  const sections = [
    { title: t('terms.s1title'), body: t('terms.s1') },
    { title: t('terms.s2title'), body: t('terms.s2') },
    { title: t('terms.s3title'), body: t('terms.s3') },
    { title: t('terms.s4title'), body: t('terms.s4') },
  ];

  const handleAccept = async () => {
    if (!accepted) return;
    const updated = { ...config, terms_accepted: true, first_launch: false };
    setConfig(updated);
    await tauri.saveConfig(updated);
    setShowTerms(false);
  };

  const handleDecline = () => getCurrentWindow().close();

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl bg-surface border border-border rounded-2xl overflow-hidden shadow-card flex flex-col"
        style={{ maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <ShieldIcon size={20} className="text-primary" />
          <h2 className="text-base font-semibold text-text-primary">{t('terms.title')}</h2>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-4 selectable">
          <p className="text-sm text-text-muted mb-5">{t('terms.intro')}</p>
          <div className="flex flex-col gap-4">
            {sections.map((s) => (
              <div key={s.title} className="bg-background rounded-xl p-4 border border-border">
                <h3 className="text-sm font-semibold text-text-primary mb-1.5">{s.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex flex-col gap-3">
          <Checkbox
            checked={accepted}
            onChange={setAccepted}
            label={t('terms.accept')}
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleDecline} className="text-danger hover:text-danger">
              {t('terms.decline')}
            </Button>
            <Button variant="primary" fullWidth disabled={!accepted} onClick={handleAccept}>
              {t('common.ok')}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
