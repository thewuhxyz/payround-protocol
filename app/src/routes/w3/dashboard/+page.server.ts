import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import parser from 'cron-parser';
import { getTransactionsFilterByMint } from '$lib/helpers';

export const load: PageServerLoad = async ({ locals }) => {
	const sbHelper = locals.sbHelper
	const session = await locals.getSession();
	const supabase = locals.supabase;
  const payroundAdmin = locals.payroundAdmin
	if (!session) {
		throw redirect(303, '/');
	}
	const user = session.user;
	// const tasksResult = await supabase.from('task').select('*').eq('account_id', user.id);
	const tasksResult = await sbHelper.getAllTasksForUser();
	if (tasksResult == null) {
		throw redirect(303, "/")
	}

	
	const data = tasksResult
	
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

  const userAccount = await sbHelper.getUserAccount();

	const userId = userAccount.id

	console.log('user id:', userId);

	const payroundClient = payroundAdmin(userId);
	console.log('payroundClient', payroundClient.usdcAddress);

	const txData = await getTransactionsFilterByMint(
		payroundClient.usdcAddress,
		payroundClient.connection,
    {limit: 10}
	);
	console.log('txData:', txData);

	const info = txData.map((data) => {
		return data.parsedTx?.meta;
	});

	console.log('info:', info);

	// const txFormatedData = txData.map((tx) => {
	// 	const preBal =
	// 		tx.parsedTx!.meta!.preTokenBalances!.filter(
	// 			(i) => i.owner == payroundClient.pubkey.toBase58()
	// 		)[0].uiTokenAmount.uiAmount || 0;

  //   const postBal =
	// 		tx.parsedTx!.meta!.postTokenBalances!.filter(
	// 			(i) => i.owner == payroundClient.pubkey.toBase58()
	// 		)[0].uiTokenAmount.uiAmount || 0;

  //   const out = preBal > postBal

  //   const address =
	// 		tx.parsedTx!.meta!.preTokenBalances!.filter(
	// 			(i) => i.owner !== payroundClient.pubkey.toBase58()
	// 		)[0].owner || null;

  //   const amount = Math.abs(preBal - postBal)
		
  //   return {
	// 		sig: tx.sigInfo.signature,
	// 		timeStamp: tx.sigInfo.blockTime! * 1000,
	// 		mint: tx.parsedTx!.meta!.preTokenBalances![0].mint,
	// 		out,
  //     preBal,
  //     postBal,
  //     amount,
  //     address
	// 	};
	// }).sort((a,b) => b.timeStamp - a.timeStamp);

	// console.log('data:', data);

	const txFormatedData = await payroundClient.formatTxData()


	return {
		upcomingTasks,
    txFormatedData
	};
};
