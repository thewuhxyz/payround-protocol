import { goto } from '$app/navigation';
import { PublicKey } from '@solana/web3.js';
import { AuthApiError } from '@supabase/supabase-js';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const sbHelper = locals.sbHelper;
	const session = await locals.getSession();
	if (!session) {
		throw redirect(303, '/');
	}
	const groupResult = await sbHelper.getAllTaskGroupForUser()
	const groups = groupResult.map(i => {
		return {name: i.name, id: i.id}
	});

	const addressBookResult = await sbHelper.getAllAddressesForUser()
	const addresses = addressBookResult.map(i => {
		return {address: i.address, name: i.name}});
	if (!addresses) {
		console.error('no group returned');
	}
	console.log('data:', addresses);
	console.log('data:', groups);

	return {
		groups,
		addresses
	};
};

export const actions: Actions = {
	createtask: async ({ request, locals }) => {
		const sbHelper = locals.sbHelper;
		const session = await sbHelper.getSession();
		
		if (!session) {
			throw redirect(303, '/');
		}
		const user = session.user
		const userId = await sbHelper.getUserId()
		const payroundAdmin = locals.payroundAdmin(userId);

		const formData = Object.fromEntries(await request.formData());
		// console.log('task data:', formData);
		const name = formData.name as string;
		const recipient = formData.recipient as string;
		const uiAmount = formData.amount as string;
		const groupId = formData.group as string;

		let schedule = '';
    let address;

    if (formData.sendto == "payround") {
			try {

				const addressData = await sbHelper.getAccountByEmail(recipient)
				address = addressData.account_key!;
        console.log(' address:', address);
			} catch (e) {
				console.log(e);
				return {success: false, message: "could not find address"}
			}

    } else {
      address = recipient
    }

    console.log("address here:", address);
    

		if (formData.every == 'week') {
			if (formData.dayofweek == 'all') {
				schedule = `0 0 ${formData.timeOfDay} * * *`;
			} else {
				schedule = `0 0 ${formData.timeOfDay} * * ${formData.dayofweek}`;
			}
		}

		if (formData.every == 'month') {
			if (formData.dayofweek == 'all') {
				schedule = `0 0 ${formData.timeOfDay} * * *`;
			} else {
				schedule = `0 0 ${formData.timeOfDay} ${formData.dayofmonth} * *`;
			}
		}

		console.log('schedule:', schedule);

		try {
			const taskKey = await payroundAdmin.createTaskTx(
				new PublicKey(address),
				Number(uiAmount),
				{cron: {schedule, skippable: false}}
			);

			console.log('task created successfully. task key:', taskKey);

      const tx = await payroundAdmin.startTaskTx(new PublicKey(taskKey), 0.005)
      console.log("tx:", tx);
      

			const threadKey = await payroundAdmin.getThreadKey(taskKey);

			const result = await sbHelper.sb
				.from('task')
				.insert({
					account_id: user.id,
					task_key: taskKey,
					name,
					amount: Number(uiAmount),
					cron: true,
          schedule,
					recipient,
					task_group: groupId ? groupId : null,
					thread_key: threadKey
				})
				.select();

			// console.log('result:', result);
		} catch (e) {
			console.log('error:', e);
		}
		return {success: true}
		
	}
};
