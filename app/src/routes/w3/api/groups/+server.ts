import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals, request }) => {
	const supabase = locals.sbAdmin;
	const req = await request.json();

	const userId = req.address as string;
	console.log('userid:', userId);
	const groupResult = await supabase.from('task_group').select('*').eq('user_id', userId);
	const groups = groupResult.data;
	if (!groups) {
		console.log('no group returned');
	}
	console.log('data:', groups);

	return new Response(
		JSON.stringify({
			groups
		})
	);
};
