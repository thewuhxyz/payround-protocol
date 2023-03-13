<script lang="ts">
	import type { PageData } from './$types';
	// @ts-ignore
	import CreditCard from 'svelte-interactive-creditcard';
	//https://github.com/MelihAltintas/svelte-credit-card
  export let data: PageData;
	let creditCard;

  let externalAccounts = data.externalAccounts!
	// let investor = 'Card';
	let cardNumber = '';
	let expDate = '';
	let cardHolder = '';
	let cvv = '';

	// export let data: PageData;
	// $: stripeCardPayment = data.stripeCardPayment;
</script>

<div class="grid justify-center mt-20 ">
	<a href="/w2/usd"><button> Back to USD </button> </a>
	<div class="p-2 text-center text-secondary-500 text-3xl">Add Card</div>
	<form
		class="form grid my-10 grid-cols-2 p-5 border-2 border-solid rounded-3xl border-primary-500"
		action="?/addcard"
    method="post"
	>
		<div class="mx-5">
			<CreditCard
				investor="card"
				{cardNumber}
				{expDate}
				{cardHolder}
				{cvv}
				bind:this={creditCard}
				width="400px"
			/>
		</div>

		<div class="mx-5 text-2xl">
			<div>
				<label class="my-2" for="number"
					>Card Number

					<input
						class="input m-2 ml-2 w-72 px-4"
						bind:value={cardNumber}
						name="number"
						id="number"
						maxlength="16"
					/>
				</label>
			</div>
			<div class="">
				<label class="my-2" for="name"
					>Name

					<input class="input ml-2 max-w-xs px-2" bind:value={cardHolder} name="name" id="name" />
				</label>
			</div>
			<div class="grid grid-cols-2 p-2">
				<div>
					<label class="my-2" for="cvv"
						>CVV
						<input
							class="input mx-1 w-20 px-4"
							bind:value={cvv}
							name="cvv"
							id="cvv"
							maxlength="3"
						/>
					</label>
				</div>
				<div class="">
					<label class="my-2" for="expiry"
						>Exp.
						<input
							class="input mx-1 mt-1 w-24 px-4"
							bind:value={expDate}
							name="expiry"
							id="expiry"
							maxlength="4"
						/>
					</label>
				</div>
			</div>
			<button
				class="btn w-full border-2 border-solid rounded-3xl border-primary-500 text-secondary-500 text-center"
				type="submit">Add Card</button
			>
		</div>
	</form>
  <div>
    {#each externalAccounts as externalAccount}
      <div id={externalAccount.id} >
        **** **** **** ****{externalAccount.last4}
      </div> 
    {/each}
  </div>

</div>
