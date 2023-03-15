import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
import { payroundClientStore } from '$lib/stores/payroundClientStore';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';

console.log('/pdas PAGE.ts');

export const load = (async ({ fetch, params, setHeaders }) => {
	console.log('+PAGE.TS::params: ', params);

	// const SOLANA_ANCHOR_SVELTEKIT_SKELETON_STARTER_PROGRAM_ID = new anchor.web3.PublicKey(
	//   '7j6ARQdmgrJwEqgJDHC82nvwQX26qcDF79osU6M7kmui'
	// );

	// U: Moved to a +page.ts so can invalidateAll() to rerun load()
	// NOTE No longer need to rebuild Anchor since I have workspaceStore
	async function isAccountCreated() {
		if (!get(walletStore).publicKey) return;
		if (!get(payroundClientStore)) return;

		const balance = await get(payroundClientStore).connection.getBalance(get(payroundClientStore).pubkey)
		console.log('balance from load: ', balance);
		return balance > 0 ;
	}

	return {
		isAccountCreated: isAccountCreated()
	};
}) satisfies PageLoad;

