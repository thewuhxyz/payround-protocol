import Stripe from "stripe"
import {STRIPE_SECRET_KEY} from "$env/static/private"

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2022-11-15'
});

export const createCustomStripeAccount = async (email: string) => {
  return await stripe.accounts.create({
		country: 'US',
		type: 'custom',
		capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
		email
	});
}

