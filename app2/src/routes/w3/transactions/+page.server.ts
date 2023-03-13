import { getTransactionsFilterByMint, getTransactionsFor } from '$lib/helpers';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const sbHelper = locals.sbHelper;
	const session = await sbHelper.getSession();
	if (!session) {
		throw redirect(303, '/');
	}
	const userId = await sbHelper.getUserId()
	const payroundAdmin = locals.payroundAdmin(userId);
	// // const tasks = tasksResult.data;
	if (!userId) {
		console.log('No User Id');
	}

	console.log('user id:', userId);

	const data = await payroundAdmin.formatTxData()

	return { data };
};
