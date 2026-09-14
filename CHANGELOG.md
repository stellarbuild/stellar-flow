# Changelog

All notable changes to `@stellarbuild/stellar-flow` are documented in
this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Changed
- `wrapInFeeBump()` now throws **synchronously at the call site** instead of deferring the error
  to `build()`. This aligns the method with the library's established eager-validation design
  (ADR-002) and surfaces the "not yet implemented" state at the point where the call is made,
  not after an async round-trip to Horizon. This is a **breaking change** for any code that
  called `wrapInFeeBump()` and expected `build()` to throw — update such code to wrap the
  `wrapInFeeBump()` call in a `try/catch` block instead.

### Removed
- Internal `feeBumpSource` and `feeBumpFee` fields from `TxBuilder` (were unused dead state).

---

## [0.4.0] — 2026-08-29

### Added
- `invokeContract()` — Soroban smart contract invocations using `Operation.invokeHostFunction`
- `ScVal` builder utilities exported from the package: `ScVal.Address`, `ScVal.i128`, `ScVal.u64`, `ScVal.u32`, `ScVal.i32`, `ScVal.Bool`, `ScVal.String`, `ScVal.Symbol`, `ScVal.Bytes`, `ScVal.Vec`, `ScVal.Map`
- `sorobanUrl` option in `TxBuilderOptions` — required when calling `invokeContract()`
- Automatic resource fee and footprint resolution via `SorobanRpc.Server.prepareTransaction()` called inside `build()`
- Dual ESM/CommonJS build output (`dist/cjs/` and `dist/esm/`)
- `exports` field in `package.json` for correct module resolution in ESM bundlers (Vite, Next.js)
- `tsconfig.esm.json` for the ESM compilation pass
- `release.yml` GitHub Actions workflow for automated npm publishing on version tags
- `CODEOWNERS`, `dependabot.yml`, and GitHub issue form templates
- Pull request template with type-of-change checklist
- `CODE_OF_CONDUCT.md`, `SECURITY.md`, `GOVERNANCE.md`, `ROADMAP.md`, `SUPPORT.md`, `FAQ.md`
- Full `docs/` suite: `architecture.md`, `api.md`, `transaction-builder.md`, `installation.md`, `development.md`, `testing.md`, `publishing.md`, `troubleshooting.md`, `coding-standards.md`, `design-decisions.md`

### Changed
- `README.md` rewritten with full API overview, architecture diagram, agent usage patterns, and accurate usage examples
- `CONTRIBUTING.md` expanded with commit conventions, branch strategy, and full workflow
- `tsconfig.json` updated to output to `dist/cjs/` with additional compiler strictness flags
- `ci.yml` upgraded with `concurrency` cancellation, dedicated quality-checks job, and build artifact verification
- `package.json` upgraded with `exports`, `publishConfig`, `engines`, `author`, and `sideEffects: false`
- `.gitignore` extended with `temp/`, `*.tgz`, and `npm-debug.log*` patterns
- `.prettierrc` added for consistent code formatting; `format`, `format:check`, `typecheck`, `clean`, `lint:fix` npm scripts added

---

## [0.3.0] — 2025-06-01

### Added
- `addManageBuyOffer()` operation support
- `addSetOptions()` with full signer type support (ed25519, sha256, preAuthTx)
- `addManageData()` with 64-byte name and value length validation
- `invokeContract()` stub — now fully implemented in v0.4.0, see above
- `wrapInFeeBump()` with address and fee validation (full implementation planned for v0.6.0)
- `addPathPayment()` using `PathPaymentStrictSend`
- Relative timebound expressions: `+5m`, `+1h`, `+2d`, `+30s`
- `resolvePrice()` helper supporting string decimals and `{ n, d }` fractions

### Changed
- `resolveAsset()` improved with explicit error messages for empty code/issuer
- `validateAddress()` now uses `Keypair.fromPublicKey()` for strict public key validation
- `validateAmount()` rejects zero and negative values with descriptive errors

### Fixed
- Memo set via `addPayment()` is now correctly overridden by an explicit `setMemo()` call

---

## [0.2.0] — 2025-03-15

### Added
- `addManageOffer()` for DEX sell offers
- `addChangeTrust()` with optional `limit` parameter
- `setTimebounds()` supporting Unix timestamps and ISO date strings
- `setMemo()` with 28-byte UTF-8 length validation

### Changed
- Builder is now constructed via `TxBuilder.for()` static factory (private constructor)
- `build()` now returns `BuiltTransaction` interface instead of raw `Transaction`

---

## [0.1.0] — 2025-01-20

### Added
- Initial release
- `TxBuilder.for()` static factory
- `addPayment()` supporting XLM and custom assets
- `addCreateAccount()` with minimum balance validation
- `build()` loading account from Horizon and assembling transaction
- `BuiltTransaction.sign()` for keypair signing
- `BuiltTransaction.submit()` for Horizon submission
- `BuiltTransaction.toXDR()` for exporting unsigned/signed XDR
- Support for `mainnet`, `testnet`, and `futurenet` networks
- Full TypeScript declarations
- Unit test suite with Horizon mock

[Unreleased]: https://github.com/stellarbuild/stellar-flow/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/stellarbuild/stellar-flow/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/stellarbuild/stellar-flow/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/stellarbuild/stellar-flow/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/stellarbuild/stellar-flow/releases/tag/v0.1.0