# Proposal: Configurable Decimal Places

## Problem Statement

Currently, evalla returns full-precision Decimal objects, and users must manually format them using `.toString()`, `.toFixed()`, or `.toDecimalPlaces()`. This proposal discusses adding a configurable decimal places option to simplify output formatting.

## Current Behavior

### Internal Calculations
- Uses Decimal.js with default precision of 20 significant digits
- All arithmetic operations maintain arbitrary precision
- Results stored as Decimal objects: `Record<string, Decimal | boolean | null>`

### Output Formatting
```typescript
const result = await evalla([{ name: 'pi', expr: '3.14159265358979323846' }]);
console.log(result.values.pi.toString());  // "3.14159265358979323846"
console.log(result.values.pi.toFixed(7));  // "3.1415927"
```

**Current usage patterns:**
- Core library: Returns raw Decimal objects (no formatting)
- Tests: Use `.toString()` for full precision validation
- Examples: Use `.toFixed(2)`, `.toFixed(4)`, etc. based on context
- Playground: Displays `.toString()` (full precision)

## Proposed Change

Add an optional `decimalPlaces` parameter to control output formatting:

```typescript
interface EvallaOptions {
  decimalPlaces?: number;  // Default: 7 (proposed)
}

const evalla = async (
  inputs: ExpressionInput[], 
  options?: EvallaOptions
): Promise<EvaluationResult> => {
  // ...
}
```

### Usage Example

```typescript
// Default: 7 decimal places
const result1 = await evalla([{ name: 'pi', expr: '3.14159265358979323846' }]);
console.log(result1.values.pi.toString());  // "3.1415927"

// Custom precision
const result2 = await evalla(
  [{ name: 'pi', expr: '3.14159265358979323846' }],
  { decimalPlaces: 2 }
);
console.log(result2.values.pi.toString());  // "3.14"

// Unlimited precision (preserve current behavior)
const result3 = await evalla(
  [{ name: 'pi', expr: '3.14159265358979323846' }],
  { decimalPlaces: undefined }  // or Infinity
);
console.log(result3.values.pi.toString());  // "3.14159265358979323846"
```

## Design Considerations

### Option 1: Format at Output (Recommended)
Apply `.toDecimalPlaces()` to Decimal values when constructing the result:

**Pros:**
- Internal calculations maintain full precision
- Only affects display
- Backward compatible if default is `undefined` (unlimited)
- Users can still access full precision by passing `decimalPlaces: undefined`

**Cons:**
- Users can't easily get both formatted and full precision
- Changes the type signature (Decimals are rounded)

### Option 2: Return Formatted Strings
Return strings instead of Decimal objects:

**Pros:**
- Clear that formatting has been applied
- Simpler for display purposes

**Cons:**
- **Breaking change** - type becomes `Record<string, string | boolean | null>`
- Loses Decimal methods (`.toExponential()`, `.abs()`, etc.)
- Can't do further arithmetic on results
- **Not recommended**

### Option 3: Add Separate Formatted Output
Keep Decimal objects but add a formatted field:

```typescript
interface EvaluationResult {
  values: Record<string, Decimal | boolean | null>;
  formatted?: Record<string, string>;  // Optional formatted strings
  order: string[];
}
```

**Pros:**
- Backward compatible
- Users get both full precision and formatted output

**Cons:**
- More complex API
- Duplicates data
- **Overkill for most use cases**

## Recommended Approach

**Option 1** with the following implementation:

```typescript
export const evalla = async (
  inputs: ExpressionInput[],
  options?: { decimalPlaces?: number }
): Promise<EvaluationResult> => {
  // ... existing evaluation logic ...
  
  // After evaluation, apply decimal places formatting if specified
  const decimalPlaces = options?.decimalPlaces;
  if (decimalPlaces !== undefined && decimalPlaces >= 0) {
    for (const [name, value] of Object.entries(values)) {
      if (value instanceof Decimal && value.isFinite()) {
        values[name] = value.toDecimalPlaces(decimalPlaces);
      }
    }
  }
  
  return { values, order };
};
```

### Why 7 Decimal Places?

**Proposed default: 7 decimal places**

Rationale:
- Sufficient for most engineering calculations (e.g., 0.0001mm precision)
- Matches common scientific notation (7 significant figures)
- Balances precision vs readability
- Can be overridden for specific use cases

Comparison:
- **JavaScript `Number.toString()`**: ~15-17 significant digits
- **Most calculators**: 8-10 digits
- **Engineering standards**: 3-6 decimal places typically
- **Financial calculations**: 2-4 decimal places
- **Scientific measurements**: 2-5 significant figures

