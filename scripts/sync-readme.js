#!/usr/bin/env node

/**
 * Sync README from packages/evalla to root (exact copy)
 * Also copies it for the Astro site to use
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const EVALLA_README = path.join(ROOT_DIR, 'packages/evalla/README.md');
const ROOT_README = path.join(ROOT_DIR, 'README.md');
const PLAYGROUND_README = path.join(ROOT_DIR, 'packages/playground/src/content/docs/readme.md');

function syncReadme() {
  console.log('🔄 Syncing README from packages/evalla to root...');

  // Read the master README from packages/evalla
  const evallaReadme = fs.readFileSync(EVALLA_README, 'utf-8');

  // Write exact copy to root README (no mutation)
  fs.writeFileSync(ROOT_README, evallaReadme, 'utf-8');
  
  console.log('✅ README synced successfully!');
  console.log(`   Source: ${EVALLA_README}`);
  console.log(`   Target: ${ROOT_README}`);
  
  // Also copy to playground content directory for Astro
  const contentDir = path.dirname(PLAYGROUND_README);
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }
  
  // Remove the "Live Demo" link for the web version
  const webReadme = evallaReadme
    .split('\n')
    .filter(line => !line.startsWith('[Live Demo]'))
    .join('\n');
  
  fs.writeFileSync(PLAYGROUND_README, webReadme, 'utf-8');
  console.log(`   Also copied to: ${PLAYGROUND_README}`);
}

// Run the sync
syncReadme();
console.log('🎉 All done!');

