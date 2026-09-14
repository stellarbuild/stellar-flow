import {
  Keypair,
  Networks,
  TransactionBuilder as StellarTransactionBuilder,
  TimeoutInfinite,
  Operation,
  Asset,
  Memo,
  Horizon,
  Transaction,
  xdr,
  Address,
  rpc,
  nativeToScVal,
} from '@stellar/stellar-sdk';
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
  NetworkPassphrase,
  TxDescription,
  OperationDescription,
} from './types';
import { TxBuilderValidationError, TxBuilderNetworkError, TxBuilderSubmitError } from './errors';

// ── helpers ────────────────────────────────────────────────────────────────

/**
 * Horizon API endpoints for each Stellar network
 */
const HORIZON_URLS: Record<string, string> = {
  mainnet: 'https://horizon.stellar.org',
  testnet: 'https://horizon-testnet.stellar.org',
  futurenet: 'https://horizon-futurenet.stellar.org',
};

/**
 * Network passphrases for each Stellar network
 */
const NETWORK_PASSPHRASES: Record<string, NetworkPassphrase> = {
  mainnet: Networks.PUBLIC,
  testnet: Networks.TESTNET,
  futurenet: Networks.FUTURENET,
};

/**
 * Resolves a payment asset to a Stellar Asset object
 * @param asset - Either 'XLM' for native asset or a custom asset with code and issuer
 * @returns Stellar Asset instance
 * @throws Error if custom asset code or issuer is invalid
 */
function resolveAsset(asset: 'XLM' | { code: string; issuer: string }): Asset {
  if (asset === 'XLM') return Asset.native();

  if (!asset.code || typeof asset.code !== 'string') {
    throw new TxBuilderValidationError(
      'Asset code must be a non-empty string',
      'asset.code',
      asset.code,
    );
  }
  if (!asset.issuer || typeof asset.issuer !== 'string') {
    throw new TxBuilderValidationError(
      'Asset issuer must be a non-empty string',
      'asset.issuer',
      asset.issuer,
    );
  }

  try {
    return new Asset(asset.code, asset.issuer);
  } catch (error) {
    throw new TxBuilderValidationError(
      `Invalid asset: code="${asset.code}", issuer="${asset.issuer}"`,
      'asset',
      asset,
    );
  }
}

/**
 * Resolves a price parameter to a Stellar price object
 * @param price - Either a string number or a fraction object with n (numerator) and d (denominator)
 * @returns Price object with n and d properties
 * @throws Error if price is invalid
 */
function resolvePrice(price: ManageOfferParams['price'] | ManageBuyOfferParams['price']): {
  n: number;
  d: number;
} {
  if (typeof price === 'string') {
    const n = parseFloat(price);
    if (isNaN(n) || n <= 0) {
      throw new TxBuilderValidationError(
        `Invalid price: "${price}" must be a positive number`,
        'price',
        price,
      );
    }
    // Convert decimal to fraction with denominator 1 for simplicity
    // Stellar SDK will handle the conversion internally
    return { n: Math.floor(n * 10000000), d: 10000000 };
  }

  if (typeof price === 'object' && price.n !== undefined && price.d !== undefined) {
    if (price.n <= 0 || price.d <= 0) {
      throw new TxBuilderValidationError(
        `Invalid price fraction: numerator and denominator must be positive`,
        'price',
        price,
      );
    }
    return { n: price.n, d: price.d };
  }

  throw new TxBuilderValidationError(
    `Invalid price format: must be a string or {n, d} object`,
    'price',
    price,
  );
}

/**
 * Parses a timebound value into a Unix timestamp
 * @param value - Unix timestamp number, ISO date string, or relative time string (e.g., '+5m', '+1h')
 * @returns Unix timestamp in seconds
 * @throws Error if the time value cannot be parsed
 */
function parseRelativeTime(value: string | number): number {
  if (typeof value === 'number') return value;

  const now = Math.floor(Date.now() / 1000);
  const match = value.match(/^\+(\d+)(s|m|h|d)$/);
  if (match) {
    const amount = parseInt(match[1], 10);
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return now + amount * multipliers[match[2]];
  }

  const parsed = Math.floor(new Date(value).getTime() / 1000);
  if (isNaN(parsed))
    throw new TxBuilderValidationError(`Invalid time value: "${value}"`, 'time', value);
  return parsed;
}

