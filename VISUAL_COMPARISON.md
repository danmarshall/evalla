# Visual Comparison: Decimal Places Impact

## Example 1: Basic Calculation

### Current Behavior (Full Precision)
```typescript
const result = await evalla([
  { name: 'a', expr: '1/3' },
  { name: 'b', expr: 'a * 3' }
]);

console.log(result.values.a.toString());  // 0.33333333333333333333
console.log(result.values.b.toString());  // 1
```

### With 7 Decimal Places
```typescript
const result = await evalla([
  { name: 'a', expr: '1/3' },
  { name: 'b', expr: 'a * 3' }
], { decimalPlaces: 7 });

console.log(result.values.a.toString());  // 0.3333333
console.log(result.values.b.toString());  // 1
```

**Note**: Internal calculation uses full precision, formatting applied at output only.

---

## Example 2: Real-World Geometry

### Current Behavior
```typescript
const result = await evalla([
  { name: 'radius', expr: '10' },
  { name: 'circumference', expr: '2 * $math.PI * radius' },
  { name: 'area', expr: '$math.PI * $math.pow(radius, 2)' }
]);

// User must manually format:
console.log(`Circumference: ${result.values.circumference.toFixed(2)} units`);
console.log(`Area: ${result.values.area.toFixed(2)} sq units`);
```

**Output:**
```
Circumference: 62.83 units
Area: 314.16 sq units
```

### With 7 Decimal Places
```typescript
const result = await evalla([
  { name: 'radius', expr: '10' },
  { name: 'circumference', expr: '2 * $math.PI * radius' },
  { name: 'area', expr: '$math.PI * $math.pow(radius, 2)' }
], { decimalPlaces: 7 });

// No manual formatting needed:
console.log(`Circumference: ${result.values.circumference} units`);
console.log(`Area: ${result.values.area} sq units`);
```

**Output:**
```
Circumference: 62.8318531 units
Area: 314.1592654 sq units
```

---

## Example 3: Financial Calculation

### With 2 Decimal Places (Financial)
```typescript
const result = await evalla([
  { name: 'price', expr: '19.99' },
  { name: 'quantity', expr: '7' },
  { name: 'subtotal', expr: 'price * quantity' },
  { name: 'tax', expr: 'subtotal * 0.08' },
  { name: 'total', expr: 'subtotal + tax' }
], { decimalPlaces: 2 });

console.log(`Subtotal: $${result.values.subtotal}`);
console.log(`Tax:      $${result.values.tax}`);
console.log(`Total:    $${result.values.total}`);
```

**Output:**
```
Subtotal: $139.93
Tax:      $11.19
Total:    $151.12
```

---

## Example 4: Playground Display

### Current Display (Full Precision)
```
┌──────────────┬────────────────────────┐
│ Name         │ Value                  │
├──────────────┼────────────────────────┤
│ pi           │ 3.14159265358979323846 │
│ oneThird     │ 0.33333333333333333333 │
│ small        │ 1.23456789e-8          │
│ calculation  │ 1234.56789012345678901 │
└──────────────┴────────────────────────┘
```

### With 7 Decimal Places
```
┌──────────────┬─────────────┐
│ Name         │ Value       │
├──────────────┼─────────────┤
│ pi           │ 3.1415927   │
│ oneThird     │ 0.3333333   │
│ small        │ 0           │
│ calculation  │ 1234.5678901│
└──────────────┴─────────────┘
```

**With Playground Control:**
```
Decimal Places: [7▼] [Unlimited]
                ↑ user can change this
```

---

## Example 5: Edge Cases

### Infinity
```typescript
const result = await evalla([
  { name: 'positive', expr: '1/0' },
  { name: 'negative', expr: '-1/0' }
], { decimalPlaces: 7 });

console.log(result.values.positive.toString());  // Infinity
console.log(result.values.negative.toString());  // -Infinity
```

