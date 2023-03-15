import { goto } from '$app/navigation';
import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { error } from 'console';

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const supabase = locals.supabase;
		const session = await locals.getSession();
		// const payroundAdmin = locals.payroundAdmin;

		if (!session) {
			throw redirect(303, '/');
		}

		
		const formData = Object.fromEntries(await request.formData());
		console.log('forndata:', formData);
		
		const name = formData.name as string;
		const address = formData.address as string;
		
		const user = session.user;
		const data = await supabase.from("account").select("user_id").eq("id", user.id).single()
		if (data.error ) throw error(404, "no such user")
		
		const submited = await supabase
			.from('address_book')
			.insert({
				account_id: user.id,
				name,
        address,
				user_id: data.data.user_id!
			})
			.select();
		console.log('submitted:', submited);

		throw redirect(303, '/w2/dashboard');
	}
};