/**
 * Validates a Stellar public key address
 * @param address - The address to validate
 * @param label - Label for error message context
 * @throws Error if the address is not a valid Stellar public key
 */
function validateAddress(address: string, label: string): void {
  if (!address || typeof address !== 'string') {
    throw new TxBuilderValidationError(`${label} must be a non-empty string`, label, address);
  }
  try {
    Keypair.fromPublicKey(address);
  } catch {
    throw new TxBuilderValidationError(
      `Invalid Stellar address for ${label}: "${address}". Expected a valid public key starting with 'G'.`,
      label,
      address,
    );
  }
}

/**
 * Validates an amount string
 * @param amount - The amount to validate
 * @param label - Label for error message context
 * @throws Error if the amount is not a positive number
 */
function validateAmount(amount: string, label: string): void {
  if (!amount || typeof amount !== 'string') {
    throw new TxBuilderValidationError(`${label} must be a non-empty string`, label, amount);
  }
  const n = parseFloat(amount);
  if (isNaN(n)) {
    throw new TxBuilderValidationError(
      `Invalid amount for ${label}: "${amount}" is not a valid number`,
      label,
      amount,
    );
  }
  if (n <= 0) {
    throw new TxBuilderValidationError(
      `Invalid amount for ${label}: "${amount}" must be greater than 0`,
      label,
      amount,
    );
  }
}

// ── BuiltTransaction impl ──────────────────────────────────────────────────

/**
 * Internal implementation of BuiltTransaction interface
 * Wraps a Stellar Transaction and Horizon Server for signing and submission
 */
class BuiltTransactionImpl implements BuiltTransaction {
  private tx: Transaction;
  private server: Horizon.Server;
  xdr: string;

  constructor(tx: Transaction, server: Horizon.Server) {
    this.tx = tx;
    this.server = server;
    this.xdr = tx.toXDR();
  }

  /**
   * Signs the transaction with the provided keypair
   * @param keypair - The keypair to sign with
   * @returns This instance for chaining
   */
  sign(keypair: Keypair): BuiltTransaction {
    this.tx.sign(keypair);
    this.xdr = this.tx.toXDR();
    return this;
  }

  /**
   * Returns the current XDR representation of the transaction
   * @returns XDR string
   */
  toXDR(): string {
    return this.tx.toXDR();
  }

  /**
   * Submits the signed transaction to the Horizon network
   * @returns SubmitResult with transaction hash, ledger, and success status
   * @throws Error if submission fails
   */
  async submit(): Promise<SubmitResult> {
    try {
      const response = await this.server.submitTransaction(this.tx);
      return {
        hash: response.hash,
        ledger: response.ledger,
        successful: response.successful,
        resultXdr: response.result_xdr,
      };
    } catch (e: any) {
      if (e.response?.data?.extras?.result_codes) {
        throw new TxBuilderSubmitError(
          e.message || 'Transaction submission failed',
          e.response.data.extras.result_codes,
        );
      }
      throw new TxBuilderNetworkError(e.message || 'Network error during submission');
    }
  }
}

// ── TxBuilder ──────────────────────────────────────────────────────────────

/**
 * Fluent builder for constructing Stellar transactions
 * Provides a chainable API for adding operations, setting memos/timebounds,
 * building, signing, and submitting transactions
 */
export class TxBuilder {
  private keypair: Keypair;
  private options: TxBuilderOptions;
  private operations: xdr.Operation[] = [];
  private descriptors: OperationDescription[] = [];
  private memo?: Memo;
  private timebounds?: { minTime: number; maxTime: number };

  private constructor(keypair: Keypair, options: TxBuilderOptions) {
    this.keypair = keypair;
    this.options = options;
  }

  /**
   * Entry point — create a builder for a given keypair and network
   * @param keypair - Source account keypair
   * @param options - Builder options including network, fee, and Horizon URL
   * @returns New TxBuilder instance
   */
  static for(keypair: Keypair, options: TxBuilderOptions): TxBuilder {
    return new TxBuilder(keypair, options);
  }

