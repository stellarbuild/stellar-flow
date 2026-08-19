import { useState } from 'react';
import { ArrowRight, Copy, Check, Terminal } from 'lucide-react';
import { ARCHITECTURAL_PATTERNS } from '../data/patterns';
import { CodeBlock } from '../components/CodeBlock';
import type { NavTab } from '../components/Navbar';

interface PhilosophyPageProps {
  onNavigate: (tab: NavTab) => void;
}

export function PhilosophyPage({ onNavigate }: PhilosophyPageProps) {
  const [selectedPatternId, setSelectedPatternId] = useState(ARCHITECTURAL_PATTERNS[0].id);
  const [copied, setCopied] = useState(false);

  const currentPattern =
    ARCHITECTURAL_PATTERNS.find((p) => p.id === selectedPatternId) ||
    ARCHITECTURAL_PATTERNS[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentPattern.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="anim-fade-in">
      {/* ============================================================
          HEADER (Chapter 02 - Architectural Patterns)
          ============================================================ */}
      <section className="container-swiss" style={{ paddingTop: 80, paddingBottom: 40 }}>
        <div style={{ maxWidth: 800 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span className="status-square" />
            <span className="font-label-caps" style={{ color: 'var(--c-accent)' }}>
              CHAPTER 02
            </span>
          </div>

          <h1 className="font-display-xl" style={{ color: 'var(--c-ink)', marginBottom: 20 }}>
            Architectural Patterns
          </h1>

          <p className="font-body-lg" style={{ color: 'var(--c-ink-dim)', lineHeight: '28px' }}>
            Core interaction models and structural methodologies for high-performance decentralized
            systems. These patterns optimize for state locality, determinism, and minimal compute overhead.
          </p>
        </div>
      </section>

      {/* ============================================================
          PATTERN SELECTOR TABS (Swiss Minimalist Bar)
          ============================================================ */}
      <section style={{ borderTop: '1px solid var(--c-stroke)', borderBottom: '1px solid var(--c-stroke)', backgroundColor: 'var(--c-surface-dim)' }}>
        <div className="container-swiss" style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
          {ARCHITECTURAL_PATTERNS.map((p) => {
            const isSelected = p.id === selectedPatternId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPatternId(p.id)}
                style={{
                  background: isSelected ? 'var(--c-surface)' : 'transparent',
                  border: 'none',
                  borderRight: '1px solid var(--c-stroke)',
                  borderLeft: isSelected ? '1px solid var(--c-stroke)' : 'none',
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderTop: isSelected ? '2px solid var(--c-accent)' : '2px solid transparent',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                <span
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isSelected ? 'var(--c-accent)' : 'var(--c-outline)'
                  }}
                >
                  PATTERN {p.number}
                </span>
                <span
                  className="font-body-md"
                  style={{
                    fontWeight: 600,
                    color: isSelected ? 'var(--c-ink)' : 'var(--c-ink-dim)'
                  }}
                >
                  {p.title}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          PATTERN DETAILS & CODE VIEWER (Zip 5)
          ============================================================ */}
      <section className="container-swiss section-gap">
        <div className="grid-12">
          {/* Left Column: Pattern Description & Benchmarks */}
          <div style={{ gridColumn: 'span 5' }} className="anim-slide-up">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div>
                <span className="font-label-caps" style={{ color: 'var(--c-accent)' }}>
                  PATTERN {currentPattern.number}
                </span>
                <h2
                  className="font-headline-lg"
                  style={{ color: 'var(--c-ink)', marginTop: 8, marginBottom: 16 }}
                >
                  {currentPattern.title}
                </h2>
                <p className="font-body-md" style={{ color: 'var(--c-ink-dim)', lineHeight: '24px' }}>
                  {currentPattern.summary}
                </p>
              </div>

              {/* Benchmark Telemetry Box */}
              <div
                className="swiss-card swiss-card-accent-edge"
                style={{ backgroundColor: 'var(--c-surface-dim)', padding: 24 }}
              >
                <div style={{ marginBottom: 16 }}>
                  <span className="font-label-caps" style={{ color: 'var(--c-ink-dim)' }}>
                    PERFORMANCE TELEMETRY
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-stroke)', paddingBottom: 10 }}>
                    <span className="font-body-sm" style={{ color: 'var(--c-ink-dim)' }}>Compute Overhead</span>
                    <span className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-accent)' }}>
                      {currentPattern.computeOverhead}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-stroke)', paddingBottom: 10 }}>
                    <span className="font-body-sm" style={{ color: 'var(--c-ink-dim)' }}>Latency Impact</span>
                    <span className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-ink)' }}>
                      {currentPattern.latencyImpact}
                    </span>
                  </div>
                </div>
              </div>

              {/* Before vs After Paradigm */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ padding: 16, borderLeft: '2px solid var(--c-error)', backgroundColor: 'var(--c-surface-dim)' }}>
                  <span className="font-label-caps" style={{ color: 'var(--c-error)', marginBottom: 4, display: 'block' }}>
                    BEFORE (CONVENTIONAL)
                  </span>
                  <p className="font-body-sm" style={{ color: 'var(--c-ink-dim)' }}>
                    {currentPattern.beforeDesc}
                  </p>
                </div>
                <div style={{ padding: 16, borderLeft: '2px solid var(--c-accent)', backgroundColor: 'var(--c-surface-dim)' }}>
                  <span className="font-label-caps" style={{ color: 'var(--c-accent)', marginBottom: 4, display: 'block' }}>
                    AFTER (STELLAR FLOW)
                  </span>
                  <p className="font-body-sm" style={{ color: 'var(--c-ink)' }}>
                    {currentPattern.afterDesc}
                  </p>
                </div>
              </div>

              {/* Action Trigger: Try in Playground */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => onNavigate('systems')}
                  className="btn-swiss-primary"
                  style={{ width: '100%' }}
                >
                  <Terminal size={16} />
                  <span>Send to Sequence Compiler</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Code Snippets (Rust Soroban + Stellar Flow) */}
          <div style={{ gridColumn: 'span 7' }} className="anim-slide-up stagger-1">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Rust Soroban Implementation */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="status-square" />
                    <span className="font-label-caps" style={{ color: 'var(--c-ink)' }}>
                      SOROBAN SMART CONTRACT (RUST)
                    </span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="btn-swiss-secondary btn-swiss-sm"
                    style={{ padding: '4px 10px', fontSize: 11 }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'COPIED' : 'COPY RUST'}</span>
                  </button>
                </div>
                <CodeBlock
                  code={currentPattern.code}
                  language="rust"
                  filename={`${currentPattern.id}.rs`}
                  showLineNumbers
                />
              </div>

              {/* Stellar Flow Builder Equivalent */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span className="status-square" style={{ backgroundColor: 'var(--c-accent)' }} />
                  <span className="font-label-caps" style={{ color: 'var(--c-accent)' }}>
                    STELLAR FLOW TS EQUIVALENT
                  </span>
                </div>
                <CodeBlock
                  code={currentPattern.stellarFlowEquivalent}
                  language="typescript"
                  filename="client_invocation.ts"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
