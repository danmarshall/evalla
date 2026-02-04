/**
 * Example usage of evalla
 * Run with: node dist/example.js
 */

import { evalla } from './index';

async function main() {
  console.log('=== Evalla Examples ===\n');

  // Example 1: Basic arithmetic with precision
  console.log('1. Decimal Precision:');
  const ex1 = await evalla([
    { name: 'x', expr: '0.1 + 0.2' }
  ]);
  console.log(`   0.1 + 0.2 = ${ex1.values.x.toString()}`);
  console.log(`   (JavaScript would give: ${0.1 + 0.2})\n`);

  // Example 2: Variable dependencies
  console.log('2. Variable Dependencies:');
  const ex2 = await evalla([
    { name: 'd', expr: 'c * 2' },
    { name: 'b', expr: 'a + 10' },
    { name: 'c', expr: 'b * 3' },
    { name: 'a', expr: '5' }
  ]);
  console.log(`   Evaluation order: ${ex2.order.join(' -> ')}`);
  console.log(`   Results: a=${ex2.values.a}, b=${ex2.values.b}, c=${ex2.values.c}, d=${ex2.values.d}\n`);

  // Example 3: Object literals and property access
  console.log('3. Object Literals & Property Access:');
  const ex3 = await evalla([
    { name: 'point', expr: '{x: 10, y: 20}' },
    { name: 'offset', expr: '{x: 5, y: 3}' },
    { name: 'resultX', expr: 'point.x + offset.x' },
    { name: 'resultY', expr: 'point.y + offset.y' }
  ]);
  console.log(`   point + offset = result`);
  console.log(`   (${ex3.values.resultX}, ${ex3.values.resultY})\n`);

  // Example 4: $math namespace
  console.log('4. Math Namespace:');
  const ex4 = await evalla([
    { name: 'radius', expr: '10' },
    { name: 'circumference', expr: '2 * $math.PI * radius' },
    { name: 'area', expr: '$math.PI * $math.pow(radius, 2)' },
    { name: 'sqrtArea', expr: '$math.sqrt(area)' }
  ]);
  console.log(`   Circle with radius=${ex4.values.radius}:`);
  console.log(`   Circumference: ${ex4.values.circumference.toFixed(2)}`);
  console.log(`   Area: ${ex4.values.area.toFixed(2)}`);
  console.log(`   √Area: ${ex4.values.sqrtArea.toFixed(2)}\n`);

  // Example 5: $unit namespace
  console.log('5. Unit Conversions:');
  const ex5 = await evalla([
    { name: 'lengthMM', expr: '254' },
    { name: 'lengthInches', expr: '$unit.mmToInch(lengthMM)' },
    { name: 'backToMM', expr: '$unit.inchToMm(lengthInches)' }
  ]);
  console.log(`   ${ex5.values.lengthMM}mm = ${ex5.values.lengthInches}in = ${ex5.values.backToMM}mm\n`);

  // Example 6: $angle namespace
  console.log('6. Angle Conversions:');
  const ex6 = await evalla([
    { name: 'degrees', expr: '90' },
    { name: 'radians', expr: '$angle.toRad(degrees)' },
    { name: 'sine', expr: '$math.sin(radians)' }
  ]);
  console.log(`   ${ex6.values.degrees}° = ${ex6.values.radians.toFixed(4)} radians`);
  console.log(`   sin(${ex6.values.degrees}°) = ${ex6.values.sine.toFixed(4)}\n`);

  // Example 7: Circular dependency detection
  console.log('7. Circular Dependency Detection:');
  try {
    await evalla([
      { name: 'a', expr: 'b + 1' },
      { name: 'b', expr: 'a + 1' }
    ]);
  } catch (error) {
    const err = error as Error;
    console.log(`   Error: ${err.message}\n`);
  }

  // Example 8: Complex real-world scenario with nested objects
  console.log('8. Real-World: Box with Nested Dimensions:');
  const ex8 = await evalla([
    { name: 'box', expr: '{dimensions: {width: 10, height: 8, depth: 6}, unit: "inches"}' },
    { name: 'widthMM', expr: '$unit.inchToMm(box.dimensions.width)' },
    { name: 'heightMM', expr: '$unit.inchToMm(box.dimensions.height)' },
    { name: 'depthMM', expr: '$unit.inchToMm(box.dimensions.depth)' },
    { name: 'volumeMM3', expr: 'widthMM * heightMM * depthMM' },
    { name: 'volumeInches3', expr: 'box.dimensions.width * box.dimensions.height * box.dimensions.depth' }
  ]);
  console.log(`   Box dimensions: ${ex8.values.volumeInches3} in³`);
  console.log(`   Volume: ${ex8.values.volumeMM3.toFixed(0)} mm³`);
}

main().catch(console.error);
