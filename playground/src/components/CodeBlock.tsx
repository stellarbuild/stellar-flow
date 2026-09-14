import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

// ── Tokenizer ────────────────────────────────────────────────
type Chunk = { text: string; cls?: string };

const TS_KW = new Set([
  'import', 'export', 'from', 'const', 'let', 'var', 'async', 'await',
  'return', 'new', 'type', 'interface', 'class', 'function', 'if', 'else',
  'for', 'of', 'in', 'true', 'false', 'null', 'undefined', 'throw', 'try',
  'catch', 'default', 'extends', 'implements', 'as', 'this', 'static',
  'private', 'public', 'readonly', 'abstract', 'override', 'void', 'never',
]);

const RUST_KW = new Set([
  'pub', 'fn', 'let', 'mut', 'impl', 'struct', 'enum', 'trait', 'use', 'mod',
  'where', 'return', 'if', 'else', 'for', 'in', 'match', 'self', 'true', 'false',
  'None', 'Some', 'Ok', 'Err', 'async', 'await', 'type', 'const', 'static',
  'move', 'ref', 'loop', 'while', 'break', 'continue',
]);

function tokenize(code: string, lang: string): Chunk[] {
  const kw = lang === 'rust' ? RUST_KW : TS_KW;
  const chunks: Chunk[] = [];
  let i = 0;
  const n = code.length;

  while (i < n) {
    const c = code[i];

    // Single-line comment
    if (c === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i);
      const text = end === -1 ? code.slice(i) : code.slice(i, end);
      chunks.push({ text, cls: 'syn-cm' });
      i += text.length;
      continue;
    }

    // Hash comment (bash/sh/curl)
    if ((lang === 'curl' || lang === 'bash' || lang === 'sh') && c === '#') {
      const end = code.indexOf('\n', i);
      const text = end === -1 ? code.slice(i) : code.slice(i, end);
      chunks.push({ text, cls: 'syn-cm' });
      i += text.length;
      continue;
    }

    // Template literal
    if (c === '`') {
      let j = i + 1;
      while (j < n) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === '`') { j++; break; }
        j++;
      }
      chunks.push({ text: code.slice(i, j), cls: 'syn-str' });
      i = j;
      continue;
    }

    // Double-quoted string
    if (c === '"') {
      let j = i + 1;
      while (j < n) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === '"') { j++; break; }
        j++;
      }
      chunks.push({ text: code.slice(i, j), cls: 'syn-str' });
      i = j;
      continue;
    }

    // Single-quoted string
    if (c === "'") {
      let j = i + 1;
      while (j < n) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === "'") { j++; break; }
        j++;
      }
      chunks.push({ text: code.slice(i, j), cls: 'syn-str' });
      i = j;
      continue;
    }

    // Word (keyword / type / function call / identifier)
    if (/[a-zA-Z_$]/.test(c)) {
      let j = i + 1;
      while (j < n && /[a-zA-Z0-9_$]/.test(code[j])) j++;
      const word = code.slice(i, j);
      // Peek past whitespace to detect function call
      let k = j;
      while (k < n && (code[k] === ' ' || code[k] === '\t')) k++;

      if (kw.has(word)) {
        chunks.push({ text: word, cls: 'syn-kw' });
      } else if (/^[A-Z]/.test(word)) {
        chunks.push({ text: word, cls: 'syn-type' });
      } else if (code[k] === '(') {
        chunks.push({ text: word, cls: 'syn-fn' });
      } else {
        chunks.push({ text: word });
      }
      i = j;
      continue;
    }

    // Number
    if (/[0-9]/.test(c)) {
      let j = i + 1;
      while (j < n && /[0-9._xXa-fA-F]/.test(code[j])) j++;
      chunks.push({ text: code.slice(i, j), cls: 'syn-num' });
      i = j;
      continue;
    }

    // Everything else — pass through as-is
    chunks.push({ text: c });
    i++;
  }

  return chunks;
}

function tokenizeJSON(code: string): Chunk[] {
  const chunks: Chunk[] = [];
  let i = 0;
  const n = code.length;

  while (i < n) {
    const c = code[i];

    // String
    if (c === '"') {
      let j = i + 1;
      while (j < n) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === '"') { j++; break; }
        j++;
      }
      const str = code.slice(i, j);
      // If followed by ':' it's a key
      let k = j;
      while (k < n && code[k] === ' ') k++;
      chunks.push({ text: str, cls: code[k] === ':' ? 'syn-fn' : 'syn-str' });
      i = j;
      continue;
    }

    // Number
    if (/[-0-9]/.test(c)) {
      let j = i + 1;
      while (j < n && /[0-9.eE+\-]/.test(code[j])) j++;
      chunks.push({ text: code.slice(i, j), cls: 'syn-num' });
      i = j;
      continue;
    }

    // true / false / null
    const remaining = code.slice(i);
    const kw = remaining.match(/^(true|false|null)/);
    if (kw) {
      chunks.push({ text: kw[0], cls: 'syn-kw' });
      i += kw[0].length;
      continue;
    }

    chunks.push({ text: c });
    i++;
  }

  return chunks;
}

function getChunks(code: string, lang: string): Chunk[] {
  if (lang === 'json') return tokenizeJSON(code);
  if (lang === 'typescript' || lang === 'ts' || lang === 'javascript' || lang === 'js' || lang === 'rust') {
    return tokenize(code, lang);
  }
  // Plain text, curl, bash, etc.
  return tokenize(code, 'bash');
}

function renderHighlighted(code: string, lang: string, showLineNumbers: boolean) {
  const chunks = getChunks(code, lang);

  if (!showLineNumbers) {
    return (
      <>
        {chunks.map((ch, idx) =>
          ch.cls ? (
            <span key={idx} className={ch.cls}>{ch.text}</span>
          ) : (
            ch.text
          )
        )}
      </>
    );
  }

  // Rebuild line-by-line for line numbers
  const lines: Chunk[][] = [[]];
  for (const ch of chunks) {
    const parts = ch.text.split('\n');
    parts.forEach((part, pi) => {
      if (pi > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, cls: ch.cls });
    });
  }

  return (
    <>
      {lines.map((line, li) => (
        <div key={li} style={{ display: 'flex', gap: 16 }}>
          <span style={{ color: 'rgba(255,255,255,0.22)', userSelect: 'none', width: 24, textAlign: 'right', flexShrink: 0 }}>
            {li + 1}
          </span>
          <span>
            {line.map((ch, ci) =>
              ch.cls ? (
                <span key={ci} className={ch.cls}>{ch.text}</span>
              ) : (
                ch.text
              )
            )}
          </span>
        </div>
      ))}
    </>
  );
}

// ── Component ────────────────────────────────────────────────
export function CodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = false,
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
          <span className="font-label-caps" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
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
            border: '1px solid rgba(255, 255, 255, 0.12)',
            background: copied ? 'rgba(37, 99, 235, 0.18)' : 'transparent',
            transition: 'all 0.2s ease',
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
          {renderHighlighted(code, language, showLineNumbers)}
        </code>
      </pre>
    </div>
  );
}
