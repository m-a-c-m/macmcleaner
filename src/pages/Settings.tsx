import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { open as openUrl } from '@tauri-apps/plugin-shell';
import i18n from '../i18n';
import { useAppStore } from '../store/useAppStore';
import { useTauri } from '../hooks/useTauri';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PlusIcon, XIcon, GlobeIcon, FolderIcon, InfoIcon, AlertIcon, ShieldIcon } from '../components/ui/Icons';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.22 } } };

const GITHUB_RELEASES = 'https://github.com/miguelacm/macmcleaner/releases';
const GITHUB_ISSUES   = 'https://github.com/miguelacm/macmcleaner/issues/new';
const WEBSITE         = 'https://miguelacm.es';

export function Settings() {
  const { t } = useTranslation();
  const { config, setConfig, addToast } = useAppStore();
  const tauri = useTauri();
  const [saving, setSaving] = useState(false);

  const handleLangChange = async (lang: string) => {
    i18n.changeLanguage(lang);
    const updated = { ...config, language: lang };
    setConfig(updated);
    await tauri.saveConfig(updated);
    addToast({ type: 'success', message: t('settings.saved') });
  };

  const handleAddExclusion = async () => {
    const selected = await openDialog({ directory: true, multiple: false, title: t('settings.addExclusion') });
    if (!selected) return;
    const path = typeof selected === 'string' ? selected : selected[0];
    if (config.exclusions.includes(path)) return;
    const updated = { ...config, exclusions: [...config.exclusions, path] };
    setConfig(updated);
    setSaving(true);
    await tauri.saveConfig(updated);
    setSaving(false);
    addToast({ type: 'success', message: t('settings.saved') });
  };

  const handleRemoveExclusion = async (path: string) => {
    const updated = { ...config, exclusions: config.exclusions.filter(e => e !== path) };
    setConfig(updated);
    await tauri.saveConfig(updated);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6 max-w-2xl">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-text-primary">{t('settings.title')}</h1>
      </motion.div>

      {/* Language */}
      <motion.div variants={item}>
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <GlobeIcon size={18} className="text-primary" />
            <h2 className="text-sm font-semibold text-text-primary">{t('settings.languageSection')}</h2>
          </div>
          <p className="text-xs text-text-muted mb-4">{t('settings.languageDesc')}</p>
          <div className="flex gap-3">
            {(['es', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLangChange(lang)}
                className={[
                  'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                  config.language === lang
                    ? 'border-primary bg-primary/10 text-primary shadow-glow-sm'
                    : 'border-border bg-surface text-text-muted hover:border-text-subtle hover:text-text-primary',
                ].join(' ')}
              >
                <span>{lang === 'es' ? '🇪🇸' : '🇬🇧'}</span>
                <span>{lang === 'es' ? 'Español' : 'English'}</span>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Exclusions */}
      <motion.div variants={item}>
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FolderIcon size={18} className="text-accent" />
              <h2 className="text-sm font-semibold text-text-primary">{t('settings.exclusionsSection')}</h2>
            </div>
            <Button size="sm" variant="secondary" icon={<PlusIcon size={14} />} onClick={handleAddExclusion} loading={saving}>
              {t('settings.addExclusion')}
            </Button>
          </div>
          <p className="text-xs text-text-muted mb-4">{t('settings.exclusionsDesc')}</p>
          {config.exclusions.length === 0 ? (
            <p className="text-xs text-text-subtle text-center py-4">{t('settings.noExclusions')}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {config.exclusions.map((path) => (
                <div key={path} className="flex items-center gap-3 px-3 py-2 bg-background rounded-lg border border-border">
                  <p className="text-xs text-text-muted flex-1 truncate selectable" title={path}>{path}</p>
                  <button onClick={() => handleRemoveExclusion(path)} className="text-text-subtle hover:text-danger transition-colors flex-shrink-0">
                    <XIcon size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Updates & Community */}
      <motion.div variants={item}>
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <InfoIcon size={18} className="text-primary" />
            <h2 className="text-sm font-semibold text-text-primary">{t('settings.updatesSection')}</h2>
          </div>
          <p className="text-xs text-text-muted mb-4">{t('settings.updatesDesc')}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => openUrl(GITHUB_RELEASES)}>
              {t('settings.checkUpdates')}
            </Button>
            <Button size="sm" variant="ghost" icon={<ShieldIcon size={14} />} onClick={() => openUrl(GITHUB_ISSUES)}>
              {t('settings.sendFeedback')}
            </Button>
            <Button size="sm" variant="ghost" icon={<GlobeIcon size={14} />} onClick={() => openUrl(WEBSITE)}>
              {t('settings.moreTools')}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Uninstall — danger zone */}
      <motion.div variants={item}>
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-3">
            <AlertIcon size={18} className="text-text-subtle" />
            <h2 className="text-sm font-semibold text-text-subtle">{t('settings.dangerZone')}</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">{t('settings.uninstallDesc')}</p>
            </div>
            <Button size="sm" variant="ghost" className="text-text-subtle hover:text-danger border border-border hover:border-danger/40" onClick={() => openUrl('ms-settings:appsfeatures')}>
              {t('settings.uninstall')}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
