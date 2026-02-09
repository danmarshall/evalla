# Revised Proposal: Separate Function for Rounding Results

## Updated Design Based on Feedback

**Original proposal**: Add `decimalPlaces` as an option parameter to `evalla()`
```typescript
// Original proposal
const result = await evalla(inputs, { decimalPlaces: 7 });
```

**Revised proposal**: Separate function for formatting/rounding results
```typescript
// Revised approach - separate concern
const result = await evalla(inputs);
const rounded = roundResults(result, { decimalPlaces: 7 });
```

## Rationale

As noted in the feedback, `decimalPlaces` is only used for display, not during evaluation. Therefore, it makes more sense to:

1. **Keep `evalla()` focused on evaluation** - It returns full-precision results
2. **Add separate utility for formatting** - Users can format results when needed for display
3. **Better separation of concerns** - Evaluation logic separated from presentation logic

## Proposed API

### New Function: `formatResults()` or `roundResults()`

```typescript
/**
 * Format evaluation results to specified decimal places
 * 
 * @param result - EvaluationResult from evalla()
 * @param options - Formatting options
 * @returns New result object with formatted Decimal values
 */
function formatResults(
  result: EvaluationResult,
  options: { decimalPlaces: number }
): EvaluationResult;
```

### Alternative Names to Consider

- `formatResults(result, { decimalPlaces: 7 })`  ✅ General formatting function
- `roundResults(result, { decimalPlaces: 7 })`   ✅ Emphasizes rounding behavior
- `toDecimalPlaces(result, 7)`                   ✅ Shorter, follows Decimal.js naming
- `formatDecimals(result, 7)`                    ✅ Clear about what's being formatted

## Usage Examples

### Example 1: Basic Usage

```typescript
// Evaluate with full precision
const result = await evalla([
  { name: 'pi', expr: '3.14159265358979323846' }
]);

// Format for display
const formatted = formatResults(result, { decimalPlaces: 7 });

console.log(result.values.pi.toString());      // "3.14159265358979323846"
console.log(formatted.values.pi.toString());   // "3.1415927"
```

### Example 2: Different Precisions for Different Uses

```typescript
const result = await evalla([
  { name: 'price', expr: '19.99' },
  { name: 'quantity', expr: '7' },
  { name: 'subtotal', expr: 'price * quantity' },
  { name: 'tax', expr: 'subtotal * 0.08' },
  { name: 'total', expr: 'subtotal + tax' }
]);

// Use full precision for further calculations
const extraCalculations = await evalla([
  { name: 'previousTotal', value: result.values.total },
  { name: 'discount', expr: 'previousTotal * 0.1' }
]);

// Format for display (financial: 2 decimal places)
const displayResults = formatResults(result, { decimalPlaces: 2 });
console.log(`Total: $${displayResults.values.total}`);  // "Total: $151.12"
```

### Example 3: Playground Integration

```typescript
// In playground component
const [decimalPlaces, setDecimalPlaces] = useState<number | undefined>(undefined);

const handleEvaluate = async () => {
  // Always evaluate with full precision
  const result = await evalla(expressions);
  
  // Format if user specified decimal places
  const displayResult = decimalPlaces !== undefined
    ? formatResults(result, { decimalPlaces })
    : result;
  
  setResult(displayResult);
};
```

## Implementation

### Core Function

```typescript
/**
 * Format Decimal values in evaluation results to specified decimal places.
 * Boolean and null values are preserved unchanged.
 * 
 * @param result - Evaluation result from evalla()
 * @param options - Formatting options
 * @returns New result with formatted values
 */
export function formatResults(
  result: EvaluationResult,
  options: { decimalPlaces: number }
): EvaluationResult {
  const { decimalPlaces } = options;
  
  if (decimalPlaces < 0) {
    throw new Error('decimalPlaces must be non-negative');
  }
  
  const formattedValues: Record<string, Decimal | boolean | null> = {};
  
  for (const [name, value] of Object.entries(result.values)) {
    if (value instanceof Decimal && value.isFinite()) {
      formattedValues[name] = value.toDecimalPlaces(decimalPlaces);
    } else {
      // Boolean, null, or Infinity - keep unchanged
      formattedValues[name] = value;
    }
  }
  
  return {
    values: formattedValues,
    order: result.order
  };
}
```

### Export from Main Module

```typescript
// In src/index.ts
export { formatResults } from './format-results.js';

// Or if we want a shorter name:
export { formatResults as roundResults } from './format-results.js';
```

## Advantages of This Approach

### 1. **Clear Separation of Concerns**
- `evalla()` focuses solely on evaluation
- `formatResults()` handles presentation
- Each function has a single responsibility

