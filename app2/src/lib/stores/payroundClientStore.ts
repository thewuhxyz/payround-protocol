import type { PayroundClient } from '$lib/payround/protocol';
import { writable } from 'svelte/store';

export const payroundClientStore = writable<PayroundClient>(undefined);
