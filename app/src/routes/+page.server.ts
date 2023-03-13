import { goto } from '$app/navigation';
import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {

	login: async ({ request, locals }) => {
		const body = Object.fromEntries(await request.formData());

		console.log("body:", body);
		

		const { data, error: err } = await locals.supabase.auth.signInWithOtp({
			email: body.email as string,
			// password: body.password as string,
			options: {
				emailRedirectTo: 'http://localhost:5173/confirmation',
			} 
		});

		if (err) {
			if (err instanceof AuthApiError && err.status === 400) {
				return fail(400, {
					error: 'invalid credentials'
				});
			}

			return fail(500, {
				message: 'server error. Try again later'
			});
		}

		throw redirect(303, '/verification');
	},
};
