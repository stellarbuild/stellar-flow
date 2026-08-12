import { xdr, nativeToScVal } from '@stellar/stellar-sdk';

/**
 * Utility functions for building Soroban smart contract arguments (ScVal).
 * These helpers provide a type-safe and convenient way to construct arguments
 * for invokeContract().
 */
export const ScVal = {
  /**
   * Create an ScVal from a Stellar address string (G... or C...)
   */
  Address: (address: string): xdr.ScVal => {
    return nativeToScVal(address, { type: 'address' });
  },

  /**
   * Create an ScVal from a 128-bit integer
   */
  i128: (value: bigint | number | string): xdr.ScVal => {
    return nativeToScVal(value, { type: 'i128' });
  },

  /**
   * Create an ScVal from an unsigned 64-bit integer
   */
  u64: (value: bigint | number | string): xdr.ScVal => {
    return nativeToScVal(value, { type: 'u64' });
  },

  /**
   * Create an ScVal from an unsigned 32-bit integer
   */
  u32: (value: number): xdr.ScVal => {
    return nativeToScVal(value, { type: 'u32' });
  },

  /**
   * Create an ScVal from a signed 32-bit integer
   */
  i32: (value: number): xdr.ScVal => {
    return nativeToScVal(value, { type: 'i32' });
  },

  /**
   * Create an ScVal from a boolean
   */
  Bool: (value: boolean): xdr.ScVal => {
    return nativeToScVal(value, { type: 'bool' });
  },

  /**
   * Create an ScVal from a string
   */
  String: (value: string): xdr.ScVal => {
    return nativeToScVal(value, { type: 'string' });
  },

  /**
   * Create an ScVal from a symbol
   */
  Symbol: (value: string): xdr.ScVal => {
    return nativeToScVal(value, { type: 'symbol' });
  },

  /**
   * Create an ScVal from a buffer or hex string
   */
  Bytes: (data: Buffer | string): xdr.ScVal => {
    const buffer = typeof data === 'string' ? Buffer.from(data, 'hex') : data;
    return nativeToScVal(buffer, { type: 'bytes' });
  },

  /**
   * Create an ScVal vector (array)
   */
  Vec: (items: xdr.ScVal[]): xdr.ScVal => {
    return xdr.ScVal.scvVec(items);
  },

  /**
   * Create an ScVal map from an array of key-value pairs
   */
  Map: (entries: { key: xdr.ScVal; val: xdr.ScVal }[]): xdr.ScVal => {
    return xdr.ScVal.scvMap(
      entries.map(e => new xdr.ScMapEntry({ key: e.key, val: e.val }))
    );
  }
};
