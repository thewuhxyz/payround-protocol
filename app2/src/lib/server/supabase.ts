import type { Database } from '$lib/types/supabase';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { error, redirect } from '@sveltejs/kit';

export class SupabaseHelper {
	// user: Session["user"]
	constructor(public sb: SupabaseClient<Database>) {}

	async getSession() {
		const {
			data: { session }
		} = await this.sb.auth.getSession();
		return session;
	}

	async getUser() {
		const session = await this.getSession();
		if (!session) throw redirect(303, '/');
		return session.user;
	}

	async getAllTasksForUser() {
		const user = await this.getUser();
		if (!user) throw redirect(303, '/');
		const tasks = await this.sb.from('task').select('*').eq('account_id', user.id);
		if (tasks.error) throw error(404, 'error fetching tasks');
		return tasks.data;
	}

	async getAllTasksForGroup(groupId: string) {
		const user = await this.getUser();
		if (!user) throw redirect(303, '/');
		const tasks = await this.sb
			.from('task')
			.select('*')
			.eq('task_group', groupId)
			.eq('account_id', user.id);
		if (tasks.error) throw error(404, 'error fetching tasks');
		return tasks.data;
	}

	async getAllTaskGroupForUser() {
		const user = await this.getUser();
		if (!user) throw redirect(303, '/');
		const data = await this.sb.from('task_group').select('*').eq('account_id', user.id);
		if (data.error) throw error(404, 'error fetching task group');
		return data.data;
	}

	async getAllAddressesForUser() {
		const user = await this.getUser();
		if (!user) throw redirect(303, '/');
		const addressesData = await this.sb.from('address_book').select('*').eq('account_id', user.id);
		if (addressesData.error) throw error(404, 'Error fetching Addresses');
		return addressesData.data;
	}

	async getUserAccount() {
		const user = await this.getUser();
		if (!user) throw redirect(303, '/');
		const userData = await this.sb.from('account').select('*').eq('id', user.id).single();
		if (userData.error) throw error(404, 'error fetching user');
		return userData.data;
	}

	async getTask(taskkey: string) {
		const user = await this.getUser();
		if (!user) throw redirect(303, '/');
		const data = await this.sb
			.from('task')
			.select('*')
			.eq('task_key', taskkey)
			.eq('account_id', user.id)
			.single();
		if (data.error) throw error(404, 'error fetching task');
		return data.data;
	}

	async getTaskGroup(groupId: string) {
		const user = await this.getUser();
		if (!user) throw redirect(303, '/');
		const data = await this.sb
			.from('task_group')
			.select('*')
			.eq('id', groupId)
			.eq('account_id', user.id)
			.single();
		if (data.error) throw error(404, 'Error fetching group');
		return data.data;
	}

	async getAddressNameByAddress(address: string) {
		const user = await this.getUser();
		if (!user) throw redirect(303, '/');
		const data = await this.sb
			.from('address_book')
			.select('name')
			.eq('address', address)
			.eq('account_id', user.id)
			.single();
		if (data.error) throw error(404, 'error fetching address');
		return data.data;
	}

	async getAccountByEmail(email: string) {
		const user = await this.getUser();
		if (!user) throw redirect(303, '/');
		const data = await this.sb.from('account').select('*').eq('email', email).single();
		if (data.error) throw error(404, 'error fetching account');
		return data.data;
	}

	async isAccountCreated() {
		const user = await this.getUser();
		if (!user) throw redirect(303, '/');
		const data = await this.sb.from('account').select('account_created').eq('id', user.id).single();
		if (data.error) throw error(404, 'error fetching info');
		return data.data;
	}

	async getUserId() {
		const user = await this.getUser();
		if (!user) throw redirect(303, '/');
		const userData = await this.sb.from('account').select('user_id').eq('id', user.id).single();
		if (userData.error) throw error(404, 'error fetching user');
    if (!userData.data.user_id) throw error (404, "error fetching user") 
		return userData.data.user_id;
	}

  async deleteTask(taskkey: string) {
    const user = await this.getUser();
    const data = await this.sb.from('task').delete().match({ task_key: taskkey }).eq("account_id", user.id).select();
    if (data.error) throw error (500, "error deleting data")
    return data.data
  }
}