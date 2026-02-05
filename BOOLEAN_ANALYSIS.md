# Boolean and Ternary Operator Analysis

## Executive Summary

This document analyzes the design decisions around boolean and ternary operator support in evalla, considering the library's philosophy that "this is not JavaScript" and its focus as a decimal math evaluator.

**UPDATE**: Based on maintainer feedback, the following design constraints are established:
- ✅ **Ternary operators are valued** - but only with Decimal outputs (already works)
- ❌ **String literals should be removed** - They're a bug (except in JSON property names)
- 🤔 **Boolean literals discussion needed** - Could be replaced with system namespace (`$true`, `$false`) or keywords as variables (`true` as algebraic name)

## Current State

### What the Grammar Currently Supports
- ✅ **Ternary operator (`? :`)**: Works perfectly, returns Decimal values
- ✅ **Comparison operators**: `>`, `<`, `==`, etc. - evaluate to booleans internally
- ✅ **Logical operators**: `&&`, `||`, `!`, `??` - work with boolean values internally
- ⚠️ **Boolean literals**: `true`, `false`, `null` - parsed and reserved (blocks use as identifiers)
- ⚠️ **String literals**: `"hello"`, `'world'` - parsed but considered a **bug** per maintainer

### Grammar Design: Reserved Literals
```pegjs
// From grammar.pegjs lines 255-256:
ReservedLiteral
  = ("true" / "false" / "null") ![a-zA-Z0-9_$]

Identifier
  = !ReservedLiteral name:$([a-zA-Z_$] [a-zA-Z0-9_$]*) { ... }
```

**Current behavior**: `true`, `false`, and `null` are **reserved** - they cannot be used as variable names.

### What Currently Happens
```typescript
const result = await evalla([
  { name: 'x', expr: '10' },
  { name: 'isPositive', expr: 'x > 0' },      // Evaluates to true internally
  { name: 'result', expr: 'x > 5 ? 100 : 50' } // Works: returns Decimal(100)
]);

console.log(result.values.isPositive); // undefined (not exposed in output)
console.log(result.values.result);     // Decimal { 100 } (works fine)
```

Boolean/string values are evaluated but **not included in the output** - they're treated like objects/arrays (available in context for references but not in results).

## Design Philosophy: "This is Not JavaScript"

### Maintainer Position (from feedback)

1. **String literals are a bug** - Should not be allowed except in JSON object property names (separate issue to address)
2. **Keywords as variables** - Since "this is not JavaScript", keywords like `return`, `if`, `while` can be variable names
3. **Comparisons in ternary: YES** ✅ - Love comparison operators with ternary: `a > b ? 10 : 20`
4. **Standalone comparisons: NO** ❌ - A value cannot be the result of `a > b` alone
5. **Ternary operators are valued** - But only with Decimal outputs (already the case)
6. **Should `true`/`false`/`null` be keywords or algebraic names?** - TBD

### Current Issue: Standalone Comparisons

**Problem:** Currently, standalone comparisons are allowed but return `undefined`:
```typescript
// Current behavior (WRONG):
{ name: 'check', expr: 'a > b' }  // Returns undefined, doesn't error

// Desired behavior:
{ name: 'check', expr: 'a > b' }  // Should throw an error - not allowed!

// Correct usage (with ternary):
{ name: 'result', expr: 'a > b ? 10 : 20' }  // ✅ This is fine
```

### Implications

If standalone comparisons are blocked:
```typescript
// NOT allowed:
{ name: 'isGreater', expr: 'a > b' }           // ❌ Error
{ name: 'isEqual', expr: 'x == y' }            // ❌ Error
{ name: 'check', expr: 'x > 0 && y > 0' }      // ❌ Error

// ONLY allowed in ternary context:
{ name: 'result', expr: 'a > b ? 1 : 0' }      // ✅ OK
{ name: 'sign', expr: 'x > 0 ? 1 : -1' }       // ✅ OK
{ name: 'value', expr: 'x > 0 && y > 0 ? 1 : 0' } // ✅ OK
```

This keeps evalla focused as a **decimal calculator**, not a boolean expression evaluator.

## Maintainer's Preferred Direction

