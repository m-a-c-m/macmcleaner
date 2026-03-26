import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { TitleBar } from './TitleBar';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/Toast';
import { Dashboard } from '../../pages/Dashboard';
import { Results } from '../../pages/Results';
import { Settings } from '../../pages/Settings';
import { About } from '../../pages/About';

const pages = {
  dashboard: <Dashboard />,
  results: <Results />,
  settings: <Settings />,
  about: <About />,
};

export function Layout() {
  const currentPage = useAppStore((s) => s.currentPage);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="h-full"
            >
              {pages[currentPage]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
