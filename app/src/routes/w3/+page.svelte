<script lang="ts">
	import { PayroundClient } from '$lib/payround/protocol';
	import { payroundClientStore } from '$lib/stores/payroundClientStore';
	import { AnchorProvider } from '@project-serum/anchor';
	import { publicKey } from '@project-serum/anchor/dist/cjs/utils';
	import { clusterApiUrl, Connection } from '@solana/web3.js';
	import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ connected } = $walletStore);
	$: ({ sendTransaction, signTransaction, signAllTransactions, signMessage } = $walletStore);

	$: isAccountCreated = connected && data.isAccountCreated;
	$: publickey = connected && $payroundClientStore.pubkey.toBase58();

  let createAccount = async () => {
    const tx = await $payroundClientStore.createAccountTx("some account 1")
    console.log("tx:", tx)
  }
  // $: createAccount = $payroundClientStore.createAccountTx("account 1")
</script>

<div>
	{#if publickey}
		{publickey}
	{/if}

	<div>
		{isAccountCreated}
	</div>

	<div>
		{#if !isAccountCreated}
			<div>Account Not Created</div>
			<button class="bg-red-500" type="submit" on:click={createAccount} >Create account</button>
		{:else}
			Account Created
		{/if}
		{#if isAccountCreated}
			some
		{/if}
	</div>
	some
</div>
