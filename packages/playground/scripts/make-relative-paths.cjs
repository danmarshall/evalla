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
  // Handles both single and double quotes
  // Avoids protocol-relative URLs (//)
  // /_astro/file.js -> _astro/file.js (for root) or ../_astro/file.js (for subdirs)
  // /test.css -> test.css (for root) or ../test.css (for subdirs)
  content = content.replace(/(href|src)=(["'])\/(?!\/)/g, `$1=$2${prefix}`);
  
  fs.writeFileSync(htmlPath, content, 'utf8');
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
  processDir(distDir);
  console.log('Converted absolute paths to relative paths');
} else {
  console.log('No dist directory found');
}
