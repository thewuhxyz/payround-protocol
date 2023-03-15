<script lang="ts">
	import { goto } from '$app/navigation';
	import { modalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
  import parser from "cron-parser"
	import { formatEpoch, truncate } from '$lib/helpers';

	export let data: PageData;

	const task = data.task!;

	$: task

	$: console.log("task:", task)

  // const nextRun = parser.parseExpression(task.schedule).next().toString()

  // $: nextRun

	let paused = false;

	$: paused;

	$: task;

	const deleteTask = () => {
		fetch(`/w3/task/${task.task_key}/deletetask`, {
			method: 'POST'
		});
	};
	
  function deleteTaskConfirm(): void {
		const confirm: ModalSettings = {
			type: 'confirm',
			title: 'Delete Task?',
			body: 'Are you sure you wish to delete task?',
			response: deleteTask,
			buttonTextCancel: 'Cancel',
			buttonTextConfirm: 'Delete Task'
		};
		modalStore.trigger(confirm);
	}
</script>

<div class="mt-12 p-4">
	<div class="text-3xl text-center underline px-10">
		{task.name} - {task.task_key}
	</div>
	<alert data-popup="examplePopup"> div </alert>
	<div class="table-container p-5">
		<table class="table table-hover">
			<tbody>
				<tr class="table-row">
					<th class="">Name:</th>
					<td class="">{task.name}</td>
				</tr>
				<tr>
					<th>Address:</th>
					<td>{task.task_key}</td>
				</tr>
				<tr>
					<th>Recipient:</th>
					<td>{task.recipient}</td>
				</tr>
				<tr>
					<th>Amount:</th>
					<td>{task.amount}</td>
				</tr>
				<tr>
					<th>Schedule:</th>
					<td>{task.cron ? task.schedule : "Once"}</td>
				</tr>
				<tr>
					<th>Status:</th>
					<td>{task.decodedStatus}</td>
				</tr>
				<tr>
					<th>Next Run:</th>
					<td>{formatEpoch(task.nextRun)}</td>
				</tr>
				<tr>
					<th>Group:</th>
					<td>{task.task_group}</td>
				</tr>
				<tr>
					<th>Task Credit:</th>
					<td>{task.threadBalance}</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div class="grid grid-cols-3">
		<div>
			<button
				formaction={paused ? '?/resume' : '?/pause'}
				class="btn w-64 py-4 mx-24  text-xl text-secondary-500 border-solid border-2 rounded-full border-primary-500"
			>
				Start / Stop
			</button>
		</div>

		<button
			class="btn w-64 py-4 mx-24  text-xl text-secondary-500 border-solid border-2 rounded-full border-primary-500"
      on:click={() => goto(`/w2/task/${task.task_key}/edit`)}
      disabled
		>
			Edit
		</button>
		<button
			class="btn w-64 py-4 mx-24  text-xl text-secondary-500 border-solid border-2 rounded-full border-primary-500"
			on:click={deleteTaskConfirm}
		>
			Delete
		</button>
	</div>
	
	<form
		class="border-2 rounded-3xl border-solid text-tertiary-400 border-primary-500 max-w-xl p-4 mx-auto my-24"
		action=""
		method="post"
	>
		<div class="justify-center text-3xl text-center ">Credit Task/ Withdraw Credit</div>
		<div class="grid grid-cols-1 py-2">
			<label class="flex  items-end  text-3xl mx-2" for="">Amount</label>
			<input class="w-sm input" name="amount" type="text" />
		</div>
		<div class="grid grid-cols-2">
			<button
				class="border-2 rounded-3xl border-solid border-primary-500 my-4 px-8 text-3xl"
				formaction="?/credit"
				type="submit">Credit</button
			>
			<button
				class="border-2 rounded-3xl border-solid border-primary-500 my-4 px-8 text-3xl"
				formaction="?/withdraw"
				type="submit">Withdraw</button
			>
		</div>
	</form>
</div>

<div class="mt-12 p-4">
	<div class="p-4 text-3xl">Transactions</div>

	{#if task.tx}
		<div class="table table-container p-5">
			<table class="table table-hover">
				<thead>
					<tr>
						<!-- <th>S/N</th> -->
						<th>Hash</th>
						<th>Address</th>
						<th>Amount</th>
						<th>In/Out</th>
						<th>Bal After Tx.</th>
						<th>Bal Before Tx.</th>
						<th>Timestamp</th>
					</tr>
				</thead>
				<tbody>
					{#each task.tx as row, i}
						<tr
							id={row.sig}
							on:click={() => goto(`https://solscan.io/tx/${row.sig}?cluster=devnet`)}
						>
							<!-- <td>{i + 1}</td> -->
							<td>{truncate(row.sig, 10)}</td>
							<td
								>{row.address != null
									? row.address
									: null}</td
							>
							<td
								>{row.amount}</td
							>
							<td>{row.out ? 'Out' : 'In'}</td>
							<td>{row.postBal}</td>
							<td>{row.preBal}</td>
							<td>{formatEpoch(row.timeStamp)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div>No Transactions Yet</div>
	{/if}
</div>

