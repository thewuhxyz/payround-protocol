import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
import { payroundClientStore } from '$lib/stores/payroundClientStore';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';

export const load: PageLoad = async ({  fetch, params }) => {
	async function getGroupData() {
		if (!get(walletStore).publicKey) if (!get(payroundClientStore)) return;

		const userId = get(payroundClientStore).userId.toBase58();
		const id = params.id
		const req = await fetch('/w3/api/group/id', {
			method: 'POST',
			body: JSON.stringify({ address:userId, id })
		});
		return await req.json();
	}

	return {
		group: (await getGroupData()).group,
		tasks: (await getGroupData()).tasks
	};
};
