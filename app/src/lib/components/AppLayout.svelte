<script lang="ts">
	import { AppBar, AppShell } from '@skeletonlabs/skeleton';
	import Header from './Header.svelte';
	import PageHeader from './PageHeader.svelte';
	import SideBar from './SideBar.svelte';

	export let name: string | null;
	export let email: string | null;
	export let address: string;
	export let balance: string | null;
	export let credit: number;
</script>

<AppShell slotSidebarLeft="bg-primary-500" slotHeader="bg-primary-700">
	<svelte:fragment slot="sidebarLeft">
		<SideBar />
	</svelte:fragment>
	<svelte:fragment slot="header">
		<Header />
	</svelte:fragment>
	<PageHeader {address} {balance} {name} {email} {credit} />
	<slot />
</AppShell>

<!-- <slot/> -->
