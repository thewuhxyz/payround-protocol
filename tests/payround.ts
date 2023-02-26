import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {  keys, PayroundAccount, program,  provider, sleep } from "./utils";
import { SystemProgram, Keypair, PublicKey, SYSVAR_RENT_PUBKEY, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {CLOCKWORK_THREAD_PROGRAM_ID, createThread, getThreadAddress, getThreadProgram} from "@clockwork-xyz/sdk"
import * as anchor from '@project-serum/anchor'


describe("payround", () => {
	// Configure the client to use the local cluster.

    const clockworkSigner = new PublicKey("C1ockworkPayer11111111111111111111111111111");

		const {degen, usdcMint, manager} = keys

		const id= Keypair.generate()
		console.log("id", id.publicKey);
		

		const degenAccount = new PayroundAccount(manager, usdcMint, id.publicKey)

		
		it("loads degen", async () => {
			await degenAccount.load()

			const tx = await degenAccount.usdcManager.airdrop(100)
			console.log("tx:", tx);
			
			const balance = await degenAccount.usdcManager.fetchUsdcBalance()
			console.log("degen balaance:", balance);
			
		})


	// it("creates a degen account", async () => {
	// 	// Add your test here.
	// 	const tx = await program.rpc.createDegenAccount({
	// 		accounts: {
	// 			associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
	// 			authority: degen.publicKey,
	// 			degenAccount: getPda().degenAcctKey,
	// 			payer: degen.publicKey,
	// 			systemProgram: SystemProgram.programId,
	// 			tokenMint: usdcMint,
	// 			tokenProgram: TOKEN_PROGRAM_ID,
	// 			usdcTokenAccount: getAta().degenAcctAta,
	// 		},
	// 		signers: [degen],
	// 	});
	// 	console.log("Your transaction signature", tx);
	// });

  // it("can transfer to an account", async () => {
	// 	const degenAccount = await fetchDegenAccount(getPda().degenAcctKey);
	// 	console.log("degen account", degenAccount.authority.toBase58());

	// 	const tx = await usdcTransfer("degenAcctAta", 1);
	// 	console.log('tx:', tx);

	// 	const tokenBalance = await fetchTokenAccount(
	// 		getAta().degenAcctAta
	// 	);
	// 	console.log("balance:", tokenBalance.amount.toString());
	// });

  // it('create a taskgroup', async () => {

  //   const taskgroup = Keypair.generate()
  //   console.log("taskgroup", taskgroup.publicKey.toBase58());
    
  //   const tasklist = Keypair.generate()
  //   console.log("tasklist", tasklist.publicKey.toBase58());
    
  //   const tx = await program.rpc.createTaskGroup("group1", {
  //     accounts: {
  //       authority: degen.publicKey,
  //       degenAccount: getPda().degenAcctKey,
  //       payer: degen.publicKey,
  //       systemProgram: SystemProgram.programId,
  //       taskGroup: taskgroup.publicKey,
  //       tasklist: tasklist.publicKey
  //     },
  //     preInstructions: [
  //       await program.account.tasklist.createInstruction(tasklist)
  //     ],
  //     signers: [degen, tasklist, taskgroup]
  //   })
  //   console.log("tx:", tx);
  // })

  // it("taskgroup check", async () => {
  //   const groupkey = new PublicKey(
	// 		"Eid5NgvZHZuZvyLmazufZfu7pzwhW18wV8mcNtZKQHtr"
	// 	);

  //   const tasklistkey = new PublicKey(
	// 		"DZy4HbQgNg9UTf2yxjRWc6PDPYKhzaHrg9tZmuLMzKXX"
	// 	);

  //   const groupAccount = await fetchTaskGroupAccount(groupkey);

  //   const tasklistAccount = await fetchTaskListAccount(tasklistkey)

  //   console.log("group account:", groupAccount.account.toBase58(), getPda().degenAcctKey.toBase58());
  //   console.log("group list:", tasklistAccount.taskGroup.toBase58(), groupkey.toBase58());
    
  // })

  // it("creates a task", async () => {
  //   const taskkey = Keypair.generate()
  //   console.log("taskkey", taskkey.publicKey.toBase58());
    

  //   const tx = await program.rpc.createTask(new anchor.BN("3"), "task1", {
  //     accounts: {
  //       authority: degen.publicKey,
  //       degenAccount: getPda().degenAcctKey,
  //       payer: degen.publicKey,
  //       recipientAta: getAta().degenAta,
  //       systemProgram: SystemProgram.programId,
  //       task: taskkey.publicKey,
  //       taskGroup: groupkey,
  //       tasklist: tasklistkey
  //     },
  //     signers: [degen, taskkey]
  //   })

  //   console.log("tx:", tx);
    
  // })

  // it ("task check", async () => {
	// 	const groupAccount = await fetchTaskGroupAccount(groupkey);

	// 	const tasklistAccount = await fetchTaskListAccount(tasklistkey)

  //   const taskAccount = await fetchTaskAccount(taskkey)

  //   console.log("taskAccount:", taskAccount);
  //   console.log("taskgrp:", groupAccount);
  //   console.log("listaccount:", tasklistAccount);
    
	// })

  // it("process task", async () => {
	// 	const threadLabel = "f";
	// 		const threadAuthority = manager.publicKey;
	// 		const payer = manager.publicKey;
	// 		const threadAddress = getThreadAddress(threadAuthority, threadLabel);

	// 	const tx = await program.rpc.processTaskTestIx({
	// 			accounts: {
	// 				accountAta: getAta().degenAcctAta,
	// 				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
	// 				degenAccount: getPda().degenAcctKey,
	// 				recipientAta: getAta().degenAta,
	// 				systemProgram: SystemProgram.programId,
	// 				task: taskkey,
	// 				threadAuthority: manager.publicKey,
	// 				tokenProgram: TOKEN_PROGRAM_ID,
	// 				rent: SYSVAR_RENT_PUBKEY,
	// 			},
  //       signers: [manager]
	// 	});

  //   console.log("tx:", tx);
    
	// })

  // it("process a task", async () => {
		// const threadLabel = "o";
		// const threadAuthority = manager.publicKey;
		// const payer = manager.publicKey;
		// const threadAddress = getThreadAddress(threadAuthority, threadLabel);

		// // todo: Need to airdrop or transfer sol to thread account

    // console.log("theadAddress", threadAddress);

    // const buildProcessTaskInstruction = async () => {
		// 	return await program.methods
		// 		.processTask()
		// 		.accounts({
		// 			accountAta: getAta().degenAcctAta,
		// 			associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
		// 			degenAccount: getPda().degenAcctKey,
		// 			recipientAta: getAta().degenAta,
		// 			systemProgram: SystemProgram.programId,
		// 			task: taskkey,
		// 			thread: threadAddress,
		// 			// threadAuthority: manager.publicKey,
		// 			tokenProgram: TOKEN_PROGRAM_ID,
		// 			rent: SYSVAR_RENT_PUBKEY,
		// 		})
		// 		.instruction();
		// };

    // const targetIx = await buildProcessTaskInstruction()
    

		// const targetIx = program.instruction.processTask({
		// 	accounts: {
		// 		accountAta: getAta().degenAcctAta,
		// 		associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
		// 		degenAccount: getPda().degenAcctKey,
		// 		recipientAta: getAta().degenAta,
		// 		systemProgram: SystemProgram.programId,
		// 		task: taskkey,
		// 		thread: threadAddress,
		// 		threadAuthority: manager.publicKey,
		// 		tokenProgram: TOKEN_PROGRAM_ID,
		// 		rent: SYSVAR_RENT_PUBKEY,
		// 	},
		// 	remainingAccounts: [
		// 		{
		// 			pubkey: signer,
		// 			isSigner: true,
		// 			isWritable: false,
		// 		},
		// 	],
		// });

		// const trigger = {
		// 	cron: {
		// 		schedule: "*/10 * * * * * *",
		// 		skippable: true,
		// 	},
		// };

		// const threadProgram = getThreadProgram(provider)

    // const tx = await threadProgram.rpc.threadCreate(
		// 	threadLabel,
		// 	{
		// 		programId: program.programId,
		// 		accounts: targetIx.keys,
		// 		data: targetIx.data,
		// 	},
		// 	trigger,
		// 	{
		// 		accounts: {
		// 			authority: manager.publicKey,
		// 			payer: manager.publicKey,
		// 			thread: threadAddress,
		// 			systemProgram: SystemProgram.programId,
		// 		},
    //     options: {
    //       skipPreflight: false
    //     }
		// 	}
		// );

    // console.log("tx:", tx);
    
    // const threadAccount = await threadProgram.account.thread.fetch(threadAddress)
    // console.log("thread account:", threadAccount.kickoffInstruction.accounts);
    

    // const tx2 = await threadProgram.rpc.threadDelete({
		// 	accounts: {
		// 		authority: threadAuthority,
		// 		closeTo: threadAuthority,
		// 		thread: threadAddress,
		// 	},
		// });

    // console.log("tx2:", tx2);
    

	// })

	it ("creates an account", async() => {

		const defaultGroup = Keypair.generate()
		const tasklist = Keypair.generate()

		console.log("group:", defaultGroup.publicKey.toBase58());
		console.log("tasklist:", tasklist.publicKey.toBase58());

		console.log("paroundacont:", degenAccount.pubkey.toBase58());
		
		console.log("id", degenAccount.id.toBase58());
		// console.log("newKey", degenAccount.id.toBase58());
		

		const tx = await program.rpc.createEmailAccount(
			degenAccount.bump,
			"some1",
			{
				accounts: {
					associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
					authority: degenAccount.owner.publicKey,
					payer: degenAccount.owner.publicKey,
					emailAccount: degenAccount.pubkey,
					userId: degenAccount.id,
					systemProgram: SystemProgram.programId,
					tokenMint: degenAccount.mint,
					defaultGroup: defaultGroup.publicKey,
					tasklist: tasklist.publicKey,
					tokenProgram: TOKEN_PROGRAM_ID,
					usdcTokenAccount: degenAccount.usdcAddress,
				},
				preInstructions: [
					await program.account.tasklist.createInstruction(tasklist),
				],
				signers: [degenAccount.owner, tasklist, defaultGroup],
				// options: {
				// 	skipPreflight: true,
				// },
			}
		);
		
		console.log("tz:", tx);

		await sleep(5000)
		
		const account = await degenAccount.fetchPayroundAccount();
		console.log("account:", account);

		const task = Keypair.generate()

		const hash = await degenAccount.transferUsdcToSelf(1)
		console.log("hash:", hash);
		

		await sleep(5000)

		const balance = await degenAccount.getBalance()
		console.log("account balance:", balance);
		

		const tx2 = await program.rpc.createTask(new anchor.BN(3), "some1", "some2", {
			accounts: {
				authority: degenAccount.owner.publicKey,
				payer: degenAccount.owner.publicKey,
				payroundAccount: degenAccount.pubkey,
				recipient: degenAccount.usdcManager.usdcAddress, // todo: should change this to the owner of the ata. will be used to verify in start thread, ata will be inserted there also
				systemProgram: SystemProgram.programId,
				task: task.publicKey,
				taskGroup: defaultGroup.publicKey,
				tasklist: tasklist.publicKey
			}, 
			signers: [degenAccount.owner, task]
		})

		console.log("tx2:", tx2);
		
		await sleep(5000);

		const taskgroupaccount = await degenAccount.fetchTaskGroupAccount(defaultGroup.publicKey)
		const taskaccount = await degenAccount.fetchTaskAccount(task.publicKey)
		const listaccount = await degenAccount.fetchTaskListAccount(tasklist.publicKey)

		console.log("taskgroup", taskgroupaccount);
		console.log("task", taskaccount);
		console.log("list", listaccount);

		const thread = taskaccount.thread
		console.log("thread:", thread.toBase58());

		// const tx3 = await program.rpc.creditTask(new anchor.BN(0.005 * LAMPORTS_PER_SOL), {
		// 	accounts: {
		// 		authority: degenAccount.owner.publicKey,
		// 		payer: degenAccount.owner.publicKey,
		// 		payroundAccount: degenAccount.pubkey,
		// 		systemProgram: SystemProgram.programId,
		// 		task: task.publicKey,
		// 		thread,
		// 	},
		// 	signers: [degenAccount.owner]
		// })

		// console.log("tx3:", tx3);
		
		// await sleep(25000);

		const tx4 = await program.rpc.startTask("*/10 * * * * * *", true, {
			accounts: {
				accountAta: degenAccount.usdcAddress,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				authority: degenAccount.owner.publicKey,
				clockworkProgram: CLOCKWORK_THREAD_PROGRAM_ID,
				payer: degenAccount.owner.publicKey,
				payroundAccount: degenAccount.pubkey,
				recipient: degenAccount.usdcManager.usdcAddress,
				recipientAta: degenAccount.usdcManager.usdcAddress,
				rent: SYSVAR_RENT_PUBKEY,
				systemProgram: SystemProgram.programId,
				task: task.publicKey,
				thread,
				tokenProgram: TOKEN_PROGRAM_ID,
			},
			signers: [degenAccount.owner],
			options:{
				skipPreflight: true,	
			}
		});

		console.log("tx4:", tx4);
		
		
	})

});

