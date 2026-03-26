import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { open } from '@tauri-apps/plugin-shell';
import { useAppStore, type AppPage } from '../../store/useAppStore';
import { DashboardIcon, ListIcon, SettingsIcon, InfoIcon } from '../ui/Icons';

interface NavItem { id: AppPage; icon: ReactNode; label: string; requiresScan?: boolean; }

export function Sidebar() {
  const { t } = useTranslation();
  const { currentPage, setCurrentPage, scanResult } = useAppStore();

  const items: NavItem[] = [
    { id: 'dashboard', icon: <DashboardIcon size={18} />, label: t('sidebar.dashboard') },
    { id: 'results',   icon: <ListIcon     size={18} />, label: t('sidebar.results'), requiresScan: true },
    { id: 'settings',  icon: <SettingsIcon size={18} />, label: t('sidebar.settings') },
    { id: 'about',     icon: <InfoIcon     size={18} />, label: t('sidebar.about') },
  ];

  return (
    <div className="flex flex-col w-52 flex-shrink-0 bg-surface h-full"
      style={{ borderRight: '1px solid rgba(0,212,255,0.1)' }}>

      {/* Logo */}
      <div className="flex flex-col items-center py-6 px-4">
        <div className="relative mb-2">
          <div className="absolute inset-0 rounded-full blur-xl"
            style={{ background: 'rgba(0,212,255,0.15)' }} />
          <img src="/logo-morado-sin-fondo.png" alt="MACMCleaner"
            className="relative w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]" />
        </div>
        <span className="text-xs text-text-muted font-medium">{t('app.version')}</span>
      </div>

      {/* Neon divider */}
      <div className="neon-divider mx-3" />

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
        {items.map((item) => {
          const disabled = item.requiresScan && !scanResult;
          const active = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => !disabled && setCurrentPage(item.id)}
              disabled={disabled}
              className={[
                'relative flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left text-sm',
                'transition-all duration-150',
                active
                  ? 'text-text-primary'
                  : disabled
                    ? 'text-text-subtle cursor-not-allowed'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-hover',
              ].join(' ')}
              style={active ? {
                background: 'rgba(0,212,255,0.06)',
                boxShadow: 'inset 0 0 0 1px rgba(0,212,255,0.08)',
              } : {}}
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary"
                  style={{ boxShadow: '0 0 8px rgba(0,212,255,0.9), 0 0 20px rgba(0,212,255,0.4)' }}
                  transition={{ duration: 0.2 }}
                />
              )}
              <span className={active ? 'text-primary drop-shadow-[0_0_6px_rgba(0,212,255,0.7)]' : ''}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Neon divider */}
      <div className="neon-divider mx-3" />

      {/* Footer — author + web link */}
      <div className="px-3 pt-3 pb-4 flex flex-col gap-2">
        {/* Author credit */}
        <div className="text-center px-1">
          <p className="text-[10px] text-text-subtle mb-1 tracking-widest uppercase">Developer</p>
          <p className="text-xs font-semibold leading-tight gradient-text">
            Miguel Ángel Colorado Marin
          </p>
        </div>

        {/* Website CTA */}
        <button
          onClick={() => open('https://miguelacm.es')}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200"
          style={{
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.18)',
            color: '#00d4ff',
            textShadow: '0 0 8px rgba(0,212,255,0.5)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,212,255,0.12)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(0,212,255,0.25)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,212,255,0.06)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
          }}
        >
          <span className="text-xs font-medium tracking-wide">miguelacm.es</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" opacity={0.7}>
            <path d="M1 9L9 1M9 1H4M9 1V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
