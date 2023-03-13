import { redirect, type Handle } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import { payroundAdmin } from '$lib/server/payround';
import { stripe } from '$lib/server/stripe';
import { SupabaseHelper } from '$lib/server/supabase';

export const handle: Handle = async ({ event,resolve }) => {
	event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event
	});

	event.locals.sbHelper = new SupabaseHelper(
		createSupabaseServerClient({
			supabaseUrl: PUBLIC_SUPABASE_URL,
			supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
			event
		})
	);

	/**
	 * a little helper that is written for convenience so that instead
	 * of calling `const { data: { session } } = await supabase.auth.getSession()`
	 * you just call this `await getSession()`
	 */
	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	event.locals.payroundAdmin = (userId?: string) => payroundAdmin(userId);

	event.locals.stripe = stripe;

	// if (event.url.pathname.startsWith(''))
	if (event.url.pathname.startsWith('/w2')) {
	
		const sbHelper = event.locals.sbHelper;
		const session = await sbHelper.getSession();
		console.log('hook server');

		if (!session) {
			throw redirect(303, '/');
		}

		const data = await sbHelper.isAccountCreated();
		if (data == null) {
			throw redirect(303, '/'); // no active user
		}

		if (data.account_created == null || !data.account_created) {
			if (event.url.pathname.startsWith('/w2/logout')) {
				return resolve(event);
			}
			if (event.url.pathname.startsWith('/w2/create')) {
				return resolve(event);
			} else {
				throw redirect(303, '/w2/create');
			}
		} else {
			if (event.url.pathname.startsWith('/w2/create')) {
				throw redirect(303, '/w2/dashboard');
			} else {
				return resolve(event);
			}
		}
	}

	const response = await resolve(event);

	response.headers.set('cache-control', 'no-cache');
	return response;
};