  /**
   * Reconstruct a TxBuilder from an existing XDR transaction envelope.
   * Useful for resuming, inspecting, or adding operations to a transaction created elsewhere.
   *
   * @param xdr - The base64 XDR transaction envelope
   * @param options - Builder options (network is required)
   * @returns A restored TxBuilder instance
   * @throws TxBuilderValidationError if an operation is not supported by stellar-flow
   */
  static fromXDR(xdrString: string, options: TxBuilderOptions): TxBuilder {
    let tx;
    try {
      const passphrase = NETWORK_PASSPHRASES[options.network];
      tx = new Transaction(xdrString, passphrase);
    } catch (e: any) {
      throw new TxBuilderValidationError(`Failed to parse XDR: ${e.message}`, 'xdr', xdrString);
    }

    // Reconstruct a public-only keypair for the source account
    const sourceKeypair = Keypair.fromPublicKey(tx.source);

    // Create builder with parsed fee (Stellar SDK tx.fee is total fee, options.fee is base fee)
    const baseFee = Math.floor(parseInt(tx.fee, 10) / Math.max(1, tx.operations.length)).toString();

    const builder = TxBuilder.for(sourceKeypair, {
      ...options,
      fee: baseFee,
    });

    if (tx.memo && tx.memo.type !== 'none') {
      if (tx.memo.type === 'text' && tx.memo.value) {
        builder.setMemo(tx.memo.value.toString('utf8'));
      } else {
        // Fallback for non-text memos which stellar-flow doesn't fully expose via builder yet,
        // but we can just set the raw memo directly to avoid losing it.
        builder.memo = tx.memo;
      }
    }

    if (tx.timeBounds) {
      // In stellar-sdk, timeBounds minTime and maxTime are strings
      builder.timebounds = {
        minTime: parseInt(tx.timeBounds.minTime, 10),
        maxTime: parseInt(tx.timeBounds.maxTime, 10),
      };
    }

    // Map operations
    for (const op of tx.operations) {
      mapParsedOperation(builder, op);
    }

    return builder;
  }

  // ── operations ────────────────────────────────────────────────────────

  /**
   * Adds a payment operation to the transaction
   * @param params - Payment parameters including destination, amount, and asset
   * @returns This instance for chaining
   * @throws Error if destination address or amount is invalid
   */
  addPayment(params: PaymentParams): this {
    validateAddress(params.destination, 'destination');
    validateAmount(params.amount, 'payment');

    this.operations.push(
      Operation.payment({
        destination: params.destination,
        asset: resolveAsset(params.asset),
        amount: params.amount,
      }),
    );
    this.descriptors.push({ type: 'payment', params });

    if (params.memo) this.memo = Memo.text(params.memo);
    return this;
  }

  /**
   * Adds a create account operation to the transaction
   * @param params - Create account parameters including destination and starting balance
   * @returns This instance for chaining
   * @throws Error if destination address or starting balance is invalid
   */
  addCreateAccount(params: CreateAccountParams): this {
    validateAddress(params.destination, 'destination');
    validateAmount(params.startingBalance, 'startingBalance');

    this.operations.push(
      Operation.createAccount({
        destination: params.destination,
        startingBalance: params.startingBalance,
      }),
    );
    this.descriptors.push({ type: 'createAccount', params });
    return this;
  }

  /**
   * Adds a change trust operation to the transaction
   * @param params - Change trust parameters including asset and optional limit
   * @returns This instance for chaining
   */
  addChangeTrust(params: ChangeTrustParams): this {
    const asset = resolveAsset({ code: params.asset.code, issuer: params.asset.issuer });
    this.operations.push(
      Operation.changeTrust({
        asset,
        ...(params.limit !== undefined ? { limit: params.limit } : {}),
      }),
    );
    this.descriptors.push({ type: 'changeTrust', params });
    return this;
  }

  /**
   * Adds a manage sell offer operation to the transaction
   * @param params - Manage offer parameters including selling/buying assets, amount, price, and optional offer ID
   * @returns This instance for chaining
   * @throws Error if parameters are invalid
   */
  addManageOffer(params: ManageOfferParams): this {
    validateAmount(params.amount, 'offer amount');

    const selling = resolveAsset(params.selling);
    const buying = resolveAsset(params.buying);
    const price = resolvePrice(params.price);

    this.operations.push(
      Operation.manageSellOffer({
        selling,
        buying,
        amount: params.amount,
        price,
        offerId: params.offerId || '0',
      }),
    );
    this.descriptors.push({ type: 'manageSellOffer', params });
    return this;
  }

