import { writable } from 'svelte/store';
import { LAMPORTS_PER_SOL, type PublicKey, type Connection } from '@solana/web3.js';

type BalanceStore = {
	balance: number;
};

function createBalanceStore() {
	const { subscribe, set } = writable<BalanceStore>({ balance: 0 });

	return {
		subscribe,
		getUserUSDCBalance: async (publicKey: PublicKey, connection: Connection) => {

			let balance = 0;

			try {

				balance = (await connection.getTokenAccountBalance(publicKey, 'confirmed')).value.uiAmount || 0;
				balance = balance / LAMPORTS_PER_SOL;
				set({ balance });

			} catch (e) {

				console.log(`error getting balance: `, e);

			}
		}
	};
}

export const balanceStore = createBalanceStore();
