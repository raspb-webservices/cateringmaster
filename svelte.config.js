import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      $store: './src/store',
      $helper: './src/lib/helper',
      $config: './src/lib/config',
      $services: './src/lib/services',
      $interfaces: './src/interfaces'
    }
  },
  vite: {
    optimizeDeps: {
      include: ['lodash.get', 'lodash.isequal', 'lodash.clonedeep']
    }
  }
};

export default config;
