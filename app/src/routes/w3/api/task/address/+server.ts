import { goto } from '$app/navigation';
import { PublicKey } from '@solana/web3.js';
import { AuthApiError } from '@supabase/supabase-js';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const supabase = locals.supabase;
	const req = await request.json();
	const email = req.address as string;
	console.log('userid:', email);

	const addressData = await supabase
		.from('account')
		.select('account_key')
		.eq('email', email)
		.single();

	let address = addressData.data?.account_key;
	console.log(' address:', address);
	if (address == null || address == undefined) {
		return new Response(JSON.stringify({ address: null }));
	}

	return new Response(
		JSON.stringify({
			address
		})
	);
};