Based on feedback, the maintainer wants:
1. ✅ **Keep ternary operators** - They work well for conditional Decimal outputs
2. ✅ **Keep comparisons in ternary** - Love `a > b ? 10 : 20` pattern
3. ❌ **Block standalone comparisons** - `a > b` alone should NOT be allowed as a value
4. ❌ **Remove string literal support** - It's a bug (except for JSON property names)
5. ❌ **Don't expose boolean/string values in results** - Keep Decimal-only output
6. 🤔 **Decision needed**: What to do with `true`/`false`/`null`?

## The Key Issue: Blocking Standalone Comparisons

### Current Behavior (Needs Fix)
```typescript
// Currently allowed but returns undefined:
await evalla([
  { name: 'check', expr: 'a > b' }  // ❌ Returns undefined
]);

// Works correctly:
await evalla([
  { name: 'result', expr: 'a > b ? 10 : 20' }  // ✅ Returns Decimal(10)
]);
```

### Required Fix
Standalone comparison expressions should **throw an error** during evaluation, not silently return undefined.

**Implementation approach:**
- In `evaluateAST` for `BinaryExpression` with comparison operators
- Check if result would be a boolean
- If so, throw an error: "Comparison operators can only be used in ternary expressions"
- Exception: If the comparison is inside a ternary's test condition, it's OK

**Alternative approach (grammar level):**
- More complex: Would need to track context in parser
- Probably not worth it - runtime check is simpler

### Examples After Fix
```typescript
// These should all throw errors:
{ name: 'x', expr: 'a > b' }                    // ❌ Error
{ name: 'y', expr: 'x == 5' }                   // ❌ Error  
{ name: 'z', expr: 'a > b && c < d' }           // ❌ Error

// These should work:
{ name: 'result', expr: 'a > b ? 10 : 20' }     // ✅ OK
{ name: 'max', expr: 'a > b ? a : b' }          // ✅ OK
{ name: 'sign', expr: 'x > 0 ? 1 : x < 0 ? -1 : 0' }  // ✅ OK
```

## Three Options for Boolean Literals

### Option 1: Remove Boolean Literals Entirely
**Remove `true`, `false`, `null` from grammar - make them available as algebraic variable names**

```pegjs
// Remove BooleanLiteral and NullLiteral from grammar
Literal
  = NumericLiteral
  // / BooleanLiteral  ← REMOVE
  // / NullLiteral     ← REMOVE

// Remove from ReservedLiteral so they can be identifiers
// ReservedLiteral  ← REMOVE ENTIRELY
```

**Pros:**
- ✅ Consistent with "this is not JavaScript" philosophy
- ✅ Allows algebraic variable names: `true`, `false`, `null`
- ✅ Simplifies grammar (fewer literal types)
- ✅ No confusion about boolean output types

**Cons:**
- ❌ Comparison operators would have issues: `x > 5` evaluates to... what?
- ❌ Logical operators (`&&`, `||`, `!`) wouldn't work properly
- ❌ Would need to rethink how comparisons work internally

**Verdict:** ❌ **Not viable** - Breaks comparison and logical operators

### Option 2: Keep Reserved but Add System Namespace
**Keep grammar as-is but add `$true`, `$false`, `$null` in system namespace**

```typescript
// In namespaces.ts, add boolean namespace:
export const createNamespaces = () => ({
  $math: { ... },
  $unit: { ... },
  $angle: { ... },
  $bool: {
    true: true,
    false: false,
    null: null
  }
});
```

Usage:
```typescript
{ name: 'check', expr: 'x > 0 ? $bool.true : $bool.false' }
// Or simpler:
{ name: 'result', expr: 'x > 0 ? 1 : 0' }  // Use 1/0 instead
```

**Pros:**
- ✅ Maintains system namespace convention (`$` prefix)
- ✅ Keeps internal boolean logic working
- ✅ Clear separation: system values vs user variables
- ✅ Could still use `true`/`false` as variable names if unreserved

**Cons:**
- ❌ More verbose: `$bool.true` vs `true`
- ❌ Doesn't solve the core issue - still need boolean values internally
- ❌ Users would ask: why not just use `true`?

