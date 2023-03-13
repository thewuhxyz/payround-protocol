import { goto } from '$app/navigation';
import { PublicKey } from '@solana/web3.js';
import { AuthApiError } from '@supabase/supabase-js';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BN } from '@project-serum/anchor';

export const load: PageServerLoad = async ({ locals }) => {
	const sbHelper = locals.sbHelper;
	const session = await sbHelper.getSession();
	if (!session) {
		throw redirect(303, '/');
	}

	const addressBookResult = await sbHelper.getAllAddressesForUser();
	const addresses = addressBookResult.map((i) => {
		return {
			name: i.name,
			address: i.address
		};
	});

	return {
		addresses
	};
};

export const actions: Actions = {
	send: async ({ request, locals }) => {
		const sbHelper = locals.sbHelper
		// const supabase = locals.supabase;
		const session = await sbHelper.getSession();
		const payroundAdmin = locals.payroundAdmin;

		if (!session) {
			throw redirect(303, '/');
		}

		const formData = Object.fromEntries(await request.formData());
		console.log('form data:', formData);
		const recipient = formData.recipient as string;
		const uiAmount = formData.amount as string;
		const sendto = formData.sendto as string;

		const userAccount = await sbHelper.getUserAccount()
		const userId = userAccount.user_id


		if (!userId) {
			throw error(404, 'error: no user found');
		}

		if (sendto == 'payround') {
			try {
				console.log('send to here !!!');

				// const addressData = await supabase
				// 	.from('account')
				// 	.select('account_key')
				// 	.eq('email', recipient)
				// 	.single();
				// const address = addressData.data?.account_key!;
				// if (!address) {
				// 	throw error(401, 'address not found');
				// }

				const addressData = await sbHelper.getAccountByEmail(recipient)
				const address = addressData.account_key

				if (address == null) {
					return {error: "acccount not found"}
				}

				console.log(' address:', address);

				const tx = await payroundAdmin(userId).makeTransferTx(
					new PublicKey(address),
					Number(uiAmount)
				);

				console.log('tx:', tx);
			} catch (e) {
				console.log(e);
			}
		} else {
			try {
				console.log('here, ui amount:', uiAmount);
				const tx = await payroundAdmin(userId).makeTransferTx(
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
