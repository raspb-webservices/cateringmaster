<script lang="ts">
  import '../app.css';
  import { navigating } from '$app/state';
  import { onMount } from 'svelte';

  import Loader from '$lib/components/loader.svelte';
  import HEADER from '$lib/components/header.svelte';
  import FOOTER from '$lib/components/footer.svelte';
  import favicon from '$lib/assets/favicon.svg';
  import appleTouch from '$lib/assets/apple-touch-icon.png';
  import favicon32 from '$lib/assets/favicon-32x32.png';
  import favicon16 from '$lib/assets/favicon-16x16.png';
  import webmanifest from '$lib/assets/site.webmanifest';

  let { children } = $props();
  let showInitialLoader = $state(true);

  onMount(() => {
    setTimeout(() => {
      showInitialLoader = false;
    }, 333);
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="apple-touch-icon" sizes="180x180" href={appleTouch} />
  <link rel="icon" type="image/png" sizes="32x32" href={favicon32} />
  <link rel="icon" type="image/png" sizes="16x16" href={favicon16} />
  <link rel="manifest" href={webmanifest} />
</svelte:head>

<div class="wrapper">
  {#if navigating.to || showInitialLoader}
    <div class="global-loading">
      <Loader size={'large'}></Loader>
    </div>
  {:else}
    <HEADER />
    <main>{@render children?.()}</main>
    <FOOTER />
  {/if}
</div>
