/**
 * Example: Using formatResults() for display formatting
 * 
 * Run with: node packages/evalla/dist/example-formatting.js
 */

import { evalla, formatResults } from './index.js';

async function main() {
  console.log('=== formatResults() Examples ===\n');

  // Example 1: Basic formatting
  console.log('1. Basic Formatting:');
  const result1 = await evalla([
    { name: 'pi', expr: '3.14159265358979323846' },
    { name: 'oneThird', expr: '1/3' }
  ]);
  
  console.log('   Full precision:');
  console.log(`   pi = ${(result1.values.pi as any).toString()}`);
  console.log(`   1/3 = ${(result1.values.oneThird as any).toString()}`);
  
  const formatted1 = formatResults(result1, { decimalPlaces: 7 });
  console.log('   Formatted (7 decimal places):');
  console.log(`   pi = ${(formatted1.values.pi as any).toString()}`);
  console.log(`   1/3 = ${(formatted1.values.oneThird as any).toString()}\n`);

  // Example 2: Financial calculations
  console.log('2. Financial Calculation (2 decimal places):');
  const result2 = await evalla([
    { name: 'price', expr: '19.99' },
    { name: 'quantity', expr: '7' },
    { name: 'subtotal', expr: 'price * quantity' },
    { name: 'tax', expr: 'subtotal * 0.08' },
    { name: 'total', expr: 'subtotal + tax' }
  ]);
  
  const financial = formatResults(result2, { decimalPlaces: 2 });
  console.log(`   Subtotal: $${financial.values.subtotal}`);
  console.log(`   Tax:      $${financial.values.tax}`);
  console.log(`   Total:    $${financial.values.total}\n`);

  // Example 3: Multiple formatting precisions
  console.log('3. Same Result, Different Precisions:');
  const result3 = await evalla([
    { name: 'radius', expr: '10' },
    { name: 'area', expr: '$math.PI * $math.pow(radius, 2)' }
  ]);
  
  console.log(`   Full precision: ${(result3.values.area as any).toString()}`);
  
  const formatted2 = formatResults(result3, { decimalPlaces: 2 });
  console.log(`   2 decimal places: ${(formatted2.values.area as any).toString()}`);
  
  const formatted6 = formatResults(result3, { decimalPlaces: 6 });
  console.log(`   6 decimal places: ${(formatted6.values.area as any).toString()}\n`);

  // Example 4: Preserving non-numeric values
  console.log('4. Mixed Value Types:');
  const result4 = await evalla([
    { name: 'decimal', expr: '3.14159' },
    { name: 'boolean', expr: '5 > 3' },
    { name: 'nullValue', expr: 'null' },
    { name: 'infinity', expr: '1/0' }
  ]);
  
  const formatted4 = formatResults(result4, { decimalPlaces: 2 });
  console.log(`   decimal:   ${(formatted4.values.decimal as any).toString()} (formatted)`);
  console.log(`   boolean:   ${formatted4.values.boolean} (preserved)`);
  console.log(`   null:      ${formatted4.values.nullValue} (preserved)`);
  console.log(`   infinity:  ${(formatted4.values.infinity as any).toString()} (preserved)\n`);

  // Example 5: Maintaining precision in calculations
  console.log('5. Full Precision During Evaluation:');
  const result5 = await evalla([
    { name: 'a', expr: '1/3' },
    { name: 'b', expr: 'a * 3' }
  ]);
  
  const formatted5 = formatResults(result5, { decimalPlaces: 7 });
  console.log(`   1/3 = ${(formatted5.values.a as any).toString()} (displayed with 7 decimal places)`);
  console.log(`   (1/3) * 3 = ${(formatted5.values.b as any).toString()} (exactly 1!)`);
  console.log('   Note: Internal calculation used full precision, so b is exactly 1\n');

  console.log('=== Key Points ===');
  console.log('• formatResults() is for display only - evaluation uses full precision');
  console.log('• Returns new result object (immutable)');
  console.log('• Boolean and null values preserved unchanged');
  console.log('• Infinity values preserved unchanged');
  console.log('• Can format same result multiple times with different precisions');
}

main().catch(console.error);
