#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist', 'esm');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix relative imports to include .js extension
      content = content.replace(
        /from ['"](\.[^'"]+)(?<!\.js)['"]/g,
        (match, p1) => {
          // Don't add .js if it already ends with .js or .mjs
          if (p1.endsWith('.js') || p1.endsWith('.mjs')) {
            return match;
          }
          return `from '${p1}.js'`;
        }
      );
      
      // Fix parser.js import to parser.mjs
      content = content.replace(
        /from ['"]\.\/parser\.js['"]/g,
        `from './parser.mjs'`
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
}

if (fs.existsSync(distDir)) {
  fixImports(distDir);
  console.log('Fixed ESM imports');
} else {
  console.log('No ESM dist directory found');
}
