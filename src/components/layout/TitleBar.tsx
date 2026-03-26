import { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { MinimizeIcon, MaximizeIcon, RestoreIcon, CloseIcon } from '../ui/Icons';

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const win = getCurrentWindow();

  useEffect(() => {
    win.isMaximized().then(setIsMaximized);
    const unlisten = win.onResized(async () => {
      setIsMaximized(await win.isMaximized());
    });
    return () => { unlisten.then(fn => fn()); };
  }, []);

  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between h-9 px-4 bg-surface flex-shrink-0 select-none"
      style={{ borderBottom: '1px solid rgba(0,212,255,0.15)' }}
    >
      {/* Left: logo + name */}
      <div className="flex items-center gap-2.5" data-tauri-drag-region>
        <img src="/logo-morado-sin-fondo.png" alt="M"
          className="w-5 h-5 object-contain drop-shadow-[0_0_4px_rgba(0,212,255,0.5)]" />
        <span className="text-sm font-semibold gradient-text">MACMCleaner</span>
      </div>

      {/* Right: window controls */}
      <div className="flex items-center" style={{ marginRight: '-8px' }}>
        <button
          onClick={() => win.minimize()}
          className="w-10 h-9 flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface-hover transition-colors"
          title="Minimizar"
        >
          <MinimizeIcon />
        </button>
        <button
          onClick={() => win.toggleMaximize()}
          className="w-10 h-9 flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface-hover transition-colors"
          title={isMaximized ? 'Restaurar' : 'Maximizar'}
        >
          {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
        </button>
        <button
          onClick={() => win.close()}
          className="w-10 h-9 flex items-center justify-center text-text-muted hover:text-white hover:bg-danger transition-colors"
          title="Cerrar"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
