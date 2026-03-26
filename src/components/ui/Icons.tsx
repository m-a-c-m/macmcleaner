interface IconProps { size?: number; className?: string; }

const i = (size: number, cls: string, path: string) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={cls}>
    <path d={path} />
  </svg>
);

export const DashboardIcon = ({ size = 20, className = '' }: IconProps) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>;

export const ListIcon = ({ size = 20, className = '' }: IconProps) =>
  i(size, className, 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01');

export const SettingsIcon = ({ size = 20, className = '' }: IconProps) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>;

export const InfoIcon = ({ size = 20, className = '' }: IconProps) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>;

export const MinimizeIcon = ({ size = 12, className = '' }: IconProps) =>
  <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor" className={className}>
    <rect y="5.5" width="12" height="1" rx="0.5"/>
  </svg>;

export const MaximizeIcon = ({ size = 12, className = '' }: IconProps) =>
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" className={className}>
    <rect x="0.6" y="0.6" width="10.8" height="10.8" rx="1.4"/>
  </svg>;

export const RestoreIcon = ({ size = 12, className = '' }: IconProps) =>
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" className={className}>
    <rect x="3.1" y="0.6" width="8.3" height="8.3" rx="1.2"/>
    <path d="M0.6 3.1v8.3h8.3" />
  </svg>;

export const CloseIcon = ({ size = 12, className = '' }: IconProps) =>
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className={className}>
    <line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/>
  </svg>;

export const CheckIcon = ({ size = 20, className = '' }: IconProps) =>
  i(size, className, 'M20 6L9 17l-5-5');

export const TrashIcon = ({ size = 20, className = '' }: IconProps) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>;

export const ShieldIcon = ({ size = 20, className = '' }: IconProps) =>
  i(size, className, 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z');

export const GlobeIcon = ({ size = 20, className = '' }: IconProps) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>;

export const FolderIcon = ({ size = 20, className = '' }: IconProps) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>;

export const AlertIcon = ({ size = 20, className = '' }: IconProps) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>;

export const SpinnerIcon = ({ size = 20, className = '' }: IconProps) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={`animate-spin ${className}`}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>;

export const ChevronDownIcon = ({ size = 20, className = '' }: IconProps) =>
  i(size, className, 'M6 9l6 6 6-6');

export const ChevronRightIcon = ({ size = 20, className = '' }: IconProps) =>
  i(size, className, 'M9 18l6-6-6-6');

export const SearchIcon = ({ size = 20, className = '' }: IconProps) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>;

export const ScanIcon = ({ size = 20, className = '' }: IconProps) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <circle cx="12" cy="12" r="3"/><path d="M12 5v2"/><path d="M12 17v2"/>
    <path d="M5 12H7"/><path d="M17 12h2"/>
  </svg>;

export const PlusIcon = ({ size = 20, className = '' }: IconProps) =>
  i(size, className, 'M12 5v14M5 12h14');

export const XIcon = ({ size = 20, className = '' }: IconProps) =>
  i(size, className, 'M18 6L6 18M6 6l12 12');