  /**
   * Adds a manage buy offer operation to the transaction
   * @param params - Manage buy offer parameters including selling/buying assets, amount, price, and optional offer ID
   * @returns This instance for chaining
   * @throws Error if parameters are invalid
   */
  addManageBuyOffer(params: ManageBuyOfferParams): this {
    validateAmount(params.amount, 'buy offer amount');

    const selling = resolveAsset(params.selling);
    const buying = resolveAsset(params.buying);
    const price = resolvePrice(params.price);

    this.operations.push(
      Operation.manageBuyOffer({
        selling,
        buying,
        buyAmount: params.amount,
        price,
        offerId: params.offerId || '0',
      }),
    );
    this.descriptors.push({ type: 'manageBuyOffer', params });
    return this;
  }

  /**
   * Adds a path payment strict send operation to the transaction
   * @param params - Path payment parameters including destination, send/dest assets and amounts, and optional path
   * @returns This instance for chaining
   * @throws Error if parameters are invalid
   */
  addPathPayment(params: PathPaymentParams): this {
    validateAddress(params.destination, 'destination');
    validateAmount(params.sendAmount, 'send amount');
    validateAmount(params.destAmount, 'destination amount');

    const sendAsset = resolveAsset(params.sendAsset);
    const destAsset = resolveAsset(params.destAsset);
    const path = params.path ? params.path.map(resolveAsset) : [];

    this.operations.push(
      Operation.pathPaymentStrictSend({
        destination: params.destination,
        sendAsset,
        sendAmount: params.sendAmount,
        destAsset,
        destMin: params.destAmount,
        path,
      }),
    );
    this.descriptors.push({ type: 'pathPaymentStrictSend', params });
    return this;
  }

  /**
   * Adds a set options operation to the transaction
   * @param params - Set options parameters for account configuration
   * @returns This instance for chaining
   * @throws Error if parameters are invalid
   */
  addSetOptions(params: SetOptionsParams): this {
    const operationParams: Record<string, unknown> = {};

    if (params.inflationDest !== undefined) {
      validateAddress(params.inflationDest, 'inflation destination');
      operationParams.inflationDest = params.inflationDest;
    }

    if (params.clearFlags !== undefined) {
      operationParams.clearFlags = params.clearFlags;
    }

    if (params.setFlags !== undefined) {
      operationParams.setFlags = params.setFlags;
    }

    if (params.masterWeight !== undefined) {
      if (params.masterWeight < 0 || params.masterWeight > 255) {
        throw new TxBuilderValidationError(
          'Master weight must be between 0 and 255',
          'masterWeight',
          params.masterWeight,
        );
      }
      operationParams.masterWeight = params.masterWeight;
    }

    if (params.lowThreshold !== undefined) {
      if (params.lowThreshold < 0 || params.lowThreshold > 255) {
        throw new TxBuilderValidationError(
          'Low threshold must be between 0 and 255',
          'lowThreshold',
          params.lowThreshold,
        );
      }
      operationParams.lowThreshold = params.lowThreshold;
    }

    if (params.medThreshold !== undefined) {
      if (params.medThreshold < 0 || params.medThreshold > 255) {
        throw new TxBuilderValidationError(
          'Medium threshold must be between 0 and 255',
          'medThreshold',
          params.medThreshold,
        );
      }
      operationParams.medThreshold = params.medThreshold;
    }

    if (params.highThreshold !== undefined) {
      if (params.highThreshold < 0 || params.highThreshold > 255) {
        throw new TxBuilderValidationError(
          'High threshold must be between 0 and 255',
          'highThreshold',
          params.highThreshold,
        );
      }
      operationParams.highThreshold = params.highThreshold;
    }

    if (params.homeDomain !== undefined) {
      if (params.homeDomain.length > 32) {
        throw new TxBuilderValidationError(
          'Home domain must be 32 characters or fewer',
          'homeDomain',
          params.homeDomain,
        );
      }
      operationParams.homeDomain = params.homeDomain;
    }

    if (params.signer !== undefined) {
      if (params.signer.weight < 0 || params.signer.weight > 255) {
        throw new TxBuilderValidationError(
          'Signer weight must be between 0 and 255',
          'signer.weight',
          params.signer.weight,
        );
      }

      const signer: Record<string, unknown> = { weight: params.signer.weight };

      if (params.signer.ed25519PublicKey) {
        validateAddress(params.signer.ed25519PublicKey, 'signer public key');
        signer.ed25519PublicKey = params.signer.ed25519PublicKey;
      } else if (params.signer.sha256Hash) {
        if (typeof params.signer.sha256Hash === 'string') {
          if (params.signer.sha256Hash.length !== 64) {
            throw new TxBuilderValidationError(
              'SHA256 hash must be 64 hex characters (32 bytes)',
              'signer.sha256Hash',
              params.signer.sha256Hash,
            );
          }
          signer.sha256Hash = Buffer.from(params.signer.sha256Hash, 'hex');
        } else {
          signer.sha256Hash = params.signer.sha256Hash;
        }
      } else if (params.signer.preAuthTx) {
        if (typeof params.signer.preAuthTx === 'string') {
          if (params.signer.preAuthTx.length !== 64) {
            throw new TxBuilderValidationError(
              'PreAuthTx must be 64 hex characters (32 bytes)',
              'signer.preAuthTx',
              params.signer.preAuthTx,
            );
          }
          signer.preAuthTx = Buffer.from(params.signer.preAuthTx, 'hex');
        } else {
          signer.preAuthTx = params.signer.preAuthTx;
        }
      } else {
        throw new TxBuilderValidationError(
          'Signer must specify one of: ed25519PublicKey, sha256Hash, or preAuthTx',
          'signer',
          params.signer,
        );
      }

      operationParams.signer = signer;
    }

    this.operations.push(Operation.setOptions(operationParams));
    this.descriptors.push({ type: 'setOptions', params });
    return this;
  }

