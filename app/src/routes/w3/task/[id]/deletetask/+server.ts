import { PublicKey } from '@solana/web3.js';
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, params }) => {
	console.log('task deleted');

	const session = await locals.getSession();
	const supabase = locals.supabase;
	const payroundAdmin = locals.payroundAdmin;
	if (!session) {
		throw redirect(303, '/');
	}
	const user = session.user;
	const userId = (await supabase.from('account').select('user_id').eq('id', user.id).single())
		.data?.user_id;

	console.log('user id:', userId);
	console.log('param:', params.id);

	if (!userId) {
		throw error(404, 'page not found');
	}

	const taskkey = new PublicKey(params.id);

	try {
		const tx = await payroundAdmin(userId).deleteTaskTx(taskkey);
		console.log('tx:', tx);
	} catch (e: any) {
		console.log(e);
	}

	const taskResult = await supabase.from('task').delete().match({ task_key: params.id }).select();
	const task = taskResult.data;

	console.log('task:', task);

	throw redirect(303, '/w2/task');
};
