import { redirect } from "@sveltejs/kit";

export const prerender = false;
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async({locals: {getSession, supabase}}) => {
  return {
    session: getSession()
  }
}
