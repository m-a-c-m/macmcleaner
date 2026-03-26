import { create } from 'zustand';

export interface ScannedFile {
  path: string;
  size: number;
  modified: string;
  category: string;
}

export interface ScanCategory {
  id: string;
  files: ScannedFile[];
  total_size: number;
  file_count: number;
}

export interface ScanResult {
  categories: ScanCategory[];
  total_files: number;
  total_size: number;
  scan_date: string;
  scan_duration_ms: number;
}

export interface CleanResult {
  deleted_files: number;
  freed_space: number;
  errors: string[];
}

export interface AppConfig {
  language: string;
  terms_accepted: boolean;
  first_launch: boolean;
  exclusions: string[];
  last_scan_date: string | null;
  total_cleaned: number;
  scans_performed: number;
}

export type AppPage = 'dashboard' | 'results' | 'settings' | 'about';
export type SortOption = 'size' | 'date' | 'name';

interface AppState {
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;

  config: AppConfig;
  setConfig: (config: Partial<AppConfig>) => void;
  configLoaded: boolean;
  setConfigLoaded: (loaded: boolean) => void;

  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  showTerms: boolean;
  setShowTerms: (show: boolean) => void;

  isScanning: boolean;
  scanProgress: number;
  scanStatus: string;
  scanResult: ScanResult | null;
  setScanning: (scanning: boolean) => void;
  setScanProgress: (progress: number, status: string) => void;
  setScanResult: (result: ScanResult | null) => void;

  isCleaning: boolean;
  cleanResult: CleanResult | null;
  setCleaning: (cleaning: boolean) => void;
  setCleanResult: (result: CleanResult | null) => void;

  enabledCategories: Record<string, boolean>;
  toggleCategory: (id: string) => void;

  selectedFiles: Record<string, boolean>;
  toggleFile: (path: string) => void;
  toggleCategoryFiles: (categoryId: string, selected: boolean) => void;
  selectAllFiles: () => void;
  deselectAllFiles: () => void;

  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  filterText: string;
  setFilterText: (text: string) => void;

  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  resetScan: () => void;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const defaultConfig: AppConfig = {
  language: 'es',
  terms_accepted: false,
  first_launch: true,
  exclusions: [],
  last_scan_date: null,
  total_cleaned: 0,
  scans_performed: 0,
};

export const useAppStore = create<AppState>((set, get) => ({
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),

  config: defaultConfig,
  setConfig: (partial) => set((s) => ({ config: { ...s.config, ...partial } })),
  configLoaded: false,
  setConfigLoaded: (loaded) => set({ configLoaded: loaded }),

  showWelcome: false,
  setShowWelcome: (show) => set({ showWelcome: show }),
  showTerms: false,
  setShowTerms: (show) => set({ showTerms: show }),

  isScanning: false,
  scanProgress: 0,
  scanStatus: '',
  scanResult: null,
  setScanning: (scanning) => set({ isScanning: scanning }),
  setScanProgress: (progress, status) => set({ scanProgress: progress, scanStatus: status }),
  setScanResult: (result) => set({ scanResult: result }),

  isCleaning: false,
  cleanResult: null,
  setCleaning: (cleaning) => set({ isCleaning: cleaning }),
  setCleanResult: (result) => set({ cleanResult: result }),

  enabledCategories: { temp: true, browser: true, system: true, recycle: true },
  toggleCategory: (id) => set((s) => ({
    enabledCategories: { ...s.enabledCategories, [id]: !s.enabledCategories[id] }
  })),

  selectedFiles: {},
  toggleFile: (path) => set((s) => ({
    selectedFiles: { ...s.selectedFiles, [path]: !s.selectedFiles[path] }
  })),
  toggleCategoryFiles: (categoryId, selected) => set((s) => {
    const cat = s.scanResult?.categories.find(c => c.id === categoryId);
    if (!cat) return {};
    const updates: Record<string, boolean> = {};
    cat.files.forEach(f => { updates[f.path] = selected; });
    return { selectedFiles: { ...s.selectedFiles, ...updates } };
  }),
  selectAllFiles: () => set((s) => {
    const all: Record<string, boolean> = {};
    s.scanResult?.categories.forEach(c => c.files.forEach(f => { all[f.path] = true; }));
    return { selectedFiles: all };
  }),
  deselectAllFiles: () => set({ selectedFiles: {} }),

  sortOption: 'size',
  setSortOption: (sort) => set({ sortOption: sort }),
  filterText: '',
  setFilterText: (text) => set({ filterText: text }),

  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  resetScan: () => set({ scanResult: null, selectedFiles: {}, scanProgress: 0, scanStatus: '', cleanResult: null }),
}));
