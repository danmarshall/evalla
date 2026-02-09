/**
 * Proof of Concept: Decimal Places Formatting
 * 
 * Run with: node decimal-places-poc.js
 * 
 * This demonstrates different approaches to formatting decimal output.
 */

import Decimal from 'decimal.js';

console.log('=== Decimal Places Formatting POC ===\n');

// Sample values
const values = {
  pi: new Decimal('3.14159265358979323846'),
  small: new Decimal('0.0000000123456789'),
  large: new Decimal('123456789.987654321'),
  infinity: new Decimal(Infinity),
  zero: new Decimal('0'),
  oneThird: new Decimal('1').div(3),
};

console.log('1. CURRENT BEHAVIOR (toString, full precision)');
console.log('------------------------------------------------');
for (const [name, value] of Object.entries(values)) {
  console.log(`${name.padEnd(10)} = ${value.toString()}`);
}

console.log('\n2. WITH 7 DECIMAL PLACES (proposed default)');
console.log('------------------------------------------------');
for (const [name, value] of Object.entries(values)) {
  const formatted = value.isFinite() ? value.toDecimalPlaces(7).toString() : value.toString();
  console.log(`${name.padEnd(10)} = ${formatted}`);
}

console.log('\n3. WITH 2 DECIMAL PLACES (financial)');
console.log('------------------------------------------------');
for (const [name, value] of Object.entries(values)) {
  const formatted = value.isFinite() ? value.toDecimalPlaces(2).toString() : value.toString();
  console.log(`${name.padEnd(10)} = ${formatted}`);
}

console.log('\n4. COMPARISON: toFixed() vs toDecimalPlaces()');
console.log('------------------------------------------------');
const testValue = new Decimal('1.23456789');
console.log(`Original:          ${testValue.toString()}`);
console.log(`toFixed(7):        ${testValue.toFixed(7)}`);
console.log(`toDecimalPlaces(7): ${testValue.toDecimalPlaces(7).toString()}`);
console.log('\nNote: toFixed() returns a string, toDecimalPlaces() returns a Decimal');

console.log('\n5. EDGE CASES');
console.log('------------------------------------------------');
const edgeCases = {
  'trailing zeros': new Decimal('1.5000000000'),
  'scientific (small)': new Decimal('1.23e-10'),
  'scientific (large)': new Decimal('1.23e10'),
  'very precise': new Decimal('1.23456789012345678901234567890'),
};

for (const [name, value] of Object.entries(edgeCases)) {
  const full = value.toString();
  const dp7 = value.isFinite() ? value.toDecimalPlaces(7).toString() : value.toString();
  console.log(`${name.padEnd(20)} | Full: ${full.padEnd(20)} | 7dp: ${dp7}`);
}

console.log('\n6. ROUNDING BEHAVIOR');
console.log('------------------------------------------------');
const roundingTests = [
  new Decimal('1.23456789'),  // Round down
  new Decimal('1.23456749'),  // Round down
  new Decimal('1.23456750'),  // Round to nearest even (banker's rounding)
  new Decimal('1.23456850'),  // Round up
  new Decimal('1.23456999'),  // Round up
];

for (const value of roundingTests) {
  const full = value.toString();
  const dp7 = value.toDecimalPlaces(7).toString();
  const dp6 = value.toDecimalPlaces(6).toString();
  console.log(`${full} -> 7dp: ${dp7} | 6dp: ${dp6}`);
}

console.log('\n7. EXAMPLE: Real-world calculation chain');
console.log('------------------------------------------------');
// Simulate: width * height * depth with full precision internally, formatted output
const width = new Decimal('10.123456789');
const height = new Decimal('5.987654321');
const depth = new Decimal('3.141592654');

// Internal calculation (full precision)
const volume = width.times(height).times(depth);

console.log('Inputs (full precision):');
console.log(`  width  = ${width.toString()}`);
console.log(`  height = ${height.toString()}`);
console.log(`  depth  = ${depth.toString()}`);
console.log('\nInternal calculation (full precision):');
console.log(`  volume = ${volume.toString()}`);
console.log('\nFormatted outputs:');
console.log(`  7 decimal places: ${volume.toDecimalPlaces(7).toString()}`);
console.log(`  2 decimal places: ${volume.toDecimalPlaces(2).toString()}`);
console.log(`  0 decimal places: ${volume.toDecimalPlaces(0).toString()}`);

console.log('\n8. DEMONSTRATION: Why precision matters');
console.log('------------------------------------------------');
const a = new Decimal('0.1');
const b = new Decimal('0.2');
const sum = a.plus(b);

console.log('JavaScript:    0.1 + 0.2 =', 0.1 + 0.2);
console.log('Decimal (full):', `0.1 + 0.2 = ${sum.toString()}`);
console.log('Decimal (7dp): ', `0.1 + 0.2 = ${sum.toDecimalPlaces(7).toString()}`);
console.log('Decimal (2dp): ', `0.1 + 0.2 = ${sum.toDecimalPlaces(2).toString()}`);

console.log('\n9. MEMORY AND PERFORMANCE');
console.log('------------------------------------------------');
console.log('Note: toDecimalPlaces() creates a NEW Decimal object.');
console.log('Original value is unchanged (immutable).');
console.log('');
const original = new Decimal('123.456789');
const rounded = original.toDecimalPlaces(2);
console.log(`Original: ${original.toString()} (unchanged)`);
console.log(`Rounded:  ${rounded.toString()} (new object)`);

console.log('\n=== Conclusions ===');
console.log('1. toDecimalPlaces() maintains Decimal type (preferred)');
console.log('2. Infinity and special values need .isFinite() check');
console.log('3. 7 decimal places covers most engineering use cases');
console.log('4. Internal calculations should use full precision');
console.log('5. Formatting should be applied at output stage');