  /**
   * Adds a manage data operation to the transaction
   * @param params - Manage data parameters including name and value
   * @returns This instance for chaining
   * @throws Error if parameters are invalid
   */
  addManageData(params: ManageDataParams): this {
    if (!params.name || typeof params.name !== 'string') {
      throw new TxBuilderValidationError(
        'Data name must be a non-empty string',
        'name',
        params.name,
      );
    }

    const nameBytes = Buffer.byteLength(params.name, 'utf8');
    if (nameBytes > 64) {
      throw new TxBuilderValidationError(
        `Data name exceeds 64-byte limit (${nameBytes} bytes)`,
        'name',
        params.name,
      );
    }

    if (params.value !== undefined && params.value !== null) {
      if (typeof params.value !== 'string') {
        throw new TxBuilderValidationError('Data value must be a string', 'value', params.value);
      }

      const valueBytes = Buffer.byteLength(params.value, 'utf8');
      if (valueBytes > 64) {
        throw new TxBuilderValidationError(
          `Data value exceeds 64-byte limit (${valueBytes} bytes)`,
          'value',
          params.value,
        );
      }
    }

    this.operations.push(
      Operation.manageData({
        name: params.name,
        value: params.value,
      }),
    );
    this.descriptors.push({ type: 'manageData', params });
    return this;
  }

  /**
   * Adds a Soroban smart contract invocation operation to the transaction
   * @param params - Invoke contract parameters including contract ID, function name, and arguments
   * @returns This instance for chaining
   * @throws Error if parameters are invalid
   * @note This is a placeholder for future Soroban support. For now, use the Stellar SDK directly:
   * Operation.invokeHostFunction({ func: xdr.HostFunction.invokeContract({ ... }) })
   */
  invokeContract(params: InvokeContractParams): this {
    if (!params.contractId || typeof params.contractId !== 'string') {
      throw new TxBuilderValidationError(
        'Contract ID must be a non-empty string',
        'contractId',
        params.contractId,
      );
    }

    if (!params.functionName || typeof params.functionName !== 'string') {
      throw new TxBuilderValidationError(
        'Function name must be a non-empty string',
        'functionName',
        params.functionName,
      );
    }

    let contractAddress: Address;
    try {
      contractAddress = new Address(params.contractId);
    } catch (error) {
      throw new TxBuilderValidationError(
        'Invalid contract ID format',
        'contractId',
        params.contractId,
      );
    }

    let scValArgs: xdr.ScVal[] = [];
    if (params.args) {
      scValArgs = params.args.map((arg) => {
        if (arg instanceof xdr.ScVal) return arg;
        if (typeof arg === 'object' && arg !== null) {
          const obj = arg as Record<string, unknown>;
          if ('address' in obj && typeof obj.address === 'string') {
            return nativeToScVal(obj.address, { type: 'address' });
          }
        }
        return nativeToScVal(arg);
      });
    }

    this.operations.push(
      Operation.invokeHostFunction({
        func: xdr.HostFunction.hostFunctionTypeInvokeContract(
          new xdr.InvokeContractArgs({
            contractAddress: contractAddress.toScAddress(),
            functionName: params.functionName,
            args: scValArgs,
          }),
        ),
        auth: [],
      }),
    );
    this.descriptors.push({ type: 'invokeContract', params });
    return this;
  }

