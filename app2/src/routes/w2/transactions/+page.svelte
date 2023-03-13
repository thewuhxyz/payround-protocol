<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatEpoch, truncate } from '$lib/helpers';
	import type { PageData } from './$types';

	export let data: PageData;

	const transactions = data.data;

	$: transactions;
</script>

<div class="mt-12 p-4">
	<div class="p-4 text-3xl">Transactions</div>

	{#if transactions}
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
					{#each transactions as row, i}
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
