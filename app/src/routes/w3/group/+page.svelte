<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	$: sourceData = data.groups.groups;
	$: console.log("source data:", sourceData)
</script>

<div class="mt-12 p-4">
	<div class="justify-end flex p-4">
		<a class="text-primary-100" href="/w3/group/create">
			<button
				class="btn w-64 py-4 mx-24  text-xl text-secondary-500 border-solid border-2 rounded-full border-primary-500"
			>
				+ Create New Group
			</button></a
		>
	</div>

	<div class="table-container p-5">
		<table class="table table-hover">
			<thead>
				<tr>
					<th>S/N</th>
					<th>Name</th>
					<th>Description</th>
					<th>Created At</th>
				</tr>
			</thead>
			{#if sourceData}
			<tbody>
				{#each sourceData as row, i}
					<tr id={row.id} on:click={() => goto(`/w3/group/${row.id}`)}>
						<td>{i + 1}</td>
						<td>{row.name}</td>
						<td>{row.description}</td>
						<td>{row.created_at}</td>
					</tr>
				{/each}
			</tbody>
			{:else}
			<div>Group List Empty</div>
				{/if}
			
		</table>
	</div>
</div>
