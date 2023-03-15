import type { Database } from "$lib/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";



// export class SupabaseHelper {
//   constructor (public sb: SupabaseClient<Database>) {}

//   async load (sb: SupabaseClient<>)

//   async getSession () {
//     return await this.sb.auth.getSession()
//   }



//   async getAllTasks () {
//     return await this.sb.from("task").select("*")
//   }

// }