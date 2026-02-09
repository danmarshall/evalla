# Decision Points: Decimal Places Configuration

This document outlines the key decisions that need to be made before implementing decimal places configuration in evalla.

## 🔴 Critical Decisions

### 1. Default Behavior

**Question**: What should be the default decimal places when no option is provided?

**Options**:
- **A) Unlimited (current behavior)** ✅ Non-breaking, backward compatible
- **B) 7 decimal places** ✅ User-friendly, reasonable default for most use cases
- **C) Make it required** ❌ Too breaking, forces all users to specify

**Recommendation**: Start with **Option A** (unlimited) for v0.2.x, consider **Option B** for v1.0.0

**Impact**:
- Option A: No breaking changes, users opt-in to formatting
- Option B: Breaking change, all existing code sees different output
- Option C: Breaking change, all existing code must be updated

---

### 2. API Design

**Question**: How should users specify decimal places?

**Option A: Simple parameter (Recommended)**
```typescript
const result = await evalla(inputs, { decimalPlaces: 7 });
```

**Option B: Formatting object**
```typescript
const result = await evalla(inputs, { 
  format: { 
    type: 'decimal',
    decimalPlaces: 7 
  }
});
```

**Option C: Separate method**
```typescript
const result = await evalla(inputs);
const formatted = formatResult(result, { decimalPlaces: 7 });
```

**Recommendation**: **Option A** - Simple and direct for most use cases

---

### 3. When to Apply Formatting

**Question**: Should formatting affect internal calculations or just output?

**Options**:
- **A) Output only (Recommended)** ✅ Maintains accuracy in multi-step calculations
- **B) All calculations** ❌ Could compound rounding errors

**Recommendation**: **Option A** - Apply `.toDecimalPlaces()` only when constructing the final result object

**Example**:
```typescript
// Good: Full precision during calculation
a = 1/3                    // 0.333333333333...
b = a * 3                  // 1.0 (exact)
// Then format output:
// a = 0.3333333 (7dp)
// b = 1.0 (7dp)

// Bad: Format during calculation
a = (1/3).toDP(7)         // 0.3333333
b = a * 3                 // 0.9999999 (wrong!)
```

---

### 4. Special Value Handling

**Question**: How to handle Infinity, -Infinity, and very small numbers?

**Decision Points**:

#### Infinity
```typescript
// Infinity.toDecimalPlaces(7) throws error in Decimal.js
// Solution: Check .isFinite() before applying
if (value instanceof Decimal && value.isFinite()) {
  value = value.toDecimalPlaces(decimalPlaces);
}
```

#### Very Small Numbers
```typescript
// 0.0000000123 with 7 decimal places becomes 0
// Is this acceptable?
```

**Options**:
- **A) Accept precision loss** ✅ Simpler, user requested it
- **B) Use scientific notation** ❌ Changes output format unexpectedly
- **C) Warn user** ❌ Too complex, noisy

**Recommendation**: **Option A** - Users who need small numbers can use more decimal places or unlimited

---

### 5. Type Impact

**Question**: Should the output type change?

**Current**:
```typescript
interface EvaluationResult {
  values: Record<string, Decimal | boolean | null>;
  order: string[];
}
```

**Options**:
- **A) Keep Decimal objects** ✅ Users can still use Decimal methods
- **B) Convert to strings** ❌ Loses type safety and functionality
- **C) Offer both** ❌ Too complex

**Recommendation**: **Option A** - Format Decimals with `.toDecimalPlaces()` but keep them as Decimal objects

---

## 🟡 Secondary Decisions

### 6. Playground Integration

**Question**: Should the playground have its own decimal places control?

**Recommendation**: Yes - Add a number input above the Evaluate button

```tsx
<div>
  <label>
    Decimal Places:
    <input 
      type="number" 
      min="0" 
      max="20" 
      value={decimalPlaces ?? ''}
      placeholder="Unlimited"
    />
  </label>
</div>
```

**Default**: Start with unlimited (empty input) to match library default

---

### 7. Documentation Strategy

**Question**: How should we document this feature?

**Recommendation**: Add to README.md:
- New section: "Output Formatting"
- Update API reference with options parameter
- Show examples with different decimal places
- Explain trade-offs (precision vs readability)

---

### 8. Test Strategy

