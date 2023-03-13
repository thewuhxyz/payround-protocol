import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	const supabase = locals.supabase;
  const stripe = locals.stripe
	// const payroundAdmin = locals.payroundAdmin()
	if (!session) {
		throw redirect(303, '/');
	}
	const user = session.user;
	const stripeResult = await supabase.from('account').select('email, stripe_id').eq('id', user.id).single();
	const stripeData = stripeResult.data;

	if (!stripeData) {
		console.log('no stripeId returned');
	}
	console.log('data:', stripeData);

  const account = await stripe.accounts.retrieve(stripeData?.stripe_id!);
	console.log('account:', account);

  const stripeCardPayment = account.capabilities?.card_payments == "active"

	// const accountCard = await stripe.accounts.retrieveExternalAccount()
	account.external_accounts?.data

	return {
		stripeCardPayment,
		externalAccounts: account.external_accounts?.data
	};
};

export const actions: Actions = {
	withdraw: async ({ request, locals }) => {
		const supabase = locals.supabase;
		const session = await locals.getSession();
		const payroundAdmin = locals.payroundAdmin;
		const stripe = locals.stripe;

		if (!session) {
			throw redirect(303, '/');
		}

		const formData = Object.fromEntries(await request.formData())
		console.log("==================== form data card: ==================", formData);
		
		const cardId = formData.card as string
		const amount = formData.amount as string

		const user = session.user;
		const stripeResult = await supabase
			.from('account')
			.select('email, stripe_id')
			.eq('id', user.id)
			.single();
		const stripeData = stripeResult.data;

		if (!stripeData) {
			console.log('no stripeId returned');
		}
		console.log('data:', stripeData);

		const payout = await stripe.payouts.create(
			{ amount: Number(amount), currency: 'usd', method: 'instant', source_type: 'card', destination: cardId },
			{ stripeAccount: stripeData?.stripe_id! }
		);

		console.log("Payout:", payout);
		

		// console.log("account link:", accountLink);
		// console.log("account link:", accountLink.url);

		// throw redirect(303, accountLink.url)
	}
};
