<script lang="ts">
	import { payroundClientStore } from '$lib/stores/payroundClientStore';
	import { PublicKey } from '@solana/web3.js';
	import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ connected } = $walletStore);
	$: payroundClient = $payroundClientStore;

	const addressBook = data.addresses;
	$: addressBook;

	let show = '';
	$: show;

	let sendto = 'payround';
	$: sendto;

	let recipient = '';
	$: recipient;

	let name = '';
	$: name;

	let amount = 0;
	$: amount;

	let group = '';
	$: group;

	let email = '';
	let dayofweek: string;
	let dayofmonth: string;
	let timeOfDay: string;

	$: {
		dayofmonth, dayofweek, timeOfDay;
	}

	const send = async () => {
		// const supabase = locals.supabase;
		// const session = await locals.getSession();
		// const payroundAdmin = locals.payroundAdmin;

		// const formData = Object.fromEntries(await request.formData());
		// console.log('task data:', formData);
		name;
		recipient;
		const uiAmount = amount;
		const groupId = group;

		let schedule = '';
		let address;

		if (sendto == 'payround') {
			console.log('here:');

			const resp = await fetch('/w3/api/task/address', {
				method: 'POST',
				body: JSON.stringify({ address: recipient })
			});
			const respData = await resp.json();
			console.log('respdata:', respData);
			address = respData.address as string;
		} else {
			address = recipient;
		}

		console.log('address here:', address);

	
		try {
			const taskKey = await payroundClient.makeTransferTx(new PublicKey(address), Number(uiAmount));

			console.log('task created successfully. task key:', taskKey);

			// console.log('result:', result);
		} catch (e) {
			console.log('error:', e);
		}
	};
	

</script>

<form
	class="border-2 rounded-3xl border-solid text-tertiary-400 border-primary-500 max-w-xl p-4 mx-auto my-24"
	on:submit|preventDefault={send}
>
	<div class="justify-center text-3xl text-center ">Send Payment</div>
	<div class="">
		<label class="flex items-end  text-3xl mx-2" for="sendto">Send to</label>
		<select class="select" bind:value={sendto} name="sendto">
			<option selected value="payround">Payround Account</option>
			<option value="address">Address</option>
		</select>
	
		<div class={`grid-cols-1 grid py-2 ${sendto == 'address' ? '' : 'hidden'}`}>
			<label class="flex items-end  text-3xl mx-2" for="recipient">Recipient</label>
			<input
				class="w-sm input"
				name="recipient"
				bind:value={recipient}
				type="text"
			/>
			<select
				class="select"
				name="address"
				bind:value={recipient}
				
			>
				<option id="address-default" value="" selected>--- address book ---</option>
				{#if addressBook}
					{#each addressBook as address}
						<option id={address.address} value={address.address}>{address.name}</option>
					{/each}
				{/if}
			</select>
		</div>
    <div class={` text-3xl py-2 ${sendto == 'payround' ? '' : 'hidden'}`} >
      <label for="">Email</label>
      <input class='input' placeholder="someone@example.com" bind:value={email} name="recipient" type="text">
    </div>
	</div>

	<div class="grid grid-cols-1 py-2">
		<label class="flex  items-end  text-3xl mx-2" for="amount">Amount</label>
		<input class="w-sm input" bind:value={amount} name="amount" type="text" />
	</div>
	<div class="flex justify-center">
		<button
			class="border-2 rounded-3xl border-solid border-primary-500 my-4 px-8 text-3xl"
			type="submit">Send</button
		>
	</div>
</form>
