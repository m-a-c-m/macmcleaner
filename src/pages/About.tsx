import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { open } from '@tauri-apps/plugin-shell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldIcon, GlobeIcon, InfoIcon } from '../components/ui/Icons';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.22 } } };

export function About() {
  const { t } = useTranslation();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col items-center gap-6 max-w-lg mx-auto w-full">
      {/* Logo + name */}
      <motion.div variants={item} className="flex flex-col items-center gap-3 pt-4">
        <img src="/logo-morado-sin-fondo.png" alt="MACMCleaner" className="w-20 h-20 object-contain" />
        <div className="text-center">
          <h1 className="text-2xl font-bold gradient-text">MACMCleaner</h1>
          <p className="text-xs text-text-muted mt-1">{t('app.version')}</p>
        </div>
        <p className="text-sm text-text-muted text-center">{t('about.description')}</p>
      </motion.div>

      {/* Info */}
      <motion.div variants={item} className="w-full">
        <Card padding="md">
          <div className="flex flex-col gap-3">
            {[
              { label: t('about.developer'), value: t('about.devName') },
              { label: t('about.website'),   value: 'miguelacm.es', link: 'https://miguelacm.es' },
              { label: t('about.license'),   value: t('about.licenseValue') },
              { label: 'Copyright',          value: t('about.copyright') },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 py-1.5 border-b border-border/50 last:border-0">
                <span className="text-xs text-text-muted flex-shrink-0">{row.label}</span>
                {row.link ? (
                  <button
                    onClick={() => open(row.link!)}
                    className="text-xs text-primary hover:text-primary-hover font-medium transition-colors selectable"
                  >
                    {row.value}
                  </button>
                ) : (
                  <span className="text-xs text-text-primary font-medium text-right selectable">{row.value}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Privacy */}
      <motion.div variants={item} className="w-full">
        <Card padding="md">
          <div className="flex items-center gap-2 mb-2">
            <ShieldIcon size={16} className="text-success" />
            <h3 className="text-sm font-semibold text-text-primary">{t('about.privacyTitle')}</h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed selectable">{t('about.privacyText')}</p>
        </Card>
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={item} className="w-full">
        <Card padding="md">
          <div className="flex items-center gap-2 mb-2">
            <InfoIcon size={16} className="text-warning" />
            <h3 className="text-sm font-semibold text-text-primary">{t('about.disclaimerTitle')}</h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed selectable">{t('about.disclaimerText')}</p>
        </Card>
      </motion.div>

      {/* Source */}
      <motion.div variants={item} className="w-full pb-4">
        <Card padding="md">
          <div className="flex items-center gap-2 mb-2">
            <GlobeIcon size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-text-primary">{t('about.sourceTitle')}</h3>
          </div>
          <p className="text-xs text-text-muted mb-3">{t('about.sourceText')}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => open('https://github.com/miguelacm/macmcleaner')}
          >
            {t('about.viewSource')}
          </Button>
        </Card>
      </motion.div>
    </motion.div>
  );
}
