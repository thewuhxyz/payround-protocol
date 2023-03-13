import * as anchor from '@project-serum/anchor';
import idl from '$lib/payround/idl/payround.json';
import type { Payround } from '$lib/payround/idl/payround';
import {
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	SystemProgram,
	SYSVAR_RENT_PUBKEY,
	Transaction
} from '@solana/web3.js';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import {
	ASSOCIATED_TOKEN_PROGRAM_ID,
	getAccount,
	getAssociatedTokenAddressSync,
	TOKEN_PROGRAM_ID
} from '@solana/spl-token';
// import { } from '@clockwork-xyz/sdk';
import type { ClockworkTrigger, TaskOptions } from './types';
import { getTransactionsFilterByMint } from '$lib/helpers';

export class PayroundClient {
	static PAYROUND_ID = new PublicKey('BQpMmaGZ9wgYvUQGcBarTr3puuDid1W3tUj7Fz3pWUkV');
	static PAYROUND_SEED = 'payround';
	static MOCK_USDC_MINT = new PublicKey('48JBvpStoDYJmQBFuENcCm6dBomPC2z9r4SfJJa9ui9H');
	static CLOCKWORK_THREAD_SEED = 'thread';

	static CLOCKWORK_THREAD_PROGRAM_ID = new PublicKey(
		'CLoCKyJ6DXBJqqu2VWx9RLbgnwwR6BMHHuyasVmfMzBh'
	);

	connection: anchor.web3.Connection;
	userId: PublicKey;

	

	constructor(
		public program: anchor.Program<Payround>,
		public provider: anchor.Provider,
		public network: string,
		userId?: string
	) {
		this.connection = program.provider.connection;
		this.userId = userId ? new PublicKey(userId) : this.provider.publicKey!;
		
	}

	static connect(provider: anchor.Provider, network: string, userId?: string): PayroundClient {
		const program = new anchor.Program<Payround>(idl as any, PayroundClient.PAYROUND_ID, provider);
		return new PayroundClient(program, provider, network, userId);
	}

	static getTokenAddress(mint: PublicKey, owner: PublicKey, allowPda?: boolean) {
		return getAssociatedTokenAddressSync(mint, owner, allowPda);
	}

	async createAccountTx(desc: string): Promise<string> {
		// const group = Keypair.generate();
		// console.log('group key:', group.publicKey.toBase58());
		// const tasklist = Keypair.generate();
		// console.log('tasklist key:', tasklist.publicKey.toBase58());

		const tx = await this.program.methods
			.createDegenAccount(this.bump, desc)
			.accounts({
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				authority: this.provider.publicKey,
				// defaultGroup: group.publicKey,
				payroundAccount: this.pubkey,
				systemProgram: SystemProgram.programId,
				// tasklist: tasklist.publicKey,
				tokenMint: PayroundClient.MOCK_USDC_MINT,
				tokenProgram: TOKEN_PROGRAM_ID,
				usdcTokenAccount: this.usdcAddress
			})
			// .preInstructions([await this.program.account.tasklist.createInstruction(tasklist)])
			// .signers([tasklist, group])
			.rpc();

		return tx;
	}

	async createEmailAccountTx(): Promise<string> {
		console.log('prov:', this.provider.publicKey?.toBase58());

		const userId = Keypair.generate().publicKey;
		console.log('userId:', userId.toBase58());
		// const group = Keypair.generate();
		// console.log('group key:', group.publicKey.toBase58());
		// const tasklist = Keypair.generate();
		// console.log('tasklist key:', tasklist.publicKey.toBase58());
		const tx = await this.program.methods
			.createEmailAccount(this._pda(userId)[1])
			.accounts({
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				authority: this.provider.publicKey,
				// defaultGroup: group.publicKey,
				emailAccount: this._pda(userId)[0],
				systemProgram: SystemProgram.programId,
				// tasklist: tasklist.publicKey,
				tokenMint: PayroundClient.MOCK_USDC_MINT,
				tokenProgram: TOKEN_PROGRAM_ID,
				usdcTokenAccount: this.getUsdcAddressFor(this._pda(userId)[0]),
				userId: userId
			})
			// .preInstructions([await this.program.account.tasklist.createInstruction(tasklist)])
			// .signers([tasklist, group])
			.rpc({ skipPreflight: true });

		console.log('account created. tx:', tx);
		return userId.toBase58();
	}

