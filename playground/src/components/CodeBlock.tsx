import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = false
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-container-swiss">
      <div className="code-header-swiss">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="status-square" style={{ width: 6, height: 6 }} />
          <span className="font-label-caps" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {filename || language.toUpperCase()}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="code-tab-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '2px 8px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: copied ? 'rgba(37, 99, 235, 0.2)' : 'transparent'
          }}
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check size={12} style={{ color: 'var(--c-accent)' }} />
              <span style={{ color: 'var(--c-accent)' }}>COPIED</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>COPY</span>
            </>
          )}
        </button>
      </div>

      <pre className="code-content-pre">
        <code>
          {showLineNumbers ? (
            code.split('\n').map((line, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 16 }}>
                <span
                  style={{
                    color: 'rgba(255, 255, 255, 0.25)',
                    userSelect: 'none',
                    width: 24,
                    textAlign: 'right',
                    flexShrink: 0
                  }}
                >
                  {idx + 1}
                </span>
                <span>{line}</span>
              </div>
            ))
          ) : (
            code
          )}
        </code>
      </pre>
    </div>
  );
}
