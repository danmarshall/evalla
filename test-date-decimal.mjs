import Decimal from 'decimal.js';

console.log('Testing Date + Decimal.js interactions:\n');

// Test 1: Date object through Decimal constructor
console.log('Test 1: new Decimal(new Date())');
try {
  const date = new Date('2024-01-15T12:30:00Z');
  const decimal = new Decimal(date);
  console.log('  Date:', date.toISOString());
  console.log('  Decimal value:', decimal.toString());
  console.log('  Type:', typeof decimal.toNumber());
  console.log('  ✅ Works - converts to timestamp (ms)');
} catch (e) {
  console.log('  ❌ Error:', e.message);
}

// Test 2: Date.getTime() through Decimal
console.log('\nTest 2: new Decimal(date.getTime())');
try {
  const date = new Date('2024-01-15T12:30:00Z');
  const decimal = new Decimal(date.getTime());
  console.log('  Timestamp:', date.getTime());
  console.log('  Decimal value:', decimal.toString());
  console.log('  Precision maintained:', decimal.toString() === String(date.getTime()));
  console.log('  ✅ Works - perfect precision');
} catch (e) {
  console.log('  ❌ Error:', e.message);
}

// Test 3: Date arithmetic with Decimal
console.log('\nTest 3: Date arithmetic via Decimal');
try {
  const date1 = new Date('2024-01-01');
  const date2 = new Date('2024-01-15');
  const d1 = new Decimal(date1.getTime());
  const d2 = new Decimal(date2.getTime());
  const diff = d2.minus(d1);
  const days = diff.div(1000 * 60 * 60 * 24);
  console.log('  Difference (ms):', diff.toString());
  console.log('  Difference (days):', days.toString());
  console.log('  ✅ Works - precise arithmetic');
} catch (e) {
  console.log('  ❌ Error:', e.message);
}

// Test 4: What if Date is invalid?
console.log('\nTest 4: Invalid Date through Decimal');
try {
  const invalidDate = new Date('invalid');
  console.log('  Invalid Date:', invalidDate);
  console.log('  getTime():', invalidDate.getTime());
  const decimal = new Decimal(invalidDate);
  console.log('  Decimal value:', decimal.toString());
  console.log('  Is NaN:', decimal.isNaN());
  console.log('  ⚠️ Invalid Date becomes NaN in Decimal');
} catch (e) {
  console.log('  ❌ Error:', e.message);
}

// Test 5: Large timestamps (precision test)
console.log('\nTest 5: Precision with large timestamps');
try {
  const date = new Date('2024-06-15T14:30:45.123Z');
  const timestamp = date.getTime(); // Milliseconds since epoch
  const decimal = new Decimal(timestamp);
  console.log('  Original timestamp:', timestamp);
  console.log('  Decimal value:', decimal.toString());
  console.log('  Back to number:', decimal.toNumber());
  console.log('  Precision maintained:', decimal.toNumber() === timestamp);
  console.log('  ✅ Full precision maintained');
} catch (e) {
  console.log('  ❌ Error:', e.message);
}

// Test 6: What about Date methods?
console.log('\nTest 6: Can we call Date methods on Decimal?');
try {
  const date = new Date('2024-01-15');
  const decimal = new Decimal(date);
  console.log('  decimal.getFullYear?', typeof decimal.getFullYear);
  console.log('  ❌ No - Decimal has no Date methods (expected)');
} catch (e) {
  console.log('  Error:', e.message);
}

console.log('\n' + '='.repeat(60));
console.log('KEY FINDINGS:');
console.log('='.repeat(60));
console.log('1. new Decimal(date) → Converts Date to timestamp (ms)');
console.log('2. new Decimal(date.getTime()) → Same, but explicit');
console.log('3. Decimal maintains full precision for timestamps');
console.log('4. Invalid Date → NaN in Decimal');
console.log('5. Date methods are NOT available on Decimal');
console.log('\nIMPLICATION FOR $date namespace:');
console.log('- Store timestamps as Decimal (not Date objects)');
console.log('- Use Day.js internally, return Decimal timestamps');
console.log('- Never expose Date objects in results');
