import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Payround } from "../target/types/payround";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";
import {
	Account,
	createMint,
	getAccount,
	getAssociatedTokenAddress,
	getAssociatedTokenAddressSync,
	getOrCreateAssociatedTokenAccount,
	mintToChecked,
	transfer,
	transferChecked,
} from "@solana/spl-token";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import Manager from "./keypair/manager";
import key2 from "./keypair/degen";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { SEED_THREAD } from "@clockwork-xyz/sdk";

const adminpair = Uint8Array.from(JSON.parse(fs.readFileSync("/Users/thewuh/.config/solana/payround_admin.json", "utf-8")))

const degenpair = Uint8Array.from(key2);
const managerpair = Uint8Array.from(Manager);


const usdcMint = new PublicKey("48JBvpStoDYJmQBFuENcCm6dBomPC2z9r4SfJJa9ui9H");

const degen = Keypair.fromSecretKey(degenpair);
const manager = Keypair.fromSecretKey(managerpair);
const admin = Keypair.fromSecretKey(adminpair);

export const clockworkProgram = new PublicKey(
	"CLoCKyJ6DXBJqqu2VWx9RLbgnwwR6BMHHuyasVmfMzBh"
);

export const keys = { manager, degen, usdcMint, admin, clockworkProgram };

export const connection = new Connection("https://api.devnet.solana.com/", {commitment: "singleGossip", });
export const provider = new anchor.AnchorProvider(
	connection,
	new anchor.Wallet(admin),
	{}
);
anchor.setProvider(provider);

export const program = anchor.workspace.Payround as Program<Payround>;

export const fetchPayroundAccount = async (key: PublicKey) => {
	return await program.account.payroundAccount.fetch(key);
};

export const fetchTaskAccount = async (key: PublicKey) => {
	return await program.account.task.fetch(key);
};

export const fetchTaskGroupAccount = async (key: PublicKey) => {
	return await program.account.taskGroup.fetch(key);
};

export const fetchTaskListAccount = async (key: PublicKey) => {
	return await program.account.tasklist.fetch(key);
};

export const fetchTokenAccount = async (address: PublicKey) => {
	return await getAccount(connection, address);
};

export const createUsdcMint = async () => {
	return await createMint(
		connection,
		manager,
		manager.publicKey,
		manager.publicKey,
		6
	);
};



export const sleep = (sec: number) => new Promise((resolve) => setTimeout(resolve, sec * 1000));

export const usdcMinter = async (mint: PublicKey = usdcMint) => {
	try {
		const managerAta = await getOrCreateAssociatedTokenAccount(
			connection,
			manager,
			mint,
			manager.publicKey
		);
		const degenAta = await getOrCreateAssociatedTokenAccount(
			connection,
			manager,
			mint,
			degen.publicKey
		);

		const tx = await mintToChecked(
			connection,
			manager,
			mint,
			managerAta.address,
			manager,
			1_000_000_000_000,
			6
		);
		console.log("tx:", tx);

		const tx2 = await mintToChecked(
			connection,
			degen,
			mint,
			degenAta.address,
			manager,
			1_000_000,
			6
		);
		console.log("tx2:", tx2);

		return { tx, tx2 };
	} catch (e) {
		return e;
	}
};

export const getPda = (userId: PublicKey) => {
	return findProgramAddressSync(
		[userId.toBuffer(), Buffer.from("payround")],
		program.programId
	);
};

export const solanaExploerer = (tx: string) => {
	console.log(
		`tx: https://solscan.io/tx/${tx}?cluster=devnet`
	);
}

export const clockworkExploerer = (thread: PublicKey) => {
	console.log(
		`tx: https://explorer.clockwork.xyz/address/${thread.toBase58()}?network=devnet`
	);
}

class UsdcManager {
	static decimals: number = 6;
	static authority: Keypair = manager;
	// static mint: PublicKey | null = null;

