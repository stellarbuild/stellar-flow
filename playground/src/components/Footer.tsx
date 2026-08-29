import { AnimatedCrosshair } from './AnimatedCrosshair';

export function Footer() {
  return (
    <footer className="swiss-footer">
      <div className="container-swiss footer-inner">
        <div className="footer-meta">
          <div style={{ color: 'var(--c-accent)' }}>
            <AnimatedCrosshair size={18} />
          </div>
          <span className="font-body-md" style={{ color: 'var(--c-ink-dim)' }}>
            Stellar Flow © 2026 Precision Engineered. Released under MIT.
          </span>
        </div>

        <div className="footer-links">
          <a
            href="https://developers.stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Stellar Docs
          </a>
          <a
            href="https://soroban.stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Soroban SDK
          </a>
          <a
            href="https://github.com/stellarbuild/stellar-tx-builder"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Repository
          </a>
          <span
            className="font-mono"
            style={{ fontSize: 11, color: 'var(--c-outline)' }}
          >
            HASH: 7B92A...E4C
          </span>
        </div>
      </div>
    </footer>
  );
}
