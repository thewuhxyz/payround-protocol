import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import parser from 'cron-parser';

export const POST: RequestHandler = async ({ request ,locals }) => {
	const supabase = locals.supabase;
	// const payroundAdmin = locals.payroundAdmin()
	const req = await request.json();
	const userId = req.address as string;
	console.log('userid:', userId);

	const tasksResult = await supabase.from('task').select('*').eq('user_id', userId);
	const tasksData = tasksResult.data;

	if (tasksData == null) {
		return new Response(
			JSON.stringify({
				tasks: null
			})
		);
	}

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

	return new Response(
		JSON.stringify({
			tasks
		})
	);
};
