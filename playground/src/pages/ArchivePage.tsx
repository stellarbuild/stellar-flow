import { useState } from 'react';
import { LIBRARY_DOCS, type LibraryMethod } from '../data/apiDocs';
import { CodeBlock } from '../components/CodeBlock';
import { Search, ChevronRight } from 'lucide-react';

export function ArchivePage() {
  const [selectedMethodId, setSelectedMethodId] = useState<string>(LIBRARY_DOCS[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const currentMethod: LibraryMethod =
    LIBRARY_DOCS.find((m) => m.id === selectedMethodId) || LIBRARY_DOCS[0];

  // Group methods by category
  const categories = Array.from(new Set(LIBRARY_DOCS.map((m) => m.category)));

  const filteredMethods = LIBRARY_DOCS.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ display: 'flex', flex: 1, borderTop: '1px solid var(--c-stroke)' }}>
        {/* ============================================================
            LEFT COLUMN: API NAVIGATION
            ============================================================ */}
        <aside
          style={{
            width: 280,
            borderRight: '1px solid var(--c-stroke)',
            backgroundColor: 'var(--c-surface-dim)',
            padding: '24px 0',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}
        >
          {/* Search Bar */}
          <div style={{ padding: '0 20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid var(--c-stroke)',
                backgroundColor: 'var(--c-surface)',
                borderRadius: 'var(--r-sm)',
                padding: '8px 12px'
              }}
            >
              <Search size={14} style={{ color: 'var(--c-outline)' }} />
              <input
                type="text"
                placeholder="Filter methods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'none',
                  outline: 'none',
                  fontFamily: 'var(--f-sans)',
                  fontSize: 12,
                  color: 'var(--c-ink)',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* Categorized List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
            {categories.map((cat) => {
              const methodsInCat = filteredMethods.filter((m) => m.category === cat);
              if (methodsInCat.length === 0) return null;

              return (
                <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ padding: '0 20px', marginBottom: 4 }}>
                    <span className="font-label-caps" style={{ color: 'var(--c-ink-dim)' }}>
                      {cat}
                    </span>
                  </div>

                  {methodsInCat.map((m) => {
                    const isSelected = m.id === selectedMethodId;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMethodId(m.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 20px',
                          border: 'none',
                          borderLeft: isSelected ? '2px solid var(--c-accent)' : '2px solid transparent',
                          backgroundColor: isSelected ? 'var(--c-accent-bg)' : 'transparent',
                          color: isSelected ? 'var(--c-accent)' : 'var(--c-ink-mid)',
                          fontFamily: 'var(--f-sans)',
                          fontSize: 13,
                          fontWeight: isSelected ? 600 : 400,
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            className="font-mono"
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: 'var(--c-accent)'
                            }}
                          >
                            fn
                          </span>
                          <span>{m.name}</span>
                        </div>
                        {isSelected && <ChevronRight size={14} />}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ============================================================
            MIDDLE COLUMN: DOCUMENTATION
            ============================================================ */}
        <main
          style={{
            flex: 1,
            padding: '40px 48px',
            maxWidth: 760,
            overflowY: 'auto'
          }}
          className="anim-slide-up"
          key={currentMethod.id} // Forces re-render animation on selection
        >
          {/* Header */}
          <div style={{ borderBottom: '1px solid var(--c-stroke)', paddingBottom: 28, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span
                className="font-mono"
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'var(--c-surface-dim)',
                  border: '1px solid var(--c-stroke)',
                  borderRadius: 'var(--r-sm)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--c-ink)'
                }}
              >
                method
              </span>
              <h1
                className="font-headline-lg font-mono"
                style={{ fontSize: 24, color: 'var(--c-ink)' }}
              >
                {currentMethod.name}
              </h1>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <CodeBlock 
                code={currentMethod.signature} 
                language="typescript" 
                filename="Signature" 
              />
            </div>

            <p className="font-body-lg" style={{ color: 'var(--c-ink-dim)', lineHeight: '26px' }}>
              {currentMethod.description}
            </p>
          </div>

          {/* Parameters */}
          {currentMethod.params.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <h2 className="font-headline-md" style={{ color: 'var(--c-ink)', marginBottom: 16 }}>
                Parameters
              </h2>
              <div style={{ borderTop: '1px solid var(--c-stroke)' }}>
                {currentMethod.params.map((param) => (
                  <div
                    key={param.name}
                    style={{
                      display: 'flex',
                      padding: '16px 0',
                      borderBottom: '1px solid var(--c-stroke)',
                      gap: 24
                    }}
                  >
                    <div style={{ width: 180, flexShrink: 0 }}>
                      <span className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-ink)' }}>
                        {param.name}
                      </span>
                      {param.required && (
                        <span style={{ color: 'var(--c-error)', marginLeft: 4, fontWeight: 700 }}>*</span>
                      )}
                      <div className="font-mono" style={{ fontSize: 11, color: 'var(--c-outline)', marginTop: 2 }}>
                        {param.type}
                      </div>
                    </div>
                    <div>
                      <p className="font-body-md" style={{ color: 'var(--c-ink-mid)' }}>
                        {param.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Return Value */}
          <div>
            <h2 className="font-headline-md" style={{ color: 'var(--c-ink)', marginBottom: 16 }}>
              Returns
            </h2>
            <div style={{ borderTop: '1px solid var(--c-stroke)' }}>
                <div
                  style={{
                    display: 'flex',
                    padding: '16px 0',
                    borderBottom: '1px solid var(--c-stroke)',
                    gap: 24,
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ width: 180, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      className="status-square"
                      style={{
                        backgroundColor: 'var(--c-accent)',
                        borderColor: 'transparent'
                      }}
                    />
                    <span className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-ink)' }}>
                      {currentMethod.returns.type}
                    </span>
                  </div>
                  <div>
                    <p className="font-body-md" style={{ color: 'var(--c-ink-mid)' }}>
                      {currentMethod.returns.description}
                    </p>
                  </div>
                </div>
            </div>
          </div>
        </main>

        {/* ============================================================
            RIGHT COLUMN: CODE EXAMPLES
            ============================================================ */}
        <aside
          style={{
            width: 480,
            backgroundColor: 'var(--code-bg)',
            color: 'var(--code-text)',
            borderLeft: '1px solid var(--c-stroke)',
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            flexShrink: 0,
            overflowY: 'auto'
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: 10,
                marginBottom: 16
              }}
            >
              <span className="font-label-caps" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                USAGE EXAMPLE
              </span>
              <span className="font-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                TypeScript
              </span>
            </div>

            <CodeBlock
              code={currentMethod.snippets.typescript}
              language="typescript"
              filename="example.ts"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
