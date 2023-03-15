import { redirect } from '@sveltejs/kit';
import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
import { payroundClientStore } from '$lib/stores/payroundClientStore';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';

export const load: PageLoad = (async ({ fetch }) => {
	async function getGroupData() {
		console.log("here");
		if (!get(walletStore).publicKey) if (!get(payroundClientStore)) return;
		console.log("here2");

		
		const userId = get(payroundClientStore).userId.toBase58();
		const req = await fetch('/w3/api/groups', {
			method: 'POST',
			body: JSON.stringify({ address: userId })
		});

		const some = await req.json()
		console.log("sone:", some)
		return some;
	}

	return {
		groups: getGroupData()
	};
}) satisfies PageLoad;
