<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton';
  export let name: string | null;
  export let email: string | null;
  export let address: string;
  export let balance: string | null;
  export let credit: number;
</script>

<div class="grid grid-cols-3 text-1xl text-secondary-500  justify-center py-4 mt-16">
  <div class="justify-center items-start px-10">
    <div class="text-4xl ">Welcome, {name}</div>
    <div class="text-tertiary-500">Account: {email ? email : address}</div>
	</div>
  <div class="justify-center flex flex-col items-center">
    <div class="text-5xl">Bal: ${balance}</div>
    <div class="text-tertiary-500">Account: {address}</div>
  </div>
  <div class="justify-center  flex flex-col items-end px-10">
    <div class="text-3xl">Task Credit: {credit}</div>
</div>
</div>
