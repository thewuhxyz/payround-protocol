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

	// register: async ({ request, locals }) => {
	// 	const body = Object.fromEntries(await request.formData());

	// 	const { data, error: err } = await locals.sb.auth.signUp({
	// 		email: body.email as string,
	// 		password: body.password as string
	// 	});

	// 	if (err) {
	// 		if (err instanceof AuthApiError && err.status === 400) {
	// 			return fail(400, {
	// 				error: 'Invalid email or password'
	// 			});
	// 		}

	// 		return fail(500, {
	// 			error: 'Server error. Try again Later'
	// 		});
	// 	}

	// 	throw redirect(303, '/w2/dashboard');
	// },

	logout: async ({ locals }) => {
		const { error: err } = await locals.supabase.auth.signOut();

		if (err) {
			return fail(500, {error: 'something went wrong with login you out'});
		}

		else {
      goto("/")
    }
	}
};
