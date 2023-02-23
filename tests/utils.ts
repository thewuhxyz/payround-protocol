import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Payround } from "../target/types/payround";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";
import {
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
import Manager from "./keypair/manager"
import Degen from "./keypair/degen"

const degenpair = Uint8Array.from(Degen);
const managerpair = Uint8Array.from(Manager);

const usdcMint = new PublicKey("9Q2fjLy6UpyW2NjFsvptZE1ADFAEzxSVTLyk7wEH8Zo8");

const degen = Keypair.fromSecretKey(degenpair);
const manager = Keypair.fromSecretKey(managerpair);

export const keys = { manager, degen, usdcMint };

export const connection = new Connection("https://api.devnet.solana.com/");
export const provider = new anchor.AnchorProvider(
	connection,
	new anchor.Wallet(manager),
	{}
);
anchor.setProvider(provider);


export const program = anchor.workspace.Payround as Program<Payround>;

export const fetchEmailAccount = async (key: PublicKey) => {
	return await program.account.emailAccount.fetch(key);
};

export const fetchDegenAccount = async (key: PublicKey) => {
	return await program.account.degenAccount.fetch(key);
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

export const getAta = (mint: PublicKey = usdcMint, user_id: string = "1") => {
	const managerAta = getAssociatedTokenAddressSync(mint, manager.publicKey);
	const degenAta = getAssociatedTokenAddressSync(mint, degen.publicKey);

	const { emailKey, degenAcctKey } = getPda(user_id);

	const emailAta = getAssociatedTokenAddressSync(mint, emailKey, true);
	const degenAcctAta = getAssociatedTokenAddressSync(mint, degenAcctKey, true);

	return {
		managerAta,
		degenAta,
		emailAta,
		degenAcctAta,
	};
};

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



export const usdcTransfer = async (to: "managerAta" | "degenAta" | "emailAta" | "degenAcctAta", uiAmount: number, mint: PublicKey = usdcMint) => {
  return await transfer (
    connection,
    manager,
    getAta(mint).managerAta,
    getAta(mint)[to],
    manager,
    uiAmount * 10**6
  )
}

// export const vaultName = Keypair.generate().publicKey.toString().slice(0, 7);

export const getPda = (userId: string = "1") => {
	let [emailKey] = findProgramAddressSync(
		[Buffer.from(userId), Buffer.from("email")],
		program.programId
	);

	let [degenAcctKey] = findProgramAddressSync(
		[degen.publicKey.toBuffer(), Buffer.from("degen")],
		program.programId
	);

	return {
		emailKey,
		degenAcctKey,
	};
};