### 2. **More Flexible**
```typescript
const result = await evalla(inputs);

// Format differently for different contexts
const forDisplay = formatResults(result, { decimalPlaces: 2 });
const forExport = formatResults(result, { decimalPlaces: 7 });
const forAPI = result;  // Send full precision to API
```

### 3. **Easier to Extend**
```typescript
// Future: Add more formatting options
formatResults(result, { 
  decimalPlaces: 7,
  notation: 'scientific',  // Future: scientific notation
  roundingMode: 'up'       // Future: rounding mode
});
```

### 4. **Non-Breaking**
- Doesn't change `evalla()` signature
- Can be added in a minor version (v0.2.x)
- Users opt-in by calling `formatResults()`

### 5. **Clearer Intent**
```typescript
// Clear that formatting is for display
const displayResult = formatResults(result, { decimalPlaces: 2 });

// vs (less clear that this is just formatting)
const result = await evalla(inputs, { decimalPlaces: 2 });
```

### 6. **Better for Testing**
```typescript
// Test evaluation separately from formatting
test('evaluates correctly', async () => {
  const result = await evalla([...]);
  expect(result.values.x.toString()).toBe('0.33333333333333333333');
});

test('formats correctly', () => {
  const result = { values: { x: new Decimal('0.33333333333333333333') }, order: ['x'] };
  const formatted = formatResults(result, { decimalPlaces: 7 });
  expect(formatted.values.x.toString()).toBe('0.3333333');
});
```

## Comparison with Original Proposal

| Aspect | Original (Options Param) | Revised (Separate Function) |
|--------|-------------------------|----------------------------|
| **API** | `evalla(inputs, { decimalPlaces: 7 })` | `formatResults(result, { decimalPlaces: 7 })` |
| **Separation of concerns** | Mixed evaluation & formatting | Clear separation |
| **Flexibility** | Format once at evaluation | Can format multiple ways |
| **Breaking change** | None if default is undefined | None (new function) |
| **Extension** | Limited to evaluation options | Can add formatting-specific options |
| **Clarity** | Less clear it's just display | Very clear purpose |
| **Performance** | Slight overhead if not used | Zero overhead if not used |

## Migration from Documentation

Since no implementation exists yet, we only need to update the documentation:

1. **Update API_MOCKUP.ts** - Show `formatResults()` instead of options param
2. **Update DECIMAL_PLACES_PROPOSAL.md** - Revise to show separate function
3. **Update QUICK_REFERENCE.md** - Update examples
4. **Update DECISION_MATRIX.md** - Reflect new API design
5. **Update decimal-places-poc.js** - Show formatting as separate step

## Implementation Plan

### Phase 1: Core Implementation
- [ ] Create `src/format-results.ts` with `formatResults()` function
- [ ] Add comprehensive JSDoc documentation
- [ ] Export from `src/index.ts`
- [ ] Update type definitions

### Phase 2: Testing
- [ ] Create `test/format-results.test.ts`
- [ ] Test various decimal place values
- [ ] Test edge cases (Infinity, boolean, null)
- [ ] Test that original result is unchanged (immutable)

### Phase 3: Documentation
- [ ] Update README.md with new function
- [ ] Add usage examples
- [ ] Document edge cases
- [ ] Show common patterns

### Phase 4: Playground
- [ ] Add decimal places control UI
- [ ] Call `formatResults()` when displaying
- [ ] Add presets (2, 7, unlimited)

## Decision Points

### 1. Function Name (Choose One)

- [ ] `formatResults()` - General, extensible
- [ ] `roundResults()` - Specific, clear about rounding
- [ ] `toDecimalPlaces()` - Shorter, follows Decimal.js convention
- [ ] `formatDecimals()` - Clear about what's formatted

**Recommendation**: `formatResults()` - Most flexible for future additions

### 2. Options Object vs Simple Parameter

**Option A: Options object (extensible)**
```typescript
formatResults(result, { decimalPlaces: 7 })
```

**Option B: Simple parameter (simpler)**
```typescript
formatResults(result, 7)
```

**Recommendation**: Option A - Easier to extend with more options later

### 3. Should it Mutate or Return New?

**Current approach**: Returns new result (immutable) ✅

This is safer and follows functional programming principles.

## Summary

The revised approach with a separate `formatResults()` function is:
- ✅ **Cleaner** - Better separation of concerns
- ✅ **More flexible** - Can format results multiple ways
- ✅ **Non-breaking** - New function, doesn't change existing API
- ✅ **More extensible** - Easy to add formatting options later
- ✅ **Clearer intent** - Obvious that formatting is for display
- ✅ **Better testable** - Evaluation and formatting tested separately

**Ready to implement once function name is decided.**
