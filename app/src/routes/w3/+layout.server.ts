import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	const supabase = locals.supabase;
	if (!session) {
		throw redirect(303, '/');
	}
	const user = session.user;
	const result = await supabase.from('account').select('user_id, email, nickname').eq('id', user.id).single();
	const userId = result.data?.user_id;
  const email = result.data?.email;
  const nickname = result.data?.nickname;
	if (!userId) {
		return {
			balance: '',
			userAccountKey: "",
			// balance: 0,
			credits: NaN,
			uiBalance: "",
			email: "",
			nickname: ""
		};
	}
	console.log('user id:', userId);

	const payroundAdmin = locals.payroundAdmin(userId);

	const userAccountKey = payroundAdmin.pubkey.toBase58();
  console.log("usdc account:", payroundAdmin.usdcAddress.toBase58());
  
	const balance = await payroundAdmin.connection.getTokenAccountBalance(payroundAdmin.usdcAddress);
	const credits = await payroundAdmin.connection.getBalance(payroundAdmin.pubkey);
	const uiBalance = balance.value.uiAmount;
	return {
		session: locals.getSession(),
		userAccountKey,
		balance,
		credits,
		uiBalance,
    email,
    nickname,
	};
};