	owner: Keypair;
	mint: PublicKey;

	constructor(mint: PublicKey, owner: Keypair) {
		this.owner = owner;
		this.mint = mint
	}

	static async createusdcMint() {
		return await createMint(
			connection,
			this.authority,
			this.authority.publicKey,
			this.authority.publicKey,
			this.decimals
		);
	}

	static getUsdcAddress(mint: PublicKey, owner: PublicKey, allowPda?: boolean) {
		return getAssociatedTokenAddressSync(mint, owner, allowPda);
	}

	static async getUsdcAccount(address: PublicKey) {
		return await getAccount(connection, address);
	}

	static async getUsdcBalance(address: PublicKey) {
		const account = await this.getUsdcAccount(address);
		return Number(account.amount)/10**6;
	}

	private static async _airdrop(
		mint: PublicKey,
		owner: Keypair,
		ownerUsdcAddress: PublicKey,
		uiAmount: number
	) {
		return await mintToChecked(
			connection,
			owner,
			mint,
			ownerUsdcAddress,
			this.authority,
			uiAmount * 10**this.decimals,
			this.decimals
		);
	}

	get usdcAddress() {
		return UsdcManager.getUsdcAddress(this.mint, this.owner.publicKey);
	}

	async createAccount() {
		return await getOrCreateAssociatedTokenAccount(
			connection,
			UsdcManager.authority,
			this.mint,
			this.owner.publicKey,
		);
	}
	async fetchUsdcBalance() {
		return await UsdcManager.getUsdcBalance(this.usdcAddress)
	}

	async airdrop(uiAmount: number) {
		return await UsdcManager._airdrop(this.mint, this.owner, this.usdcAddress, uiAmount);
	}

	async transferUsdc(to: PublicKey, uiAmount: number) {
		return await transfer(
			connection,
			this.owner,
			this.usdcAddress,
			to,
			this.owner,
			uiAmount * 10 ** UsdcManager.decimals
		);
	}
}




export class PayroundAccount {
	authority: Keypair;
	usdcManager: UsdcManager;
	id: PublicKey
	// email: boolean
	mint: PublicKey;

	constructor(keypair: Keypair, mint: PublicKey, id?: PublicKey) {
		this.authority = keypair;
		this.mint = mint;
		this.id = id ? id : this.authority.publicKey
		// this.email = id ? true : false
		this.usdcManager = new UsdcManager(this.mint, this.authority);
	}

	async load() {
		// await UsdcManager.load();
		await this.usdcManager.createAccount()
	}

	get pubkey() {
		return findProgramAddressSync(
			[this.id.toBuffer(), Buffer.from("payround")],
			program.programId
		)[0];
	}

	get bump() {
		return findProgramAddressSync(
			[this.id.toBuffer(), Buffer.from("payround")],
			program.programId
		)[1];
	}

	threadKey (taskKey: PublicKey) {
		return findProgramAddressSync(
			[Buffer.from(SEED_THREAD), taskKey.toBuffer(), Buffer.from(taskKey.toBase58().slice(0,10))],
			clockworkProgram
		)[0]
	}

	async transferUsdcToSelf (amount: number) {
		return await this.usdcManager.transferUsdc(this.usdcAddress, amount)
	}

	get usdcAddress() {
		return UsdcManager.getUsdcAddress(this.mint, this.pubkey, true);
	}

	async getBalance() {
		return await UsdcManager.getUsdcBalance(this.usdcAddress);
	}

	fetchPayroundAccount = async () => {
		return await program.account.payroundAccount.fetch(this.pubkey);
	};

	fetchTaskAccount = async (key: PublicKey) => {
		return await program.account.task.fetch(key);
	};

	fetchTaskGroupAccount = async (key: PublicKey) => {
		return await program.account.taskGroup.fetch(key);
	};

	fetchTaskListAccount = async (key: PublicKey) => {
		return await program.account.tasklist.fetch(key);
	};
}

