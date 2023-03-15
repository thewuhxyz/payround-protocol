import { goto } from '$app/navigation';
import { PublicKey } from '@solana/web3.js';
import { AuthApiError } from '@supabase/supabase-js';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type {  RequestHandler } from './$types';

// export const GET: RequestHandler = async ({request, locals }) => {
// 	const supabase = locals.supabase;
// 	const req = await request.json();
// 	const userId = req.address as string;
// 	console.log('userid:', userId);

// 	const groupResult = await supabase
// 		.from('task_group')
// 		.select('name, id')
// 		.eq('user_id', userId);
// 	const groups = groupResult.data;

// 	const addressBookResult = await supabase
// 		.from('address_book')
// 		.select('name, address')
// 		.eq('user_id', userId);
// 	const addresses = addressBookResult.data;
// 	if (!addresses) {
// 		console.error('no group returned');
// 	}
// 	console.log('data:', addresses);
// 	console.log('data:', groups);

// 	return new Response (JSON.stringify({
// 		groups,
// 		addresses
// 	}));
// };

export const POST: RequestHandler = async ({request, locals }) => {
	const supabase = locals.supabase;
	const req = await request.json();
	const userId = req.address as string;
	const threadKey = req.threadKey as string;
	const name = req.name as string
	const groupId = req.groupId
	const recipient = req.recipient
	const schedule = req.schedule
	const uiAmount = req.amount
	const taskKey = req.taskKey
	console.log('userid:', userId);

	const result = await supabase
		.from('task')
		.insert({
			task_key: taskKey,
			name,
			amount: Number(uiAmount),
			cron: true,
			schedule,
			recipient,
			task_group: groupId ? groupId : null,
			thread_key: threadKey,
			user_id: userId,
		})
		.select();

		console.log("result:", result)

	return new Response (JSON.stringify({
		success: true
	}));
};





// export const actions: Actions = {
// 	createtask: async ({ request, locals }) => {
// 		const supabase = locals.supabase;
// 		const session = await locals.getSession();
// 		const payroundAdmin = locals.payroundAdmin;

// 		if (!session) {
// 			throw redirect(303, '/');
// 		}

// 		const formData = Object.fromEntries(await request.formData());
// 		console.log('task data:', formData);
// 		const name = formData.name as string;
// 		const recipient = formData.recipient as string;
// 		const uiAmount = formData.amount as string;
// 		const groupId = formData.group as string;

// 		let schedule = '';
//     let address;

//     if (formData.sendto == "payround") {
// 			console.log("here:");
			
// 				const addressData = await supabase
// 					.from('account')
// 					.select('account_key')
// 					.eq('email', recipient)
// 					.single();

// 				address = addressData.data?.account_key!;
//         console.log(' address:', address);
// 				if (!address) {
// 					throw error(401, 'address not found');
// 				}

//     } else {
//       address = recipient
//     }

//     console.log("address here:", address);
    

// 		if (formData.every == 'week') {
// 			if (formData.dayofweek == 'all') {
// 				schedule = `0 0 ${formData.timeOfDay} * * *`;
// 			} else {
// 				schedule = `0 0 ${formData.timeOfDay} * * ${formData.dayofweek}`;
// 			}
// 		}

// 		if (formData.every == 'month') {
// 			if (formData.dayofweek == 'all') {
// 				schedule = `0 0 ${formData.timeOfDay} * * *`;
// 			} else {
// 				schedule = `0 0 ${formData.timeOfDay} ${formData.dayofmonth} * *`;
// 			}
// 		}

// 		console.log('schedule:', schedule);

// 		const user = session.user;

// 		const userId = (await supabase.from('account').select('user_id').eq('id', user.id).single())
// 			.data?.user_id;
// 		console.log('user id:', userId);

// 		if (!userId) {
// 			console.error('error: no user id found');
// 		}

// 		try {
// 			const taskKey = await payroundAdmin(userId!).createTaskTx(
// 				new PublicKey(address),
// 				Number(uiAmount),
// 				{cron: {schedule, skippable: false}}
// 			);

// 			console.log('task created successfully. task key:', taskKey);

//       const tx = await payroundAdmin(userId!).startTaskTx(new PublicKey(taskKey), 0.005)
//       console.log("tx:", tx);
      

// 			const threadKey = await payroundAdmin(userId!).getThreadKey(taskKey);

// 			const result = await supabase
// 				.from('task')
// 				.insert({
// 					account_id: user.id,
// 					task_key: taskKey,
// 					name,
// 					amount: Number(uiAmount),
// 					cron: true,
//           schedule,
// 					recipient,
// 					task_group: groupId ? groupId : null,
// 					thread_key: threadKey
// 				})
// 				.select();

// 			console.log('result:', result);
// 		} catch (e) {
// 			console.log('error:', e);
// 		}

// 		throw redirect(303, '/w2/task/create');
// 	}
// };
