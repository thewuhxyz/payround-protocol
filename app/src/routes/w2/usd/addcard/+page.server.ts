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
	addcard: async ({ request, locals }) => {
		const sbHelper = locals.sbHelper;
		const session = await sbHelper.getSession();
		// const payroundAdmin = locals.payroundAdmin;
		const stripe = locals.stripe;

		if (!session) {
			throw redirect(303, '/');
		}

		const formData = Object.fromEntries(await request.formData())
		console.log("form data card:", formData);
		

		const user = session.user;
		const stripeResult = await sbHelper.getUserAccount()
			// .from('account')
			// .select('email, stripe_id')
			// .eq('id', user.id)
			// .single();
		// const stripeData = stripeResult;

		// if (!stripeData) {
		// 	console.log('no stripeId returned');
		// }
		// console.log('data:', stripeData);

		const expiry = formData.expiry as string
		const expMonth = expiry.slice(0,2)
		const expYear = "20"+expiry.slice(2,4)

		console.log("exp month:", expMonth);
		console.log("exp year:", expYear);
		

		const cardToken = await stripe.tokens.create({
			card: {
				number: formData.number as string,
				exp_month: expMonth,
				exp_year: expYear,
				cvc: formData.cvv as string,
				currency: "usd"
			}
		})

		console.log("card token:", cardToken);
		

		const stripeId = stripeResult.stripe_id!;

		const account = await stripe.accounts.createExternalAccount(stripeId, {
			external_account: cardToken.id
		});

		console.log("account:", account);
		
	}
};
