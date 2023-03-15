import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
import { payroundClientStore } from '$lib/stores/payroundClientStore';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';

export const load: PageLoad = async ({ fetch}) => {
	
	async function getDashboardData() {
		if (!get(walletStore).publicKey) if (!get(payroundClientStore)) return;

		const userId = get(payroundClientStore).userId.toBase58();
		const req = await fetch('/w3/api/dashboard', {
			method: 'POST',
			body: JSON.stringify({ userId })
		});
		return await req.json();
	}

	return {
		groups: (await getDashboardData()).groups,
		addresses: (await getDashboardData()).addresses
	};
};

