<script lang="ts">
  let { children, fullWidth = false, fullHeight = false, noSpacing = false, type = 'default' } = $props();
</script>

{#if type === 'default'}
  <section class="base-section" class:full={fullWidth} class:stretch={fullHeight}  class:noSpacing={noSpacing}>
    <div class="inner-container">
      {@render children?.()}
    </div>
  </section>
{:else if type === 'centerTeaser'}
  <section class="base-section center-teaser">
    <div class="inner-container">
      {@render children?.()}
    </div>
  </section>
{:else if type === 'fullCenterTeaser'}
  <section class="base-section full-center-teaser">
    <div class="inner-container animate-fade-in-up">
      {@render children?.()}
    </div>
  </section>
{/if}

<style lang="postcss">
  @reference '../../app.css';
  section.base-section {
    @apply w-full bg-base-100 py-24;

    &.stretch {
      @apply min-h-[100vh];
    }

    &.noSpacing  {
      @apply py-0;
    }

    &:not(.full) {
      .inner-container {
        @apply m-auto h-full w-full max-w-7xl px-4;
      }
    }
    
    &.center-teaser {
      @apply from-secondary/30 via-primary/10 to-secondary/20 bg-gradient-to-br py-36;
    }
    
    &.full-center-teaser {
      @apply from-secondary/30 via-primary/10 to-secondary/20 bg-gradient-to-br py-10;
      .inner-container {
        @apply min-h-[100vh] flex flex-col justify-center items-center text-center;
      }
    }
  }
</style>