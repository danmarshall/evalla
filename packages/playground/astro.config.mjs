import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// BASE_PATH is set in CI workflows:
// - Main deploy: /evalla/
// - PR preview: /pr-preview/pr-123
// Locally defaults to / for dev convenience
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  output: 'static',
  integrations: [react(), tailwind()],
  build: {
    inlineStylesheets: 'auto'
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true
    }
  }
});
