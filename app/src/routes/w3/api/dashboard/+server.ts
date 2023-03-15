import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import parser from 'cron-parser';
import { getTransactionsFilterByMint } from '$lib/helpers';

export const POST: RequestHandler = async ({ locals, request }) => {

  const req = await request.json()
	const supabase = locals.sbAdmin;

  const userId = req.address
	
	const tasksResult = await supabase.from('task').select('*').eq('user_id', userId);
	const data = tasksResult.data;

	let upcomingTasks: any[] 
	if (!data) {
		upcomingTasks = []
	} else {

		console.log('data:', data);
		
		upcomingTasks = data
		.map((i) => {
			let nextRunMs: number;
			if (i.cron) {
				nextRunMs = parser.parseExpression(i.schedule).next().toDate().getTime();
			} else {
				nextRunMs = Number(i.schedule) * 1000;
			}
			return { nextRunMs, ...i };
		})
		.filter((i) => i.nextRunMs > Date.now())
		.sort((a, b) => a.nextRunMs - b.nextRunMs)
		.slice(0, 10);
		
	}

  return new Response (JSON.stringify({
		upcomingTasks,
		// txFormatedData
	}))
};
