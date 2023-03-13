<script lang="ts">
	import type { PageData } from './$types';
	// @ts-ignore
	import CreditCard from 'svelte-interactive-creditcard';
	import { goto } from '$app/navigation';
	//https://github.com/MelihAltintas/svelte-credit-card
	let creditCard;

	// let investor = 'Card';
	let cardNumber = '';
	let expDate = '';
	let cardHolder = '';
	let cvv = '';

	export let data: PageData;
	$: stripeCardPayment = data.stripeCardPayment;
</script>

	{#if stripeCardPayment}

  <div class="text-center p-4 text-3xl ">USD</div>
  <div class="grid grid-cols-1 justify-items-center">

      <a
      href="/w2/usd/addcard"
      class="max-w-lg my-5 p-5 btn w-full border-2 border-solid rounded-3xl border-primary-500 text-secondary-500 text-center"
      >Cards
    </a>
      <a
      href="/w2/usd/deposit"
      class="max-w-lg my-5 p-5 btn w-full border-2 border-solid rounded-3xl border-primary-500 text-secondary-500 text-center"
      >Deposit
    </a>
      <a
      href="/w2/usd/withdraw"
      class="max-w-lg my-5 p-5 btn w-full border-2 border-solid rounded-3xl border-primary-500 text-secondary-500 text-center"
      >Withdraw
    </a>
   
   
  </div>
	{:else}
		<form action="?/setupusd" method="post" class="form m-3">
			<button type="submit" class="btn p-3 bg-red-400 rounded-3xl text-white"
				>Set up account to receive payment</button
			>
		</form>
	{/if}
