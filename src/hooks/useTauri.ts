import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { AppConfig, ScanResult, CleanResult } from '../store/useAppStore';

export interface ScanProgressEvent {
  category: string;
  files_found: number;
  current_path: string;
  progress_percent: number;
}

export interface CleanProgressEvent {
  deleted: number;
  freed: number;
  total: number;
}

export function useTauri() {
  return {
    loadConfig: () => invoke<AppConfig>('load_config'),
    saveConfig: (config: AppConfig) => invoke<void>('save_config', { config }),

    startScan: (categories: string[], exclusions: string[]) =>
      invoke<ScanResult>('start_scan', { categories, exclusions }),
    cancelScan: () => invoke<void>('cancel_scan'),

    cleanFiles: (filePaths: string[], exclusions: string[]) =>
      invoke<CleanResult>('clean_files', { filePaths, exclusions }),

    onScanProgress: (cb: (p: ScanProgressEvent) => void) =>
      listen<ScanProgressEvent>('scan-progress', (e) => cb(e.payload)),

    onCleanProgress: (cb: (p: CleanProgressEvent) => void) =>
      listen<CleanProgressEvent>('clean-progress', (e) => cb(e.payload)),
  };
}
