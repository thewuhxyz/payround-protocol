<script lang="ts">
	import { goto } from '$app/navigation';
	import { Avatar, LightSwitch } from '@skeletonlabs/skeleton';

	// const submitLogout: SubmitFunction = async ({ cancel }) => {
	// 	const { error } = await supabaseClient.auth.signOut();
	// 	if (error) {
	// 		console.log(error);
	// 	}
	// 	cancel();
	// 	goto('/');
	// };

	const links = [
		{ name: 'Dashboard', link: '/w2/dashboard' },

		{ name: 'Send', link: '/w2/send' },
		{ name: 'Tasks', link: '/w2/task' },
		{ name: 'Groups', link: '/w2/group' },
		{ name: 'Address Book', link: '/w2/addresses' },
		{ name: 'Transactions', link: '/w2/transactions' },
		{ name: 'USD', link: '/w2/usd' },
		{ name: 'Settings', link: '/w2/settings' }
	];
</script>

<div class="mt-4 w-48 py-12 text-white">
	<!-- <LightSwitch/> -->
	<div class="flex bg-primary-700 items-center">
		<div class="p-2">
			<Avatar class="" />
		</div>
		<div class="text-sm">
			<div class="text-lg">Qi</div>
			<div>someone@...com</div>
		</div>
	</div>
	<div>

	</div>
	<li class="my-4">
    {#each links as link}
    <a class="text-primary-100" href={link.link} >
			<ul
				class="btn text-white w-full p-4 text-1xl text-center hover:bg-secondary-100 hover:italic hover:text-secondary-500 active:italic active:text-secondary-500"
				>
          {link.name}
        </ul>
      </a>
		{/each}
	</li>
	<div class="p-5 w-full">
	<form action="/w2/logout" method="POST">
		<button type="submit" class="p-1 bg-red-400">Logout</button>
	</form>

</div>
</div>
