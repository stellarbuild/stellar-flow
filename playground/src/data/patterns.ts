export interface Pattern {
  id: string;
  number: string;
  title: string;
  summary: string;
  code: string;
  computeOverhead: string;
  latencyImpact: string;
  beforeDesc: string;
  afterDesc: string;
  stellarFlowEquivalent: string;
}

export const ARCHITECTURAL_PATTERNS: Pattern[] = [
  {
    id: 'optimistic-batching',
    number: '01',
    title: 'Optimistic Batching',
    summary: 'Aggregating multiple state transitions into a single verifiable proof. Reduces on-chain footprint and normalizes gas execution costs across high-frequency operations.',
    code: `impl BatchProcessor {
    pub fn process_queue(
        env: Env,
        operations: Vec<StateOperation>
    ) -> Result<Map<Address, i128>, BatchError> {
        let mut state_deltas = StateDeltaMap::new();
        for op in operations.iter() {
            let result = self.verify_and_apply(&env, &op)?;
            state_deltas.merge(result);
        }
        self.commit_deltas(&env, state_deltas)
    }
}`,
    computeOverhead: 'O(n) -> O(1) storage',
    latencyImpact: '+12ms per batch',
    beforeDesc: 'Sequential N-transactions, high base fees, unbounded block contention.',
    afterDesc: 'Single compressed batch, deterministic single-slot commitment, 78% gas reduction.',
    stellarFlowEquivalent: `import { TxBuilder } from '@stellarbuild/stellar-flow';

const batchTx = await TxBuilder.for(relayerKeypair, { network: 'testnet' })
  .addPayment({ destination: 'G_USER_A', amount: '50.0', asset: 'XLM' })
  .addPayment({ destination: 'G_USER_B', amount: '75.0', asset: 'XLM' })
  .addManageData({ name: 'batch_merkle_root', value: merkleRoot })
  .setTimebounds({ maxTime: '+30s' })
  .build();`
  },
  {
    id: 'ephemeral-channels',
    number: '02',
    title: 'Ephemeral Channels',
    summary: 'Establishing temporary, off-chain state machines for high-throughput bilateral interactions. State is only committed back to the global layer upon channel closure or dispute.',
    code: `struct ChannelState {
    participants: [Address; 2],
    nonce: u64,
    balances: [i64; 2],
    timeout_block: u32,
}

fn verify_channel_update(
    env: &Env,
    state: &ChannelState,
    signatures: [Signature; 2]
) -> bool {
    let payload = env.crypto().sha256(state.serialize());
    signatures[0].verify(&state.participants[0], &payload) &&
    signatures[1].verify(&state.participants[1], &payload)
}`,
    computeOverhead: 'Zero L1 footprint',
    latencyImpact: '< 1ms bilateral delta',
    beforeDesc: 'Every tick touches global state storage, high gas volatility, throughput bottlenecks.',
    afterDesc: 'Off-chain cryptographically signed transitions with atomic on-chain dispute finality.',
    stellarFlowEquivalent: `import { TxBuilder, ScVal } from '@stellarbuild/stellar-flow';

const settleChannelTx = await TxBuilder.for(channelManager, {
  network: 'testnet',
  sorobanUrl: 'https://soroban-testnet.stellar.org',
})
  .invokeContract({
    contractId: 'C_CHANNEL_REGISTRY',
    functionName: 'settle_dispute',
    args: [ScVal.u64(finalNonce), ScVal.i128(balanceAlice), ScVal.i128(balanceBob)]
  })
  .build();`
  },
  {
    id: 'capability-delegation',
    number: '03',
    title: 'Capability Delegation',
    summary: 'Instead of passing complex permissions arrays, components pass opaque, cryptographically verifiable capability tokens. Enables zero-trust execution contexts.',
    code: `trait RequiresCapability {
    fn execute_privileged(
        &mut self,
        env: Env,
        cap: CapabilityToken,
        args: Args
    ) -> Result<ExecutionReceipt, AuthError> {
        if !env.auth().verify_token(&cap) {
            return Err(AuthError::InvalidCapability);
        }
        let context = cap.extract_context();
        self.internal_execute(context, args)
    }
}`,
    computeOverhead: 'O(1) capability check',
    latencyImpact: '0ms authorization delta',
    beforeDesc: 'Global ACL lookups, high latency, tight coupling, brittle permission matrices.',
    afterDesc: 'Opaque token passing, stateless validation, decoupled zero-trust execution.',
    stellarFlowEquivalent: `import { TxBuilder } from '@stellarbuild/stellar-flow';

const delegateTx = await TxBuilder.for(operatorKeypair, { network: 'testnet' })
  .addSetOptions({
    signer: { ed25519PublicKey: 'G_DELEGATE', weight: 1 },
    masterWeight: 2,
    lowThreshold: 1,
    medThreshold: 2,
    highThreshold: 2
  })
  .build();`
  }
];
