import { PublicKey } from '@solana/web3.js';
import { error, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import parser from 'cron-parser';
import { getTransactionsFilterByMint } from '$lib/helpers';
import type { TaskStatus } from '$lib/payround/types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const session = await locals.getSession();
	const supabase = locals.supabase;
	const payroundAdmin = locals.payroundAdmin;
	if (!session) {
		throw redirect(303, '/');
	}
	const user = session.user;
	const userId = (await supabase.from('account').select('user_id').eq('id', user.id).single())
		.data?.user_id;
	const taskResult = await supabase.from('task').select('*').eq('task_key', params.id).single();
	const task = taskResult.data;

	if (!userId) {
		throw error(404, 'page not found');
	}
  const payroundClient = payroundAdmin(userId)
	const taskkey = new PublicKey(params.id);
	const taskAccount = await payroundClient.fetchTaskAccount(taskkey)
  const thread = taskAccount.thread
  const threadBalance = await payroundClient.connection.getBalance(thread)
  
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

  const txData = await getTransactionsFilterByMint(
		thread,
		payroundClient.connection
	);
	console.log('txData:', txData);

  const info = txData.map((data) => {
		return data.parsedTx?.meta;
	});
  
  const info2 = txData.map((data) => {
		return data.parsedTx?.meta?.preTokenBalances;
	});
  console.log("pubkey:", payroundClient.pubkey.toBase58());
  
  const info3 = txData.map((data) => {
		return data.parsedTx?.meta?.preTokenBalances?.filter((i) => i.owner = payroundClient.pubkey.toBase58());
	});

	console.log('info:', info);
	console.log('info2:', info2);

	const tx = txData
		.map((tx) => {
			const preBal =
				tx.parsedTx!.meta!.preTokenBalances!.filter(
					(i) => i.owner == payroundClient.pubkey.toBase58()
				)[0].uiTokenAmount.uiAmount || 0;
				
        

			const postBal =
				tx.parsedTx!.meta!.postTokenBalances!.filter(
					(i) => i.owner == payroundClient.pubkey.toBase58()
				)[0].uiTokenAmount.uiAmount || 0;

			const out = preBal > postBal;

			const token =
				tx.parsedTx!.meta!.postTokenBalances!.filter(
					(i) => i.owner !== payroundClient.pubkey.toBase58()
				);

      const address = token.length == 0 ? "-" : token[0].owner

			const amount = Math.abs(preBal - postBal);

			return {
				sig: tx.sigInfo.signature,
				timeStamp: tx.sigInfo.blockTime! * 1000,
				mint: tx.parsedTx!.meta!.preTokenBalances![0].mint,
				out,
				preBal,
				postBal,
				amount,
				address
			};
		})

	if (!task) {
		console.log('no group returned');
	}
	console.log('data:', task);

  let nextRun;

  if (task!.cron) {
    nextRun = parser.parseExpression(task!.schedule).next().toDate().getTime();
  } else {
    nextRun = Number(task!.schedule)*1000
  }

	return {
		task: { nextRun, decodedStatus, threadBalance, tx, ...task}
	};
};


// export const POST:RequestHandler = (() => {
// 	// do something
// });

export const actions: Actions = {
	withdraw: async ({ request, locals, params }) => {
		const supabase = locals.supabase;
		const session = await locals.getSession();
		const payroundAdmin = locals.payroundAdmin;

		if (!session) {
			throw redirect(303, '/');
		}

		const formData = Object.fromEntries(await request.formData());
		console.log('forndata:', formData);

		const amount = formData.amount as string;
		// const description = formData.desc as string;

    console.log("withdraw");
    
	},
	credit: async ({ request, locals, params }) => {
		const supabase = locals.supabase;
		const session = await locals.getSession();
		const payroundAdmin = locals.payroundAdmin;

		if (!session) {
			throw redirect(303, '/');
		}

		const formData = Object.fromEntries(await request.formData());
		console.log('forndata:', formData);

		const amount = formData.amount as string;
		// const description = formData.desc as string;
    console.log("credit");
    
	},

	resume: async ({ request, locals, params }) => {
		const supabase = locals.supabase;
		const session = await locals.getSession();
		const payroundAdmin = locals.payroundAdmin;

		if (!session) {
			throw redirect(303, '/');
		}

		const formData = Object.fromEntries(await request.formData());
		console.log('forndata:', formData);

		const amount = formData.amount as string;
		// const description = formData.desc as string;

		const user = session.user;
		const userId = (await supabase.from('account').select('account_key').eq('id', user.id).single())
			.data?.account_key;
		if (!userId) {
			throw error(404, 'page not found');
		}

		const payroundClient = payroundAdmin(userId);

		try {
			const tx = await payroundClient.resumeTaskTx(new PublicKey(params.id!));
			console.log('tx:', tx);
		} catch (e) {
			console.log(e);
		}
	},
	pause: async ({ request, locals, params }) => {
		const supabase = locals.supabase;
		const session = await locals.getSession();
		const payroundAdmin = locals.payroundAdmin;

		if (!session) {
			throw redirect(303, '/');
		}

		const formData = Object.fromEntries(await request.formData());
		console.log('forndata:', formData);

		const amount = formData.amount as string;
		// const description = formData.desc as string;

		const user = session.user;
		const userId = (await supabase.from('account').select('account_key').eq('id', user.id).single())
			.data?.account_key;
		if (!userId) {
			throw error(404, 'page not found');
		}

		const payroundClient = payroundAdmin(userId);

		try {
			const tx = await payroundClient.pauseTaskTx(new PublicKey(params.id!));
			console.log('tx:', tx);
		} catch (e) {
			console.log(e);
		}
	}
};
