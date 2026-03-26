import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useAppStore } from '../store/useAppStore';
import { Button } from './ui/Button';

export function WelcomeModal() {
  const { t } = useTranslation();
  const { setShowWelcome, setShowTerms, setConfig } = useAppStore();
  const [selected, setSelected] = useState<'es' | 'en' | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    i18n.changeLanguage(selected);
    setConfig({ language: selected });
    setShowWelcome(false);
    setShowTerms(true);
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-8 max-w-sm w-full px-6"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <motion.img
            src="/logo-morado-sin-fondo.png"
            alt="MACMCleaner"
            className="w-24 h-24 object-contain"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
          <h1 className="text-2xl font-bold gradient-text text-center">{t('welcome.title')}</h1>
          <p className="text-sm text-text-muted text-center">{t('welcome.subtitle')}</p>
        </div>

        {/* Language buttons */}
        <div className="flex gap-3 w-full">
          {(['es', 'en'] as const).map((lang) => (
            <motion.button
              key={lang}
              onClick={() => setSelected(lang)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={[
                'flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-200 font-medium',
                selected === lang
                  ? 'border-primary bg-primary/10 text-primary shadow-glow-sm'
                  : 'border-border bg-surface text-text-muted hover:border-text-subtle hover:text-text-primary',
              ].join(' ')}
            >
              <span className="text-2xl">{lang === 'es' ? '🇪🇸' : '🇬🇧'}</span>
              <span className="text-sm">{lang === 'es' ? t('welcome.spanish') : t('welcome.english')}</span>
            </motion.button>
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selected}
          onClick={handleContinue}
        >
          {t('welcome.continue')}
        </Button>
      </motion.div>
    </div>
  );
}
