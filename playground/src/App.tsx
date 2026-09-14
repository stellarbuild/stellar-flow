import { useState, useEffect, useCallback } from 'react';
import './index.css';
import { Navbar, type NavTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { OverviewPage } from './pages/OverviewPage';
import { PhilosophyPage } from './pages/PhilosophyPage';
import { SystemsPage } from './pages/SystemsPage';
import { ArchivePage } from './pages/ArchivePage';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load saved theme or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('sf_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('sf_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      return nextTheme;
    });
  }, []);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavTab;
      if (['overview', 'philosophy', 'systems', 'archive'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = useCallback((tab: NavTab) => {
    window.location.hash = tab;
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleNavigate}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main style={{ flex: 1 }} key={activeTab}>
        {activeTab === 'overview' && <OverviewPage onNavigate={handleNavigate} />}
        {activeTab === 'philosophy' && <PhilosophyPage onNavigate={handleNavigate} />}
        {activeTab === 'systems' && <SystemsPage />}
        {activeTab === 'archive' && <ArchivePage />}
      </main>

      <Footer />
    </div>
  );
}
