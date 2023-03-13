<script lang="ts">
	import { goto } from '$app/navigation';
	import AppLayout from '$lib/components/AppLayout.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	$: balance = data.uiBalance!.toString();
	$: nickname=data.nickname!
	$: data.credits;
	$: data.userAccountKey;
	$: email = data.email!;
</script>

<AppLayout
	address={data.userAccountKey}
	balance={balance}
	credit={data.credits}
	{email}
	name={nickname}
>
	<slot />
</AppLayout>
