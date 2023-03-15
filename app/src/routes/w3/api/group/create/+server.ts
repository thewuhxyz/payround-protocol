import { goto } from '$app/navigation';
import { AuthApiError } from '@supabase/supabase-js';
import type { RequestHandler } from '@sveltejs/kit';

export const POST:RequestHandler = async ({ request, locals }) => {
		const supabase = locals.sbAdmin;
		// const payroundAdmin = locals.payroundAdmin;

		const req = (await request.json());
		console.log('forndata:', req);

		const name = req.name as string;
		const description = req.desc as string;
    const userId = req.address as string;

		const submited = await supabase
			.from('task_group')
			.insert({
				// account_id: user.id,
				name,
				description,
        user_id: userId,
			})
			.select();
		console.log('submitted:', submited);

	return new Response(JSON.stringify({ success: 'true', message: 'account created' }));
	}
