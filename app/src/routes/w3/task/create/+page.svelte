<script lang="ts">
	import { payroundClientStore } from '$lib/stores/payroundClientStore';
	import { PublicKey } from '@solana/web3.js';
	import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
	import type { PageData } from './$types';

	export let data: PageData;
	const groups = data.groups;
	const addressBook = data.addresses;
	$: groups;
	$: addressBook;

	$: ({ connected } = $walletStore);
	$: payroundClient = $payroundClientStore;

	const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);
	const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
	const time = Array.from({ length: 24 }, (_, i) => i);

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

	const createTask = async () => {
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

		if (show == 'week') {
			if (dayofweek == 'all') {
				schedule = `0 0 ${timeOfDay} * * *`;
			} else {
				schedule = `0 0 ${timeOfDay} * * ${dayofweek}`;
			}
		}

		if (show == 'month') {
			if (dayofweek == 'all') {
				schedule = `0 0 ${timeOfDay} * * *`;
			} else {
				schedule = `0 0 ${timeOfDay} ${dayofmonth} * *`;
			}
		}

		console.log('schedule:', schedule);

		try {
			const taskKey = await payroundClient.createTaskTx(new PublicKey(address), Number(uiAmount), {
				cron: { schedule, skippable: false }
			});

			console.log('task created successfully. task key:', taskKey);

			const tx = await payroundClient.startTaskTx(new PublicKey(taskKey), 0.005);
			console.log('tx:', tx);

			const threadKey = await payroundClient.getThreadKey(taskKey);

			const req = await fetch('/w3/api/task/create', {
				method: 'POST',
				body: JSON.stringify({
					taskKey,
					name,
					amount,
					schedule,
					recipient,
					groupId,
					threadKey,
					address: payroundClient.userId.toBase58()
				})
			});

			const some = await req.json()
			console.log("some:", some);
			

			// console.log('result:', result);
		} catch (e) {
			console.log('error:', e);
		}
	};
</script>

<form
	class="border-2 rounded-3xl border-solid text-tertiary-400 border-primary-500 max-w-xl p-4 mx-auto my-24"
	on:submit|preventDefault={createTask}
>
	<div class="justify-center text-3xl text-center ">Create New Task</div>
	<div class="grid-cols-1 grid py-2">
		<label class="flex items-end  text-3xl mx-2" for="name">Task Name</label>
		<input class="w-sm input" name="name" bind:value={name} type="text" />
	</div>
	<label class="flex items-end  text-3xl mx-2" for="sendto">Send to</label>
	<select class="select" bind:value={sendto} name="sendto">
		<option selected value="payround">Payround Account</option>
		<option value="address">Address</option>
	</select>
	<div class={`grid-cols-1 grid py-2 ${sendto == 'address' ? '' : 'hidden'}`}>
		<label class="flex items-end  text-3xl mx-2" for="recipient">Recipient</label>
		<input class="w-sm input" name="recipient" bind:value={recipient} type="text" />
		<select class="select" name="address" bind:value={recipient}>
			<option id="address-default" value="" selected>--- address book ---</option>
			{#if addressBook}
				{#each addressBook as address}
					<option id={address.address} value={address.address}>{address.name}</option>
				{/each}
			{/if}
		</select>
	</div>
	<div class={` text-3xl py-2 ${sendto == 'payround' ? '' : 'hidden'}`}>
		<label for="">Email</label>
		<input class="input" bind:value={email} placeholder="someone@example.com" name="recipient" type="text" />
	</div>
	<div class="grid grid-cols-1 py-2">
		<label class="flex  items-end  text-3xl mx-2" for="amount">Amount</label>
		<input class="w-sm input" bind:value={amount} name="amount" type="text" />
	</div>
	<div class=" py-2">
		<label class="flex items-end  text-3xl mx-2" for="schedule">every</label>
		<select class="select" bind:value={show} name="every">
			<option value="" selected disabled hidden>--- select ---</option>
			<option value="week">week</option>
			<option value="month">month</option>
		</select>
		<label class={`flex items-end  text-3xl mx-2 ${show == '' ? 'hidden' : ''}`} for="schedule"
			>on</label
		>
		<select class={`select ${show == 'week' ? '' : 'hidden'}`} bind:value={dayofweek} name="dayofweek">
			<option value="" selected disabled hidden>--- days ---</option>
			<option value="all">Everyday</option>
			{#each daysOfWeek as day}
				<option value={day}>{day}</option>
			{/each}
		</select>
		<select bind:value={dayofmonth} class={`select ${show == 'month' ? '' : 'hidden'}`} name="dayofmonth">
			<option value="" selected disabled hidden>--- days ---</option>
			<option value="all">Everyday</option>
			{#each daysOfMonth as day}
				<option value={day} >{day}</option>
			{/each}
		</select>
		<label class={`flex items-end  text-3xl mx-2 `} for="schedule">at</label>
		<select class={`select `} bind:value={timeOfDay} name="timeOfDay">
			<option value="" selected disabled hidden>--- time of day ---</option>
			{#each time as t}
				<option  value={t}
					>{t < 10 ? `0${t}` : t}:00 {t / 12 > 1
						? `(${t % 12 == 0 ? 12 : t % 12} pm)`
						: `(${t % 12 == 0 ? 12 : t % 12} am)`} UTC</option
				>
			{/each}
		</select>
	</div>
	<div class="grid-cols-1 grid py-2">
		<label class="flex items-end  text-3xl mx-2" for="group">Group</label>
		<!-- <input class="w-sm input" name="group" type="text" /> -->
		<select class="select" name="group">
			<option value="">--- select ---</option>
			{#if groups}
				{#each groups as group}
					<option id={group.id} value={group.id}>{group.name}</option>
				{/each}
			{/if}
		</select>
	</div>
	<div class="flex justify-center">
		<button
			class="border-2 rounded-3xl border-solid border-primary-500 my-4 px-8 text-3xl"
			type="submit">Create Task</button
		>
	</div>
</form>
