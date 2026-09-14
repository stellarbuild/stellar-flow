import { useState, useMemo } from 'react';
import { Play, Plus, Trash2, Terminal, RefreshCw } from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';

type OperationType = 'payment' | 'trustline' | 'escrow' | 'contract';

interface TxOperation {
  id: string;
  type: OperationType;
  destination: string;
  amount: string;
  asset: string;
  memo?: string;
  contractId?: string;
  functionName?: string;
}

export function SystemsPage() {
  const [sourceKey, setSourceKey] = useState('GBX6Y7C2M8P4T1V9W0Q3Z5A7K9E4ZW3J2L1M0N9P8Q7R6S5T4U3V2W1');
  const [network, setNetwork] = useState<'TESTNET' | 'PUBLIC' | 'FUTURENET'>('TESTNET');
  const [fee, setFee] = useState('100');
  const [timeoutSecs, setTimeoutSecs] = useState('30');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isCompiling, setIsCompiling] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[INIT] Sequence compiler environment ready. Protocol v2.4.1 initialized.',
    '[INFO] Network target: TESTNET (Passphrase: "Test SDF Network ; September 2015")',
    '[STANDBY] Awaiting sequence compilation triggers...'
  ]);

  const [operations, setOperations] = useState<TxOperation[]>([
    {
      id: 'op-1',
      type: 'payment',
      destination: 'GD2S7G7Y2KWPYH5V4N77D2N5P6K9F8K7L6M5N4P3Q2R1S0T9U8V7W6X5',
      amount: '125.50',
      asset: 'native',
      memo: 'invoice_84920'
    }
  ]);

  const handleAddOperation = (type: OperationType) => {
    const newOp: TxOperation = {
      id: `op-${Date.now()}`,
      type,
      destination: type === 'payment' ? 'GA...' : '',
      amount: '50.0',
      asset: 'native',
      contractId: type === 'contract' ? 'CA...' : undefined,
      functionName: type === 'contract' ? 'invoke_action' : undefined
    };
    setOperations([...operations, newOp]);
    if (activeStep < 12) {
      setActiveStep(operations.length + 1);
    }
  };

  const handleRemoveOperation = (id: string) => {
    if (operations.length === 1) return;
    setOperations(operations.filter((op) => op.id !== id));
  };

  const handleUpdateOperation = (id: string, updates: Partial<TxOperation>) => {
    setOperations(
      operations.map((op) => (op.id === id ? { ...op, ...updates } : op))
    );
  };

  // Compile Simulation
  const handleCompileSequence = () => {
    setIsCompiling(true);
    setTerminalLogs((prev) => [
      ...prev,
      `[BUILD] Compiling sequence of ${operations.length} atomic operations...`,
      `[SIM] Resolving source sequence for ${sourceKey.slice(0, 8)}...`,
      `[FEE] Computed base fee: ${Number(fee) * operations.length} stroops`,
      `[OK] Sequence validated. Hash: 0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
      `[READY] Transaction envelope ready for signature.`
    ]);
    setTimeout(() => {
      setIsCompiling(false);
    }, 400);
  };

  // Generate Type-Safe TypeScript Code
  const generatedCode = useMemo(() => {
    const lines = [
      `import { TxBuilder } from '@stellarbuild/stellar-flow';`,
      `import { Keypair } from '@stellar/stellar-sdk';`,
      ``,
      `// Source keypair — load from secure storage in production`,
      `const keypair = Keypair.fromSecret('S...');`,
      ``,
      `const builtTx = await TxBuilder.for(keypair, {`,
      `  network: '${network}',`,
      `  fee: '${fee}',`,
      ...(operations.some(op => op.type === 'contract')
        ? [`  sorobanUrl: 'https://soroban-testnet.stellar.org',`]
        : []),
      `})`,
    ];

    operations.forEach((op) => {
      if (op.type === 'payment') {
        lines.push(`  .addPayment({`);
        lines.push(`    destination: '${op.destination || 'G...'}',`);
        lines.push(`    amount: '${op.amount || '0'}',`);
        lines.push(
          `    asset: ${op.asset === 'native' ? `'XLM'` : `{ code: '${op.asset}', issuer: 'G_ISSUER' }`}`
        );
        lines.push(`  })`);
      } else if (op.type === 'trustline') {
        lines.push(`  .addChangeTrust({`);
        lines.push(`    asset: { code: '${op.asset || 'USDC'}', issuer: 'G_ISSUER' },`);
        lines.push(`    limit: '1000000'`);
        lines.push(`  })`);
      } else if (op.type === 'escrow') {
        lines.push(`  .addCreateAccount({`);
        lines.push(`    destination: '${op.destination || 'G...'}',`);
        lines.push(`    startingBalance: '${op.amount || '100'}'`);
        lines.push(`  })`);
      } else if (op.type === 'contract') {
        lines.push(`  .invokeContract({`);
        lines.push(`    contractId: '${op.contractId || 'C...'}',`);
        lines.push(`    functionName: '${op.functionName || 'exec'}',`);
        lines.push(`    args: []`);
        lines.push(`  })`);
      }
    });

    if (operations[0]?.memo) {
      lines.push(`  .setMemo('${operations[0].memo}')`);
    }

    lines.push(`  .setTimebounds({ maxTime: '+${timeoutSecs}s' })`);
    lines.push(`  .build();`);
    lines.push(``);
    lines.push(`// Sign & submit to Horizon`);
    lines.push(`const result = await builtTx.sign(keypair).submit();`);
    lines.push(`console.log('Tx Hash:', result.hash);`);

    return lines.join('\n');
  }, [sourceKey, network, fee, timeoutSecs, operations]);

  return (
    <div className="anim-fade-in">
      {/* ============================================================
          HEADER (Zip 6 - Protocol Configuration / System Operations)
          ============================================================ */}
      <section className="container-swiss" style={{ paddingTop: 60, paddingBottom: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span className="status-square" />
              <span className="font-label-caps" style={{ color: 'var(--c-accent)' }}>
                PROTOCOL CONFIGURATION
              </span>
            </div>
            <h1 className="font-headline-lg" style={{ color: 'var(--c-ink)' }}>
              System Operations
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="badge-swiss">
              <span className="font-mono" style={{ color: 'var(--c-accent)' }}>
                EXEC ENV:
              </span>
              <span>v2.4.1 PROTOCOL 20</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          12-STEP SEQUENCE COMPILER PIPELINE BAR (Zip 6)
          ============================================================ */}
      <section style={{ borderTop: '1px solid var(--c-stroke)', borderBottom: '1px solid var(--c-stroke)', backgroundColor: 'var(--c-surface-dim)' }}>
        <div className="container-swiss" style={{ padding: '16px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="font-label-caps" style={{ color: 'var(--c-ink-dim)' }}>
              EXECUTION PIPELINE (12 STEPS)
            </span>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--c-accent)' }}>
              ACTIVE STEP: {activeStep} / 12
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6 }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((step) => {
              const isFilled = step <= operations.length;
              const isCurrent = step === activeStep;
              return (
                <button
                  key={step}
                  onClick={() => setActiveStep(step)}
                  style={{
                    background: isCurrent
                      ? 'var(--c-accent)'
                      : isFilled
                      ? 'var(--c-ink)'
                      : 'var(--c-surface)',
                    border: '1px solid var(--c-stroke)',
                    borderRadius: 'var(--r-sm)',
                    padding: '8px 0',
                    color: isCurrent || isFilled ? '#ffffff' : 'var(--c-outline)',
                    cursor: 'pointer',
                    fontFamily: 'var(--f-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    transition: 'all 0.15s ease'
                  }}
                  title={`Step ${step}`}
                >
                  {step}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          MAIN WORKSPACE: BUILDER & CODE GENERATOR
          ============================================================ */}
      <section className="container-swiss section-gap" style={{ marginTop: 40 }}>
        <div className="grid-12">
          {/* Left Column: Operation Builder Form */}
          <div style={{ gridColumn: 'span 7' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Account & Protocol Settings */}
              <div className="swiss-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span className="font-label-caps" style={{ color: 'var(--c-ink-dim)' }}>
                    01 // PROTOCOL PARAMETERS
                  </span>
                  <span className="badge-swiss badge-success">AUTOLOAD SEQ</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label className="swiss-label">Source Account (Public Key)</label>
                    <input
                      type="text"
                      className="swiss-input swiss-input-mono"
                      value={sourceKey}
                      onChange={(e) => setSourceKey(e.target.value)}
                      placeholder="G..."
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <div>
                      <label className="swiss-label">Network Target</label>
                      <select
                        className="swiss-input swiss-input-mono"
                        value={network}
                        onChange={(e) => setNetwork(e.target.value as any)}
                      >
                        <option value="TESTNET">Testnet</option>
                        <option value="PUBLIC">Public</option>
                        <option value="FUTURENET">Futurenet</option>
                      </select>
                    </div>

                    <div>
                      <label className="swiss-label">Base Fee (Stroops)</label>
                      <input
                        type="number"
                        className="swiss-input swiss-input-mono"
                        value={fee}
                        onChange={(e) => setFee(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="swiss-label">Timeout (Secs)</label>
                      <input
                        type="number"
                        className="swiss-input swiss-input-mono"
                        value={timeoutSecs}
                        onChange={(e) => setTimeoutSecs(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Atomic Operations Drawer List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-label-caps" style={{ color: 'var(--c-ink)' }}>
                    02 // ATOMIC OPERATIONS ({operations.length})
                  </span>

                  {/* Add Operation Menu */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleAddOperation('payment')}
                      className="btn-swiss-secondary btn-swiss-sm"
                    >
                      <Plus size={12} />
                      <span>Payment</span>
                    </button>
                    <button
                      onClick={() => handleAddOperation('trustline')}
                      className="btn-swiss-secondary btn-swiss-sm"
                    >
                      <Plus size={12} />
                      <span>Trustline</span>
                    </button>
                    <button
                      onClick={() => handleAddOperation('escrow')}
                      className="btn-swiss-secondary btn-swiss-sm"
                    >
                      <Plus size={12} />
                      <span>Escrow</span>
                    </button>
                  </div>
                </div>

                {operations.map((op, idx) => (
                  <div key={op.id} className="swiss-card swiss-card-accent-edge anim-slide-up">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="status-square" />
                        <span className="font-mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-ink)' }}>
                          OP_{idx + 1}: {op.type.toUpperCase()}
                        </span>
                      </div>
                      {operations.length > 1 && (
                        <button
                          onClick={() => handleRemoveOperation(op.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--c-error)',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Remove Operation"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label className="swiss-label">Destination Address</label>
                        <input
                          type="text"
                          className="swiss-input swiss-input-mono"
                          value={op.destination}
                          onChange={(e) =>
                            handleUpdateOperation(op.id, { destination: e.target.value })
                          }
                          placeholder="GD2S7..."
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <label className="swiss-label">Asset Allocation</label>
                          <select
                            className="swiss-input swiss-input-mono"
                            value={op.asset}
                            onChange={(e) =>
                              handleUpdateOperation(op.id, { asset: e.target.value })
                            }
                          >
                            <option value="native">XLM (Native)</option>
                            <option value="USDC">USDC (Circle)</option>
                            <option value="EURC">EURC</option>
                          </select>
                        </div>

                        <div>
                          <label className="swiss-label">Amount</label>
                          <input
                            type="text"
                            className="swiss-input swiss-input-mono"
                            value={op.amount}
                            onChange={(e) =>
                              handleUpdateOperation(op.id, { amount: e.target.value })
                            }
                            placeholder="100.00"
                          />
                        </div>
                      </div>

                      {idx === 0 && (
                        <div>
                          <label className="swiss-label">Memo (Optional)</label>
                          <input
                            type="text"
                            className="swiss-input swiss-input-mono"
                            value={op.memo || ''}
                            onChange={(e) =>
                              handleUpdateOperation(op.id, { memo: e.target.value })
                            }
                            placeholder="Text memo or tx tag..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Code Generator & Live Execution Terminal */}
          <div style={{ gridColumn: 'span 5' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 88 }}>
              {/* Generated TypeScript Container */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="status-square" />
                    <span className="font-label-caps" style={{ color: 'var(--c-ink)' }}>
                      GENERATED TYPESCRIPT
                    </span>
                  </div>
                  <div className="badge-swiss">
                    <span className="font-mono">EST: ~{180 + operations.length * 64} B</span>
                  </div>
                </div>

                <CodeBlock
                  code={generatedCode}
                  language="typescript"
                  filename="stellar_flow_sequence.ts"
                />
              </div>

              {/* Execution Terminal (Zip 6) */}
              <div
                style={{
                  backgroundColor: 'var(--code-bg)',
                  border: '1px solid var(--c-stroke)',
                  borderRadius: 'var(--r-sm)',
                  color: 'var(--code-text)',
                  fontFamily: 'var(--f-mono)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Terminal size={14} style={{ color: 'var(--c-accent)' }} />
                    <span className="font-label-caps" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      SEQUENCE TERMINAL
                    </span>
                  </div>

                  <button
                    onClick={handleCompileSequence}
                    disabled={isCompiling}
                    className="btn-swiss-primary btn-swiss-sm"
                    style={{
                      backgroundColor: 'var(--c-accent)',
                      borderColor: 'var(--c-accent)',
                      padding: '4px 12px',
                      fontSize: 11
                    }}
                  >
                    {isCompiling ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Play size={12} fill="currentColor" />
                    )}
                    <span>{isCompiling ? 'COMPILING...' : 'SIMULATE'}</span>
                  </button>
                </div>

                <div
                  style={{
                    padding: 16,
                    fontSize: 12,
                    lineHeight: '20px',
                    maxHeight: 180,
                    overflowY: 'auto'
                  }}
                >
                  {terminalLogs.map((log, i) => (
                    <div
                      key={i}
                      style={{
                        color: log.includes('[OK]')
                          ? '#86efac'
                          : log.includes('[FEE]')
                          ? '#fde047'
                          : 'rgba(255, 255, 255, 0.75)'
                      }}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
