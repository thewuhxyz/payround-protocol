import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
import { payroundClientStore } from '$lib/stores/payroundClientStore';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';


export const load = (async ({ fetch }) => {

	// const req = await fetch ("/w3/api/dashboard", {
	// 	method: "POST"
	// })

	async function getUpcomingTasks() {
		if (!get(walletStore).publicKey) 
		if (!get(payroundClientStore)) return;

		const userId = get(payroundClientStore).userId.toBase58()
		const req = await fetch('/w3/api/dashboard', {
			method: 'POST',
			body: JSON.stringify({userId})
		});
		// const some = await req.json()
		// console.log("req:", some)
		return await req.json() 
	}
	
	async function getTxFormatedData() {
		if (!get(walletStore).publicKey) 
		if (!get(payroundClientStore)) return;

		const balance = await get(payroundClientStore).connection.getTokenAccountBalance(
			get(payroundClientStore).usdcAddress
		);
		// console.log('balance from load: ', balance);
		if (balance.value.uiAmount == 0) return null
		const txs = await get(payroundClientStore).formatTxData(10)
		console.log(txs)
		return txs
	}

	return {
		upcomingTasks: getUpcomingTasks(),
		txFormatedData: getTxFormatedData()
	};
}) satisfies PageLoad;

