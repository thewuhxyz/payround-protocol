// import { PayroundClient } from '$lib/payround/protocol';
import  type { Provider } from '@project-serum/anchor';
// import { clusterApiUrl, Connection } from '@solana/web3.js';
// import type { WalletStore } from '@svelte-on-solana/wallet-adapter-core';
import { writable } from 'svelte/store';
import type { Commitment, ConnectionConfig } from '@solana/web3.js';

export const providerStore = writable<Provider>(undefined);

// import { payroundClientStore } from './payroundClientStore';

// const network = clusterApiUrl('devnet');

// export const providerStore = writable<Provider>(undefined);

// export function fetchClientFromWalletStore(walletStore: WalletStore, netwk: string = network) {
//   let config: Commitment | ConnectionConfig | undefined = 'processed';

// 	// const { PublicKey } = web3;
// 	// const programID = new PublicKey(idl.metadata.address);
// 	const connection = new Connection(network, config);
// 	let { sendTransaction, signTransaction, signAllTransactions, signMessage, publicKey } =
// 		walletStore;

// 	const providerWallet = {
// 		sendTransaction,
// 		signTransaction,
// 		signAllTransactions,
// 		signMessage,
// 		publicKey
// 	};

// 	// FIXME Types mismatch on 'signTransaction' property
// 	// @ts-ignore
// 	const provider = new AnchorProvider(connection, providerWallet, {
// 		preflightCommitment: 'processed'
// 	} as web3.ConfirmOptions);

// 	return new PayroundClient(provider, netwk);
// }