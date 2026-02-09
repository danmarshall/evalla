# Quick Reference: Decimal Places Discussion

## What This Is About

You want to discuss adding configurable decimal places to evalla, with a proposed default of 7 decimal places.

## Current Behavior

```typescript
const result = await evalla([{ name: 'pi', expr: '3.14159265358979323846' }]);
console.log(result.values.pi.toString());
// Output: "3.14159265358979323846" (full precision)
```

Users must manually format:
```typescript
console.log(result.values.pi.toFixed(7));  // "3.1415927"
```

## Proposed Behavior

```typescript
const result = await evalla(
  [{ name: 'pi', expr: '3.14159265358979323846' }],
  { decimalPlaces: 7 }
);
console.log(result.values.pi.toString());
// Output: "3.1415927" (automatically formatted)
```

## Key Documents

1. **DECIMAL_PLACES_PROPOSAL.md** - Full proposal with design options
2. **DECISION_POINTS.md** - Specific decisions that need to be made
3. **decimal-places-poc.js** - Working demonstration you can run

## Run the Demo

```bash
cd /home/runner/work/evalla/evalla
node decimal-places-poc.js
```

This shows:
- Current behavior vs formatted output
- Different decimal place settings (2, 7, unlimited)
- Edge cases (Infinity, very small numbers, etc.)
- Why internal precision matters

## Critical Decisions Needed

### 1. Default Value
- **Option A**: Unlimited (current behavior) - Non-breaking
- **Option B**: 7 decimal places - User-friendly but breaking

**Your stated preference**: 7 decimal places

**Recommendation**: Start with unlimited for backward compatibility, then consider 7 in v1.0.0

### 2. Breaking Change or Not?
- **Non-breaking**: Default to unlimited, users opt-in
- **Breaking**: Default to 7, requires major version bump

**Recommendation**: Non-breaking initially (v0.2.x), breaking later if desired (v1.0.0)

### 3. Implementation Approach
- Apply formatting at output stage only
- Keep full precision during internal calculations
- Check `.isFinite()` before formatting (handles Infinity)

## API Design (Proposed)

```typescript
// Unlimited precision (current behavior, backward compatible)
await evalla(inputs);
await evalla(inputs, { decimalPlaces: undefined });

// 7 decimal places (proposed default)
await evalla(inputs, { decimalPlaces: 7 });

// Custom precision
await evalla(inputs, { decimalPlaces: 2 });  // Financial
await evalla(inputs, { decimalPlaces: 10 }); // Scientific
```

## Why 7 Decimal Places?

From your proposal and analysis:
- Sufficient for most engineering calculations
- Matches common scientific notation (7 significant figures)
- Balances precision vs readability
- ~0.0001mm precision for mechanical engineering
- Can be overridden for specific needs

## Impact Analysis

### Files to Change
1. `/packages/evalla/src/index.ts` - Add options parameter
2. `/packages/evalla/src/types.ts` - Add EvallaOptions interface
3. `/packages/evalla/test/decimal-places.test.ts` - New tests
4. `/packages/evalla/README.md` - Documentation
5. `/packages/playground/src/components/PlaygroundApp.tsx` - UI control

### Playground Enhancement
Add a decimal places control:
```
Decimal Places: [7] [Unlimited]
```

Allows users to:
- See full precision when debugging
- Use reasonable defaults for readability
- Match their specific use case

## Next Steps

### If You Want to Proceed

1. **Confirm Default**: 
   - Start with unlimited (non-breaking)?
   - Or go straight to 7 (breaking, needs v1.0.0)?

2. **Confirm API**: 
   - `{ decimalPlaces: 7 }` is good?
   - Any other options needed?

3. **Implementation Order**:
   - Core library changes
   - Tests
   - Documentation
   - Playground UI

### If You Want to Discuss More

Questions to consider:
- Should playground have separate setting from code?
- Do we need other formats (scientific, engineering)?
- Should there be preset profiles (financial, engineering, scientific)?
- Timeline for implementation?

## Testing

Run proof of concept:
```bash
cd /home/runner/work/evalla/evalla
node decimal-places-poc.js
```

Demonstrates:
- All decimal place options
- Edge cases
- Real-world calculation examples
- Why precision matters (0.1 + 0.2 = 0.3)

## My Recommendation

**Phase 1 (v0.2.x - Now)**: Non-breaking
```typescript
// Default: unlimited (backward compatible)
const result = await evalla(inputs);

// Opt-in formatting
const result = await evalla(inputs, { decimalPlaces: 7 });
```

**Phase 2 (v1.0.0 - Later)**: Consider making 7 the default
```typescript
// Default: 7 decimal places
const result = await evalla(inputs);

// Opt-out to unlimited if needed
const result = await evalla(inputs, { decimalPlaces: undefined });
```

This approach:
- ✅ Doesn't break existing code now
- ✅ Lets users try the feature
- ✅ Gather feedback before making 7 the default
- ✅ Clear migration path for v1.0.0

## Questions?

Feel free to:
1. Review the documents created
2. Run the POC to see behavior
3. Ask questions or request changes
4. Give the go-ahead to implement

**Current Status**: ⏸️ Waiting for your decision on:
- Default value (unlimited vs 7)
- Breaking vs non-breaking approach
- Any other requirements or concerns
