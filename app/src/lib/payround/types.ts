import type * as anchor from '@project-serum/anchor';
import type { PublicKey } from '@solana/web3.js';

export type ScheduleOptions = {
	freq: string;
	skippable: boolean;
};

export type TaskOptions = {
	amount: anchor.BN | null;
	scheduleOptions: ClockworkTrigger | null;
};

// // clockwork trigger I am interested in
export interface ClockworkTrigger {
	cron?: { schedule: string; skippable: boolean };
	epoch?: { epoch: anchor.BN };
	now?: {};
	slot?: { slot: anchor.BN };
	account?: { address: PublicKey; offset: anchor.BN; size: anchor.BN };
}

export type TaskStatus = { notstarted: {} } | { started: {} } | { paused: {} } | { ended: {} };

// export interface TaskStatus {
// 	notstarted?: {}
// 	started?: {}
// 	paused?: {}
// 	ended?: {}
// }
