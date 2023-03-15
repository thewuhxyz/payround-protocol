import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
import { payroundClientStore } from '$lib/stores/payroundClientStore';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { getTransactionsFilterByMint } from '$lib/helpers';
import { PublicKey } from '@solana/web3.js';
import parser from "cron-parser"

export const load: PageLoad = async ({ fetch, params }) => {
	async function getDashboardData() {
		if (!get(walletStore).publicKey) if (!get(payroundClientStore)) return;

		const userId = get(payroundClientStore).userId.toBase58();
		const req = await fetch('/w3/api/task/id', {
			method: 'POST',
			body: JSON.stringify({ taskkey: params.id, address: userId })
		});

		const res = await req.json();

		const { task } = res
		console.log('some:', task);

		const taskKey = new PublicKey(params.id);
		const taskAccount = await get(payroundClientStore).fetchTaskAccount(taskKey)
		const thread = taskAccount.thread
		const threadBalance = await get(payroundClientStore).connection.getBalance(thread);

		const status = taskAccount.status
		let decodedStatus;

		console.log("task account:", taskAccount);
		console.log("task account:", status);

		if (status.ended) {
		  decodedStatus = "ended"
		} else if (status.paused) {
		  decodedStatus = "paused"
		} else if (status.started) {
		  decodedStatus = "started"
		} else {
		  decodedStatus ="notstarted"
		}

		decodedStatus

		const tx = await get(payroundClientStore).formatTxDataFor(thread);

		let nextRun

		if (task!.cron) {
	  nextRun = parser.parseExpression(task!.schedule).next().toDate().getTime();
	} else {
	  nextRun = Number(task!.schedule)*1000
	}
	const some = { tx, nextRun, decodedStatus, threadBalance, ...task };
	console.log("some in page ts:", some);
	
		return some
	}
	return {
		task: getDashboardData()
	};
};

// export const POST:RequestHandler = (() => {
// 	// do something
// });
