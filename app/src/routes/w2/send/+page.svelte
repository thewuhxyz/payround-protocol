<script lang="ts">
	import { DateInput } from 'date-picker-svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const addressBook = data.addresses;
	$: addressBook;

	let show = 'payround';
	$: show;

	let recipient = '';
	$: recipient;

	

</script>

<form
	class="border-2 rounded-3xl border-solid text-tertiary-400 border-primary-500 max-w-xl p-4 mx-auto my-24"
	action="?/send"
	method="post"
>
	<div class="justify-center text-3xl text-center ">Send Payment</div>
	<div class="">
		<label class="flex items-end  text-3xl mx-2" for="sendto">Send to</label>
		<select class="select" bind:value={show} name="sendto">
			<option selected value="payround">Payround Account</option>
			<option value="address">Address</option>
		</select>
	
		<div class={`grid-cols-1 grid py-2 ${show == 'address' ? '' : 'hidden'}`}>
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
    <div class={` text-3xl py-2 ${show == 'payround' ? '' : 'hidden'}`} >
      <label for="">Email</label>
      <input class='input' placeholder="someone@example.com" name="recipient" type="text">
    </div>
	</div>

	<div class="grid grid-cols-1 py-2">
		<label class="flex  items-end  text-3xl mx-2" for="amount">Amount</label>
		<input class="w-sm input" name="amount" type="text" />
	</div>
	<div class="flex justify-center">
		<button
			class="border-2 rounded-3xl border-solid border-primary-500 my-4 px-8 text-3xl"
			type="submit">Send</button
		>
	</div>
</form>
