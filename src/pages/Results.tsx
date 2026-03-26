import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { useTauri } from '../hooks/useTauri';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { AlertIcon, ChevronDownIcon, ChevronRightIcon, CheckIcon, TrashIcon, SearchIcon } from '../components/ui/Icons';
import { formatBytes, formatDate } from '../utils/format';

export function Results() {
  const { t, i18n } = useTranslation();
  const {
    scanResult, selectedFiles, toggleFile, toggleCategoryFiles,
    selectAllFiles, deselectAllFiles, sortOption, setSortOption,
    filterText, setFilterText, isCleaning, setCleaning,
    setCleanResult, setCurrentPage, config, setConfig,
    addToast, resetScan,
  } = useAppStore();
  const tauri = useTauri();

  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [showMoreCats, setShowMoreCats] = useState<Record<string, boolean>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [cleanDone, setCleanDone] = useState(false);
  const [cleanStats, setCleanStats] = useState<{ deleted: number; freed: number; errors: number }>({ deleted: 0, freed: 0, errors: 0 });

  const FILE_LIMIT = 100;

  if (!scanResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-text-muted">{t('results.noResults')}</p>
        <Button onClick={() => setCurrentPage('dashboard')}>{t('results.backToDashboard')}</Button>
      </div>
    );
  }

  const selectedPaths = useMemo(
    () => Object.entries(selectedFiles).filter(([, v]) => v).map(([k]) => k),
    [selectedFiles]
  );

  const selectedSize = useMemo(
    () => scanResult.categories
      .flatMap(c => c.files)
      .filter(f => selectedFiles[f.path])
      .reduce((s, f) => s + f.size, 0),
    [scanResult, selectedFiles]
  );

  const toggleCat = (id: string) =>
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));

  const isCatSelected = (id: string) => {
    const cat = scanResult.categories.find(c => c.id === id);
    if (!cat || cat.files.length === 0) return false;
    return cat.files.every(f => selectedFiles[f.path]);
  };

  const isCatIndeterminate = (id: string) => {
    const cat = scanResult.categories.find(c => c.id === id);
    if (!cat) return false;
    const sel = cat.files.filter(f => selectedFiles[f.path]).length;
    return sel > 0 && sel < cat.files.length;
  };

  const handleClean = async () => {
    setShowConfirm(false);
    setCleaning(true);
    try {
      const result = await tauri.cleanFiles(selectedPaths, config.exclusions);
      setCleanResult(result);
      setCleanStats({ deleted: result.deleted_files, freed: result.freed_space, errors: result.errors.length });
      setCleanDone(true);

      // Update config stats
      const updated = {
        ...config,
        total_cleaned: config.total_cleaned + result.freed_space,
        scans_performed: config.scans_performed + 1,
        last_scan_date: new Date().toISOString(),
      };
      setConfig(updated);
      await tauri.saveConfig(updated);
      addToast({ type: 'success', message: t('toast.cleanComplete', { size: formatBytes(result.freed_space) }) });
    } catch (e) {
      addToast({ type: 'error', message: t('toast.error') });
    } finally {
      setCleaning(false);
    }
  };

  if (cleanDone) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-full gap-6">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-success/15 border border-success/30 flex items-center justify-center"
        >
          <CheckIcon size={32} className="text-success" />
        </motion.div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary">{t('cleaning.complete')}</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold text-primary">{cleanStats.deleted}</p>
            <p className="text-xs text-text-muted mt-1">{t('cleaning.deleted')}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold gradient-text">{formatBytes(cleanStats.freed)}</p>
            <p className="text-xs text-text-muted mt-1">{t('cleaning.freed')}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className={`text-2xl font-bold ${cleanStats.errors > 0 ? 'text-warning' : 'text-success'}`}>
              {cleanStats.errors}
            </p>
            <p className="text-xs text-text-muted mt-1">{t('cleaning.errors')}</p>
          </Card>
        </div>
        {cleanStats.errors > 0 && (
          <p className="text-xs text-text-muted text-center max-w-sm">
            {t('cleaning.errorsNote')}
          </p>
        )}
        <Button variant="primary" size="lg" onClick={() => {
          setCurrentPage('dashboard');
          setTimeout(() => resetScan(), 300);
        }}>
          {t('cleaning.done')}
        </Button>
      </motion.div>
    );
  }

  if (isCleaning) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-text-primary mb-2">{t('cleaning.title')}</h2>
        </div>
        <div className="w-full max-w-sm">
          <ProgressBar value={50} label={t('cleaning.title')} showPercent />
        </div>
      </div>
    );
  }

  if (scanResult.total_files === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <CheckIcon size={40} className="text-success" />
        <h2 className="text-xl font-bold text-text-primary">{t('results.noResults')}</h2>
        <p className="text-sm text-text-muted">{t('results.noResultsDesc')}</p>
        <Button onClick={() => setCurrentPage('dashboard')}>{t('results.backToDashboard')}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('results.title')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('results.subtitle')}</p>
      </div>

      {/* Summary bar */}
      <Card padding="sm" className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-muted">
            {t('results.totalFound')}: <span className="text-text-primary font-semibold">{formatBytes(scanResult.total_size)}</span>
          </span>
          <span className="text-sm text-text-muted">
            {t('results.selected')}: <span className="text-primary font-semibold">{formatBytes(selectedSize)}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={selectAllFiles}>{t('results.selectAll')}</Button>
          <Button size="sm" variant="ghost" onClick={deselectAllFiles}>{t('results.deselectAll')}</Button>

          {/* Sort */}
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value as any)}
            className="text-xs bg-surface border border-border rounded-lg px-2 py-1.5 text-text-muted focus:outline-none focus:border-primary"
          >
            <option value="size">{t('results.sortBySize')}</option>
            <option value="date">{t('results.sortByDate')}</option>
            <option value="name">{t('results.sortByName')}</option>
          </select>
        </div>
      </Card>

      {/* Filter */}
      <div className="relative">
        <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder={t('results.filterPlaceholder')}
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors selectable"
        />
      </div>

      {/* Category list */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1">
        {scanResult.categories.map((cat) => {
          const filtered = cat.files.filter(f =>
            !filterText || f.path.toLowerCase().includes(filterText.toLowerCase())
          );
          const sorted = [...filtered].sort((a, b) => {
            if (sortOption === 'size') return b.size - a.size;
            if (sortOption === 'date') return b.modified.localeCompare(a.modified);
            return a.path.localeCompare(b.path);
          });
          if (filtered.length === 0) return null;
          const expanded = expandedCats[cat.id];

          return (
            <Card key={cat.id} padding="none" className="overflow-hidden">
              {/* Category header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-hover transition-colors"
                onClick={() => toggleCat(cat.id)}
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isCatSelected(cat.id)}
                    indeterminate={isCatIndeterminate(cat.id)}
                    onChange={(v) => toggleCategoryFiles(cat.id, v)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{t(`dashboard.${cat.id}`)}</p>
                  <p className="text-xs text-text-muted mt-0.5">{t(`dashboard.${cat.id}Desc`)}</p>
                </div>
                <Badge variant="muted">{sorted.length} {t('results.files')}</Badge>
                <Badge variant="primary">{formatBytes(cat.total_size)}</Badge>
                {expanded ? <ChevronDownIcon size={16} className="text-text-muted" />
                           : <ChevronRightIcon size={16} className="text-text-muted" />}
              </div>

              {/* Files list */}
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                    className="border-t border-border"
                  >
                    <div className="max-h-64 overflow-y-auto">
                      {(showMoreCats[cat.id] ? sorted : sorted.slice(0, FILE_LIMIT)).map((file) => (
                        <div
                          key={file.path}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-surface-hover transition-colors border-b border-border/50 last:border-0"
                        >
                          <Checkbox
                            checked={!!selectedFiles[file.path]}
                            onChange={() => toggleFile(file.path)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-text-muted truncate selectable" title={file.path}>
                              {file.path === '__RECYCLE_BIN__' ? t('results.recycleBinAll') : file.path}
                            </p>
                          </div>
                          <span className="text-xs text-text-subtle flex-shrink-0">{formatDate(file.modified, i18n.language)}</span>
                          <span className="text-xs font-medium text-text-muted flex-shrink-0 w-16 text-right">{formatBytes(file.size)}</span>
                        </div>
                      ))}
                      {sorted.length > FILE_LIMIT && !showMoreCats[cat.id] && (
                        <button
                          onClick={() => setShowMoreCats(prev => ({ ...prev, [cat.id]: true }))}
                          className="w-full py-2 text-xs text-primary hover:text-primary-hover transition-colors text-center"
                        >
                          {t('results.showMore', { count: sorted.length - FILE_LIMIT })}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      {/* Sticky footer */}
      <div className="flex items-center gap-3 pt-2 border-t border-border flex-shrink-0">
        <Button variant="ghost" onClick={() => setCurrentPage('dashboard')} size="sm">
          {t('results.backToDashboard')}
        </Button>
        <div className="flex-1" />
        <Button
          variant="primary"
          size="md"
          disabled={selectedPaths.length === 0}
          icon={<TrashIcon size={16} />}
          onClick={() => setShowConfirm(true)}
        >
          {t('results.clean')} ({formatBytes(selectedSize)})
        </Button>
      </div>

      {/* Confirm modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title={t('confirm.title')} size="sm">
        <div className="px-6 py-4 flex flex-col gap-4">
          <div className="flex gap-3 p-3 bg-danger/10 border border-danger/20 rounded-xl">
            <AlertIcon size={18} className="text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-text-primary">
                {t('confirm.message', { count: selectedPaths.length, size: formatBytes(selectedSize) })}
              </p>
              <p className="text-xs text-text-muted mt-1">{t('confirm.warning')}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowConfirm(false)} fullWidth>{t('confirm.cancel')}</Button>
            <Button variant="danger" onClick={handleClean} fullWidth>{t('confirm.confirm')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
