#!/usr/bin/env node

/**
 * Sync README from packages/evalla to root with packages section injection
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const EVALLA_README = path.join(ROOT_DIR, 'packages/evalla/README.md');
const ROOT_README = path.join(ROOT_DIR, 'README.md');

// The packages section to inject after the description
const PACKAGES_SECTION = `
## 🎮 Try the Playground

Visit the interactive playground to experiment with evalla in your browser! See the [playground README](packages/playground/README.md) for details.

## 📦 Packages

This is a monorepo containing:

- **[evalla](packages/evalla/)** - Core math evaluator library
- **[playground](packages/playground/)** - Interactive Astro-based playground
`;

function syncReadme() {
  console.log('🔄 Syncing README from packages/evalla to root...');

  // Read the master README from packages/evalla
  let evallaReadme = fs.readFileSync(EVALLA_README, 'utf-8');

  // Remove the "Try it Live" section from evalla README since we'll have "Try the Playground" in root
  // This avoids duplication
  const lines = evallaReadme.split('\n');
  const filteredLines = [];
  let skipSection = false;
  let foundFirstCodeBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we're at the "Try it Live" section
    if (line.startsWith('## 🎮 Try it Live')) {
      skipSection = true;
      continue;
    }
    
    // Check if we've reached the next section or code block
    if (skipSection) {
      if (line.startsWith('## ') && !line.startsWith('## 🎮')) {
        // Reached next section
        skipSection = false;
        filteredLines.push(line);
      } else if (line.startsWith('```typescript')) {
        // Reached the code block
        skipSection = false;
        filteredLines.push(line);
      }
      continue;
    }
    
    filteredLines.push(line);
  }
  
  // Now find where to inject the packages section (after title and description)
  let insertIndex = 0;
  let foundTitle = false;
  let foundDescription = false;
  
  for (let i = 0; i < filteredLines.length; i++) {
    const line = filteredLines[i];
    
    if (line.startsWith('# evalla')) {
      foundTitle = true;
      continue;
    }
    
    if (foundTitle && !foundDescription && line.trim() && !line.startsWith('##')) {
      foundDescription = true;
      continue;
    }
    
    // Insert before the first section heading after description
    if (foundDescription && (line.startsWith('##') || line.startsWith('```'))) {
      insertIndex = i;
      break;
    }
  }
  
  // Insert the packages section
  const updatedLines = [
    ...filteredLines.slice(0, insertIndex),
    ...PACKAGES_SECTION.trim().split('\n'),
    '',
    ...filteredLines.slice(insertIndex)
  ];
  
  const updatedReadme = updatedLines.join('\n');
  
  // Write to root README
  fs.writeFileSync(ROOT_README, updatedReadme, 'utf-8');
  
  console.log('✅ README synced successfully!');
  console.log(`   Source: ${EVALLA_README}`);
  console.log(`   Target: ${ROOT_README}`);
}

// Run the sync
syncReadme();
