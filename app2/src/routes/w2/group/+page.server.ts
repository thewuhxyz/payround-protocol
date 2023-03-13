import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const sbHelper = locals.sbHelper
	const session = await sbHelper.getSession();
	// const supabase = locals.supabase;
	if (!session) {
		throw redirect(303, '/');
	}
	const user = session.user;
	const groupResult = await sbHelper.getAllTaskGroupForUser()
	const groups = groupResult;
	// if (!groups) {
	// 	console.log('no group returned');
	// }
	// console.log('data:', groups);

	return {
		groups
	};
};
