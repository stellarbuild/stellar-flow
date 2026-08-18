import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Zap, Shield, Layers, Link2, Code2, Terminal,
  ArrowRight, Copy, Check, ChevronRight, Play, FileCode,
  Globe, Package, BookOpen, ExternalLink, Rocket, Settings2, Database
} from 'lucide-react';
import './index.css';

/* ================================================================
   STELLAR FLOW — INTERACTIVE PLAYGROUND
   A premium landing page, documentation, and live playground
   ================================================================ */

// ─── Navbar ─────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <a href="#" className="nav-logo">
          <div className="nav-logo-icon">✦</div>
          stellar-flow
        </a>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#quickstart">Quick Start</a></li>
          <li><a href="#playground">Playground</a></li>
          <li><a href="#operations">API</a></li>
          <li>
            <a href="https://github.com/stellarbuild/stellar-flow"
               className="nav-cta" target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} /> GitHub
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

// ─── Hero Section ───────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-badge">
          <span className="badge-dot" />
          v0.4.0 — Now with Soroban Smart Contracts
        </div>

        <h1>
          Build Stellar Transactions<br />
          <span className="gradient">With Confidence</span>
        </h1>

        <p className="hero-desc">
          A fluent, type-safe TypeScript SDK that turns verbose Stellar transaction
          assembly into clean, chainable one-liners. Validate early, ship faster.
        </p>

        <div className="hero-actions">
          <a href="#playground" className="btn btn-primary">
            <Rocket size={16} /> Try the Playground
          </a>
          <a href="#quickstart" className="btn btn-ghost">
            <BookOpen size={16} /> Read the Docs
          </a>
        </div>

        <div className="hero-code">
          <div className="code-window">
            <div className="code-window-bar">
              <span className="code-window-dot red" />
              <span className="code-window-dot yellow" />
              <span className="code-window-dot green" />
              <span className="code-window-title">payment.ts</span>
            </div>
            <pre>
              <span className="kw">import</span> {'{ '}
              <span className="type">TxBuilder</span>
              {' }'} <span className="kw">from</span>{' '}
              <span className="str">'@stellarbuild/stellar-flow'</span>;{'\n\n'}
              <span className="cm">// Build → Sign → Submit in one fluent chain</span>{'\n'}
              <span className="kw">const</span> result <span className="op">=</span>{' '}
              <span className="kw">await</span>{' '}
              <span className="type">TxBuilder</span>
              .<span className="fn">for</span>(keypair, {'{ '}network:{' '}
              <span className="str">'mainnet'</span>
              {' }'}){'\n'}
              {'  '}.<span className="fn">addPayment</span>({'{ '}
              {'\n'}
              {'    '}destination: <span className="str">'GDQP2KPQ...'</span>,{'\n'}
              {'    '}amount:{'      '}
              <span className="str">'100'</span>,{'\n'}
              {'    '}asset:{'       '}
              <span className="str">'XLM'</span>{'\n'}
              {'  '}
              {'}'}){'\n'}
              {'  '}.<span className="fn">build</span>();{'\n\n'}
              result.<span className="fn">sign</span>(keypair);{'\n'}
              <span className="kw">await</span> result.<span className="fn">submit</span>();{'  '}
              <span className="cm">// ✅ Done</span>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features Section ───────────────────────────────────────────
