import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import parser from 'cron-parser';
import { getTransactionsFilterByMint } from '$lib/helpers';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	const supabase = locals.supabase;
  const payroundAdmin = locals.payroundAdmin
	if (!session) {
		throw redirect(303, '/');
	}
	const user = session.user;
	const tasksResult = await supabase.from('task').select('*').eq('account_id', user.id);
	const data = tasksResult.data;
	if (!data) {
		throw console.error('no group returned');
	}
	console.log('data:', data);

	const upcomingTasks = data
		.map((i) => {
      let nextRunMs: number;
      if (i.cron) {
        nextRunMs = parser.parseExpression(i.schedule).next().toDate().getTime();
      } else {
        nextRunMs = Number(i.schedule) * 1000
      }
			return { nextRunMs, ...i };
		})
		.filter((i) => i.nextRunMs > Date.now())
		.sort((a, b) => a.nextRunMs - b.nextRunMs).slice(0,10);

  const userId = await supabase.from('account').select('user_id').eq('id', user.id).single();
	// const tasks = tasksResult.data;
	if (!userId) {
		console.log('No User Id');
	}

	console.log('user id:', userId);

	const payroundClient = payroundAdmin(userId.data?.user_id!);
	console.log('payroundClient', payroundClient.usdcAddress);

	const txData = await getTransactionsFilterByMint(
		payroundClient.usdcAddress,
		payroundClient.connection,
    {limit: 10}
	);
	// console.log('txData:', txData);

	const info = txData.map((data) => {
		return data.parsedTx?.meta;
	});

	// console.log('info:', info);

	const txFormatedData = txData.map((tx) => {
		const preBal =
			tx.parsedTx!.meta!.preTokenBalances!.filter(
				(i) => i.owner == payroundClient.pubkey.toBase58()
			)[0].uiTokenAmount.uiAmount || 0;

    const postBal =
			tx.parsedTx!.meta!.postTokenBalances!.filter(
				(i) => i.owner == payroundClient.pubkey.toBase58()
			)[0].uiTokenAmount.uiAmount || 0;

    const out = preBal > postBal

    const address =
			tx.parsedTx!.meta!.preTokenBalances!.filter(
				(i) => i.owner !== payroundClient.pubkey.toBase58()
			)[0].owner || null;

    const amount = Math.abs(preBal - postBal)
		
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
	}).sort((a,b) => b.timeStamp - a.timeStamp);

	console.log('data:', data);


	return {
		upcomingTasks,
    txFormatedData
	};
};
