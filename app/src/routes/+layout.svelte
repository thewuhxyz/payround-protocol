<script lang="ts">
	import '../theme.postcss';
	// import '@skeletonlabs/skeleton/themes/theme-hamlindigo.css';
	import '@skeletonlabs/skeleton/styles/all.css';
	import '../app.postcss';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { Modal, storePopup } from '@skeletonlabs/skeleton';

	import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  $: ({ supabase } = data);

  onMount(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      invalidate('supabase:auth');
    });

    return () => subscription.unsubscribe();
  });

</script>

<!-- <Solana /> -->
<slot />
<Modal/>
