import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { useTauri } from '../hooks/useTauri';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ScanIcon, TrashIcon, GlobeIcon, ShieldIcon, FolderIcon } from '../components/ui/Icons';
import { formatBytes, formatDate } from '../utils/format';

const CATEGORIES = [
  { id: 'temp',    icon: <FolderIcon size={20} />, color: 'text-primary' },
  { id: 'browser', icon: <GlobeIcon  size={20} />, color: 'text-accent' },
  { id: 'system',  icon: <ShieldIcon size={20} />, color: 'text-warning' },
  { id: 'recycle', icon: <TrashIcon  size={20} />, color: 'text-success' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export function Dashboard() {
  const { t, i18n } = useTranslation();
  const {
    config, enabledCategories, toggleCategory,
    isScanning, scanProgress, scanStatus,
    setScanning, setScanProgress, setScanResult,
    setCurrentPage, addToast,
  } = useAppStore();
  const tauri = useTauri();
  const [scanError, setScanError] = useState<string | null>(null);
  const [filesFound, setFilesFound] = useState(0);

  const handleScan = async () => {
    const cats = Object.entries(enabledCategories)
      .filter(([, v]) => v).map(([k]) => k);

    if (!cats.length) return;

    setScanError(null);
    setScanning(true);
    setFilesFound(0);
    setScanProgress(0, '');

    const unlisten = await tauri.onScanProgress((p) => {
      setScanProgress(p.progress_percent, p.category);
      setFilesFound(p.files_found);
    });

    try {
      const result = await tauri.startScan(cats, config.exclusions);
      setScanResult(result);
      setCurrentPage('results');
      addToast({ type: 'success', message: t('toast.scanComplete', { count: result.total_files }) });
    } catch (e) {
      setScanError(String(e));
    } finally {
      setScanning(false);
      unlisten();
    }
  };

  const scanningLabel = scanStatus
    ? t(`scanner.scanning_${scanStatus}`, { defaultValue: scanStatus })
    : t('dashboard.analyzing');

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-text-primary">{t('dashboard.title')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('dashboard.subtitle')}</p>
      </motion.div>

      {/* Hero — Analyze button */}
      <motion.div variants={item}>
        <Card glowing className="flex flex-col items-center py-10 gap-5">
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow-brand animate-pulse-glow cursor-pointer"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={!isScanning ? handleScan : undefined}
          >
            <ScanIcon size={36} className="text-white" />
          </motion.div>

          <div className="text-center w-full max-w-xs">
            <Button
              variant="primary"
              size="lg"
              loading={isScanning}
              onClick={handleScan}
              disabled={isScanning}
            >
              {isScanning ? t('dashboard.analyzing') : t('dashboard.analyzeNow')}
            </Button>
            {scanError && <p className="text-xs text-danger mt-2">{scanError}</p>}
          </div>

          {/* Progress indicator during scan */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full max-w-xs flex flex-col gap-2"
              >
                <ProgressBar value={scanProgress} showPercent />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted truncate">{scanningLabel}</span>
                  <span className="text-xs text-primary font-medium flex-shrink-0 ml-2">
                    {filesFound} {t('scanner.found')}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isScanning && (
            <p className="text-xs text-text-muted">
              {t('dashboard.lastScan')}: <span className="text-text-primary">
                {formatDate(config.last_scan_date, i18n.language)}
              </span>
            </p>
          )}
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-4">
        {[
          { label: t('dashboard.totalCleaned'), value: formatBytes(config.total_cleaned) },
          { label: t('dashboard.scansPerformed'), value: String(config.scans_performed) },
          { label: t('app.version'), value: 'v1.0.0' },
        ].map((stat) => (
          <Card key={stat.label} padding="md">
            <p className="text-xs text-text-muted mb-1">{stat.label}</p>
            <p className="text-xl font-bold gradient-text">{stat.value}</p>
          </Card>
        ))}
      </motion.div>

      {/* Categories */}
      <motion.div variants={item}>
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
          {t('dashboard.categoriesTitle')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const enabled = enabledCategories[cat.id];
            return (
              <Card
                key={cat.id}
                padding="md"
                onClick={() => toggleCategory(cat.id)}
                className={`transition-all ${enabled ? 'gradient-border' : 'opacity-60'}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 ${enabled ? cat.color : 'text-text-subtle'}`}>
                    {cat.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${enabled ? 'text-text-primary' : 'text-text-muted'}`}>
                      {t(`dashboard.${cat.id}`)}
                    </p>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {t(`dashboard.${cat.id}Desc`)}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 border-2 transition-all ${
                    enabled ? 'bg-gradient-brand border-transparent' : 'border-text-subtle bg-transparent'
                  }`} />
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