**Note**: Infinity is not formatted (can't apply decimal places to Infinity)

### Very Small Numbers
```typescript
const result = await evalla([
  { name: 'small1', expr: '0.0000000123' },
  { name: 'small2', expr: '1.23e-8' },
  { name: 'small3', expr: '0.00000123' }
], { decimalPlaces: 7 });

console.log(result.values.small1.toString());  // 0
console.log(result.values.small2.toString());  // 0
console.log(result.values.small3.toString());  // 0.0000012
```

**Note**: Precision loss is expected when decimal places < required precision

### Boolean and Null (Unaffected)
```typescript
const result = await evalla([
  { name: 'isPositive', expr: '5 > 0' },
  { name: 'isNegative', expr: '5 < 0' },
  { name: 'empty', expr: '' }
], { decimalPlaces: 7 });

console.log(result.values.isPositive);  // true
console.log(result.values.isNegative);  // false
console.log(result.values.empty);       // null
```

**Note**: Boolean and null values are not affected by decimal places setting

---

## Comparison Table

| Use Case | Current (Full) | 7 Places | 2 Places | Best Choice |
|----------|---------------|----------|----------|-------------|
| Scientific | `3.14159265358979` | `3.1415927` | `3.14` | 7+ |
| Engineering | `123.456789012345` | `123.4567890` | `123.46` | 7 |
| Financial | `19.99` | `19.99` | `19.99` | 2 |
| Angles | `1.57079632679489` | `1.5707963` | `1.57` | 4-7 |
| Temperature | `98.6` | `98.6` | `98.60` | 1-2 |
| GPS Coords | `37.7749295` | `37.7749295` | `37.77` | 7+ |

---

## Benefits of Configurable Decimal Places

### ✅ Pros
1. **Simpler code**: No need to manually call `.toFixed()` everywhere
2. **Consistent formatting**: All values formatted the same way
3. **Readable output**: Less visual clutter in displays
4. **Appropriate precision**: Match the use case (2 for money, 7 for engineering)
5. **Still have full precision**: During internal calculations

### ⚠️ Cons
1. **Precision loss in display**: Can't see full precision without changing setting
2. **Learning curve**: Users need to know about the option
3. **Breaking change risk**: If we make 7 the default (but can start non-breaking)

---

## User Workflow Examples

### Workflow 1: Interactive Exploration (Playground)
```
1. User enters expressions
2. Clicks "Decimal Places: 7"
3. Clicks Evaluate
4. Sees formatted results
5. Switches to "Unlimited" if needs more precision
6. Re-evaluates
```

### Workflow 2: Production Code (Financial)
```typescript
const invoiceCalculations = await evalla(invoiceItems, { 
  decimalPlaces: 2  // Financial precision
});

// All values automatically formatted to 2 decimal places
displayInvoice(invoiceCalculations.values);
```

### Workflow 3: Scientific Calculation
```typescript
// Use default 7 places for display
const results = await evalla(equations, { decimalPlaces: 7 });
console.log('Results:', results.values);

// Get full precision for further calculation
const fullPrecisionResults = await evalla(equations);
furtherCalculation(fullPrecisionResults.values);
```

---

## Migration Example (If 7 Becomes Default)

### Before (v0.2.x)
```typescript
const result = await evalla([{ name: 'pi', expr: '3.14159265358979323846' }]);
console.log(result.values.pi.toString());
// Output: 3.14159265358979323846
```

### After (v1.0.0 with 7 as default)
```typescript
// Default behavior changes:
const result = await evalla([{ name: 'pi', expr: '3.14159265358979323846' }]);
console.log(result.values.pi.toString());
// Output: 3.1415927  ← CHANGED

// To maintain old behavior:
const result = await evalla(
  [{ name: 'pi', expr: '3.14159265358979323846' }],
  { decimalPlaces: undefined }  // Unlimited
);
console.log(result.values.pi.toString());
// Output: 3.14159265358979323846  ← SAME AS BEFORE
```

---

## Conclusion

The decimal places option provides:
- **Flexibility**: Users choose precision for their use case
- **Simplicity**: No manual formatting needed
- **Safety**: Full precision during calculations
- **Clarity**: Appropriate precision for display

**Recommended approach**: Start with unlimited default (non-breaking), consider 7 in v1.0.0.
