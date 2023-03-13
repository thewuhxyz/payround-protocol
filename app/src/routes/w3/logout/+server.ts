import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";


export const POST: RequestHandler = async ({locals}) => {
	const {error: err} = await locals.supabase.auth.signOut();
	if (err) {
		console.log("err POST:", err);
		throw error(500, "something went wrong")
	} else {
		console.log("should log out");
		throw redirect(303, "/")
	}
}