// See https://kit.svelte.dev/docs/types#app
import { SupabaseClient, Session } from '@supabase/supabase-js';
import { Database } from '$lib/types/supabase';
import type { PayroundClient } from '$lib/payround/protocol';
import type Stripe from 'stripe';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			sbAdmin: SupabaseClient<Database>;
			getSession(): Promise<Session | null>;
			payroundAdmin: (userId?: string) => PayroundClient;
			stripe: Stripe
		}
		interface PageData {
			session: Session | null;
		}
		// interface Error {}
		// interface Platform {}
	}
}

export {};
