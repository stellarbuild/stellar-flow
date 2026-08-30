# Roadmap

This document outlines the planned direction for `stellar-flow`. It is a
living document — items may be added, reprioritised, or removed based on
community feedback, Stellar protocol changes, and maintainer capacity.

This roadmap is written to be useful to two audiences:
- **Human developers** building wallets, DeFi tools, payment rails, and applications on Stellar
- **AI agents and automated systems** that need to construct and submit transactions programmatically

To propose an addition to the roadmap, open a
[Feature Request](https://github.com/stellarbuild/stellar-flow/issues/new?template=feature_request.yml).

---

## Status Key

| Symbol | Meaning |
|---|---|
| ✅ | Released |
| 🔨 | In progress |
| 📋 | Planned |
| 💬 | Under discussion |
| ❌ | Deprioritised / not planned |

---

## Released

### v0.1.0
- ✅ `TxBuilder.for()` static factory
- ✅ `addPayment()` — XLM and custom assets
- ✅ `addCreateAccount()`
- ✅ `build()` / `sign()` / `submit()` / `toXDR()` pipeline
- ✅ Mainnet, testnet, futurenet network support
- ✅ Full TypeScript declarations

### v0.2.0
- ✅ `addChangeTrust()`
- ✅ `addManageOffer()` — DEX sell offers
- ✅ `setMemo()` with byte validation
- ✅ `setTimebounds()` with Unix timestamp and ISO string support

### v0.3.0
- ✅ `addManageBuyOffer()` — DEX buy offers
- ✅ `addPathPayment()` — PathPaymentStrictSend
- ✅ `addSetOptions()` — full signer type support
- ✅ `addManageData()`
- ✅ Relative timebound expressions (`+5m`, `+1h`, `+2d`)
- ✅ `invokeContract()` validation stub
- ✅ `wrapInFeeBump()` validation stub

### v0.4.0
- ✅ `invokeContract()` — Soroban contract invocations via `Operation.invokeHostFunction`
- ✅ `ScVal` builder utilities (`ScVal.Address`, `ScVal.i128`, `ScVal.u64`, `ScVal.u32`, `ScVal.i32`, `ScVal.Bool`, `ScVal.String`, `ScVal.Symbol`, `ScVal.Bytes`, `ScVal.Vec`, `ScVal.Map`)
- ✅ `sorobanUrl` option in `TxBuilderOptions`
- ✅ Automatic resource fee and footprint resolution via `SorobanRpc.Server.prepareTransaction()` in `build()`
- ✅ Dual CJS/ESM build output
- ✅ Full `docs/` suite and production-quality `README.md`

---

## Planned

### v0.5.0 — Additional Classic Operations
Target: Q3 2026 *(carried forward)*

- 📋 `addPathPaymentStrictReceive()` — specify exact destination amount
- 📋 `addCreateClaimableBalance()` — create claimable balance entries
- 📋 `addClaimClaimableBalance()` — claim a claimable balance
- 📋 `addRevokeSponsorship()` — revoke account, trustline, or offer sponsorship
- 📋 `addBeginSponsoringFutureReserves()` / `addEndSponsoringFutureReserves()`

### v0.6.0 — Fee Bump Transactions
Target: Q3 2026

- 📋 Full `wrapInFeeBump()` implementation using `TransactionBuilder.buildFeeBumpTransaction()`
- 📋 Fee bump XDR export
- 📋 Fee bump submission via Horizon

### v0.7.0 — Developer Experience & Agent Reliability
Target: Q3 2026

- 📋 `TxBuilder.fromXDR()` — reconstruct a builder from an existing XDR envelope, useful for resuming or inspecting transactions created elsewhere
- 📋 `simulate()` method — dry-run Soroban transaction simulation without submitting; returns fee estimate and resource usage
- 📋 `describe()` method — return a plain JavaScript object describing all queued operations, memo, timebounds, and fee config without making any network call; designed for agent inspection and human-readable logging
- 📋 `estimateFee()` — query Horizon's current base fee recommendation before building
- 📋 Structured error classes:
  - `TxBuilderValidationError` — thrown at `.add*()` call sites for bad input; includes the field name and invalid value
  - `TxBuilderNetworkError` — wraps Horizon connectivity failures from `.build()` or `.submit()`
  - `TxBuilderSubmitError` — wraps Horizon rejection responses with the raw `result_codes` object

### v0.8.0 — Agent & Automation Support
Target: Q4 2026

This release is specifically motivated by the needs of AI agents, LLM-powered tools, and automated systems that interact with the Stellar network.

- 📋 `builder.toJSON()` / `TxBuilder.fromJSON()` — serialize and deserialize a partially built transaction; enables pause-and-resume workflows across process boundaries or approval gates
- 📋 `builder.inspect()` — return all queued operations as plain JavaScript objects (not XDR), allowing agents to read back what they have queued before calling `.build()`
- 📋 Operation diffing — compare two serialized builders to produce a human-readable summary of what changed; useful for audit logs and approval UIs
- 📋 `withTimeout()` builder option — automatically set a sensible transaction timeout based on expected processing time
- 📋 Retry helpers — optional built-in exponential backoff for `.submit()` on transient Horizon failures

### v0.9.0 — Multi-Transaction Workflows
Target: Q1 2027

- 📋 `TxSequence` — a higher-level construct for chaining multiple dependent transactions in order:
  - Each step can depend on the result of the previous (e.g., use the created account's ID in the next transaction)
  - Configurable `stopOnFailure` behaviour
  - Serializable for approval-gated workflows
- 📋 Conditional transaction templates — pre-define a transaction structure with placeholder values to be filled at execution time

### v1.0.0 — Stable Release
Target: Q2 2027

- 📋 Stable, locked public API — no breaking changes after v1.0
- 📋 Full Soroban operation coverage
- 📋 Comprehensive integration test suite against Stellar testnet
- 📋 Complete API documentation with generated typedoc
- 📋 Audit of all public types, error messages, and structured error classes

---

## Under Discussion

- 💬 **React hooks** — a `@stellarbuild/react` package with `useTxBuilder` hook
- 💬 **Browser wallet integration** — Freighter / Albedo signing adapter
- 💬 **Multi-party signing workflow** — helpers for collecting signatures from multiple parties before submission
- 💬 **Ledger hardware wallet support**
- 💬 **AI agent integration guide** — a dedicated guide and utility module for building reliable agentic workflows on top of `stellar-flow`, covering error handling patterns, approval gates, and audit logging

---

## Not Planned

- ❌ Stellar account management (creation, funding) — out of scope; use Horizon SDK directly
- ❌ Custom Horizon server implementation
- ❌ Support for Node.js < 18

---

## How to Influence the Roadmap

1. Open a [Feature Request](https://github.com/stellarbuild/stellar-flow/issues/new?template=feature_request.yml) describing your use case.
2. Participate in [GitHub Discussions](https://github.com/stellarbuild/stellar-flow/discussions) to share your priorities.
3. Submit a pull request — working implementations are the most effective way to accelerate roadmap items.