**Verdict:** ⚠️ **Possible but awkward**

### Option 3: Keep Current (Reserved Literals, Internal Only)
**Keep `true`, `false`, `null` as reserved literals, used internally only**

**Current state:**
- Grammar reserves `true`, `false`, `null`
- They work perfectly in comparisons and logical operations
- Results are **not** exposed in output (undefined)
- Ternary operators work great: `x > 0 ? 100 : 50` returns Decimal

**Pros:**
- ✅ Already works correctly
- ✅ Comparison operators work: `x > 0` evaluates to boolean internally
- ✅ Ternary operators work: returns Decimal values
- ✅ Type safety maintained: output is always Decimal
- ✅ Simple mental model: evalla is a decimal calculator

**Cons:**
- ❌ Reserves words that could be algebraic names
- ❌ Inconsistent with "keywords can be variables" philosophy
- ❌ Can't directly output boolean validation results

**Verdict:** ✅ **Most pragmatic** - Works well, minimal issues

## Recommendation Based on Maintainer Feedback

### Primary Recommendation: **Keep Current Design (Option 3)**

**Rationale:**
1. Ternary operators already provide the main use case: `x > 0 ? 1 : 0`
2. Decimal-only output maintains clear value proposition
3. Comparison/logical operators work correctly internally
4. Minimal changes needed

**Address the inconsistency:**
Document that `true`, `false`, `null` are **structural keywords** (like operators) rather than JavaScript keywords. They're needed for the boolean logic underlying comparisons, even though evalla is "not JavaScript."

### Alternative: **Unreserve + System Namespace** (Advanced)

If wanting maximum flexibility:
1. Remove `true`, `false`, `null` from `ReservedLiteral`
2. Add `$true`, `$false`, `$null` to system namespace
3. Allow users to define: `{ name: 'true', expr: '1' }`
4. Update grammar to handle this ambiguity

**Much more complex**, likely not worth it.

## String Literals: The Bug to Fix

### Current State
String literals are currently parsed in the grammar:
```pegjs
StringLiteral
  = '"' chars:DoubleStringCharacter* '"' { ... }
  / "'" chars:SingleStringCharacter* "'" { ... }
```

### Maintainer Position
**String literals should NOT be supported** except for JSON object property names.

### Examples of Current Behavior
```typescript
// Currently works (but shouldn't):
checkSyntax('"hello"').valid  // true ← BUG
checkSyntax("'world'").valid  // true ← BUG

// Ternary with strings (currently works):
{ name: 'grade', expr: 'score >= 90 ? "A" : "B"' }  // ← BUG

// JSON property names (should work):
{ name: 'obj', expr: '{x: 10, "weird-name": 20}' }  // ← OK
```

### Action Items for String Literal Bug

1. **Update grammar** to disallow string literals in most contexts
2. **Keep string support** only for object property keys
3. **Update tests** to verify strings are rejected
4. **Update documentation** to clarify that strings are not supported

This is a **separate issue** that needs its own testing and PR.

## Ternary Operators with Comparisons: Perfect Match ✅

### Current Behavior
Ternary operators work perfectly and return Decimal values:

```typescript
const result = await evalla([
  { name: 'x', expr: '10' },
  { name: 'result', expr: 'x > 5 ? 100 : 50' }  // Comparison + ternary
]);

console.log(result.values.result.toString()); // "100" (Decimal)
```

### Maintainer Position
✅ **Ternary operators are liked** - Especially with comparisons (greater than, etc.)
✅ **Comparison operators are liked** - In conjunction with ternary
✅ **Decimal outputs** - Keep returning only Decimal values (already the case)

**This is the sweet spot:** Comparisons evaluate internally to booleans, ternary operators use those booleans, and the result is a clean Decimal value in the output.

