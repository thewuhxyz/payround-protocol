import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	const supabase = locals.supabase;
	if (!session) {
		throw redirect(303, '/');
	}
	const user = session.user;
	const groupResult = await supabase.from('task_group').select('*').eq('account_id', user.id);
	const groups = groupResult.data;
	if (!groups) {
		console.log('no group returned');
	}
	console.log('data:', groups);

	return {
		groups
	};
};
