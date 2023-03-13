import { PublicKey } from '@solana/web3.js';
import { error, fail, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, params }) => {
	const sbHelper = locals.sbHelper
	const session = await sbHelper.getSession();
	// const supabase = locals.supabase;
	const payroundAdmin = locals.payroundAdmin;
	
	if (!session) {
		throw redirect(303, '/');
	}

	const userId = await sbHelper.getUserId()


	if (!userId) {
		throw error(404, 'error fetching user');
	}

	const taskkey = new PublicKey(params.id);

	try {
		const tx = await payroundAdmin(userId).deleteTaskTx(taskkey);
		console.log('tx:', tx);
	} catch (e: any) {
		console.log(e);
		throw error (401, 'error deleting task')
	}
	
	const deletedTask = await sbHelper.deleteTask(params.id);
	const task = deletedTask;
	console.log('task:', task);


	throw redirect(303, "/w2/task")
};
