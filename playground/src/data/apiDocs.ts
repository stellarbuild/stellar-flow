export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface LibraryMethod {
  id: string;
  category: string;
  name: string;
  signature: string;
  description: string;
  params: Parameter[];
  returns: {
    type: string;
    description: string;
  };
  snippets: {
    typescript: string;
  };
}

export const LIBRARY_DOCS: LibraryMethod[] = [
  {
    id: 'for',
    category: 'Initialization',
    name: 'TxBuilder.for',
    signature: 'static for(keypair: Keypair, options: TxBuilderOptions): TxBuilder',
    description: 'Initializes a new transaction builder instance with the source account keypair and network configuration. Automatically fetches the sequence number from Horizon during build().',
    params: [
      {
        name: 'keypair',
        type: 'Keypair',
        required: true,
        description: 'The source account keypair that will be used to fetch the sequence number.'
      },
      {
        name: 'options',
        type: 'TxBuilderOptions',
        required: true,
        description: 'Configuration including network, fee, and optional timeout or Horizon URL.'
      }
    ],
    returns: {
      type: 'TxBuilder',
      description: 'A new chainable builder instance.'
    },
    snippets: {
      typescript: `import { TxBuilder } from '@stellarbuild/stellar-flow';
import { Keypair } from '@stellar/stellar-sdk';

const keypair = Keypair.fromSecret('S...');
const builder = TxBuilder.for(keypair, {
  network: 'testnet',
  fee: '100'
});`
    }
  },
  {
    id: 'add-payment',
    category: 'Operations',
    name: '.addPayment',
    signature: '.addPayment(params: PaymentParams): this',
    description: 'Adds a payment operation to the transaction. Supports native XLM or issued assets.',
    params: [
      {
        name: 'destination',
        type: 'string',
        required: true,
        description: 'The recipient\'s Stellar public address (G...).'
      },
      {
        name: 'amount',
        type: 'string',
        required: true,
        description: 'Amount to send, as a string to avoid precision loss.'
      },
      {
        name: 'asset',
        type: 'Asset | "XLM" | { code: string; issuer: string }',
        required: true,
        description: 'The asset to send.'
      }
    ],
    returns: {
      type: 'this',
      description: 'The builder instance for chaining.'
    },
    snippets: {
      typescript: `import { TxBuilder } from '@stellarbuild/stellar-flow';
import { Keypair } from '@stellar/stellar-sdk';

const keypair = Keypair.fromSecret('S...');
const tx = await TxBuilder.for(keypair, { network: 'testnet' })
  .addPayment({
    destination: 'GBX...',
    amount: '100.5',
    asset: 'XLM' // or { code: 'USDC', issuer: 'G...' }
  })
  .build();`
    }
  },
  {
    id: 'invoke-contract',
    category: 'Soroban',
    name: '.invokeContract',
    signature: '.invokeContract(params: InvokeContractParams): this',
    description: 'Invokes a Soroban smart contract function. Automatically resolves the required resource fee and footprint during build().',
    params: [
      {
        name: 'contractId',
        type: 'string',
        required: true,
        description: 'The Strkey representation of the contract (C...).'
      },
      {
        name: 'functionName',
        type: 'string',
        required: true,
        description: 'The name of the function to invoke on the contract.'
      },
      {
        name: 'args',
        type: 'xdr.ScVal[]',
        required: false,
        description: 'Arguments to pass to the function.'
      }
    ],
    returns: {
      type: 'this',
      description: 'The builder instance for chaining.'
    },
    snippets: {
      typescript: `import { TxBuilder, ScVal } from '@stellarbuild/stellar-flow';
import { Keypair } from '@stellar/stellar-sdk';

const keypair = Keypair.fromSecret('S...');
const tx = await TxBuilder.for(keypair, {
  network: 'testnet',
  sorobanUrl: 'https://soroban-testnet.stellar.org'
})
  .invokeContract({
    contractId: 'C...',
    functionName: 'increment',
    args: [ScVal.u32(1)]
  })
  .build();`
    }
  },
  {
    id: 'build',
    category: 'Execution',
    name: '.build',
    signature: 'async .build(): Promise<BuiltTransaction>',
    description: 'Validates all parameters, fetches the current sequence number, applies timebounds, and compiles the final transaction envelope.',
    params: [],
    returns: {
      type: 'Promise<BuiltTransaction>',
      description: 'An interface wrapper around the compiled transaction, ready for signing.'
    },
    snippets: {
      typescript: `const builtTx = await builder.build();
console.log('Base fee applied:', builtTx.inner.fee);`
    }
  }
];
