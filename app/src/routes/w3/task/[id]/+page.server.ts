import { PublicKey } from '@solana/web3.js';
import { error, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import parser from 'cron-parser';
import { getTransactionsFilterByMint } from '$lib/helpers';
import type { TaskStatus } from '$lib/payround/types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const sbHelper = locals.sbHelper
	const session = await sbHelper.getSession();
	// const supabase = locals.supabase;
	const payroundAdmin = locals.payroundAdmin;
	if (!session) {
		throw redirect(303, '/');
	}
	const userId = await sbHelper.getUserId()
	const taskResult = await sbHelper.getTask(params.id);
	const task = taskResult

	if (!userId) {
		throw error(404, 'error fetching user data');
	}
  const payroundClient = payroundAdmin(userId)
	const taskkey = new PublicKey(params.id);
	const taskAccount = await payroundClient.fetchTaskAccount(taskkey)
  const thread = taskAccount.thread
  const threadBalance = await payroundClient.connection.getBalance(thread)
  
  const status = taskAccount.status
  let decodedStatus; 


  
  if (status.ended) {
    decodedStatus = "ended"
  } else if (status.paused) {
    decodedStatus = "paused"
  } else if (status.started) {
    decodedStatus = "started"
  } else {
    decodedStatus ="notstarted"
  }

  decodedStatus

  const tx = await payroundClient.formatTxDataFor(thread, 50)

	if (!task) {
		console.log('no group returned');
	}
	console.log('data:', task);

  let nextRun;

  if (task!.cron) {
    nextRun = parser.parseExpression(task!.schedule).next().toDate().getTime();
  } else {
    nextRun = Number(task!.schedule)*1000
  }

	return {
		task: { nextRun, decodedStatus, threadBalance, tx, ...task}
	};
};



export const actions: Actions = {
	withdraw: async ({ request, locals, params }) => {
		const sbHelper = locals.sbHelper;
		const session = await sbHelper.getSession();
    
		if (!session) {
      throw redirect(303, '/');
		}
    
    const userId = await sbHelper.getUserId()
    const payroundAdmin = locals.payroundAdmin(userId);

		const formData = Object.fromEntries(await request.formData());
		console.log('forndata:', formData);

    const taskPubkey = new PublicKey (params.id!)
		const amount = formData.amount as string;

    try {

      const tx = await payroundAdmin.withdrawTaskCreditTx(taskPubkey, Number(amount))
      return {success: true} 
    } catch (e) {
      console.log(e)
      return {success: false}
    }
    
	},
	
	credit: async ({ request, locals, params }) => {
		const sbHelper = locals.sbHelper;
		const session = await sbHelper.getSession();
    
		if (!session) {
      throw redirect(303, '/');
		}
    
    const userId = await sbHelper.getUserId()
    const payroundAdmin = locals.payroundAdmin(userId);

		const formData = Object.fromEntries(await request.formData());
		console.log('forndata:', formData);

    const taskPubkey = new PublicKey (params.id!)
		const amount = formData.amount as string;

    try {

      const tx = await payroundAdmin.creditTaskTx(taskPubkey, Number(amount))
      return {success: true} 
    } catch (e) {
      console.log(e)
      return {success: false}
    }
    
	},
	
  resume: async ({ request, locals, params }) => {
		const sbHelper = locals.sbHelper;
		const session = await sbHelper.getSession();
    
		if (!session) {
      throw redirect(303, '/');
		}
    
    const userId = await sbHelper.getUserId()
    const payroundAdmin = locals.payroundAdmin(userId);

		const formData = Object.fromEntries(await request.formData());
		console.log('forndata:', formData);

    const taskPubkey = new PublicKey (params.id!)
		const amount = formData.amount as string;

    try {

      const tx = await payroundAdmin.resumeTaskTx(taskPubkey)
      return {success: true} 
    } catch (e) {
      console.log(e)
      return {success: false}
    }
    
	},
  pause: async ({ request, locals, params }) => {
		const sbHelper = locals.sbHelper;
		const session = await sbHelper.getSession();
    
		if (!session) {
      throw redirect(303, '/');
		}
    
    const userId = await sbHelper.getUserId()
    const payroundAdmin = locals.payroundAdmin(userId);

		const formData = Object.fromEntries(await request.formData());
		console.log('forndata:', formData);

    const taskPubkey = new PublicKey (params.id!)
		const amount = formData.amount as string;

    try {

      const tx = await payroundAdmin.pauseTaskTx(taskPubkey)
      return {success: true} 
    } catch (e) {
      console.log(e)
      return {success: false}
    }
    
	},
  start: async ({ request, locals, params }) => {
		const sbHelper = locals.sbHelper;
		const session = await sbHelper.getSession();
    
		if (!session) {
      throw redirect(303, '/');
		}
    
    const userId = await sbHelper.getUserId()
    const payroundAdmin = locals.payroundAdmin(userId);

		const formData = Object.fromEntries(await request.formData());
		console.log('forndata:', formData);

    const taskPubkey = new PublicKey (params.id!)
		const amount = formData.amount as string;

    try {
      await payroundAdmin.startTaskTx(taskPubkey, Number(amount))
      return {success: true} 
    } catch (e) {
      console.log(e)
      return {success: false}
    }
    
	},
	
};
