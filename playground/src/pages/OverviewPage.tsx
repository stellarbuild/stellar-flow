import { useState } from 'react';
import { ArrowRight, ShieldCheck, Zap, Feather, Check, Copy, Terminal } from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';
import type { NavTab } from '../components/Navbar';

interface OverviewPageProps {
  onNavigate: (tab: NavTab) => void;
}

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const [copiedInstall, setCopiedInstall] = useState(false);

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('npm install @stellarbuild/stellar-flow');
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const traditionalSdkCode = `const client = new Client();
client.setOptions({ timeout: 5000 });
client.authenticate('token');

const req = client.createRequest('GET', '/users');
req.setQuery({ limit: 10 });

client.execute(req)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));`;

  const stellarFlowCode = `// Minimalist, fluent, type-safe
await flow
  .users()
  .limit(10)
  .timeout(5000)
  .fetch();`;

  return (
    <div className="anim-fade-in">
      {/* ============================================================
          HERO SECTION (Zip 4)
          ============================================================ */}
      <section className="container-swiss" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="grid-12" style={{ alignItems: 'flex-start' }}>
          {/* Left Column: Headline & Value Proposition */}
          <div style={{ gridColumn: 'span 7' }} className="anim-slide-up stagger-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <span className="status-square" />
              <span className="font-label-caps" style={{ color: 'var(--c-accent)' }}>
                AXIOM PRECISION PROTOCOL
              </span>
            </div>

            <h1 className="font-display-xl" style={{ color: 'var(--c-ink)', marginBottom: 24 }}>
              The Fluent Way to Build.
            </h1>

            <p
              className="font-body-lg"
              style={{ color: 'var(--c-ink-dim)', maxWidth: 540, marginBottom: 40 }}
            >
              Precision engineered for scale. Eliminate boilerplate, guarantee compile-time safety,
              and construct atomic Stellar transactions with surgical velocity.
            </p>

            {/* Install Bar */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid var(--c-stroke)',
                backgroundColor: 'var(--c-surface-dim)',
                borderRadius: 'var(--r-sm)',
                marginBottom: 32,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  borderRight: '1px solid var(--c-stroke)',
                  color: 'var(--c-accent)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Terminal size={16} />
              </div>
              <code
                className="font-mono"
                style={{
                  padding: '10px 16px',
                  fontSize: 13,
                  color: 'var(--c-ink)'
                }}
              >
                npm install @stellarbuild/stellar-flow
              </code>
              <button
                onClick={handleCopyInstall}
                style={{
                  background: 'none',
                  border: 'none',
                  borderLeft: '1px solid var(--c-stroke)',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  color: 'var(--c-ink-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
                title="Copy install command"
              >
                {copiedInstall ? (
                  <Check size={14} style={{ color: 'var(--c-accent)' }} />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                onClick={() => onNavigate('systems')}
                className="btn-swiss-primary"
              >
                <span>Launch Sequence Compiler</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => onNavigate('philosophy')}
                className="btn-swiss-secondary"
              >
                <span>Explore Patterns</span>
              </button>
            </div>
          </div>

          {/* Right Column: Key Spec Telemetry */}
          <div style={{ gridColumn: 'span 5' }} className="anim-slide-up stagger-2">
            <div
              className="swiss-card swiss-card-accent-edge"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                backgroundColor: 'var(--c-surface-dim)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-stroke)', paddingBottom: 16 }}>
                <span className="font-label-caps" style={{ color: 'var(--c-ink-dim)' }}>
                  SPECIFICATION
                </span>
                <span className="font-mono" style={{ fontSize: 12, color: 'var(--c-accent)', fontWeight: 700 }}>
                  v0.4.0-PROD
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <div className="font-mono" style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-ink)' }}>
                    &lt; 3.8 kB
                  </div>
                  <div className="font-body-sm" style={{ color: 'var(--c-ink-dim)', marginTop: 4 }}>
                    Zero-Dependency Weight
                  </div>
                </div>
                <div>
                  <div className="font-mono" style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-accent)' }}>
                    100%
                  </div>
                  <div className="font-body-sm" style={{ color: 'var(--c-ink-dim)', marginTop: 4 }}>
                    Type Safety Coverage
                  </div>
                </div>
                <div>
                  <div className="font-mono" style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-ink)' }}>
                    12+
                  </div>
                  <div className="font-body-sm" style={{ color: 'var(--c-ink-dim)', marginTop: 4 }}>
                    Supported Stellar Ops
                  </div>
                </div>
                <div>
                  <div className="font-mono" style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-ink)' }}>
                    0.0 ms
                  </div>
                  <div className="font-body-sm" style={{ color: 'var(--c-ink-dim)', marginTop: 4 }}>
                    Runtime Abstraction Penalty
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SIDE-BY-SIDE CODE COMPARISON (Zip 4)
          ============================================================ */}
      <section style={{ borderTop: '1px solid var(--c-stroke)', borderBottom: '1px solid var(--c-stroke)', backgroundColor: 'var(--c-surface-dim)', padding: '80px 0' }}>
        <div className="container-swiss">
          <div style={{ marginBottom: 40, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="status-square" />
              <span className="font-label-caps" style={{ color: 'var(--c-ink-dim)' }}>
                PARADIGM SHIFT
              </span>
            </div>
            <h2 className="font-headline-lg" style={{ color: 'var(--c-ink)' }}>
              Side-by-Side Comparison
            </h2>
            <p className="font-body-md" style={{ color: 'var(--c-ink-dim)', maxWidth: 600, marginTop: 8 }}>
              Observe the dramatic reduction in syntactic overhead and state management complexity.
            </p>
          </div>

          <div className="grid-12">
            {/* Verbose Traditional SDK */}
            <div style={{ gridColumn: 'span 6' }}>
              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="font-label-caps" style={{ color: 'var(--c-error)' }}>
                  TRADITIONAL VERBOSE SDK
                </span>
                <span className="badge-swiss badge-error">High Friction</span>
              </div>
              <CodeBlock code={traditionalSdkCode} language="typescript" filename="traditional_sdk.ts" />
            </div>

            {/* Stellar Flow Fluent */}
            <div style={{ gridColumn: 'span 6' }}>
              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="font-label-caps" style={{ color: 'var(--c-accent)' }}>
                  STELLAR FLOW FLUENT API
                </span>
                <span className="badge-swiss badge-success">Optimized</span>
              </div>
              <CodeBlock code={stellarFlowCode} language="typescript" filename="stellar_flow.ts" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          3 CORE PILLARS (Zip 4)
          ============================================================ */}
      <section className="container-swiss section-gap">
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="status-square" />
            <span className="font-label-caps" style={{ color: 'var(--c-ink-dim)' }}>
              CORE PILLARS
            </span>
          </div>
          <h2 className="font-headline-lg" style={{ color: 'var(--c-ink)' }}>
            Engineered for Precision & Speed
          </h2>
        </div>

        <div className="grid-12">
          {/* Pillar 1 */}
          <div style={{ gridColumn: 'span 4' }} className="swiss-card">
            <div
              style={{
                width: 40,
                height: 40,
                border: '1px solid var(--c-stroke)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--c-accent)',
                marginBottom: 24,
                backgroundColor: 'var(--c-surface-dim)'
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-headline-md" style={{ color: 'var(--c-ink)', marginBottom: 12 }}>
              Type-Safe by Default
            </h3>
            <p className="font-body-md" style={{ color: 'var(--c-ink-dim)' }}>
              End-to-end type safety guarantees that your operations, keypairs, and Soroban arguments
              are fully validated at compile time, eliminating runtime crashes.
            </p>
          </div>

          {/* Pillar 2 */}
          <div style={{ gridColumn: 'span 4' }} className="swiss-card">
            <div
              style={{
                width: 40,
                height: 40,
                border: '1px solid var(--c-stroke)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--c-accent)',
                marginBottom: 24,
                backgroundColor: 'var(--c-surface-dim)'
              }}
            >
              <Zap size={22} />
            </div>
            <h3 className="font-headline-md" style={{ color: 'var(--c-ink)', marginBottom: 12 }}>
              Fluent API
            </h3>
            <p className="font-body-md" style={{ color: 'var(--c-ink-dim)' }}>
              Chainable builder methods create self-documenting syntax that reads like natural
              language while automatically sequencing operations and memos.
            </p>
          </div>

          {/* Pillar 3 */}
          <div style={{ gridColumn: 'span 4' }} className="swiss-card">
            <div
              style={{
                width: 40,
                height: 40,
                border: '1px solid var(--c-stroke)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--c-accent)',
                marginBottom: 24,
                backgroundColor: 'var(--c-surface-dim)'
              }}
            >
              <Feather size={22} />
            </div>
            <h3 className="font-headline-md" style={{ color: 'var(--c-ink)', marginBottom: 12 }}>
              Zero-Dependency Lightweight
            </h3>
            <p className="font-body-md" style={{ color: 'var(--c-ink-dim)' }}>
              Engineered to add less than 4kb to your bundle footprint. Maximizes frontend execution
              and cold boot times without sacrificing utility.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
