import {
	ASSOCIATED_TOKEN_PROGRAM_ID,
	TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
	clockworkExploerer,
	keys,
	PayroundAccount,
	program,
	provider,
	sleep,
	connection,
	solanaExploerer,
} from "./utils";
import {
	SystemProgram,
	Keypair,
	PublicKey,
	SYSVAR_RENT_PUBKEY,
	LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
	CLOCKWORK_THREAD_PROGRAM_ID,
	createThread,
	getThreadAddress,
	getThreadProgram,
	TriggerTypes,
} from "@clockwork-xyz/sdk";
import * as anchor from "@project-serum/anchor";

describe("payround", () => {
	// Configure the client to use the local cluster.

	const clockworkSigner = new PublicKey(
		"C1ockworkPayer11111111111111111111111111111"
	);

	const clockworkProgram = new PublicKey(
		"CLoCKyJ6DXBJqqu2VWx9RLbgnwwR6BMHHuyasVmfMzBh"
	);

	const { degen, usdcMint, manager, admin } = keys;

	const id = Keypair.generate();
	console.log("admin:", admin.publicKey.toBase58());
	console.log("id", id.publicKey.toBase58());

	const emailAccount = new PayroundAccount(admin, usdcMint, id.publicKey);

	it("loads email", async () => {
		await emailAccount.load();

		const tx = await emailAccount.usdcManager.airdrop(100);
		console.log("tx:", tx);
		solanaExploerer(tx);

		const balance = await emailAccount.usdcManager.fetchUsdcBalance();
		console.log("email balaance:", balance);

		const hash = await emailAccount.usdcManager.transferUsdc(
			new PublicKey("2mtrq9BZyvkDEAJtccf16x1Eqpc81KYD8cMRm6hDLC7Z"),
			15
		);

		console.log("hash:", hash);

		// const some = await connection.getParsedTransaction(
		// 	"2BRByh1pZeZnYKzoKrJKpP9w6LXPzF3HbgiKfh3Uwx7NCz1w8qu752nr5USFA8vtGfusNn7yP6zW1owhvU4bgShM"
		// , {commitment: "confirmed"});

		// console.log("some:", some.meta);

		const some2 = await connection.getSignaturesForAddress(
			new PublicKey("E8zxdBu2N5KwPtd78j9FuTM5etsk2YQLAFfD9yt13gmb"),
			{ limit: 20 },
			"confirmed"
		);
// some2.map(i => i.)
		console.log(
			"some2:",
			some2.map((i) => i.signature)
		);

		const some = await connection.getParsedTransactions(
			some2.map((i) => i.signature),
			{ commitment: "confirmed" }
		);



	});

	it("creates an account", async () => {
		const defaultGroup = Keypair.generate();
		const tasklist = Keypair.generate();

		console.log("group:", defaultGroup.publicKey.toBase58());
		console.log("tasklist:", tasklist.publicKey.toBase58());

		console.log("paroundacont:", emailAccount.pubkey.toBase58());

		console.log("id", emailAccount.id.toBase58());
		// console.log("newKey", emailAccount.id.toBase58());

		const tx = await program.methods
			.createEmailAccount(emailAccount.bump)
			.accounts({
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				authority: emailAccount.authority.publicKey,
				emailAccount: emailAccount.pubkey,
				userId: emailAccount.id,
				systemProgram: SystemProgram.programId,
				tokenMint: emailAccount.mint,
				// defaultGroup: defaultGroup.publicKey,
				// tasklist: tasklist.publicKey,
				tokenProgram: TOKEN_PROGRAM_ID,
				usdcTokenAccount: emailAccount.usdcAddress,
			})
			// .preInstructions([
			// 	await program.account.tasklist.createInstruction(tasklist),
			// ])
			.signers([
				emailAccount.authority,
				// tasklist,
				// defaultGroup
			])
			.rpc();

		console.log("tz:", tx);
		solanaExploerer(tx);

		await sleep(5);

		const account = await emailAccount.fetchPayroundAccount();
		console.log("account:", account);

		const task = Keypair.generate();

		const hash = await emailAccount.transferUsdcToSelf(1);
		console.log("hash:", hash);

		await sleep(5);

		const balance = await emailAccount.getBalance();
		console.log("account balance:", balance);

		const trigger = { cron: { schedule: "*/10 * * * * * *", skippable: true } };
		// const trigger = { epoch: { epoch: new anchor.BN(Date.now()/1000 + 60)}};

		const tx2 = await program.methods
			.createTask(new anchor.BN(3), trigger)
			.accounts({
				authority: emailAccount.authority.publicKey,
				payroundAccount: emailAccount.pubkey,
				recipient: emailAccount.authority.publicKey,
				systemProgram: SystemProgram.programId,
				task: task.publicKey,
				// taskGroup: defaultGroup.publicKey,
				// tasklist: tasklist.publicKey,
				userId: emailAccount.id,
			})
			.signers([
				task,
				emailAccount.authority
			])
			.rpc({ skipPreflight: false });

		console.log("tx2:", tx2);
		solanaExploerer(tx2);

		await sleep(5);

		// let taskgroupaccount = await emailAccount.fetchTaskGroupAccount(
		// 	defaultGroup.publicKey
		// );
		let taskaccount = await emailAccount.fetchTaskAccount(task.publicKey);
		// let listaccount = await emailAccount.fetchTaskListAccount(
		// 	tasklist.publicKey
		// );

		// console.log("taskgroup", taskgroupaccount);
		console.log("task", taskaccount);
		// console.log("list", listaccount);

		const thread = taskaccount.thread;
		console.log("thread:", thread.toBase58());

		await sleep(5);

		const tx3 = await program.methods
			.startTask(new anchor.BN(3))
			.accounts({
				accountAta: emailAccount.usdcAddress,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				authority: emailAccount.authority.publicKey,
				clockworkProgram,
				payroundAccount: emailAccount.pubkey,
				recipient: emailAccount.authority.publicKey,
				recipientAta: emailAccount.usdcManager.usdcAddress,
				rent: SYSVAR_RENT_PUBKEY,
				systemProgram: SystemProgram.programId,
				task: task.publicKey,
				thread,
				tokenProgram: TOKEN_PROGRAM_ID,
				tokenMint: usdcMint,
				userId: emailAccount.id,
			})
			.signers([emailAccount.authority])
			.rpc({ skipPreflight: true });
		console.log("tx3:", tx3);
		solanaExploerer(tx3);
		clockworkExploerer(thread);

		// const thread = emailAccount.threadKey(task.publicKey);

		
		// const tx4 = await program.methods
		// 	.creditTask(new anchor.BN(0.005 * LAMPORTS_PER_SOL))
		// 	.accounts({
		// 		authority: emailAccount.authority.publicKey,
		// 		payroundAccount: emailAccount.pubkey,
		// 		systemProgram: SystemProgram.programId,
		// 		task: task.publicKey,
		// 		thread,
		// 		userId: emailAccount.id,
		// 	})
		// 	.signers([emailAccount.authority])
		// 	.rpc();

		// console.log("tx4:", tx4);
		// await sleep(60); // wait 1 min

		// let amount = new anchor.BN(5);
		// let freq = "*/15 * * * * * *";
		// let skippable = false;

		// let taskOptions = {
		// 	amount,
		// 	scheduleOptions: { cron: { schedule: freq, skippable: true} },
		// };

		// const tx5 = await program.methods
		// 	.updateTaskDetails(taskOptions)
		// 	.accounts({
		// 		authority: emailAccount.authority.publicKey,
		// 		clockworkProgram,
		// 		payroundAccount: emailAccount.pubkey,
		// 		systemProgram: SystemProgram.programId,
		// 		task: task.publicKey,
		// 		thread: thread,
		// 		userId: emailAccount.id,
		// 	})
		// 	.signers([emailAccount.authority])
		// 	.rpc({ skipPreflight: true });

		// console.log("tx5");

		// solanaExploerer(tx5);
		// clockworkExploerer(thread);

		// await sleep(60); // wait 1 min

		// amount = null;
		// skippable = true;

		// taskOptions = {
		// 	amount,
		// 	scheduleOptions: { freq, skippable },
		// };

		// const tx6 = await program.methods
		// 	.updateTaskDetails(taskOptions)
		// 	.accounts({
		// 		authority: emailAccount.authority.publicKey,
		// 		clockworkProgram: CLOCKWORK_THREAD_PROGRAM_ID,
		// 		payroundAccount: emailAccount.pubkey,
		// 		systemProgram: SystemProgram.programId,
		// 		task: task.publicKey,
		// 		thread: thread,
		// 		userId: emailAccount.id,
		// 	})
		// 	.signers([emailAccount.authority])
		// 	.rpc({ skipPreflight: true });

		// console.log("tx6");

		// solanaExploerer(tx6);
		// clockworkExploerer(thread);

		// await sleep(60); // wait 1 mins

		// amount = new anchor.BN(7);
		// skippable = false;

		// taskOptions = {
		// 	amount,
		// 	scheduleOptions: null,
		// };

		// const tx7 = await program.methods
		// 	.updateTaskDetails(taskOptions)
		// 	.accounts({
		// 		authority: emailAccount.authority.publicKey,
		// 		clockworkProgram: CLOCKWORK_THREAD_PROGRAM_ID,
		// 		payroundAccount: emailAccount.pubkey,
		// 		systemProgram: SystemProgram.programId,
		// 		task: task.publicKey,
		// 		thread: thread,
		// 		userId: emailAccount.id,
		// 	})
		// 	.signers([emailAccount.authority])
		// 	.rpc({ skipPreflight: true });

		// console.log("tx7");

		// solanaExploerer(tx7);
		// clockworkExploerer(thread);

		// await sleep(60); // wait 1 mins

		const tx8 = await program.methods
			.deleteTask()
			.accounts({
				authority: emailAccount.authority.publicKey,
				clockworkProgram,
				payroundAccount: emailAccount.pubkey,
				task: task.publicKey,
				thread: thread,
				userId: emailAccount.id,
				// taskGroup: defaultGroup.publicKey,
				// tasklist: tasklist.publicKey,
			})
			.signers([emailAccount.authority])
			.rpc();

		console.log("tx8");

		solanaExploerer(tx8);
		clockworkExploerer(thread);
	
			

		try {
			taskaccount = await emailAccount.fetchTaskAccount(task.publicKey);
			console.log("task", taskaccount);
		} catch (e) {
			console.log(e);
		}
	
	}).pending = false;
});