	async makeTransferTx(recipient: PublicKey, uiAmount: number): Promise<string> {
		return await this.program.methods
			.makeTransfer(new anchor.BN(uiAmount * 10**6))
			.accounts({
				accountAta: this.usdcAddress,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				authority: this.provider.publicKey,
				payroundAccount: this.pubkey,
				recipient: recipient,
				recipientAta: this.getUsdcAddressFor(recipient),
				systemProgram: SystemProgram.programId,
				tokenMint: PayroundClient.MOCK_USDC_MINT,
				tokenProgram: TOKEN_PROGRAM_ID,
				userId: this.userId
			})
			.rpc();
	}

	async createTaskTx(
		recipient: PublicKey,
		uiAmount: number,
		trigger: ClockworkTrigger
	): Promise<string> {
		// const groupAccount = await this.fetchTaskGroupAccount(group);
		const task = Keypair.generate();
		const amount = uiAmount * 10 ** 6; // mock usdc decimals
		const tx = await this.program.methods
			.createTask(new anchor.BN(amount), trigger)
			.accounts({
				authority: this.provider.publicKey,
				payroundAccount: this.pubkey,
				recipient: recipient,
				systemProgram: SystemProgram.programId,
				task: task.publicKey,
				// taskGroup: group,
				// tasklist: groupAccount.tasklist,
				userId: this.userId
			})
			.signers([task])
			.rpc();

		console.log('tx:', tx);

		return task.publicKey.toBase58();
	}
	// async createTaskTx(
	// 	recipient: PublicKey,
	// 	uiAmount: number,
	// 	trigger: ClockworkTrigger
	// 	// task: PublicKey,
	// 	// group: PublicKey
	// ): Promise<string> {
	// 	// const groupAccount = await this.fetchTaskGroupAccount(group);
	// 	const task = Keypair.generate();
	// 	const amount = uiAmount * 10 ** 6; // mock usdc decimals
	// 	const tx = await this.program.methods
	// 		.createTask(new anchor.BN(amount), amount, trigger)
	// 		.accounts({
	// 			authority: this.provider.publicKey,
	// 			payroundAccount: this.pubkey,
	// 			recipient: recipient,
	// 			systemProgram: SystemProgram.programId,
	// 			task: task.publicKey,
	// 			// taskGroup: group,
	// 			// tasklist: groupAccount.tasklist,
	// 			userId: this.userId
	// 		})
	// 		.signers([task])
	// 		.rpc();

	// 	console.log('tx:', tx);

	// 	return task.publicKey.toBase58();
	// }

	// async createGroupTx(desc: string): Promise<string> {
	// 	const group = Keypair.generate();
	// 	console.log('group key:', group.publicKey.toBase58());
	// 	const tasklist = Keypair.generate();
	// 	console.log('tasklist key:', tasklist.publicKey.toBase58());

	// 	return await this.program.methods
	// 		.createTaskGroup(desc)
	// 		.accounts({
	// 			authority: this.provider.publicKey,
	// 			payroundAccount: this.pubkey,
	// 			systemProgram: SystemProgram.programId,
	// 			taskGroup: group.publicKey,
	// 			tasklist: tasklist.publicKey,
	// 			userId: this.userId
	// 		})
	// 		.preInstructions([await this.program.account.tasklist.createInstruction(tasklist)])
	// 		.signers([tasklist, group])
	// 		.rpc();
	// }

	// async changeTaskGroupTx(taskKey: PublicKey, newGroupkey: PublicKey): Promise<string> {
	// 	const task = await this.fetchTaskAccount(taskKey);
	// 	const currentTaskGroup = await this.fetchTaskGroupAccount(task.taskGroup);
	// 	const newGroupAccount = await this.fetchTaskGroupAccount(newGroupkey);
	// 	return await this.program.methods
	// 		.changeTaskGroup()
	// 		.accounts({
	// 			authority: this.provider.publicKey,
	// 			currentGroupTasklist: currentTaskGroup.tasklist,
	// 			currentTaskGroup: currentTaskGroup.pubkey,
	// 			newGroupTasklist: newGroupAccount.tasklist,
	// 			newTaskGroup: newGroupAccount.pubkey,
	// 			payroundAccount: this.pubkey,
	// 			task: taskKey,
	// 			userId: this.userId
	// 		})
	// 		.rpc();
	// }

