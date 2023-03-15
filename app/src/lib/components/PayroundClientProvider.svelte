<script lang="ts">
	// IMPORTANT Tried to install wallet-adapter-anchor package but it failed!
	// I have Sveltekit 1.0 and Anchor 0.26, so think that's the cause. Trying
	// to copy/paste the package manually with minor tweaks.
	import { Connection } from '@solana/web3.js';
	import type { Commitment, ConnectionConfig } from '@solana/web3.js';
	// import { workspaceStore } from '$lib/stores/workspace-store';
	import { web3, Program, AnchorProvider } from '@project-serum/anchor';
	import { walletStore, type WalletStore } from '@svelte-on-solana/wallet-adapter-core';
	import { providerStore } from '$lib/stores/providerStore';
	import { PayroundClient } from '$lib/payround/protocol';
	import { payroundClientStore } from '$lib/stores/payroundClientStore';

	// Component props:
	export 
		let network: string,
		config: Commitment | ConnectionConfig | undefined = 'processed';

	// const { PublicKey } = web3;
	// const programID = new PublicKey(idl.metadata.address);
	// const baseAccount = web3.Keypair.generate();
	const connection = new Connection(network, config);

	function defineProgramAndProvider(walletStore: WalletStore) {
		let { sendTransaction, signTransaction, signAllTransactions, signMessage, publicKey } =
			walletStore;

		const providerWallet = {
			sendTransaction,
			signTransaction,
			signAllTransactions,
			signMessage,
			publicKey
		};

		// FIXME Types mismatch on 'signTransaction' property
		// @ts-ignore
		const provider = new AnchorProvider(connection, providerWallet, {
			preflightCommitment: 'processed'
		} as web3.ConfirmOptions);

    const payroundClient = PayroundClient.connect(provider, network)

		// const program = new Program(idl, programID, provider);
		providerStore.set(provider);
    payroundClientStore.set(payroundClient)

		return {
			// baseAccount,
			connection,
			provider,
			network
		};
	}

	$: $walletStore && $walletStore.publicKey && defineProgramAndProvider($walletStore);
</script>

<slot />
