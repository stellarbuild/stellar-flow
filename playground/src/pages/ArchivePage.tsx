import { useState } from 'react';
import { API_DOCS } from '../data/apiDocs';
import { CodeBlock } from '../components/CodeBlock';
import { Search, ChevronRight } from 'lucide-react';

export function ArchivePage() {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(API_DOCS[0].id);
  const [activeLang, setActiveLang] = useState<'curl' | 'typescript' | 'nodejs' | 'python'>('typescript');
  const [searchQuery, setSearchQuery] = useState('');

  const currentEndpoint =
    API_DOCS.find((ep) => ep.id === selectedEndpointId) || API_DOCS[0];

  // Group endpoints by category
  const categories = Array.from(new Set(API_DOCS.map((ep) => ep.category)));

  const filteredEndpoints = API_DOCS.filter(
    (ep) =>
      ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ display: 'flex', flex: 1, borderTop: '1px solid var(--c-stroke)' }}>
        {/* ============================================================
            LEFT COLUMN: API ENDPOINT NAVIGATION (Zip 7)
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
                placeholder="Filter endpoints..."
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
              const endpointsInCat = filteredEndpoints.filter((ep) => ep.category === cat);
              if (endpointsInCat.length === 0) return null;

              return (
                <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ padding: '0 20px', marginBottom: 4 }}>
                    <span className="font-label-caps" style={{ color: 'var(--c-ink-dim)' }}>
                      {cat}
                    </span>
                  </div>

                  {endpointsInCat.map((ep) => {
                    const isSelected = ep.id === selectedEndpointId;
                    return (
                      <button
                        key={ep.id}
                        onClick={() => setSelectedEndpointId(ep.id)}
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
                              color:
                                ep.method === 'GET'
                                  ? 'var(--c-accent)'
                                  : ep.method === 'POST'
                                  ? 'var(--c-success)'
                                  : 'var(--c-error)'
                            }}
                          >
                            {ep.method}
                          </span>
                          <span>{ep.title}</span>
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
            MIDDLE COLUMN: ENDPOINT DOCUMENTATION (Zip 7)
            ============================================================ */}
        <main
          style={{
            flex: 1,
            padding: '40px 48px',
            maxWidth: 760,
            overflowY: 'auto'
          }}
          className="anim-slide-up"
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
                {currentEndpoint.method}
              </span>
              <h1
                className="font-headline-lg font-mono"
                style={{ fontSize: 24, color: 'var(--c-ink)' }}
              >
                {currentEndpoint.path}
              </h1>
            </div>

            <p className="font-body-lg" style={{ color: 'var(--c-ink-dim)', lineHeight: '26px' }}>
              {currentEndpoint.description}
            </p>
          </div>

          {/* Path Parameters */}
          {currentEndpoint.pathParams.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <h2 className="font-headline-md" style={{ color: 'var(--c-ink)', marginBottom: 16 }}>
                Path Parameters
              </h2>
              <div style={{ borderTop: '1px solid var(--c-stroke)' }}>
                {currentEndpoint.pathParams.map((param) => (
                  <div
                    key={param.name}
                    style={{
                      display: 'flex',
                      padding: '16px 0',
                      borderBottom: '1px solid var(--c-stroke)',
                      gap: 24
                    }}
                  >
                    <div style={{ width: 160, flexShrink: 0 }}>
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

          {/* Query Parameters */}
          {currentEndpoint.queryParams.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <h2 className="font-headline-md" style={{ color: 'var(--c-ink)', marginBottom: 16 }}>
                Query Parameters
              </h2>
              <div style={{ borderTop: '1px solid var(--c-stroke)' }}>
                {currentEndpoint.queryParams.map((param) => (
                  <div
                    key={param.name}
                    style={{
                      display: 'flex',
                      padding: '16px 0',
                      borderBottom: '1px solid var(--c-stroke)',
                      gap: 24
                    }}
                  >
                    <div style={{ width: 160, flexShrink: 0 }}>
                      <span className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-ink)' }}>
                        {param.name}
                      </span>
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

          {/* Responses Table */}
          <div>
            <h2 className="font-headline-md" style={{ color: 'var(--c-ink)', marginBottom: 16 }}>
              Response
            </h2>
            <div style={{ borderTop: '1px solid var(--c-stroke)' }}>
              {currentEndpoint.responses.map((resp) => (
                <div
                  key={resp.status}
                  style={{
                    display: 'flex',
                    padding: '16px 0',
                    borderBottom: '1px solid var(--c-stroke)',
                    gap: 24,
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ width: 160, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      className="status-square"
                      style={{
                        backgroundColor: resp.status === 200 ? 'var(--c-accent)' : 'transparent',
                        borderColor: resp.status === 200 ? 'transparent' : 'var(--c-outline)'
                      }}
                    />
                    <span className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-ink)' }}>
                      {resp.statusText}
                    </span>
                  </div>
                  <div>
                    <p className="font-body-md" style={{ color: 'var(--c-ink-mid)' }}>
                      {resp.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* ============================================================
            RIGHT COLUMN: CODE EXAMPLES & RESPONSE PAYLOAD (Zip 7)
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
          {/* Request Code Snippets */}
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
                REQUEST SPECIFICATION
              </span>

              {/* Language Switcher */}
              <div style={{ display: 'flex', gap: 6 }}>
                {(['typescript', 'curl', 'nodejs', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontFamily: 'var(--f-mono)',
                      fontSize: 11,
                      color: activeLang === lang ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                      borderBottom: activeLang === lang ? '1px solid var(--c-accent)' : '1px solid transparent',
                      padding: '2px 4px',
                      cursor: 'pointer'
                    }}
                  >
                    {lang === 'typescript' ? 'TS' : lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <CodeBlock
              code={currentEndpoint.snippets[activeLang]}
              language={activeLang}
              filename={`${currentEndpoint.id}.${activeLang === 'python' ? 'py' : activeLang === 'curl' ? 'sh' : 'ts'}`}
            />
          </div>

          {/* Response Payload */}
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
                RESPONSE PAYLOAD
              </span>
              <span className="badge-swiss badge-success" style={{ fontSize: 10 }}>
                200 OK
              </span>
            </div>

            <CodeBlock
              code={JSON.stringify(currentEndpoint.responses[0].body, null, 2)}
              language="json"
              filename="response_payload.json"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