### Perfect Use Cases (Comparison + Ternary)
```typescript
// Comparison operators with ternary - exactly what the maintainer likes!

// Sign function (using >, <)
{ name: 'sign', expr: 'x > 0 ? 1 : x < 0 ? -1 : 0' }

// Min/Max (using <, >)
{ name: 'min', expr: 'a < b ? a : b' }
{ name: 'max', expr: 'a > b ? a : b' }

// Range clamping (using <, >)
{ name: 'clamped', expr: 'x < 0 ? 0 : x > 100 ? 100 : x' }

// Conditional calculations (using >=, <=)
{ name: 'discount', expr: 'quantity >= 10 ? price * 0.9 : price' }

// Absolute value (using <)
{ name: 'abs', expr: 'x < 0 ? -x : x' }

// Grading with multiple comparisons (using >=)
{ name: 'grade', expr: 'score >= 90 ? 90 : score >= 80 ? 80 : score >= 70 ? 70 : 0' }
```

**This is exactly the design that works well:**
1. Comparison operators (`>`, `<`, `>=`, `<=`, `==`, `!=`) evaluate to boolean internally
2. Ternary operator uses that boolean for conditional logic
3. Result is a **Decimal value** in the output
4. No boolean/string types exposed - clean, simple, focused on math

**No changes needed** - Works perfectly with current design.

## Summary of Design Decisions

| Feature | Current Status | Maintainer Position | Required Action |
|---------|---------------|---------------------|-----------------|
| **Ternary operators** | ✅ Working | ✅ Liked (Decimal output) | Keep as-is |
| **Comparisons in ternary** | ✅ Working | ✅ **Love this!** | Keep as-is |
| **Standalone comparisons** | ⚠️ Returns undefined | ❌ Should be blocked | **FIX: Throw error** |
| **Logical operators in ternary** | ✅ Working | ✅ OK (in ternary only) | Keep for ternary |
| **Standalone logical ops** | ⚠️ Returns undefined | ❌ Should be blocked | **FIX: Throw error** |
| **Boolean literals** | ⚠️ Reserved | 🤔 TBD: Reserved vs algebraic | Decide Option 1-3 |
| **String literals** | 🐛 Bug | ❌ Should not be supported | **FIX: Remove** |
| **Boolean in output** | ❌ Not supported | ❌ Don't want | Don't change |
| **String in output** | ❌ Not supported | ❌ Don't want | Don't change |

## Recommended Next Steps

### Immediate (This PR)
1. ✅ Update analysis document with maintainer feedback
2. ✅ Clarify that current design (Decimal-only output) is preferred
3. ✅ Clarify that comparisons should only work in ternary operators
4. ❌ Do NOT implement boolean/string output

### Future (Separate Issues/PRs)

#### Issue 1: Block Standalone Comparisons ⚠️ HIGH PRIORITY
**Problem:** `{ name: 'x', expr: 'a > b' }` currently returns undefined, should throw error

**Solution:** Modify evaluator to detect when comparison/logical operators produce boolean values that would be assigned to a variable (not in ternary context).

**Implementation:**
```typescript
// In index.ts, after evaluating expression:
if (typeof result === 'boolean') {
  throw new EvaluationError(
    `Boolean values are not supported. Use comparison operators only in ternary expressions: "a > b ? 10 : 20"`,
    name
  );
}
```

**Tests needed:**
- Verify `a > b` throws error
- Verify `a > b ? 10 : 20` still works
- Verify logical operators `&&`, `||`, `!` also throw when standalone
- Verify nested ternaries still work

#### Issue 2: Remove String Literal Support
- Remove `StringLiteral` from grammar (except object property keys)
- Add tests to verify strings are rejected
- Update documentation

#### Issue 3: Decide on Boolean Literal Strategy  
- Option A: Keep as reserved (current)
- Option B: System namespace (`$true`, `$false`)
- Option C: Unreserve (complex, probably not worth it)

#### Issue 4: Object Property Name Edge Cases
- Test and document string literals in object keys
- Ensure `{x: 10, "weird-name": 20}` works
- Prevent strings elsewhere

## Conclusion

**For this PR:** The analysis is complete. The maintainer's position is clear:
- ✅ **Love the combination:** Comparison operators (`>`, `<`, etc.) with ternary operators
- ✅ Keep ternary operators (Decimal output only) - Already works perfectly
- ✅ Keep comparison operators **in ternary context** - Already works perfectly
- ❌ **Block standalone comparisons** - `a > b` alone should throw error (needs fix)
- ❌ Don't expose boolean/string values in results
- 🐛 String literals are a bug (separate issue to fix)
- 🤔 Boolean literal keywords need design decision (Option 1-3 above)

