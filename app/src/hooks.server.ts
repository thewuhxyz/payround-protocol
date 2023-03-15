import { redirect, type Handle } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import { payroundAdmin } from '$lib/server/payround';
import { stripe } from '$lib/server/stripe';
import { SUPABASE_SECRET_KEY } from '$env/static/private';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event
	});

	event.locals.sbAdmin = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: SUPABASE_SECRET_KEY,
		event
	});


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

  event.locals.stripe = stripe

	// if (event.url.pathname.startsWith(''))
		if (event.url.pathname.startsWith('/w2')) {
			const session = await event.locals.getSession();
			const supabase = event.locals.supabase;
			console.log('hook server');
			// console.log('session:', session);

			if (!session) {
				throw redirect(303, '/');
			}

			const user = session.user;
			const isUserCreated = await supabase
				.from('account')
				.select('account_created')
				.eq('id', user.id)
				.single();
			console.log('is user created:', isUserCreated.data);

			if (
				isUserCreated.data?.account_created == null ||
				!isUserCreated.data?.account_created
			) {
        if (event.url.pathname.startsWith("/w2/logout")){
          return resolve(event)
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

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});
};
