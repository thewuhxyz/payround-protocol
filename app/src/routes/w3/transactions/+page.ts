import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
import { payroundClientStore } from '$lib/stores/payroundClientStore';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { getTransactionsFilterByMint } from '$lib/helpers';
import { PublicKey } from '@solana/web3.js';
import parser from 'cron-parser';

export const load: PageLoad = async ({ fetch, params }) => {
	async function getDashboardData() {
		const balance = await get(payroundClientStore).connection.getTokenAccountBalance(
			get(payroundClientStore).usdcAddress
		);
		console.log('balance from load: ', balance);
		if (balance.value.uiAmount == 0) return null;
		const txs = await get(payroundClientStore).formatTxData(10);
		console.log(txs);
		return txs;
	}
	return {
		data: getDashboardData()
	};
};

// export const POST:RequestHandler = (() => {
// 	// do something
// });
