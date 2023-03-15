import { goto } from '$app/navigation';
import { createCustomStripeAccount } from '$lib/server/stripe';
import { AuthApiError } from '@supabase/supabase-js';
import  type {RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler  = async ({ request, locals }) => {

	const req = await request.json()
	const userId = req.address as string
	console.log('userid:', userId)
	const name = req.name as string
		const supabase = locals.sbAdmin;
		const payroundAdmin = locals.payroundAdmin;

		const isUserCreated = await supabase
			.from('user')
			.select('account_created')
			.eq('user_id', userId)
			.single();

			if (isUserCreated.data?.account_created == null) {
				

			const some = await supabase
				.from('user')
				.insert({
					degen: true,
					user_id: userId,
					account_key: payroundAdmin(userId).pubkey.toBase58(),
					account_created: true,
					name,
				})
				.select();
			console.log('some:', some);
			return new Response(JSON.stringify({success: "true", message: "account created"}))
		}
		
		return new Response(JSON.stringify({success: "true", message: "account already created"}))
	}

