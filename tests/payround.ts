import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { fetchDegenAccount, fetchTokenAccount, getAta, getPda, keys, program, usdcTransfer } from "./utils";
import { SystemProgram } from "@solana/web3.js";


describe("payround", () => {
	// Configure the client to use the local cluster.

	const { manager, degen, usdcMint } = keys;

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

  it("can transfer to an account", async () => {
		const degenAccount = await fetchDegenAccount(getPda().degenAcctKey);
		console.log("degen account", degenAccount.authority.toBase58());

		const tx = await usdcTransfer("degenAcctAta", 1);
		console.log('tx:', tx);

		const tokenBalance = await fetchTokenAccount(
			getAta().degenAcctAta
		);
		console.log("balance:", tokenBalance.amount.toString());
	});
});
