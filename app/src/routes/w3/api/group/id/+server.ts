import type{  RequestHandler } from '@sveltejs/kit';
// import type { PageServerLoad } from './$types';
import parser from 'cron-parser';

export const POST: RequestHandler = async ({request, locals, params }) => {
	const session = await locals.getSession();
	const supabase = locals.supabase;
	const req = await request.json();
	const userId = req.address as string;
	const id = req.id as string;
	
	const groupResult = await supabase.from('task_group').select('*').eq('id', id).eq("user_id", userId).single();
	const tasksResult = await supabase.from('task').select('*').eq('task_group', id).eq("user_id", userId);
	const group = groupResult.data;
	const tasksData = tasksResult.data;

	const tasks = tasksData?.map((i) => {
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

	return new Response(
		JSON.stringify({
			group,
			tasks
		})
	);
};