**The current design is excellent for the maintainer's use case, with one fix needed:**
- Comparisons + ternary operators work beautifully together ✅
- Decimal-only output keeps things simple and focused ✅
- Type safety is maintained ✅
- **Need to block standalone comparisons** ⚠️ (should throw error, not return undefined)

**No code changes needed in this PR** - This is purely an analysis document.

### What Works Today (Keep It!)
```typescript
// This is exactly what the maintainer wants:
await evalla([
  { name: 'x', expr: '15' },
  // Comparisons in ternary - perfect! ✅
  { name: 'category', expr: 'x > 20 ? 3 : x > 10 ? 2 : x > 0 ? 1 : 0' },
  { name: 'clamped', expr: 'x < 0 ? 0 : x > 100 ? 100 : x' },
  { name: 'sign', expr: 'x > 0 ? 1 : x < 0 ? -1 : 0' }
]);
// All results are Decimal values - clean and simple!
```

### What Needs Fixing
```typescript
// This should throw an error (currently returns undefined): ❌
await evalla([
  { name: 'check', expr: 'a > b' }  // Should error: "Use comparisons only in ternary"
]);
```

#### 1. **Enables Validation and Flags** ✅
```typescript
const result = await evalla([
  { name: 'value', expr: '150' },
  { name: 'isValid', expr: 'value >= 0 && value <= 100' },
  { name: 'isOutOfRange', expr: 'value > 100' }
]);
// isValid: false, isOutOfRange: true (currently both undefined)
```

**Use case**: Form validation, data quality checks, business rule evaluation.

#### 2. **More Expressive Formulas** ✅
```typescript
const result = await evalla([
  { name: 'isMember', expr: 'true' },
  { name: 'quantity', expr: '5' },
  { name: 'qualifiesForDiscount', expr: 'isMember && quantity > 3' }
]);
```

**Use case**: Business logic, conditional calculations, rule engines.

#### 3. **Better Developer Experience** ✅
```typescript
// Currently confusing behavior:
{ name: 'check', expr: '5 > 3' }  // evaluates to true, returns undefined

// Expected behavior:
{ name: 'check', expr: '5 > 3' }  // evaluates to true, returns true
```

#### 4. **Consistency** ✅
- Ternary operators already work: `x > 5 ? 100 : 50` returns a Decimal
- Logical expressions already work internally
- Missing: Direct access to boolean results

#### 5. **No New Parsing Complexity** ✅
- Grammar already supports all boolean operations
- No security risks introduced
- No breaking changes to existing code

### Costs and Concerns

#### 1. **Type System Complexity** ⚠️
```typescript
// Current (simple):
interface EvaluationResult {
  values: Record<string, Decimal>;
  order: string[];
}

// Proposed (more complex):
interface EvaluationResult {
  values: Record<string, Decimal | boolean | string | null>;
  order: string[];
}
```

**Impact**: 
- Breaks type safety assumptions that all values are Decimal
- Consumers must handle multiple types
- May require runtime type checking in consuming code

#### 2. **Breaking Change Potential** ⚠️
```typescript
// Code that currently works:
result.values.x.toString()  // Always safe (always Decimal)

// After change:
result.values.x.toString()  // May fail if x is boolean
```

**Impact**: 
- Not technically breaking (only adds previously undefined values)
- But changes return type contract
- May surprise existing users

#### 3. **Inconsistency with Design Philosophy** ⚠️

The current design treats evalla as a **numeric calculator** with object/array support for intermediate values. Boolean exposure shifts it toward a **general expression evaluator**.

**Philosophy question**: Is evalla meant to be:
- A) A math evaluator with precise decimal arithmetic? (current)
- B) A general expression evaluator with various types? (proposed)

#### 4. **Documentation Complexity** ⚠️
```typescript
// Users must understand:
- Which expressions return Decimal vs boolean vs string
- When to use .toString() vs direct access
- How to handle multiple types
```

