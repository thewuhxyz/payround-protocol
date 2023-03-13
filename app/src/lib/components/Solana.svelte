<script lang="ts">
	import { getLocalStorage } from '@svelte-on-solana/wallet-adapter-core';
	import AnchorConnectionProvider from '$lib/components/AnchorConnectionProvider.svelte';
	import { WalletProvider, WalletMultiButton } from '@svelte-on-solana/wallet-adapter-ui';
	import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
  import { clusterApiUrl, PublicKey } from '@solana/web3.js';
	import { browser } from '$app/environment';

  // ***IMPORTANT: MUST copy IDL .json file to frontend on each anchor build!
	// import idl from '../../../target/idl/solana_anchor_sveltekit_skeleton_starter.json';
  // NOTE For Vercel deploy, I specify Root to be /app, which makes ../target dir unavailable!
  // This results in a RollupError: Could not resolve "../../../target/idl/..."
	// import idl from "$lib/idl/playground.json";
	import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
	import { workspaceStore } from '$lib/stores/workspace-store';
  import { balanceStore } from '$lib/stores/balance-store';
	import { Toast } from '@skeletonlabs/skeleton';
	import { payroundClientStore } from '$lib/stores/payroundClientStore';
	import { PayroundClient } from '$lib/payround/protocol';

	const localStorageKey = 'walletAdapter';
	// const endpoint = WalletAdapterNetwork.Devnet;
	const network = clusterApiUrl("devnet");
	// const network = 'http://localhost:8899';

	let wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

	$: autoConnect = browser && Boolean(getLocalStorage('autoconnect', false));

	// Create some variables to react to Stores' state
	$: hasWorkspaceProgramReady =
		$payroundClientStore &&
		$payroundClientStore.program &&
		$payroundClientStore.program.programId.toBase58() ===
			PayroundClient.PAYROUND_ID.toBase58();

	$: hasWalletReadyForFetch =
		$walletStore.connected && !$walletStore.connecting && !$walletStore.disconnecting;

	$: if (hasWalletReadyForFetch && hasWorkspaceProgramReady) {
		console.log('Wallet and Workspace ready!');

		// Get the user's SOL balance using balanceStore
		balanceStore.getUserSOLBalance(
			$walletStore.publicKey as PublicKey,
			$workspaceStore.connection
		);
	}
</script>

<WalletProvider {localStorageKey} {wallets} {autoConnect} />
<AnchorConnectionProvider {network} />
<slot/>
