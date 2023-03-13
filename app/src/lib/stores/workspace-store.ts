import { writable } from 'svelte/store';
import type { Program, Provider, web3 } from '@project-serum/anchor';
import type { Connection, Keypair } from '@solana/web3.js';

// export type WorkSpace = {
//   connection: Connection;
//   provider?: Provider;
//   network: string;
// };

export const workspaceStore = writable<Provider>(undefined);
