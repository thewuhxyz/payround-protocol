import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const supabase = locals.supabase;
	const req = await request.json();
	const userId = req.address as string;
	console.log('userid:', userId);

	const groupResult = await supabase.from('task_group').select('name, id').eq('user_id', userId);
	const groups = groupResult.data;

	const addressBookResult = await supabase
		.from('address_book')
		.select('name, address')
		.eq('user_id', userId);
	const addresses = addressBookResult.data;
	if (!addresses) {
		console.error('no group returned');
	}
	console.log('data:', addresses);
	console.log('data:', groups);

	return new Response(
		JSON.stringify({
			groups,
			addresses
		})
	);
};
