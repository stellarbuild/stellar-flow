# stellar-flow

<div align="center">

[![npm version](https://img.shields.io/npm/v/@stellarbuild/stellar-flow.svg?style=flat-square)](https://www.npmjs.com/package/@stellarbuild/stellar-flow)
[![CI](https://github.com/stellarbuild/stellar-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/stellarbuild/stellar-flow/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Stellar SDK](https://img.shields.io/badge/Stellar%20SDK-%3E%3D12-blueviolet?style=flat-square)](https://github.com/stellar/js-stellar-sdk)

**A fluent, type-safe TypeScript transaction builder for the [Stellar](https://stellar.org) network.**

*Built for developers. Designed to work with AI agents.*

[Documentation](docs/) · [API Reference](docs/api.md) · [Changelog](CHANGELOG.md) · [Roadmap](ROADMAP.md) · [Contributing](CONTRIBUTING.md)

</div>

---

## Table of Contents

- [What is stellar-flow?](#what-is-stellar-flow)
- [Why stellar-flow Exists](#why-stellar-flow-exists)
- [How It Works](#how-it-works)
- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
- [For AI Agents](#for-ai-agents)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
- [Supported Operations](#supported-stellar-operations)
- [Error Handling](#error-handling)
- [TypeScript Support](#typescript-support)
- [Local Development](#local-development)
- [Repository Structure](#repository-structure)
- [Security](#security)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [FAQ](#faq)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## What is stellar-flow?

`stellar-flow` is a **TypeScript library** that makes it easy to build, sign, and submit transactions on the [Stellar](https://stellar.org) blockchain network.

If you're not familiar with Stellar: it's a fast, low-cost public blockchain focused on payments, asset issuance, and decentralised exchange. Every action on Stellar — sending money, creating an account, placing a trade — is expressed as a **transaction** made up of one or more **operations**.

`stellar-flow` gives you a clean, readable, chainable API for constructing those transactions, so you spend less time on boilerplate and more time building your product.

> **New to Stellar?** Start at [stellar.org/learn](https://stellar.org/learn) or the [Stellar Developer Docs](https://developers.stellar.org).

---

## Why stellar-flow Exists

Building Stellar transactions with the official `@stellar/stellar-sdk` requires developers to manually:

- Load the source account from the Horizon API (a network call)
- Instantiate a `TransactionBuilder` with the correct network passphrase
- Call low-level `Operation.*` factory functions with verbose parameters
- Manually resolve assets (XLM vs custom tokens), encode memos, and format timebounds
- Manage the entire build → sign → submit lifecycle yourself

This is powerful, but verbose. Here is what sending a simple payment looks like **without** `stellar-flow`:

```typescript
// Without stellar-flow — lots of boilerplate
import { Horizon, TransactionBuilder, Operation, Asset, Networks, Memo } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');
const sourceAccount = await server.loadAccount(keypair.publicKey());

const tx = new TransactionBuilder(sourceAccount, {
  fee: '100',
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.payment({
      destination: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
      asset: Asset.native(),
      amount: '100',
    })
  )
  .addMemo(Memo.text('Invoice #42'))
  .setTimeout(300)
  .build();

tx.sign(keypair);
const result = await server.submitTransaction(tx);
```

For teams building wallets, exchanges, payment rails, or DeFi applications, this boilerplate accumulates fast and becomes a real source of bugs.

**`stellar-flow` wraps the Stellar SDK in a fluent, chainable builder API** that eliminates that scaffolding while staying transparently thin over the SDK. It does not re-implement Stellar primitives — it **composes** them.

```typescript
// With stellar-flow — readable and concise
import { TxBuilder } from '@stellarbuild/stellar-flow';

const result = await TxBuilder.for(keypair, { network: 'testnet' })
  .addPayment({ destination: RECEIVER, amount: '100', asset: 'XLM' })
  .setMemo('Invoice #42')
  .setTimebounds({ maxTime: '+5m' })
  .build()
  .then(tx => tx.sign(keypair))
  .then(tx => tx.submit());
```

---

## How It Works

The builder follows a clear four-stage pipeline. You configure once, queue up operations, build (the only async step), then sign and submit.

```
Stage 1: Configure
  TxBuilder.for(keypair, { network: 'testnet' })
    ↳ Initialises the builder with your source account and network settings.
      No network call happens here.

Stage 2: Declare Operations  (chainable — returns `this` each time)
  .addPayment({ ... })
  .addChangeTrust({ ... })
  .setMemo('Hello')
  .setTimebounds({ maxTime: '+5m' })
    ↳ Each method validates inputs immediately. Errors are thrown here —
      before any network call — so you find mistakes at the exact line
      of code, not buried in a Horizon response.

Stage 3: Build  (async — the only network call)
  .build()
    ↳ Loads your account sequence number from Horizon, compiles the
      operation queue into a Stellar transaction, and returns a
      BuiltTransaction object ready to sign.

Stage 4: Sign & Submit
  .then(tx => tx.sign(keypair))
  .then(tx => tx.submit())
    ↳ Sign with one or multiple keypairs. Submit to Horizon.
      The SubmitResult contains the transaction hash and ledger number.
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Your Application                    │
└────────────────────────┬────────────────────────────────┘
                         │ TxBuilder.for(keypair, options)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                      TxBuilder                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  Operation Queue (validated xdr.Operation[])   │     │
│  ├────────────────────────────────────────────────┤     │
│  │  Memo  │  Timebounds                           │     │
│  └────────────────────────────────────────────────┘     │
│                         │ .build()                      │
└─────────────────────────┼───────────────────────────────┘
                          │ async: loadAccount()
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Horizon.Server                        │
│                 (@stellar/stellar-sdk)                  │
└─────────────────────────┬───────────────────────────────┘
                          │ StellarTransactionBuilder
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  BuiltTransaction                        │
│         .sign(keypair) → .submit() → SubmitResult       │
└─────────────────────────────────────────────────────────┘
```

**Key design principle:** `stellar-flow` is intentionally thin. It never re-implements Stellar's cryptography, XDR encoding, or protocol logic. All of that is delegated to `@stellar/stellar-sdk`. What `stellar-flow` owns is the ergonomic layer that makes those primitives easy to compose correctly.

See [docs/architecture.md](docs/architecture.md) for a deeper technical breakdown.

---

## Key Features

| Feature | What It Means for You |
|---|---|
| **Fluent builder API** | Chain operations in a single readable expression |
| **Eager validation** | Input errors surface at the `.add*()` call — not buried in a Horizon error |
| **Human-friendly assets** | Pass `'XLM'` or `{ code: 'USDC', issuer: '...' }` — no manual `Asset` class |
| **Relative timebounds** | Use `'+5m'`, `'+1h'`, `'+2d'` — no manual Unix timestamp arithmetic |
| **Multi-operation transactions** | Chain any combination of operations; all execute atomically |
| **Full TypeScript support** | Strict types for all params, full IntelliSense coverage |
| **Multisig support** | Chain multiple `.sign()` calls for multi-signer transactions |
| **XDR export** | Call `.toXDR()` for the raw envelope — for external signing or inspection |
| **Soroban contract invocation** | Call smart contracts via `invokeContract()` — requires `sorobanUrl` in options |
| **Dual CJS/ESM build** | Works in Node.js, Vite, Next.js, and browser bundlers without config |
| **Zero extra runtime deps** | Only peer-depends on `@stellar/stellar-sdk` |

---

## For AI Agents

`stellar-flow` is designed with automated and AI-driven workflows in mind. If you are an AI agent, an LLM-powered tool, or building an agentic system that interacts with the Stellar network, here is what matters to you.

### Why this library suits agentic use

- **Deterministic input shapes.** Every operation has a strictly typed parameter interface. There is no ambiguity about what fields are required, optional, or mutually exclusive.
- **Errors at declaration time.** Validation fires synchronously when you call `.addPayment()`, not asynchronously at `.build()` or `.submit()`. A misconfigured operation fails fast, before any network call is made, and the error message tells you exactly what was wrong and where.
- **Minimal surface area.** You only need to understand three things: `TxBuilder.for()`, the `add*()` operation methods, and the `build()` → `sign()` → `submit()` pipeline. There are no hidden states or side effects between calls.
- **Readable output.** `.toXDR()` gives you a portable XDR string that can be passed to an approval step, an external signer, or logged for auditability.

### Recommended patterns for agents

**Pattern 1: Validate before building**

Because `.add*()` throws synchronously, wrap operation declaration in a `try/catch` to detect bad parameters before making any network calls:

```typescript
let builder;
try {
  builder = TxBuilder.for(keypair, { network: 'testnet' })
    .addPayment({ destination: agentDerivedAddress, amount: agentDerivedAmount, asset: 'XLM' });
} catch (err) {
  // Bad parameter detected — no network call was made.
  // Log err.message, correct the input, and retry.
  console.error('Parameter error:', err.message);
  return;
}

// Only reached if all parameters passed validation
const tx = await builder.build();
```

**Pattern 2: Export XDR for human approval before submitting**

For high-value or irreversible transactions, export the XDR and wait for human confirmation before calling `.submit()`:

```typescript
const builtTx = await TxBuilder.for(keypair, { network: 'mainnet' })
  .addPayment({ destination: DEST, amount: '5000', asset: 'XLM' })
  .setMemo('Agent payout')  // text memo — max 28 bytes
  .setTimebounds({ maxTime: '+10m' })
  .build();

builtTx.sign(keypair);
const xdr = builtTx.toXDR();

// Route xdr to a human approval queue or audit log.
// Only call builtTx.submit() after explicit approval is received.
console.log('Pending approval. XDR:', xdr);
```

**Pattern 3: Bundle setup operations atomically**

Group related setup steps into a single transaction to reduce round-trips and guarantee atomicity:

```typescript
// Add trustline and fund in a single atomic transaction
const tx = await TxBuilder.for(keypair, { network: 'testnet' })
  .addChangeTrust({ asset: { code: 'USDC', issuer: USDC_ISSUER } })
  .addPayment({ destination: TARGET, amount: '100', asset: { code: 'USDC', issuer: USDC_ISSUER } })
  .setMemo('Agent setup')  // text memo — max 28 bytes
  .setTimebounds({ maxTime: '+5m' })
  .build();
```

### Planned agent-specific improvements

The roadmap includes features specifically motivated by agentic use cases — see [ROADMAP.md](ROADMAP.md) for the full picture:

| Feature | Version | What it enables |
|---|---|---|
| Structured error classes | v0.7 | Handle `TxBuilderValidationError` vs `TxBuilderNetworkError` programmatically — no string parsing |
| Dry-run / describe mode | v0.7 | Inspect what a built transaction will do before any network call |
| State serialization | v0.8 | Pause a partially built transaction, serialize it, resume in a different process or session |
| `TxBuilder.fromXDR()` | v0.7 | Reconstruct a builder from an existing XDR envelope |
| Multi-tx sequencing | v0.9 | A `TxSequence` construct for chaining dependent transactions with rollback strategy |

---

## Installation

```bash
# npm
npm install @stellarbuild/stellar-flow

# yarn
yarn add @stellarbuild/stellar-flow

# pnpm
pnpm add @stellarbuild/stellar-flow
```

**Peer dependency** — you must also have the Stellar SDK installed:

```bash
npm install @stellar/stellar-sdk
```

> **Requires** Node.js ≥ 18 and `@stellar/stellar-sdk` ≥ 12.

See [docs/installation.md](docs/installation.md) for advanced setup, ESM configuration, and version compatibility matrix.

---

## Quick Start

```typescript
import { TxBuilder } from '@stellarbuild/stellar-flow';
import { Keypair } from '@stellar/stellar-sdk';

const sourceKeypair = Keypair.fromSecret('SCZANGBA5RLPKD2EPQNZJ4QPIMESUHW26IUSQQ7VFXZ4HNPNGJXS23');

const tx = await TxBuilder.for(sourceKeypair, { network: 'testnet' })
  .addPayment({
    destination: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
    amount: '100',
    asset: 'XLM',
    memo: 'Payment for services',
  })
  .setTimebounds({ maxTime: '+5m' })
  .build();

const result = await tx.sign(sourceKeypair).submit();

console.log('Transaction hash:', result.hash);
console.log('Ledger:', result.ledger);
```

---

## Usage Examples

### Send a Custom Asset (USDC)

```typescript
const tx = await TxBuilder.for(keypair, { network: 'mainnet' })
  .addPayment({
    destination: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
    amount: '50',
    asset: {
      code: 'USDC',
      issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    },
  })
  .build();
```

### Create a New Stellar Account

Every Stellar account must be explicitly created and funded with a minimum balance of 1 XLM. Use `addCreateAccount()` to do this from an existing funded account.

```typescript
const tx = await TxBuilder.for(keypair, { network: 'testnet' })
  .addCreateAccount({
    destination: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
    startingBalance: '2', // must be at least 1 XLM
  })
  .build();
```

### Add a Trustline

Before an account can hold or receive a custom asset (like USDC), it must explicitly opt in by adding a trustline. This is a one-time setup step per asset.

```typescript
const tx = await TxBuilder.for(keypair, { network: 'testnet' })
  .addChangeTrust({
    asset: {
      code: 'USDC',
      issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    },
    limit: '10000', // optional — omit to use the maximum allowed limit
  })
  .build();
```

### Place a DEX Sell Offer

Stellar has a built-in decentralised exchange (DEX). You can place limit orders directly on-chain without a centralised intermediary.

```typescript
const tx = await TxBuilder.for(keypair, { network: 'testnet' })
  .addManageOffer({
    selling: { code: 'USDC', issuer: 'GA5ZSEJ...' },
    buying: 'XLM',
    amount: '500',       // amount of USDC to sell
    price: '0.25',       // sell 1 USDC for 0.25 XLM (or use { n: 1, d: 4 } as a fraction)
  })
  .build();
```

### Path Payment (DEX Swap)

Path payments let you send one asset and have the recipient receive a different asset. Stellar automatically routes the conversion through the on-chain DEX.

```typescript
const tx = await TxBuilder.for(keypair, { network: 'mainnet' })
  .addPathPayment({
    destination: 'GDQP2KPQ...',
    sendAsset: 'XLM',
    sendAmount: '100',                                        // send up to 100 XLM
    destAsset: { code: 'USDC', issuer: 'GA5ZSEJ...' },
    destAmount: '25',                                         // recipient receives at least 25 USDC
    path: [{ code: 'yXLM', issuer: 'GARDNEUQQ...' }],        // optional intermediate assets
  })
  .build();
```

### Invoke a Soroban Smart Contract

Soroban is Stellar's smart contract platform. `stellar-flow` supports basic contract invocations via `invokeContract()`. You must provide a `sorobanUrl` in options — when `.build()` is called, it runs `prepareTransaction()` against the Soroban RPC to set the correct resource fee and footprint.

> **Note:** `args` accepts raw `xdr.ScVal` objects or simple primitives (`string`, `number`, `boolean`). For convenience, `stellar-flow` exports a `ScVal` helper object with builder methods for common types.

```typescript
import { TxBuilder, ScVal } from '@stellarbuild/stellar-flow';

const tx = await TxBuilder.for(keypair, {
  network: 'testnet',
  sorobanUrl: 'https://soroban-testnet.stellar.org',
})
  .invokeContract({
    contractId: 'CCLZ...',
    functionName: 'increment',
    args: [ScVal.u32(1)],
  })
  .build(); // Calls prepareTransaction() on Soroban RPC to set fee and footprint
```

### Multi-Operation Transaction

Multiple operations can be bundled into a single transaction. This is **atomic** — if any operation fails, the entire transaction is rejected and none of the operations take effect.

```typescript
// Example: set up a new account in a single atomic transaction
const tx = await TxBuilder.for(keypair, { network: 'testnet' })
  .addChangeTrust({ asset: { code: 'USDC', issuer: 'GA5ZSEJ...' } })       // step 1: add trustline
  .addPayment({ destination: 'GDQP2KPQ...', amount: '100', asset: 'XLM' }) // step 2: fund with XLM
  .addManageData({ name: 'last_payment', value: new Date().toISOString() }) // step 3: record metadata
  .setMemo('Setup + funding')  // text memo — max 28 bytes
  .setTimebounds({ minTime: 0, maxTime: '+10m' })
  .build();
```

### Sign with Multiple Signers

```typescript
const built = await TxBuilder.for(keypair, { network: 'testnet' })
  .addPayment({ destination: DEST, amount: '10', asset: 'XLM' })
  .build();

// Chain multiple .sign() calls for multisig transactions
const result = await built
  .sign(signer1Keypair)
  .sign(signer2Keypair)
  .submit();
```

### Get XDR Without Submitting

Export the transaction as a raw XDR string to send to an external signer, the [Stellar Laboratory](https://lab.stellar.org), or a Freighter browser wallet.

```typescript
const built = await TxBuilder.for(keypair, { network: 'testnet' })
  .addPayment({ destination: DEST, amount: '10', asset: 'XLM' })
  .build();

built.sign(keypair);
const xdr = built.toXDR();

// Now you can:
// - Pass xdr to a hardware wallet or browser wallet for signing
// - Inspect it on lab.stellar.org
// - Store it for later submission
// - Send it to a human approver before calling .submit()
console.log('Transaction XDR:', xdr);
```

---

## Supported Stellar Operations

| Method | Stellar Operation | What It Does |
|---|---|---|
| `addPayment()` | `Payment` | Send XLM or any custom asset to another account |
| `addCreateAccount()` | `CreateAccount` | Create and fund a new Stellar account |
| `addChangeTrust()` | `ChangeTrust` | Add, update, or remove a trustline for a custom asset |
| `addManageOffer()` | `ManageSellOffer` | Place, update, or cancel a DEX sell offer |
| `addManageBuyOffer()` | `ManageBuyOffer` | Place, update, or cancel a DEX buy offer |
| `addPathPayment()` | `PathPaymentStrictSend` | Send one asset, have recipient receive another via DEX routing |
| `addSetOptions()` | `SetOptions` | Change account flags, signers, thresholds, or home domain |
| `addManageData()` | `ManageData` | Store or delete arbitrary key-value data on an account |
| `invokeContract()` | `InvokeHostFunction` | Call a Soroban smart contract function |

---

## Error Handling

`stellar-flow` validates all inputs **synchronously and eagerly** — before any network request is made. This means you catch configuration mistakes at the exact line of code where the bad value was passed, not buried in an asynchronous Horizon response.

```typescript
try {
  const tx = await TxBuilder.for(keypair, { network: 'testnet' })
    .addPayment({
      destination: 'not-a-valid-stellar-address', // ← throws here immediately
      amount: '10',
      asset: 'XLM',
    })
    .build();
} catch (err) {
  // err.message: "Invalid Stellar address for destination: not-a-valid-stellar-address"
  console.error(err.message);
}
```

**Error origins:**

| When it throws | What went wrong |
|---|---|
| At `.add*()` call | Invalid parameter — address, amount, asset code, price, etc. |
| At `.build()` rejection | Network failure or Horizon unreachable |
| At `.submit()` rejection | Horizon rejected the transaction (insufficient balance, bad auth, etc.) |

> **Coming in v0.7:** Structured error classes (`TxBuilderValidationError`, `TxBuilderNetworkError`) will allow programmatic error handling without parsing message strings — especially useful for agent and automated workflows.

Common errors and their causes are documented in [docs/troubleshooting.md](docs/troubleshooting.md).

---

## TypeScript Support

The library ships with full TypeScript declarations. All parameter interfaces are exported:

```typescript
import type {
  TxBuilderOptions,
  PaymentParams,
  CreateAccountParams,
  ChangeTrustParams,
  ManageOfferParams,
  ManageBuyOfferParams,
  PathPaymentParams,
  SetOptionsParams,
  ManageDataParams,
  InvokeContractParams,
  TimeboundParams,
  BuiltTransaction,
  SubmitResult,
} from '@stellarbuild/stellar-flow';
```

---

## Local Development

```bash
# 1. Clone the repository
git clone https://github.com/stellarbuild/stellar-flow.git
cd stellar-flow

# 2. Install dependencies
npm install

# 3. Build (CJS + ESM)
npm run build

# 4. Run tests
npm run test

# 5. Run tests with coverage
npm run test:coverage

# 6. Lint
npm run lint

# 7. Type-check
npm run typecheck
```

See [docs/development.md](docs/development.md) for a complete local development guide.

---

## Repository Structure

```
stellar-flow/
├── src/
│   ├── TxBuilder.ts        # Core builder class
│   ├── types.ts            # All TypeScript interfaces
│   ├── soroban.ts          # ScVal builder utilities for Soroban contract arguments
│   └── index.ts            # Public API surface
├── tests/
│   └── TxBuilder.test.ts   # Unit test suite
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── transaction-builder.md
│   ├── installation.md
│   ├── development.md
│   ├── testing.md
│   ├── publishing.md
│   ├── troubleshooting.md
│   ├── coding-standards.md
│   └── design-decisions.md
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── release.yml
│   ├── ISSUE_TEMPLATE/
│   ├── CODEOWNERS
│   ├── dependabot.yml
│   └── pull_request_template.md
├── dist/                   # Generated — do not edit
│   ├── cjs/
│   └── esm/
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── GOVERNANCE.md
├── ROADMAP.md
├── SECURITY.md
├── SUPPORT.md
├── FAQ.md
└── LICENSE
```

---

## Security

`stellar-flow` is a **transaction construction library** — it does not transmit, store, or manage private keys.

- Private keys (`Keypair`) are passed in by the caller and used only to call `tx.sign()` — a local cryptographic operation that never leaves your process.
- No keys or secrets are logged, cached, or sent over the network by this library.
- All network communication goes directly to Horizon (`@stellar/stellar-sdk`) over HTTPS.

> **Your responsibility:** Keep secret keys out of source code, out of environment variables committed to version control, and out of client-side bundles. Use a secrets manager or hardware wallet for production systems.

To report a security vulnerability, please follow our [Security Policy](SECURITY.md). Do **not** open a public GitHub issue for security concerns.

---

## Contributing

Contributions are welcome and appreciated. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

Quick summary:
1. Fork the repository and create a feature branch.
2. Make your changes with tests.
3. Ensure `npm run lint`, `npm run typecheck`, and `npm run test` all pass.
4. Open a pull request against `main`.

---

## Roadmap

Upcoming highlights:

- **v0.5** — `PathPaymentStrictReceive`, claimable balances, sponsorship operations
- **v0.6** — Full fee bump transaction support
- **v0.7** — Structured error classes, dry-run mode, `TxBuilder.fromXDR()`
- **v0.8** — Agent-focused: state serialization, operation introspection
- **v1.0** — Stable API, full Soroban coverage, comprehensive integration tests

See [ROADMAP.md](ROADMAP.md) for the full roadmap including agent-specific improvements.

---

## FAQ

See [FAQ.md](FAQ.md) for answers to common questions.

---

## License

[MIT](LICENSE) © [StellarBuild](https://stellarbuild.io)[MIT](LICENSE) © [stellarbuild](https://github.com/stellarbuild)

---

## Acknowledgements

- [Stellar Development Foundation](https://stellar.org) for the Stellar network and JavaScript SDK
- The [Stellar Ecosystem Proposals](https://github.com/stellar/stellar-protocol/tree/master/ecosystem) community
- All [contributors](https://github.com/stellarbuild/stellar-flow/graphs/contributors) who have improved this library