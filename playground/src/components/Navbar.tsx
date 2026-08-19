import { Moon, Sun, Terminal, Code2 } from 'lucide-react';
import { AnimatedCrosshair } from './AnimatedCrosshair';

export type NavTab = 'overview' | 'philosophy' | 'systems' | 'archive';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Navbar({ activeTab, onSelectTab, theme, onToggleTheme }: NavbarProps) {
  const tabs: { id: NavTab; label: string; number: string }[] = [
    { id: 'overview', label: 'Overview', number: '01' },
    { id: 'philosophy', label: 'Philosophy', number: '02' },
    { id: 'systems', label: 'Systems', number: '03' },
    { id: 'archive', label: 'Archive', number: '04' }
  ];

  return (
    <header className="swiss-header">
      <div className="container-swiss header-inner">
        {/* Brand */}
        <div className="brand-section" onClick={() => onSelectTab('overview')}>
          <div className="brand-logo-glyph">
            <AnimatedCrosshair size={22} />
          </div>
          <div>
            <span className="brand-title">Stellar Flow</span>
          </div>
          <span className="brand-badge">AXIOM v0.4</span>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links-row">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelectTab(tab.id)}
              >
                <span
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    color: isActive ? 'var(--c-accent)' : 'var(--c-outline)'
                  }}
                >
                  {tab.number}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="header-right-actions">
          {/* Network Indicator */}
          <div className="network-pill">
            <span className="network-dot" />
            <span>TESTNET 2.4.1</span>
          </div>

          {/* Quick TX Terminal Trigger */}
          <button
            className="btn-swiss-primary btn-swiss-sm"
            onClick={() => onSelectTab('systems')}
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            <Terminal size={14} />
            <span>COMPILE TX</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'light' ? 'Midnight Tech Dark' : 'Axiom Precision Light'}`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com/stellarbuild/stellar-tx-builder"
            target="_blank"
            rel="noopener noreferrer"
            className="theme-toggle-btn"
            title="GitHub Repository"
            aria-label="GitHub Repository"
          >
            <Code2 size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}
