import { PayroundClient } from "$lib/payround/protocol";
import * as anchor from "@project-serum/anchor"
import {PAYROUND_ADMIN_KEYPAIR} from "$env/static/private"
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "processed")

const payroundAdminKeypair = Keypair.fromSecretKey(Uint8Array.from(bs58.decode(PAYROUND_ADMIN_KEYPAIR)))

const payroundAdminProvider = new anchor.AnchorProvider(connection, new anchor.Wallet(payroundAdminKeypair), {})

export const payroundAdmin = (userId?: string)  => PayroundClient.connect(payroundAdminProvider, "", userId)
