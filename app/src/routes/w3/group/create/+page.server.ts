import { goto } from '$app/navigation';
import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	creategroup: async ({ request, locals }) => {
		const supabase = locals.sbAdmin;
	
    const formData = Object.fromEntries(await request.formData())
    console.log("forndata:", formData);
    
    const name = formData.name as string
    const description = formData.desc as string
		const userId = formData.address as string

		
		const submited = await supabase
			.from('task_group')
			.insert({
        user_id: userId,
        name,
        description,
				
      })
			.select();
		console.log("submitted:", submited);
    

		throw redirect(303, '/w3/dashboard');
	}
};
