import { evalla } from './dist/index.js';

console.log('Testing: &&@c');
try {
  const result = await evalla([{ name: '&&@c', expr: '5' }]);
  console.log('SUCCESS (unexpected):', JSON.stringify(result));
} catch (err) {
  console.log('ERROR (expected):', err.message);
}

console.log('\nTesting: abc@def');
try {
  const result = await evalla([{ name: 'abc@def', expr: '5' }]);
  console.log('SUCCESS (unexpected):', JSON.stringify(result));
} catch (err) {
  console.log('ERROR (expected):', err.message);
}

console.log('\nTesting: valid_name');
try {
  const result = await evalla([{ name: 'valid_name', expr: '5' }]);
  console.log('SUCCESS (expected):', JSON.stringify(result));
} catch (err) {
  console.log('ERROR (unexpected):', err.message);
}
