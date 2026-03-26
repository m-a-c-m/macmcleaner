import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import { useAppStore } from './store/useAppStore';
import { useTauri } from './hooks/useTauri';
import { Layout } from './components/layout/Layout';
import { WelcomeModal } from './components/WelcomeModal';
import { TermsModal } from './components/TermsModal';

export default function App() {
  const { i18n: _i18n } = useTranslation();
  const {
    showWelcome, showTerms,
    setShowWelcome,
    setConfig, setConfigLoaded,
  } = useAppStore();
  const tauri = useTauri();

  useEffect(() => {
    tauri.loadConfig()
      .then((cfg) => {
        setConfig(cfg);
        setConfigLoaded(true);
        if (cfg.language) i18n.changeLanguage(cfg.language);
        if (cfg.first_launch || !cfg.terms_accepted) {
          setShowWelcome(true);
        }
      })
      .catch(() => {
        // No config yet — first launch
        setConfigLoaded(true);
        setShowWelcome(true);
      });
  }, []);

  if (showWelcome) return <WelcomeModal />;
  if (showTerms) return <TermsModal />;
  return <Layout />;
}
