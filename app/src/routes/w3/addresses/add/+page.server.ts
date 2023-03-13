import { goto } from '$app/navigation';
import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const sbHelper = locals.sbHelper
		const session = await sbHelper.getSession();

		if (!session) {
			throw redirect(303, '/');
		}

		const formData = Object.fromEntries(await request.formData());
		console.log('forndata:', formData);

		const name = formData.name as string;
		const address = formData.address as string;

		const user = session.user;
		const submited = await sbHelper.sb
			.from('address_book')
			.insert({
				account_id: user.id,
				name,
        address,
			})
			.select();
		console.log('submitted:', submited);

		throw redirect(303, '/w2/dashboard');
	}
};
