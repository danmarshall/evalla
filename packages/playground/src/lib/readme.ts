import fs from 'node:fs';
import path from 'node:path';

// Sections to exclude from web page (GitHub-only content)
const SECTIONS_TO_EXCLUDE = [
  '## 🎮 Try the Playground',
  '## 📦 Packages'
];

/**
 * Read and process README from the monorepo root
 * Filters out GitHub-specific sections
 */
export function getFilteredReadme(): string {
  // Read the README from the root of the monorepo
  const rootDir = path.join(process.cwd(), '..', '..');
  const readmePath = path.join(rootDir, 'README.md');
  let readmeContent = '';

  try {
    readmeContent = fs.readFileSync(readmePath, 'utf-8');
  } catch (error) {
    console.error('Error reading README:', error);
    return '# README not found';
  }

  // Remove GitHub-only sections for the web page
  const lines = readmeContent.split('\n');
  const filteredLines: string[] = [];
  let skipSection = false;

  for (const line of lines) {
    // Check if we're at a section to exclude
    if (SECTIONS_TO_EXCLUDE.includes(line)) {
      skipSection = true;
      continue;
    }
    
    // Check if we've reached the next section (any other ## heading)
    if (skipSection && line.startsWith('## ')) {
      // Reached next section - stop skipping
      skipSection = false;
      filteredLines.push(line);
      continue;
    }
    
    // Skip lines if we're in a section to be removed
    if (skipSection) {
      continue;
    }
    
    filteredLines.push(line);
  }

  return filteredLines.join('\n');
}
