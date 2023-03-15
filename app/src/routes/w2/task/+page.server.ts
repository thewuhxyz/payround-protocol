import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import parser from "cron-parser"

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	const supabase = locals.supabase;
	// const payroundAdmin = locals.payroundAdmin()
	if (!session) {
		throw redirect(303, '/');
	}
	const user = session.user;
	const tasksResult = await supabase.from('task').select('*').eq('account_id', user.id);
	const tasksData = tasksResult.data;

  const tasks = tasksData!.map((i) => {
		let nextRunMs: number;
		if (i.cron) {
			nextRunMs = parser.parseExpression(i.schedule).next().toDate().getTime();
		} else {
			nextRunMs = Number(i.schedule) * 1000;
		}
		return { nextRunMs, ...i };
	});

	if (!tasks) {
		console.log('no group returned');
	}
	console.log('data:', tasks);

	return {
		tasks
	};
};
