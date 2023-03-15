<script lang="ts">
	import { goto } from '$app/navigation';
	import AppLayout from '$lib/components/AppLayout.svelte';
	import type { LayoutData } from './$types';

	import { Modal, storePopup } from '@skeletonlabs/skeleton';
	import { WalletMultiButton, WalletProvider } from '@svelte-on-solana/wallet-adapter-ui';
	import { getLocalStorage, walletStore } from '@svelte-on-solana/wallet-adapter-core';
	import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
	import { browser } from '$app/environment';
	import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
	import { payroundClientStore } from '$lib/stores/payroundClientStore';
	import PayroundClientProvider from '$lib/components/PayroundClientProvider.svelte';
	import { balanceStore } from '$lib/stores/balance-store';
	import { get } from 'svelte/store';

	export const ssr = false

	export let data: LayoutData;

	const localStorageKey = 'walletAdapter';
	// const endpoint = WalletAdapterNetwork.Devnet;
	const network = clusterApiUrl('devnet');
	// const network = 'http://localhost:8899';

	let wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

	$: autoConnect = browser && Boolean(getLocalStorage('autoconnect', true));

	$: walletStore;

	$: ({ connected } = $walletStore);
	$: ({ sendTransaction, signTransaction, signAllTransactions, signMessage, publicKey } =
		$walletStore);

		// Create some variables to react to Stores' state
	$: hasWorkspaceProgramReady =
		$payroundClientStore &&
		$payroundClientStore.userId == $walletStore.publicKey

	$: hasWalletReadyForFetch =
		$walletStore.connected && !$walletStore.connecting && !$walletStore.disconnecting;

	$: if (hasWalletReadyForFetch && hasWorkspaceProgramReady) {
		console.log('Wallet and Workspace ready!');

		// Get the user's SOL balance using balanceStore
		

		
	}
	
	$: balance = data.balance
	// export let data: LayoutData;

	// $: balance = data.uiBalance!.toString();
	// $: nickname=data.nickname!
	// $: data.credits;
	// $: data.userAccountKey;
	// $: email = data.email!;
</script>

<WalletProvider {localStorageKey} {wallets} {autoConnect} />
<PayroundClientProvider {network} />
<AppLayout
	route={'w3'}
	hide={false}
	address={""} 
	balance={balance || "0"}
	credit={0}
	email={""}
	name={""}
>
	<slot />
</AppLayout> 
