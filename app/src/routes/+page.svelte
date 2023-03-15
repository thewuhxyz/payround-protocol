<script lang="ts">
	import { goto } from '$app/navigation';
	import { LightSwitch } from '@skeletonlabs/skeleton';
</script>

<LightSwitch />

<div class="flex justify-center  mx-12  mt-24">
	<div class="grid justify-center text-primary-500 mx-4 max-w-4xl  p-4">
		<div class="text-6xl flex items-center ">Payround</div>
		<div class="text-6xl text-secondary-500 ">
			Send. Receive. Automate Payment with Payround
			<div class="text-lg py-4 text-primary-500 tracking-widest">
				Powered by Solana. Stripe. Circle.
			</div>
		</div>
	</div>
	<div class="mx-4">
		<div
			class=" px-8 max-w-lg mx-4 text-white my-10 rounded-3xl bg-primary-500 grid justify-center"
		>
			<form class="form" action="?/login" method="POST">
				<div class="text-center text-3xl mt-5 py-3">Sign in with email 👔</div>
				<input
					class="my-2 px-6 input bg-white text-secondary-500 placeholder:text-secondary-200"
					placeholder="someone@example.com"
					name="email"
					type="email"
				/>
				<!-- <input
					class=" my-2 px-6 input bg-white text-secondary-500 placeholder:text-secondary-200"
					placeholder="password"
					name="password"
					type="password"
				/> -->
			
				<button class="bg-secondary-500 w-full rounded-3xl p-2 my-2 btn" type="submit"
					>SIGN IN</button
				>
			</form>
			<div class="my-2 border-t-2 border-dashed" />
			<div class="mb-8">
				<div class="text-center text-3xl py-3">Welcome Degen 🥷</div>
				<button class="bg-secondary-500 w-full rounded-3xl p-4 my-2 btn" on:click={() => {goto("/w3/")}} type="submit"
					>LAUNCH APP</button
				>
			</div>
		</div>
	</div>
</div>
