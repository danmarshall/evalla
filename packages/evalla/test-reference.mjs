import { evalla } from './dist/index.js';

console.log('Testing: Can we reference &&@c in an expression?');
try {
  const result = await evalla([
    { name: '&&@c', expr: '5' },
    { name: 'b', expr: '&&@c + 1' }
  ]);
  console.log('SUCCESS (unexpected):', JSON.stringify(result));
} catch (err) {
  console.log('ERROR (expected):', err.message);
}