const FEATURES = [
  {
    icon: <Link2 size={22} />,
    color: 'indigo',
    title: 'Fluent Chainable API',
    desc: 'Chain operations naturally with .addPayment(), .setMemo(), and .build(). No boilerplate, no ceremony.'
  },
  {
    icon: <Shield size={22} />,
    color: 'emerald',
    title: 'Eager Validation',
    desc: 'Every input is validated the moment you call it — before any network request. Catch mistakes instantly in development.'
  },
  {
    icon: <Code2 size={22} />,
    color: 'cyan',
    title: 'Full TypeScript',
    desc: 'Strict generics, discriminated unions, and zero "any" types. Your IDE autocompletes every field and parameter.'
  },
  {
    icon: <Layers size={22} />,
    color: 'purple',
    title: 'Multi-Operation Batching',
    desc: 'Compose multiple operations into a single atomic transaction. Payments, trustlines, offers — all in one XDR.'
  },
  {
    icon: <Sparkles size={22} />,
    color: 'pink',
    title: 'Soroban Smart Contracts',
    desc: 'Invoke Soroban contracts with type-safe ScVal builders. Automatic RPC simulation handles fees and footprints.'
  },
  {
    icon: <Zap size={22} />,
    color: 'blue',
    title: 'Lightweight & Transparent',
    desc: 'Zero runtime dependencies beyond the Stellar SDK. No hidden magic — everything compiles to standard SDK calls.'
  },
];