	async startTaskTx(task: PublicKey, amount: number): Promise<string> {
		const taskAccount = await this.fetchTaskAccount(task);
		console.log('recipient:', taskAccount.recipient.toBase58());
		console.log('recipient token address:', this.getUsdcAddressFor(taskAccount.recipient).toBase58());
		console.log('task account thread address:', taskAccount.thread.toBase58());

		return await this.program.methods
			.startTask(new anchor.BN(amount * LAMPORTS_PER_SOL))
			.accounts({
				accountAta: this.usdcAddress,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				authority: this.provider.publicKey,
				clockworkProgram: PayroundClient.CLOCKWORK_THREAD_PROGRAM_ID,
				payroundAccount: this.pubkey,
				recipient: taskAccount.recipient,
				recipientAta: this.getUsdcAddressFor(taskAccount.recipient),
				rent: SYSVAR_RENT_PUBKEY,
				systemProgram: SystemProgram.programId,
				task: task,
				thread: taskAccount.thread,
				tokenProgram: TOKEN_PROGRAM_ID,
				tokenMint: PayroundClient.MOCK_USDC_MINT,
				userId: this.userId
			})
			.rpc();
	}

	async pauseTaskTx(task: PublicKey) {
		const taskAccount = await this.fetchTaskAccount(task);
		return await this.program.methods
			.pauseTask()
			.accounts({
				authority: this.provider.publicKey,
				clockworkProgram: PayroundClient.CLOCKWORK_THREAD_PROGRAM_ID,
				payroundAccount: this.pubkey,
				task: taskAccount.pubkey,
				thread: taskAccount.thread,
				userId: this.userId
			})
			.rpc();
	}

	async resumeTaskTx(task: PublicKey) {
		const taskAccount = await this.fetchTaskAccount(task);
		return await this.program.methods
			.resumeTask()
			.accounts({
				authority: this.provider.publicKey,
				clockworkProgram: PayroundClient.CLOCKWORK_THREAD_PROGRAM_ID,
				payroundAccount: this.pubkey,
				task: taskAccount.pubkey,
				thread: taskAccount.thread,
				userId: this.userId
			})
			.rpc();
	}

	// async endTaskTx(task: PublicKey): Promise<string> {
	// 	const taskAccount = await this.fetchTaskAccount(task);
	// 	return await this.program.methods
	// 		.endTask()
	// 		.accounts({
	// 			authority: this.provider.publicKey,
	// 			clockworkProgram: PayroundClient.CLOCKWORK_THREAD_PROGRAM_ID,
	// 			payroundAccount: this.pubkey,
	// 			task: taskAccount.pubkey,
	// 			thread: taskAccount.thread,
	// 			userId: this.userId
	// 		})
	// 		.rpc();
	// }

	async deleteTaskTx(task: PublicKey): Promise<string> {
		const taskAccount = await this.fetchTaskAccount(task);
		// const taskGroup = await this.fetchTaskGroupAccount(taskAccount.taskGroup);
		return await this.program.methods
			.deleteTask()
			.accounts({
				authority: this.provider.publicKey,
				clockworkProgram: PayroundClient.CLOCKWORK_THREAD_PROGRAM_ID,
				payroundAccount: this.pubkey,
				task: task,
				thread: taskAccount.thread,
				// taskGroup: taskGroup.pubkey,
				// tasklist: taskGroup.tasklist,
				userId: this.userId
			})
			.rpc({skipPreflight: true});
	}

	async creditTaskTx(task: PublicKey, amount: number): Promise<string> {
		const taskAccount = await this.fetchTaskAccount(task);
		return await this.program.methods
			.creditTask(new anchor.BN(amount))
			.accounts({
				authority: this.provider.publicKey,
				payroundAccount: this.pubkey,
				systemProgram: SystemProgram.programId,
				task: taskAccount.pubkey,
				thread: taskAccount.thread,
				userId: this.userId
			})
			.rpc();
	}

