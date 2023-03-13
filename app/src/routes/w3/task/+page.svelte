<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import parser from "cron-parser"
	import { formatEpoch, truncate } from '$lib/helpers';

	export let data: PageData;

	const tasks = data.tasks!;

	$: tasks

	// const nextRun = parser.parseExpression()
	// const tasksFormat = tasks!.map((i) => {
	// 	const nextRun = parser.parseExpression(i.cron_schedule).next().toString()
	// 	console.log("next run:", nextRun);
		
	// 	return { nextRun, ...i}
	// 	// return i
	// })

	// tasksFormat;
</script>

<div class="mt-12 p-4">
	<div class="justify-end flex p-4">
		
		<a class="text-primary-100" href="/w2/task/create">
			<button
				class="btn w-64 py-4 mx-24  text-xl text-secondary-500 border-solid border-2 rounded-full border-primary-500"
			>
				+ Create New Task
			</button></a
		>
	</div>

	{#if tasks}
		<div class="table table-container p-5">
			<table class="table table-hover">
				<thead>
					<tr>
						<th>S/N</th>
						<th>Name</th>
						<th>Address</th>
						<th>Recipient</th>
						<th>Amount</th>
						<th>Cron</th>
						<th>Next Run</th>
						<th>Created At</th>
					</tr>
				</thead>
				<tbody>
					{#each tasks as row, i}
						<tr id={row.task_key} on:click={() => goto(`/w2/task/${row.task_key}`)}>
							<td>{i + 1}</td>
							<td>{row.name}</td>
							<td>{truncate(row.task_key)}</td>
							<td>{row.recipient}</td>
							<td>{row.amount}</td>
							<td>{row.cron}</td>
							<td>{formatEpoch(row.nextRunMs)}</td>
							<td>{new Date(row.created_at).toLocaleDateString()}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div>Group List Empty</div>
	{/if}
</div>
