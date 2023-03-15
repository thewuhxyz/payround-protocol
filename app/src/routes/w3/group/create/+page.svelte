<script lang="ts">
	import { PayroundClient } from '$lib/payround/protocol';
	import { payroundClientStore } from '$lib/stores/payroundClientStore';
	import { AnchorProvider } from '@project-serum/anchor';
	import { publicKey } from '@project-serum/anchor/dist/cjs/utils';
	import { clusterApiUrl, Connection } from '@solana/web3.js';
	import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
	import type { PageData } from './$types';

	// export let data: PageData;

	$: ({ connected } = $walletStore);
	$: ({ sendTransaction, signTransaction, signAllTransactions, signMessage } = $walletStore);

	
	$: publickey = connected && $payroundClientStore.userId.toBase58()

	

</script>

<form
	class="border-2 rounded-3xl border-solid text-tertiary-400 border-primary-500 max-w-xl p-4 mx-auto my-24"
	action="?/creategroup"
	method="post"
>

	<div class="justify-center text-3xl text-center ">Create New Group</div>
	<div class="grid-cols-1 grid py-2">
		<label class="flex items-end  text-3xl mx-2" for="name">Name</label>
		<input class="w-sm input" name="name" type="text" />
	</div>
	<div class="grid-cols-1 grid py-2">
		<label class="flex items-end  text-3xl mx-2" for="desc">Desc</label>
		<textarea class="w-sm textarea" name="desc" />
	</div>
	<input bind:value={publickey} class="invisible" name="address" type="text">
	<div class="flex justify-center">
		<button
			class="border-2 rounded-3xl border-solid border-primary-500 my-4 px-8 text-3xl"
			type="submit">Create Group</button
		>
	</div>
</form>
