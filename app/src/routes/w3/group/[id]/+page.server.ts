import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import parser from "cron-parser"

export const load: PageServerLoad = async ({ locals, params }) => {
	const session = await locals.getSession();
	const supabase = locals.supabase;
	const sbHelper = locals.sbHelper
  // const payroundAdmin = locals.payroundAdmin()
	if (!session) {
		throw redirect(303, '/');
	}
	const groupResult = await sbHelper.getTaskGroup(params.id)
	const tasksResult = await sbHelper.getAllTasksForGroup(params.id)
  const group = groupResult;
	const tasksData = tasksResult;

  const tasks = tasksData?.map((i) => {
     let nextRunMs: number;
			if (i.cron) {
				nextRunMs = parser.parseExpression(i.schedule).next().toDate().getTime();
			} else {
				nextRunMs = Number(i.schedule) * 1000;
			}
			return { nextRunMs, ...i };
  })

	if (!tasks) {
		console.log('no group returned');
	}
	console.log('data:', tasks);

	return {
    group,
		tasks
	};
};
