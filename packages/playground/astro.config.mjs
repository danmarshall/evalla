import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  integrations: [react(), tailwind()],
  build: {
    inlineStylesheets: 'auto'
  },
  // Don't set a base path - let the script handle relative paths
  base: undefined
});