function FeaturesSection() {
  return (
    <section className="section" id="features">
      <div className="container">
        <div className="section-label"><span className="dot" /> Features</div>
        <h2 className="section-title">Everything you need to build on Stellar</h2>
        <p className="section-subtitle">
          stellar-flow wraps the official Stellar SDK in an ergonomic builder pattern
          that eliminates boilerplate while keeping you in full control.
        </p>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className={`feature-card anim-fade-up anim-delay-${i + 1}`} key={i}>
              <div className={`feature-icon ${f.color}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works Section ───────────────────────────────────────
const PIPELINE_STEPS = [
  {
    title: 'Configure',
    desc: 'Create a builder instance with your keypair and target network. The builder resolves the correct Horizon URL and network passphrase automatically.',
    code: 'TxBuilder.for(keypair, { network: \'testnet\' })'
  },
  {
    title: 'Declare Operations',
    desc: 'Chain one or more operations. Each method validates its inputs immediately and returns the builder for fluent chaining.',
    code: '.addPayment({ destination, amount, asset })'
  },
  {
    title: 'Build',
    desc: 'The async build() method loads your account from Horizon, assembles the transaction with the correct sequence number, and returns a signable Transaction object.',
    code: 'const tx = await builder.build()'
  },
  {
    title: 'Sign & Submit',
    desc: 'Sign with one or more keypairs, then submit to the Stellar network. The full lifecycle in four readable steps.',
    code: 'tx.sign(keypair); await tx.submit()'
  },
];

function HowItWorksSection() {
  return (
    <section className="section" id="how-it-works" style={{ background: 'rgba(0,0,0,0.15)' }}>
      <div className="container">
        <div className="section-label"><span className="dot" /> Architecture</div>
        <h2 className="section-title">How it works</h2>
        <p className="section-subtitle">
          A clear four-stage pipeline: configure, declare, build, submit. Each stage
          validates its inputs eagerly so errors never reach the network.
        </p>
        <div className="pipeline">
          {PIPELINE_STEPS.map((step, i) => (
            <div className="pipeline-step" key={i}>
              <div className="pipeline-num">{i + 1}</div>
              <div className="pipeline-content">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                <code>{step.code}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Quick Start Section ────────────────────────────────────────
function CopyableCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="install-cmd" onClick={handleCopy}>
      <div>
        <span className="prefix">$ </span>{command}
      </div>
      <button className="copy-btn" title="Copy to clipboard">
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}

function QuickStartSection() {
  return (
    <section className="section" id="quickstart">
      <div className="container">
        <div className="section-label"><span className="dot" /> Quick Start</div>
        <h2 className="section-title">Up and running in 60 seconds</h2>
        <p className="section-subtitle">
          Install from npm, import the builder, and start assembling transactions. No setup, no configuration files.
        </p>

        <div className="install-block">
          <div className="install-card">
            <h3><Package size={16} /> Install</h3>
            <CopyableCommand command="npm install @stellarbuild/stellar-flow" />
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--c-text-dim)' }}>
              Requires <code style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-accent-3)' }}>@stellar/stellar-sdk ≥ 12.x</code> as a peer dependency.
            </p>
          </div>

          <div className="install-card">
            <h3><Terminal size={16} /> Basic Usage</h3>
            <div className="output-code" style={{ fontSize: 13 }}>
              <span style={{ color: '#c084fc' }}>import</span>{' { '}
              <span style={{ color: '#67e8f9' }}>TxBuilder</span>
              {' } '}<span style={{ color: '#c084fc' }}>from</span>{' '}
              <span style={{ color: '#34d399' }}>'@stellarbuild/stellar-flow'</span>;{'\n\n'}
              <span style={{ color: '#c084fc' }}>const</span> tx = <span style={{ color: '#c084fc' }}>await</span>{' '}
              <span style={{ color: '#67e8f9' }}>TxBuilder</span>
              .<span style={{ color: '#818cf8' }}>for</span>(keypair, {'{ '}network:{' '}
              <span style={{ color: '#34d399' }}>'testnet'</span>
              {' }'}){'\n'}
              {'  '}.<span style={{ color: '#818cf8' }}>addPayment</span>({'{ '}destination, amount:{' '}
              <span style={{ color: '#34d399' }}>'50'</span>, asset:{' '}
              <span style={{ color: '#34d399' }}>'XLM'</span>
              {' }'}){'\n'}
              {'  '}.<span style={{ color: '#818cf8' }}>build</span>();
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Interactive Playground ─────────────────────────────────────
type OperationType = 'payment' | 'createAccount' | 'changeTrust';

function PlaygroundSection() {
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const [opType, setOpType] = useState<OperationType>('payment');
  const [destination, setDestination] = useState('GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOORAT7GMPMP7VHDQ');
  const [amount, setAmount] = useState('100');
  const [asset, setAsset] = useState('XLM');
  const [startingBalance, setStartingBalance] = useState('50');
  const [assetCode, setAssetCode] = useState('USDC');
  const [assetIssuer, setAssetIssuer] = useState('GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN');

  const [activeTab, setActiveTab] = useState<'xdr' | 'code'>('code');
  const [error, setError] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);

  const generateCode = useCallback(() => {
    if (opType === 'payment') {
      const assetParam = asset === 'XLM'
        ? `'XLM'`
        : `{ code: '${asset}', issuer: '...' }`;
      return `import { TxBuilder } from '@stellarbuild/stellar-flow';
import { Keypair } from '@stellar/stellar-sdk';

const keypair = Keypair.fromSecret('S...');

const tx = await TxBuilder.for(keypair, { network: '${network}' })
  .addPayment({
    destination: '${destination}',
    amount: '${amount}',
    asset: ${assetParam}
  })
  .build();

tx.sign(keypair);
await tx.submit();`;
    }

    if (opType === 'createAccount') {
      return `import { TxBuilder } from '@stellarbuild/stellar-flow';
import { Keypair } from '@stellar/stellar-sdk';

const keypair = Keypair.fromSecret('S...');

const tx = await TxBuilder.for(keypair, { network: '${network}' })
  .addCreateAccount({
    destination: '${destination}',
    startingBalance: '${startingBalance}'
  })
  .build();

tx.sign(keypair);
await tx.submit();`;
    }

    // changeTrust
    return `import { TxBuilder } from '@stellarbuild/stellar-flow';
import { Keypair } from '@stellar/stellar-sdk';

const keypair = Keypair.fromSecret('S...');

const tx = await TxBuilder.for(keypair, { network: '${network}' })
  .addChangeTrust({
    asset: {
      code: '${assetCode}',
      issuer: '${assetIssuer}'
    }
  })
  .build();

tx.sign(keypair);
await tx.submit();`;
  }, [opType, network, destination, amount, asset, startingBalance, assetCode, assetIssuer]);

  const handleBuild = async () => {
    setIsBuilding(true);
    setError('');

    // Simulate a build attempt
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // Validate inputs
      if (opType === 'payment' || opType === 'createAccount') {
        if (!destination.startsWith('G') || destination.length !== 56) {
          throw new Error(`Invalid Stellar address: must start with 'G' and be 56 characters. Got ${destination.length} characters.`);
        }
      }
      if (opType === 'payment' && (isNaN(Number(amount)) || Number(amount) <= 0)) {
        throw new Error(`Invalid amount: must be a positive number. Got '${amount}'.`);
      }
      if (opType === 'createAccount' && Number(startingBalance) < 1) {
        throw new Error(`Starting balance must be at least 1 XLM for account creation.`);
      }

      setActiveTab('code');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsBuilding(false);
    }
  };

  const renderForm = () => {
    switch (opType) {
      case 'payment':
        return (
          <>
            <div className="form-group">
              <label>Destination Address</label>
              <input
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="G..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="100"
                />
              </div>
              <div className="form-group">
                <label>Asset</label>
                <select value={asset} onChange={e => setAsset(e.target.value)}>
                  <option value="XLM">XLM (Native)</option>
                  <option value="USDC">USDC</option>
                  <option value="yXLM">yXLM</option>
                </select>
              </div>
            </div>
          </>
        );
      case 'createAccount':
        return (
          <>
            <div className="form-group">
              <label>New Account Address</label>
              <input
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="G..."
              />
            </div>
            <div className="form-group">
              <label>Starting Balance (XLM)</label>
              <input
                type="number"
                value={startingBalance}
                onChange={e => setStartingBalance(e.target.value)}
                placeholder="50"
              />
            </div>
          </>
        );
      case 'changeTrust':
        return (
          <>
            <div className="form-group">
              <label>Asset Code</label>
              <input
                value={assetCode}
                onChange={e => setAssetCode(e.target.value)}
                placeholder="USDC"
              />
            </div>
            <div className="form-group">
              <label>Asset Issuer</label>
              <input
                value={assetIssuer}
                onChange={e => setAssetIssuer(e.target.value)}
                placeholder="G..."
              />
            </div>
          </>
        );
    }
  };

  return (
    <section className="section" id="playground" style={{ background: 'rgba(0,0,0,0.15)' }}>
      <div className="container">
        <div className="section-label"><span className="dot" /> Interactive</div>
        <h2 className="section-title">Live Playground</h2>
        <p className="section-subtitle">
          Configure a transaction visually. See the generated TypeScript code
          update in real time as you adjust parameters.
        </p>

        <div className="playground-grid">
          {/* Builder Panel */}
          <div className="playground-panel">
            <h3>
              <span className="icon" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--c-accent-1)' }}>
                <Settings2 size={16} />
              </span>
              Transaction Builder
            </h3>

            <div className="form-group">
              <label>Network</label>
              <select value={network} onChange={e => setNetwork(e.target.value as 'testnet' | 'mainnet')}>
                <option value="testnet">Testnet</option>
                <option value="mainnet">Mainnet (Public)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Operation Type</label>
              <select value={opType} onChange={e => setOpType(e.target.value as OperationType)}>
                <option value="payment">Payment</option>
                <option value="createAccount">Create Account</option>
                <option value="changeTrust">Change Trust</option>
              </select>
            </div>

            <div style={{ height: 1, background: 'var(--c-border)', margin: '20px 0' }} />

            {renderForm()}

            <button className={`build-btn ${isBuilding ? 'building' : ''}`} onClick={handleBuild}>
              {isBuilding ? (
                <><span className="spinner" /> Validating...</>
              ) : (
                <><Play size={15} /> Validate & Preview</>
              )}
            </button>
          </div>

          {/* Output Panel */}
          <div className="playground-panel">
            <h3>
              <span className="icon" style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--c-accent-5)' }}>
                <FileCode size={16} />
              </span>
              Output
              {!error && <span className="status-pill success" style={{ marginLeft: 'auto', fontSize: 11 }}>
                <Check size={10} /> Ready
              </span>}
            </h3>

            <div className="output-tabs">
              <button
                className={`output-tab ${activeTab === 'code' ? 'active' : ''}`}
                onClick={() => setActiveTab('code')}
              >
                TypeScript Code
              </button>
              <button
                className={`output-tab ${activeTab === 'xdr' ? 'active' : ''}`}
                onClick={() => setActiveTab('xdr')}
              >
                XDR Preview
              </button>
            </div>

            {error ? (
              <div className="output-code output-error">
                ❌ Validation Error{'\n\n'}{error}
              </div>
            ) : activeTab === 'code' ? (
              <div className="output-code">
                {generateCode()}
              </div>
            ) : (
              <div className="output-code output-xdr">
                <span style={{ color: 'var(--c-text-dim)' }}>
                  {'// XDR generation requires a funded account on the network.\n'}
                  {'// Use the TypeScript code tab to copy the snippet,\n'}
                  {'// then run it in your project to produce live XDR.\n\n'}
                </span>
                {'AAAAAgAAAAD...  (base64-encoded XDR)\n\n'}
                <span style={{ color: 'var(--c-text-dim)' }}>
                  {'// Tip: Paste the output into\n'}
                  {'// '}
                </span>
                <span style={{ color: 'var(--c-accent-3)' }}>
                  {'https://laboratory.stellar.org/#xdr-viewer'}
                </span>
                <span style={{ color: 'var(--c-text-dim)' }}>
                  {'\n// to inspect the full transaction envelope.'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Operations Reference Section ───────────────────────────────
const OPERATIONS = [
  { name: '.addPayment()', stellar: 'Payment', desc: 'Send XLM or custom assets to any Stellar account.' },
  { name: '.addCreateAccount()', stellar: 'CreateAccount', desc: 'Fund and create a new account on the ledger.' },
  { name: '.addChangeTrust()', stellar: 'ChangeTrust', desc: 'Establish or remove a trustline for custom assets.' },
  { name: '.addManageOffer()', stellar: 'ManageSellOffer', desc: 'Place, update, or cancel sell orders on the DEX.' },
  { name: '.addManageBuyOffer()', stellar: 'ManageBuyOffer', desc: 'Place, update, or cancel buy orders on the DEX.' },
  { name: '.addPathPayment()', stellar: 'PathPaymentStrictSend', desc: 'Cross-asset payments routed through the DEX.' },
  { name: '.addSetOptions()', stellar: 'SetOptions', desc: 'Configure signers, thresholds, and home domain.' },
  { name: '.addManageData()', stellar: 'ManageData', desc: 'Store or remove key-value data entries on-chain.' },
  { name: '.invokeContract()', stellar: 'InvokeHostFunction', desc: 'Call Soroban smart contracts with typed ScVal args.' },
];

function OperationsSection() {
  return (
    <section className="section" id="operations">
      <div className="container">
        <div className="section-label"><span className="dot" /> API Reference</div>
        <h2 className="section-title">Supported Operations</h2>
        <p className="section-subtitle">
          Every Stellar operation you need, wrapped in a clean builder method with
          full input validation and TypeScript intellisense.
        </p>
        <div className="ops-grid">
          {OPERATIONS.map((op, i) => (
            <div className="op-card" key={i}>
              <div className="op-name">{op.name}</div>
              <div className="op-stellar">↳ {op.stellar}</div>
              <div className="op-desc">{op.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>© {new Date().getFullYear()} stellarbuild — MIT License</p>
        <ul className="footer-links">
          <li><a href="https://github.com/stellarbuild/stellar-flow" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          <li><a href="https://www.npmjs.com/package/@stellarbuild/stellar-flow" target="_blank" rel="noopener noreferrer">npm</a></li>
          <li><a href="https://stellar.org" target="_blank" rel="noopener noreferrer">Stellar</a></li>
        </ul>
      </div>
    </footer>
  );
}

// ─── App Entrypoint ─────────────────────────────────────────────
export default function App() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <div className="section-divider" />
      <FeaturesSection />
      <HowItWorksSection />
      <QuickStartSection />
      <PlaygroundSection />
      <OperationsSection />
      <Footer />
    </>
  );
}