### Backward Compatibility

**Breaking Change Consideration:**

If we set a default (7 decimal places), existing code will see different output:
```typescript
// Before: "3.14159265358979323846"
// After:  "3.1415927"
```

**Migration Strategy:**

1. **Option A (Breaking)**: Default to 7 decimal places
   - Update major version (0.2.0 → 1.0.0)
   - Document in CHANGELOG and README
   - Update all tests to expect rounded values

2. **Option B (Non-breaking)**: Default to `undefined` (unlimited)
   - Users opt-in to formatting
   - More verbose but safer
   - Can change default in future major version

**Recommendation**: Option B (non-breaking) for initial release, then consider Option A in v1.0.0 based on user feedback.

## Special Cases

### Infinity
```typescript
const result = await evalla([{ name: 'x', expr: '1/0' }]);
// Infinity.toDecimalPlaces(7) throws error in Decimal.js
// Solution: Check with .isFinite() before applying
```

### Boolean and Null
No formatting needed - these are not numeric types.

### Very Small Numbers
```typescript
// Scientific notation preserved
const result = await evalla([{ name: 'x', expr: '0.0000000123' }]);
console.log(result.values.x.toString());  // "0.0000000" with 7 decimal places
// or "1.23e-8" depending on Decimal.js settings
```

## Impact on Playground

The playground should add a decimal places control:

```tsx
<label>
  Decimal Places: 
  <input type="number" min="0" max="20" value={decimalPlaces} />
  <button onClick={() => setDecimalPlaces(undefined)}>Unlimited</button>
</label>
```

This allows users to:
- See full precision when needed (debugging)
- Use reasonable defaults for readability
- Match their specific use case (engineering vs financial)

## Testing Strategy

### Test Categories

1. **Full Precision Tests** (existing)
   - Continue using `.toString()` to validate exact calculations
   - Pass `{ decimalPlaces: undefined }` to maintain current behavior

2. **Formatted Output Tests** (new)
   - Test various decimal place settings (0, 2, 7, 10)
   - Verify rounding behavior
   - Test edge cases (Infinity, very small numbers)

3. **Backward Compatibility Tests** (if default is unlimited)
   - Ensure existing code works without options parameter

### Example Test

```typescript
test('decimal places formatting', async () => {
  const result = await evalla(
    [{ name: 'pi', expr: '3.14159265358979323846' }],
    { decimalPlaces: 2 }
  );
  expect((result.values.pi as Decimal).toString()).toBe('3.14');
});

test('unlimited precision (default)', async () => {
  const result = await evalla([{ name: 'pi', expr: '3.14159265358979323846' }]);
  expect((result.values.pi as Decimal).toString()).toBe('3.14159265358979323846');
});
```

## Documentation Updates

### README.md
- Add section on "Output Formatting"
- Show `decimalPlaces` option in API reference
- Update examples to show formatted output

### TypeScript Definitions
- Add `EvallaOptions` interface
- Update function signature

### Playground Help Text
- Explain decimal places control
- Show examples of different precision levels

## Questions for Discussion

1. **Should we default to 7 decimal places or unlimited?**
   - Unlimited is safer (non-breaking)
   - 7 is more user-friendly (reasonable default)

2. **Should internal calculations also be limited?**
   - No - maintain full precision internally
   - Only format at output
   - Ensures accuracy in intermediate steps

3. **Should playground have a separate setting?**
   - Yes - allows users to experiment
   - Independent of code examples

4. **What about toExponential() or other formats?**
   - Out of scope for this proposal
   - Users can still call Decimal methods
   - Could add in future (e.g., `format: 'decimal' | 'exponential' | 'engineering'`)

5. **Should we provide a helper for common formats?**
   - e.g., `financial: { decimalPlaces: 2 }`
   - e.g., `engineering: { decimalPlaces: 6 }`
   - Maybe in future, keep simple for now

## Recommendation Summary

1. ✅ Add optional `decimalPlaces` parameter to `evalla()`
2. ✅ Default to `undefined` (unlimited) for backward compatibility
3. ✅ Apply formatting only at output, not during calculations
4. ✅ Check `.isFinite()` before applying to handle Infinity
5. ✅ Add playground control for decimal places
6. ✅ Consider changing default to 7 in future major version

## Next Steps (Pending Approval)

- [ ] Agree on default value (7 vs unlimited)
- [ ] Agree on API design
- [ ] Implement changes
- [ ] Update tests
- [ ] Update documentation
- [ ] Update playground
- [ ] Consider migration guide if breaking change

---

**Status**: 🟡 **DISCUSSION PHASE** - Do not implement until agreed upon.
