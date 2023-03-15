import { goto } from '$app/navigation';
import { createCustomStripeAccount } from '$lib/server/stripe';
import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	createaccount: async ({ request, locals }) => {
		const supabase = locals.supabase;
		const session = await locals.getSession();
		const payroundAdmin = locals.payroundAdmin;

		if (!session) {
			throw redirect(303, '/');
		}

		const user = session.user;
		const isUserCreated = await supabase
			.from('account')
			.select('account_created')
			.eq('id', user.id)
			.single();

		if (isUserCreated.data?.account_created == null) {
			const formData = Object.fromEntries(await request.formData());
			console.log('forndata:', formData);

			const name = formData.name as string;

			const payroundAd = payroundAdmin().provider.publicKey;
			const userId = await payroundAdmin().createEmailAccountTx();
			console.log('payround admin', payroundAd?.toBase58());

			let stripeId;

			if (user.email) {
				const stripeAccount = await createCustomStripeAccount(user.email);
				stripeId = stripeAccount.id;
				console.log('stripe id:', stripeId);
			}

			const some = await supabase
				.from('account')
				.insert({
					id: user.id,
					degen: false,
					user_id: userId,
					account_key: payroundAdmin(userId).pubkey.toBase58(),
					account_created: true,
					email: user.email,
					nickname: name,
					stripe_id: stripeId
				})
				.select();
			const some2 = await supabase
				.from('user')
				.insert({
					user_id: userId,
					degen: false,
					account_key: payroundAdmin(userId).pubkey.toBase58(),
					account_created: true
				})
				.select();
			console.log('some:', some);
		}

		throw redirect(303, '/w2/dashboard');
	}
};
