/**
 * Thrown when an input parameter fails validation locally before any network call.
 */
export class TxBuilderValidationError extends Error {
  field?: string;
  value?: unknown;

  constructor(message: string, field?: string, value?: unknown) {
    super(message);
    this.name = 'TxBuilderValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Thrown when a network request to Horizon or Soroban RPC fails due to connectivity,
 * timeout, or unexpected server errors.
 */
export class TxBuilderNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TxBuilderNetworkError';
  }
}

/**
 * Thrown when a transaction submission is rejected by the Horizon network.
 * Includes the parsed result_codes from the Horizon error response.
 */
export class TxBuilderSubmitError extends Error {
  resultCodes?: Record<string, unknown>;

  constructor(message: string, resultCodes?: Record<string, unknown>) {
    super(message);
    this.name = 'TxBuilderSubmitError';
    this.resultCodes = resultCodes;
  }
}