  /**
   * Wraps the transaction in a fee bump transaction.
   *
   * **Not yet implemented.** Full support is planned for v0.6.0 — see ROADMAP.md.
   * Calling this method will always throw synchronously.
   *
   * @param feeSource - Public key of the account paying the fee
   * @param fee - Fee to pay (in stroops), defaults to base fee
   * @throws Error always — feature not yet implemented
   */
  wrapInFeeBump(_feeSource: string, _fee?: string): this {
    throw new Error(
      'wrapInFeeBump() is not yet implemented. Full fee bump support is planned for v0.6.0. ' +
        'See ROADMAP.md or use TransactionBuilder.buildFeeBumpTransaction() from @stellar/stellar-sdk directly.',
    );
  }

  /**
   * Sets a text memo for the transaction
   * @param text - Memo text (max 28 bytes)
   * @returns This instance for chaining
   * @throws Error if memo exceeds 28 bytes or is empty
   */
  setMemo(text: string): this {
    if (!text || typeof text !== 'string') {
      throw new TxBuilderValidationError('Memo must be a non-empty string', 'memo', text);
    }
    const byteLength = Buffer.byteLength(text, 'utf8');
    if (byteLength > 28)
      throw new TxBuilderValidationError(
        `Memo text exceeds 28-byte limit (${byteLength} bytes)`,
        'memo',
        text,
      );
    this.memo = Memo.text(text);
    return this;
  }

  /**
   * Sets timebounds for the transaction validity window
   * @param bounds - Timebound parameters with optional minTime and maxTime
   * @returns This instance for chaining
   */
  setTimebounds(bounds: TimeboundParams): this {
    this.timebounds = {
      minTime: bounds.minTime !== undefined ? parseRelativeTime(bounds.minTime) : 0,
      maxTime: bounds.maxTime !== undefined ? parseRelativeTime(bounds.maxTime) : 0,
    };
    return this;
  }

  // ── inspection ────────────────────────────────────────────────────────

  /**
   * Returns a plain-object description of the builder's current state.
   * Useful for AI agents to inspect and validate a transaction before building.
   * @returns TxDescription object
   */
  describe(): TxDescription {
    return {
      network: this.options.network,
      source: this.keypair.publicKey(),
      fee: this.options.fee || '100',
      memo: this.memo?.value?.toString() || undefined,
      timebounds: this.timebounds,
      operations: [...this.descriptors],
    };
  }

  // ── build ─────────────────────────────────────────────────────────────

  /**
   * Builds the transaction by loading the source account from Horizon
   * and assembling all operations, memos, and timebounds
   * @returns BuiltTransaction ready for signing and submission
   * @throws Error if no operations have been added
   */
  async build(): Promise<BuiltTransaction> {
    if (this.operations.length === 0)
      throw new TxBuilderValidationError('Cannot build a transaction with no operations');

    const horizonUrl = this.options.horizonUrl ?? HORIZON_URLS[this.options.network];
    const passphrase = NETWORK_PASSPHRASES[this.options.network];
    const server = new Horizon.Server(horizonUrl);

    let sourceAccount;
    try {
      sourceAccount = await server.loadAccount(this.keypair.publicKey());
    } catch (e: any) {
      throw new TxBuilderNetworkError(`Failed to load source account: ${e.message}`);
    }

    const builder = new StellarTransactionBuilder(sourceAccount, {
      fee: this.options.fee ?? '100',
      networkPassphrase: passphrase,
    });

    for (const op of this.operations) {
      builder.addOperation(op);
    }

    if (this.memo) builder.addMemo(this.memo);

    // Apply timebounds if set, otherwise use TimeoutInfinite
    if (this.timebounds) {
      builder.setTimebounds(this.timebounds.minTime, this.timebounds.maxTime);
    } else {
      builder.setTimeout(TimeoutInfinite);
    }

    const tx = builder.build() as Transaction;

    let finalTx = tx;
    const hasSoroban = this.operations.some(
      (op) => op.body().switch() === xdr.OperationType.invokeHostFunction(),
    );

    if (hasSoroban) {
      if (!this.options.sorobanUrl) {
        throw new TxBuilderValidationError(
          'sorobanUrl is required in TxBuilderOptions when invoking a Soroban contract',
          'sorobanUrl',
          undefined,
        );
      }
      const sorobanServer = new rpc.Server(this.options.sorobanUrl);
      try {
        finalTx = (await sorobanServer.prepareTransaction(tx)) as Transaction;
      } catch (e: any) {
        throw new TxBuilderNetworkError(`Failed to prepare Soroban transaction: ${e.message}`);
      }
    }

    return new BuiltTransactionImpl(finalTx, server);
  }
}