#### 5. **Potential for Misuse** ⚠️
```typescript
// Confusing behavior:
{ name: 'x', expr: 'true' }     // returns boolean true
{ name: 'y', expr: '1' }        // returns Decimal(1)
{ name: 'eq', expr: 'x == y' }  // What does this mean?
```

### Negatives and Risks

#### 1. **Loss of Numeric Focus** ❌
- evalla's strength is **decimal precision for math**
- Adding booleans/strings dilutes this clear value proposition
- May confuse users about the library's purpose

#### 2. **Type Confusion** ❌
```typescript
// Ambiguous cases:
result.values.x // Decimal | boolean | string | null - what is it?

// Requires defensive coding:
if (result.values.x instanceof Decimal) {
  // handle number
} else if (typeof result.values.x === 'boolean') {
  // handle boolean
}
```

#### 3. **Testing Burden** ❌
- Increases test surface area significantly
- Must test interactions between all types
- More edge cases to consider

#### 4. **Migration Complexity** ❌
- Existing code may need updates
- Users must understand what changed
- Potential for runtime errors in production

## Alternative Approaches

### Option 1: Keep Current Behavior (Status Quo)
**Pros**: 
- Simple, focused on math
- No breaking changes
- Clear type contract

**Cons**: 
- Booleans remain inaccessible despite working internally
- Less expressive formulas

### Option 2: Expose Booleans Only (Not Strings/Null)
```typescript
interface EvaluationResult {
  values: Record<string, Decimal | boolean>;
  order: string[];
}
```

**Pros**: 
- Addresses main use case (validation, flags)
- Simpler than full multi-type support
- Still maintains some type clarity

**Cons**: 
- Inconsistent (why booleans but not strings?)
- Doesn't solve ternary operator use case fully

### Option 3: Separate Output Channels
```typescript
interface EvaluationResult {
  values: Record<string, Decimal>;     // Numeric results only
  booleans: Record<string, boolean>;   // Boolean results
  strings: Record<string, string>;     // String results
  order: string[];
}
```

**Pros**: 
- Maintains type safety per channel
- No breaking changes to existing values
- Clear separation of concerns

**Cons**: 
- More complex API
- Overhead of managing multiple outputs
- Doesn't feel natural

### Option 4: Opt-in Configuration
```typescript
await evalla(inputs, { includeBooleans: true })
```

**Pros**: 
- Backward compatible
- Users choose complexity level

**Cons**: 
- Configuration complexity
- Two modes to maintain

## Recommendation

### If Prioritizing Simplicity and Focus: **Keep Status Quo**
- evalla remains a clear, focused **decimal math evaluator**
- Type safety is maintained
- Users can still use booleans in ternary operators to return numbers

### If Prioritizing Expressiveness: **Option 2 (Booleans Only)**
- Expose boolean values but keep strings/null internal
- Addresses primary use cases (validation, conditional logic)
- Minimizes type complexity

### If Prioritizing Full Support: **Full Multi-Type (Original Implementation)**
- Expose all primitive types (boolean, string, null)
- Most expressive and consistent
- Requires accepting increased complexity

## Testing Insights

From my implementation testing, all **27 tests** for boolean/ternary operations passed, including:
- Boolean literals and operations
- Comparison operators
- Logical operators (&&, ||, !, ??)
- Ternary operators with comparisons (e.g., `a > 3 ? -1 : 1`)
- Nested ternary expressions
- Sign function implementation
- Range checking

**Key insight**: The implementation works perfectly from a technical standpoint. The question is whether the added complexity is worth the additional expressiveness.

## Security Considerations

✅ **No security concerns identified**:
- CodeQL scan: 0 alerts
- Type safety maintained (booleans cannot be used in arithmetic)
- No prototype pollution risks
- No arbitrary code execution risks

## Conclusion

**Technical feasibility**: ✅ Fully implemented and tested
**Type safety**: ⚠️ Requires users to handle multiple types
**Breaking changes**: ⚠️ Soft breaking (changes type contract)
**Value proposition**: 🤔 Depends on library goals

The decision ultimately depends on **what evalla wants to be**:
- A focused decimal math calculator? → Keep status quo
- A versatile expression evaluator? → Expose booleans/strings

Both are valid choices with different trade-offs.
