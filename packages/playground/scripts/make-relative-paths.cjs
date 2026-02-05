#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

function makeRelative(htmlPath) {
  let content = fs.readFileSync(htmlPath, 'utf8');
  
  // Calculate relative path depth based on how deep the HTML file is
  const relativePath = path.relative(distDir, path.dirname(htmlPath));
  const depth = relativePath ? relativePath.split(path.sep).length : 0;
  const prefix = depth > 0 ? '../'.repeat(depth) : '';
  
  // Replace absolute paths starting with / to relative paths
  // Handles href, src, and Astro's component-url and renderer-url attributes
  // Avoids protocol-relative URLs (//)
  // /_astro/file.js -> _astro/file.js (for root) or ../_astro/file.js (for subdirs)
  content = content.replace(/(href|src|component-url|renderer-url)=(["'])\/(?!\/)/g, `$1=$2${prefix}`);
  
  // Handle paths in style tags and inline CSS (for @import, url(), etc.)
  // Matches: url(/_astro/...) or url("/_astro/...") or url('/_astro/...')
  content = content.replace(/url\((["']?)\/(?!\/)/g, `url($1${prefix}`);
  
  // Handle paths in script tags for dynamic imports
  // Matches: import('/_astro/...') or import("/_astro/...")
  content = content.replace(/import\((["'])\/(?!\/)/g, `import($1${prefix}`);
  
  fs.writeFileSync(htmlPath, content, 'utf8');
  console.log(`Processed: ${path.relative(distDir, htmlPath)} (depth: ${depth}, prefix: "${prefix}")`);
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDir(filePath);
    } else if (file.endsWith('.html')) {
      makeRelative(filePath);
    }
  }
}

if (fs.existsSync(distDir)) {
  console.log('Converting absolute paths to relative paths...');
  processDir(distDir);
  console.log('✓ Conversion complete');
} else {
  console.log('No dist directory found');
}