// ── parsing helpers ────────────────────────────────────────────────────────

/**
 * Maps a parsed stellar-sdk operation object back to stellar-flow's builder methods.
 * @param builder - The TxBuilder instance to add the operation to
 * @param op - The parsed operation object from tx.operations
 * @throws TxBuilderValidationError if the operation type is not supported
 */
function mapParsedOperation(builder: TxBuilder, op: any): void {
  const mapAsset = (asset: Asset) =>
    asset.isNative() ? 'XLM' : { code: asset.getCode(), issuer: asset.getIssuer() };

  switch (op.type) {
    case 'payment':
      builder.addPayment({
        destination: op.destination,
        asset: mapAsset(op.asset),
        amount: op.amount,
      });
      break;

    case 'createAccount':
      builder.addCreateAccount({
        destination: op.destination,
        startingBalance: op.startingBalance,
      });
      break;

    case 'changeTrust':
      builder.addChangeTrust({
        asset: mapAsset(op.line) as { code: string; issuer: string },
        limit: op.limit,
      });
      break;

    case 'manageSellOffer':
      builder.addManageOffer({
        selling: mapAsset(op.selling),
        buying: mapAsset(op.buying),
        amount: op.amount,
        price: op.price,
        offerId: op.offerId,
      });
      break;

    case 'manageBuyOffer':
      builder.addManageBuyOffer({
        selling: mapAsset(op.selling),
        buying: mapAsset(op.buying),
        amount: op.buyAmount,
        price: op.price,
        offerId: op.offerId,
      });
      break;

    case 'pathPaymentStrictSend':
      builder.addPathPayment({
        destination: op.destination,
        sendAsset: mapAsset(op.sendAsset),
        sendAmount: op.sendAmount,
        destAsset: mapAsset(op.destAsset),
        destAmount: op.destMin,
        path: op.path ? op.path.map(mapAsset) : [],
      });
      break;

    case 'setOptions':
      builder.addSetOptions({
        inflationDest: op.inflationDest,
        clearFlags: op.clearFlags,
        setFlags: op.setFlags,
        masterWeight: op.masterWeight,
        lowThreshold: op.lowThreshold,
        medThreshold: op.medThreshold,
        highThreshold: op.highThreshold,
        homeDomain: op.homeDomain,
        signer: op.signer,
      });
      break;

    case 'manageData':
      builder.addManageData({
        name: op.name,
        value: op.value
          ? typeof op.value === 'string'
            ? op.value
            : op.value.toString('utf8')
          : undefined,
      });
      break;

    case 'invokeHostFunction':
      if (op.func && op.func.switch().name === 'hostFunctionTypeInvokeContract') {
        const invokeArgs = op.func.value();
        const contractId = Address.fromScAddress(invokeArgs.contractAddress()).toString();
        const functionName = invokeArgs.functionName().toString('utf8');

        builder.invokeContract({
          contractId,
          functionName,
          args: invokeArgs.args(),
        });
      } else {
        throw new TxBuilderValidationError(
          `Unsupported invokeHostFunction type in fromXDR`,
          'operation',
          op,
        );
      }
      break;

    default:
      throw new TxBuilderValidationError(
        `Unsupported operation type in fromXDR: ${op.type}`,
        'operation',
        op,
      );
  }
}
