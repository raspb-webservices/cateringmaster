<script lang="ts">
  let { size = 'small' } = $props();
</script>

<div class="loader {size}"></div>

<style lang="postcss">
  @reference '../../app.css';

  .loader {
    @apply text-accent rounded-full w-3 h-3;
    --d: 44px;
    box-shadow:
      calc(1 * var(--d)) calc(0 * var(--d)) 0 0,
      calc(0.707 * var(--d)) calc(0.707 * var(--d)) 0 1px,
      calc(0 * var(--d)) calc(1 * var(--d)) 0 2px,
      calc(-0.707 * var(--d)) calc(0.707 * var(--d)) 0 3px,
      calc(-1 * var(--d)) calc(0 * var(--d)) 0 4px,
      calc(-0.707 * var(--d)) calc(-0.707 * var(--d)) 0 5px,
      calc(0 * var(--d)) calc(-1 * var(--d)) 0 6px;
    animation: rotete 1s infinite steps(8);
  }
  @keyframes rotete {
    100% {
      transform: rotate(1turn);
    }
  }
</style>
