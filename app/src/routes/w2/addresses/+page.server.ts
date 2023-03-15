import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	const supabase = locals.supabase;
	if (!session) {
		throw redirect(303, '/');
	}
	const user = session.user;
	const addressBookResult = await supabase.from('address_book').select('*').eq('account_id', user.id);
	const addresses = addressBookResult.data;
	if (!addresses) {
		console.error('no group returned');
	}
	console.log('data:', addresses);

	return {
		addresses
	};
};
