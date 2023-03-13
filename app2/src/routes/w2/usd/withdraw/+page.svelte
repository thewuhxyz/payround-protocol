<script lang="ts">
	import type { PageData } from './$types';
	// @ts-ignore
	import CreditCard from 'svelte-interactive-creditcard';
	//https://github.com/MelihAltintas/svelte-credit-card
	export let data: PageData;
	let creditCard;

	$: externalAccounts = data.externalAccounts!;
</script>

<form
	action="?/withdraw"
	method="post"
	class="border-2 rounded-3xl border-solid text-tertiary-400 border-primary-500 max-w-xl p-4 mx-auto my-24"
>
	<div class="justify-center text-3xl text-center ">Withdraw</div>
	<div class="grid grid-cols-1 py-2">
		<label class="flex  items-end  text-3xl mx-2" for="amount"
			>Amount

			<input class="w-sm input mx-2" name="amount" type="number" />
		</label>
		<label class="flex  items-end  text-3xl  m-2" for="card"
			>To
			<select class="select mx-2" name="card">
				<option value="" selected disabled hidden>--- select ---</option>

				{#each externalAccounts as externalAccount}
					<option id={externalAccount.id} value={externalAccount.id}>
						**** **** **** ****{externalAccount.last4}
					</option>
				{/each}
			</select>
		</label>
	</div>
	<div class="flex justify-center">
		<button
			class="border-2 rounded-3xl border-solid border-primary-500 my-4 px-8 text-3xl"
			type="submit">Send</button
		>
	</div>
</form>