	async withdrawTaskCreditTx(taskKey: PublicKey, amount: number) {
		const task = await this.fetchTaskAccount(taskKey);
		return await this.program.methods
			.withdrawTaskCredit(new anchor.BN(amount))
			.accounts({
				authority: this.provider.publicKey,
				clockworkProgram: PayroundClient.CLOCKWORK_THREAD_PROGRAM_ID,
				payroundAccount: this.pubkey,
				task: task.pubkey,
				thread: task.thread,
				userId: this.userId
			})
			.rpc();
	}

	async updateTaskDetails(task: PublicKey, taskOptions: TaskOptions) {
		const taskAccount = await this.fetchTaskAccount(task);
		return await this.program.methods
			.updateTaskDetails(taskOptions)
			.accounts({
				authority: this.provider.publicKey,
				payroundAccount: this.pubkey,
				clockworkProgram: PayroundClient.CLOCKWORK_THREAD_PROGRAM_ID,
				task: taskAccount.pubkey,
				thread: taskAccount.thread,
				systemProgram: SystemProgram.programId,
				userId: this.userId
			})
			.rpc();
	}

	// todo: close account

	get usdcAddress() {
		return this.getUsdcAddressFor(this.pubkey);
	}

	get pubkey() {
		return this._pda(this.userId)[0];
	}

	get bump() {
		return this._pda(this.userId)[1];
	}

	async getThreadKey(taskkey: string) {
		const taskPublicKey = new PublicKey(taskkey)
		const task = await this.fetchTaskAccount(taskPublicKey)
		return task.thread.toBase58()
	}

	private _pda(userId: PublicKey) {
		return findProgramAddressSync(
			[userId.toBuffer(), Buffer.from(PayroundClient.PAYROUND_SEED)],
			this.program.programId
		);
	}

	static getUsdcAddress(mint: PublicKey, owner: PublicKey, allowPda?: boolean) {
		return getAssociatedTokenAddressSync(mint, owner, allowPda);
	}

	async getUsdcAccount(address: PublicKey) {
		return await getAccount(this.connection, address);
	}

	async getUsdcBalance(address: PublicKey) {
		const account = await this.getUsdcAccount(address);
		return Number(account.amount) / 10 ** 6;
	}

	getUsdcAddressFor(owner: PublicKey) {
		return PayroundClient.getTokenAddress(PayroundClient.MOCK_USDC_MINT, owner, true);
	}

	async fetchPayroundAccount(userId: PublicKey) {
		return await this.program.account.payroundAccount.fetch(this.pubkey);
	}

	async fetchTaskAccount(key: PublicKey) {
		return await this.program.account.task.fetch(key);
	}

	async fetchTaskGroupAccount(key: PublicKey) {
		return await this.program.account.taskGroup.fetch(key);
	}

	async fetchTaskListAccount(key: PublicKey) {
		return await this.program.account.tasklist.fetch(key);
	}

	async formatTxData ( limit?: number) {
		  return await this.formatTxDataFor(this.usdcAddress, limit)
	}
	
	async formatTxDataFor (address: PublicKey, limit?: number) {
		  const txData = await getTransactionsFilterByMint(address, this.connection, {limit});
			console.log('txData:', txData);

			return txData.map((tx) => {
				const preBal =
					tx.parsedTx!.meta!.preTokenBalances!.filter(
						(i) => i.owner == this.pubkey.toBase58()
					)[0].uiTokenAmount.uiAmount || 0;

				const postBal =
					tx.parsedTx!.meta!.postTokenBalances!.filter(
						(i) => i.owner == this.pubkey.toBase58()
					)[0].uiTokenAmount.uiAmount || 0;

				const out = preBal > postBal;

				const token = tx.parsedTx!.meta!.postTokenBalances!.filter(
					(i) => i.owner !== this.pubkey.toBase58()
				);

				const address = token.length == 0 ? '-' : token[0].owner;

				const amount = Math.abs(preBal - postBal);

				return {
					sig: tx.sigInfo.signature,
					timeStamp: tx.sigInfo.blockTime! * 1000,
					mint: tx.parsedTx!.meta!.preTokenBalances![0].mint,
					out,
					preBal,
					postBal,
					amount,
					address
				};
			});

	}
}
