import { ScVal } from '../src';
import { xdr, Keypair } from '@stellar/stellar-sdk';

describe('ScVal Utilities', () => {
  it('creates an Address ScVal', () => {
    const address = Keypair.random().publicKey();
    const val = ScVal.Address(address);
    expect(val).toBeInstanceOf(xdr.ScVal);
    expect(val.switch()).toBe(xdr.ScValType.scvAddress());
  });

  it('creates an i128 ScVal', () => {
    const val = ScVal.i128(100);
    expect(val.switch()).toBe(xdr.ScValType.scvI128());
  });

  it('creates a u64 ScVal', () => {
    const val = ScVal.u64('123456789');
    expect(val.switch()).toBe(xdr.ScValType.scvU64());
  });

  it('creates an i32 ScVal', () => {
    const val = ScVal.i32(-42);
    expect(val.switch()).toBe(xdr.ScValType.scvI32());
  });

  it('creates a Bool ScVal', () => {
    const val = ScVal.Bool(true);
    expect(val.switch()).toBe(xdr.ScValType.scvBool());
  });

  it('creates a Symbol ScVal', () => {
    const val = ScVal.Symbol('hello');
    expect(val.switch()).toBe(xdr.ScValType.scvSymbol());
  });

  it('creates a Bytes ScVal from string', () => {
    const val = ScVal.Bytes('deadbeef');
    expect(val.switch()).toBe(xdr.ScValType.scvBytes());
  });

  it('creates a Vec ScVal', () => {
    const val = ScVal.Vec([ScVal.u32(1), ScVal.u32(2)]);
    expect(val.switch()).toBe(xdr.ScValType.scvVec());
  });

  it('creates a Map ScVal', () => {
    const val = ScVal.Map([
      { key: ScVal.Symbol('key1'), val: ScVal.u32(1) },
      { key: ScVal.Symbol('key2'), val: ScVal.u32(2) },
    ]);
    expect(val.switch()).toBe(xdr.ScValType.scvMap());
  });
});
