import { goto } from '$app/navigation';
import { PublicKey } from '@solana/web3.js';
import { AuthApiError } from '@supabase/supabase-js';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BN } from '@project-serum/anchor';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	const supabase = locals.supabase;
	if (!session) {
		throw redirect(303, '/');
	}
	const user = session.user;
	// const groupResult = await supabase
	// 	.from('task_group')
	// 	.select('name, id')
	// 	.eq('account_id', user.id);
	// const groups = groupResult.data;

	const addressBookResult = await supabase
		.from('address_book')
		.select('name, address')
		.eq('account_id', user.id);
	const addresses = addressBookResult.data;
	if (!addresses) {
		console.error('no group returned');
	}
	console.log('data:', addresses);
	// console.log('data:', groups);

	return {
		// groups,
		addresses
	};
};

export const actions: Actions = {
	send: async ({ request, locals }) => {
		const supabase = locals.supabase;
		const session = await locals.getSession();
		const payroundAdmin = locals.payroundAdmin;

		if (!session) {
			throw redirect(303, '/');
		}

		const formData = Object.fromEntries(await request.formData());
		console.log('form data:', formData);
		// const later = formData.name as string;
		const recipient = formData.recipient as string;
		const uiAmount = formData.amount as string;
		// const datetime = formData.datetime as string;
		const sendto = formData.sendto as string
		console.log("sendto:", sendto);
		

		const user = session.user;

		const userId = (await supabase.from('account').select('user_id').eq('id', user.id).single())
			.data?.user_id;
		console.log('user id:', userId);

		if (!userId) {
			console.error('error: no user id found');
		}

		if (sendto == 'payround') {

			try {
				console.log("send to here !!!");
				
				const addressData = await supabase.from("account").select("account_key").eq("email", recipient).single()
				const address = addressData.data?.account_key!
				if (!address) {
					throw error(401, "address not found")
				}

				console.log(" address:", address);
				

				const tx = await payroundAdmin(userId!).makeTransferTx(
					new PublicKey(address),
					Number(uiAmount)
				);

				console.log("tx:", tx);
				
				

			} catch (e) {
				console.log(e);
			}
		} else {
			try {

				console.log('here, ui amount:', uiAmount);
				const tx = await payroundAdmin(userId!).makeTransferTx(
					new PublicKey(recipient),
					Number(uiAmount)
				);

				console.log('tx:', tx);

				return {};
			} catch (e) {
				console.log(e);
			}
		}
	}
};
