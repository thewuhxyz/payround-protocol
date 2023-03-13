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
 

	return {
		stripeCardPayment
	};
};

export const actions: Actions = {
	setupusd: async ({ request, locals }) => {
		const supabase = locals.supabase;
		const session = await locals.getSession();
		const payroundAdmin = locals.payroundAdmin;
    const stripe = locals.stripe;

		if (!session) {
			throw redirect(303, '/');
		}

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

    const accountLink = await stripe.accountLinks.create({
			account: stripeData?.stripe_id!,
			refresh_url: 'http://localhost:5173/w2/usd',
			return_url: 'http://localhost:5173/w2/usd',
			type: 'account_onboarding',
			collect: 'currently_due'
		});

    console.log("account link:", accountLink);
    console.log("account link:", accountLink.url);

    
    
		throw redirect(303, accountLink.url)
	}
};