**Question**: How do we test without breaking existing tests?

**Recommendation**:
1. Keep all existing tests as-is (they test full precision)
2. Add new test file: `decimal-places.test.ts`
3. Test various decimal place values
4. Test edge cases (Infinity, very small/large numbers)
5. Test that undefined means unlimited (backward compatibility)

**Example**:
```typescript
test('formats output to 7 decimal places', async () => {
  const result = await evalla(
    [{ name: 'pi', expr: '3.14159265358979323846' }],
    { decimalPlaces: 7 }
  );
  expect((result.values.pi as Decimal).toString()).toBe('3.1415927');
});

test('unlimited precision by default', async () => {
  const result = await evalla([{ name: 'pi', expr: '3.14159265358979323846' }]);
  expect((result.values.pi as Decimal).toString()).toBe('3.14159265358979323846');
});
```

---

### 9. Migration Path (if breaking)

**Question**: If we make 7 the default, how do users migrate?

**Option A: Major version bump**
- v0.2.x → v1.0.0
- Update CHANGELOG with breaking changes
- Provide migration guide

**Option B: Feature flag**
```typescript
// Old behavior (deprecated)
const result = await evalla(inputs);

// New behavior
const result = await evalla(inputs, { decimalPlaces: undefined }); // unlimited
const result = await evalla(inputs, { decimalPlaces: 7 });         // formatted
```

**Recommendation**: If we make 7 the default, use **Option A** (major version bump)

---

## 🟢 Implementation Details

### 10. Code Location

**Where to apply formatting?**

**Location**: `/packages/evalla/src/index.ts` at the end of `evalla()` function

```typescript
export const evalla = async (
  inputs: ExpressionInput[],
  options?: { decimalPlaces?: number }
): Promise<EvaluationResult> => {
  // ... existing evaluation logic ...
  
  // Apply decimal places formatting if specified
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

**Files to update**:
1. `/packages/evalla/src/index.ts` - Add options parameter and formatting logic
2. `/packages/evalla/src/types.ts` - Add EvallaOptions interface
3. `/packages/evalla/test/decimal-places.test.ts` - New test file
4. `/packages/evalla/README.md` - Documentation
5. `/packages/playground/src/components/PlaygroundApp.tsx` - Add UI control

---

### 11. Edge Case Behavior

**Documented behavior for edge cases**:

| Input | 7 Decimal Places | Notes |
|-------|------------------|-------|
| `3.14159265358979323846` | `3.1415927` | Standard rounding |
| `0.0000000123` | `0` | Precision loss acceptable |
| `1/3` | `0.3333333` | Repeating decimal truncated |
| `Infinity` | `Infinity` | Not rounded (checked with .isFinite()) |
| `null` | `null` | Not a Decimal, unchanged |
| `true` | `true` | Not a Decimal, unchanged |
| `0` | `0` | No change needed |

---

### 12. Performance Considerations

**Question**: Does `.toDecimalPlaces()` have performance implications?

**Analysis**:
- Creates new Decimal object (immutable)
- O(n) where n = number of decimal places
- Negligible for typical use cases (<100 variables)

**Recommendation**: No special optimization needed

---

## Summary of Recommendations

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Default behavior | Unlimited (non-breaking) | Safe for initial release |
| API design | Simple `{ decimalPlaces: 7 }` | Easy to use and understand |
| When to apply | Output only | Maintains calculation accuracy |
| Special values | Check `.isFinite()` | Prevents errors on Infinity |
| Type impact | Keep as Decimal | Preserves functionality |
| Playground | Add control UI | User flexibility |
| Testing | New test file + keep existing | Comprehensive coverage |
| Documentation | New README section | Clear user guidance |

---

## Next Steps

1. ✅ Review this document with stakeholders
2. ✅ Get consensus on critical decisions (#1-5)
3. ⏳ Implement based on agreed decisions
4. ⏳ Write comprehensive tests
5. ⏳ Update documentation
6. ⏳ Review and merge

---

**Status**: 🟡 **AWAITING DECISIONS** - Ready to implement once agreed upon.

**Discussion Topics**:
- Is 7 decimal places the right default? (If not unlimited)
- Should we add this in v0.2.x or wait for v1.0.0?
- Any other output formatting needs? (scientific notation, engineering notation, etc.)
