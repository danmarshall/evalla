#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

function makeRelative(htmlPath) {
  let content = fs.readFileSync(htmlPath, 'utf8');
  
  // Replace absolute paths starting with / to relative paths
  // Handles both single and double quotes
  // Avoids protocol-relative URLs (//)
  // /_astro/file.js -> _astro/file.js
  // /test.css -> test.css
  content = content.replace(/(href|src)=(["'])\/(?!\/)/g, '$1=$2');
  
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
