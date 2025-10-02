<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import CustomSection from '$lib/components/custom-section.svelte';
</script>

<svelte:head>
  <title>FEHLER</title>
  <meta name="description" content="Das ist die Fehlerseite..."/>
</svelte:head>


<CustomSection type={'fullCenterTeaser'}>
<div class="inner-content-wrapper prose">
<h2>Es ist ein Fehler aufgetreten!</h2>
</div>
</CustomSection>

<style lang="postcss">
  @reference '../app.css';
  .inner-content-wrapper {
    @apply flex flex-col items-center justify-center text-center;
  }
</style>
