# Boolean and Ternary Operator Analysis

## Executive Summary

This document analyzes the design decisions around boolean and ternary operator support in evalla, considering the library's philosophy: **"Algebra, not code"** - evalla is a mathematical expression evaluator, not a programming language.

**UPDATE**: Based on maintainer feedback, the following design constraints are established:
- ✅ **Ternary operators are valued** - but only with Decimal outputs (already works)
- ❌ **String literals should be removed** - They're a bug (except in JSON property names)
- 🤔 **Philosophy shift: "Algebra, not code"** - This fundamentally changes how we think about equality operators
- 🤔 **Single equals (`=`) for algebraic equality?** - In algebra, equals is `=`, not `==` or `===`

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

**Problem:** Currently, standalone comparisons (including equality) are allowed but return `undefined`:
```typescript
// Current behavior (ALL WRONG - should error):
{ name: 'check1', expr: 'a > b' }     // Returns undefined
{ name: 'check2', expr: 'a == b' }    // Returns undefined
{ name: 'check3', expr: 'a === b' }   // Returns undefined
{ name: 'check4', expr: 'a != b' }    // Returns undefined

// Desired behavior - ALL should throw errors:
{ name: 'check1', expr: 'a > b' }     // Should throw an error - not allowed!
{ name: 'check2', expr: 'a == b' }    // Should throw an error - not allowed!
{ name: 'check3', expr: 'a === b' }   // Should throw an error - not allowed!

// Correct usage (with ternary) - ALL FINE:
{ name: 'result1', expr: 'a > b ? 10 : 20' }   // ✅ OK
{ name: 'result2', expr: 'a == b ? 10 : 20' }  // ✅ OK
{ name: 'result3', expr: 'a === b ? 10 : 20' } // ✅ OK
```

**Applies to all comparison operators:**
- Relational: `>`, `<`, `>=`, `<=`
- Equality: `==`, `===`, `!=`, `!==`

All should only work in ternary context, not as standalone expressions.

### Implications

If standalone comparisons (relational AND equality) are blocked:
```typescript
// NOT allowed - ALL comparison operators:
{ name: 'gt', expr: 'a > b' }              // ❌ Error
{ name: 'gte', expr: 'a >= b' }            // ❌ Error
{ name: 'lt', expr: 'a < b' }              // ❌ Error
{ name: 'lte', expr: 'a <= b' }            // ❌ Error
{ name: 'eq', expr: 'x == y' }             // ❌ Error
{ name: 'strictEq', expr: 'x === y' }      // ❌ Error
{ name: 'neq', expr: 'x != y' }            // ❌ Error
{ name: 'strictNeq', expr: 'x !== y' }     // ❌ Error
{ name: 'check', expr: 'x > 0 && y > 0' }  // ❌ Error (logical result)

// ONLY allowed in ternary context - ALL comparison operators:
{ name: 'result1', expr: 'a > b ? 1 : 0' }       // ✅ OK
{ name: 'result2', expr: 'a >= b ? 1 : 0' }      // ✅ OK
{ name: 'result3', expr: 'x == y ? 1 : 0' }      // ✅ OK
{ name: 'result4', expr: 'x === y ? 1 : 0' }     // ✅ OK
{ name: 'result5', expr: 'x != y ? 1 : 0' }      // ✅ OK
{ name: 'sign', expr: 'x > 0 ? 1 : -1' }         // ✅ OK
{ name: 'bonus', expr: 'score == 100 ? 50 : 0' } // ✅ OK
{ name: 'value', expr: 'x > 0 && y > 0 ? 1 : 0' } // ✅ OK (logical in ternary)
```

This keeps evalla focused as a **decimal calculator**, not a boolean expression evaluator.

## Philosophy Evolution: "Algebra, Not Code"

### New Insight from Maintainer

**"Algebra, not code"** - This fundamentally reframes how we should think about evalla's operators.

evalla is a **mathematical expression evaluator**, not a programming language. This has profound implications for operator design.

### The Equals Sign Question

**In mathematics/algebra:**
```
x = 5           (x equals 5)
a = b           (a equals b)  
2 + 2 = 4       (two plus two equals four)
```
The equals sign `=` represents **equality**, not assignment. Variables aren't "assigned" - they're defined by their expressions.

**In programming (JavaScript):**
```javascript
x = 5           // Assignment (not equality!)
x == 5          // Loose equality comparison
x === 5         // Strict equality comparison
```

**Current state in evalla:**
- `=` is **REJECTED** (parser treats it as assignment)
- `==` is **SUPPORTED** (loose equality - programming concept)
- `===` is **SUPPORTED** (strict equality - programming concept)

### Proposal: Single Equals for Algebraic Equality

**The maintainer's perspective:**
- `=` (single) - **Natural algebraic equality** - Should be primary? ✅
- `==` (double) - Supported **only for programmer community** ⚠️
- `===` (triple) - **No need in algebra** - Programming concept, may be unnecessary ❌

**Rationale:**
1. **True to algebra** - In mathematics, equality is `=`, not `==`
2. **Natural for users** - Non-programmers expect `=` for "equals"
3. **No assignment needed** - Variables are defined via `{ name, expr }`, not `x = 5`
4. **Simpler mental model** - One equals sign, one meaning (equality)
5. **"Algebra, not code"** - Aligns with design philosophy

**Example with single equals:**
```typescript
// Would work if = is equality:
{ name: 'bonus', expr: 'score = 100 ? 50 : 0' }     // Natural algebra
{ name: 'match', expr: 'value = target ? 100 : 0' } // Intuitive
{ name: 'check', expr: 'x = y ? x * 2 : x + y' }    // Mathematical

// Current (double equals):
{ name: 'bonus', expr: 'score == 100 ? 50 : 0' }    // Programming style
```

### Comparison: Programming vs Algebra

| Feature | Programming (JS) | Algebra (Math) | Current evalla | Proposed evalla |
|---------|------------------|----------------|----------------|-----------------|
| **Equality** | `==`, `===` | `=` | `==`, `===` | `=` (primary) |
| **Assignment** | `=` | N/A | Rejected | Rejected |
| **Loose vs Strict** | `==` vs `===` | N/A (one equality) | Both supported | Not needed? |
| **Variables** | Reserved keywords | Any symbol | Any symbol ✅ | Any symbol ✅ |
| **Philosophy** | Code execution | Expression evaluation | Mixed | **Algebra, not code** |

### Implementation Considerations

**If switching to single equals (`=`):**

**Option A: Replace `==` with `=`**
- Remove `==` and `===` from grammar
- Add `=` as equality operator
- **Breaking change** for any existing code using `==`

**Option B: Support all three (`=`, `==`, `===`)**
- Add `=` as primary equality operator
- Keep `==` and `===` for programmer community
- More forgiving, but potentially confusing

**Option C: Keep current (`==`, `===`), discuss philosophy**
- Document the "algebra, not code" philosophy
- Acknowledge that `==` is a programming convention
- Consider future migration path

### Questions for Decision

1. **Should `=` be the primary/only equality operator?** (algebraic approach)
2. **Should `==` be kept for programmer community?** (pragmatic approach)
3. **Is `===` (strict equality) needed in an algebraic context?** (probably not)
4. **How to handle migration** if changing from `==` to `=`?

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
// These should all throw errors (relational AND equality):
{ name: 'x', expr: 'a > b' }                    // ❌ Error
{ name: 'y', expr: 'x == 5' }                   // ❌ Error  
{ name: 'z', expr: 'a > b && c < d' }           // ❌ Error
{ name: 'w', expr: 'x === y' }                  // ❌ Error
{ name: 'v', expr: 'a != b' }                   // ❌ Error

// These should work (all comparison types in ternary):
{ name: 'result', expr: 'a > b ? 10 : 20' }     // ✅ OK (relational)
{ name: 'max', expr: 'a > b ? a : b' }          // ✅ OK (relational)
{ name: 'bonus', expr: 'score == 100 ? 50 : 0' } // ✅ OK (equality)
{ name: 'check', expr: 'x === y ? x : y' }      // ✅ OK (strict equality)
{ name: 'penalty', expr: 'status != 1 ? 10 : 0' } // ✅ OK (inequality)
{ name: 'sign', expr: 'x > 0 ? 1 : x < 0 ? -1 : 0' }  // ✅ OK (nested)
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
Ternary operators work perfectly with all comparison operators and return Decimal values:

```typescript
const result = await evalla([
  { name: 'x', expr: '10' },
  { name: 'y', expr: '10' },
  
  // Relational operators: >, <, >=, <=
  { name: 'gt', expr: 'x > 5 ? 100 : 50' },
  { name: 'gte', expr: 'x >= 10 ? 100 : 50' },
  
  // Equality operators: == (double equals), === (triple equals)
  { name: 'eq', expr: 'x == y ? 100 : 50' },        // Double equals (loose)
  { name: 'strictEq', expr: 'x === y ? 100 : 50' },  // Triple equals (strict)
  { name: 'neq', expr: 'x != 5 ? 100 : 50' },
  { name: 'strictNeq', expr: 'x !== 5 ? 100 : 50' }
]);
```

**Note on equals syntax:**
- `=` (single equals) - NOT supported (assignment operator - correctly rejected)
- `==` (double equals) - Loose equality comparison ✅
- `===` (triple equals) - Strict equality comparison ✅

### Maintainer Position
✅ **Ternary operators are liked** - Especially with comparisons
✅ **All comparison operators supported** - Both relational and equality
  - Relational: `>`, `<`, `>=`, `<=`
  - Equality: `==` (double), `===` (triple), `!=`, `!==`
  - NOT supported: `=` (single - assignment, correctly rejected)
✅ **Decimal outputs** - Keep returning only Decimal values (already the case)

**This is the sweet spot:** All comparison operators (including equals) evaluate internally to booleans, ternary operators use those booleans, and the result is a clean Decimal value in the output.

### Perfect Use Cases (All Comparison Types + Ternary)
```typescript
// All comparison operators work with ternary - exactly what the maintainer likes!

// RELATIONAL OPERATORS (>, <, >=, <=)
// Sign function
{ name: 'sign', expr: 'x > 0 ? 1 : x < 0 ? -1 : 0' }

// Min/Max
{ name: 'min', expr: 'a < b ? a : b' }
{ name: 'max', expr: 'a > b ? a : b' }

// Range clamping
{ name: 'clamped', expr: 'x < 0 ? 0 : x > 100 ? 100 : x' }

// Conditional calculations
{ name: 'discount', expr: 'quantity >= 10 ? price * 0.9 : price' }

// Absolute value
{ name: 'abs', expr: 'x < 0 ? -x : x' }

// EQUALITY OPERATORS (== double equals, === triple equals)
// Note: = (single equals) is NOT supported (assignment operator)

// Exact match with double equals
{ name: 'bonus', expr: 'score == 100 ? 50 : 0' }

// Strict equality with triple equals
{ name: 'match', expr: 'value === target ? 100 : 0' }

// Not equal
{ name: 'penalty', expr: 'status != 1 ? 10 : 0' }

// Switch-like logic
{ name: 'value', expr: 'type == 1 ? 100 : type == 2 ? 200 : 300' }

// Validation with ternary
{ name: 'result', expr: 'x === y ? x * 2 : x + y' }

// COMBINED
// Grading with equality and relational
{ name: 'grade', expr: 'score >= 90 ? 90 : score >= 80 ? 80 : score == 70 ? 70 : 0' }
```

**All comparison operators work beautifully with ternary:**
- **Relational**: `>`, `<`, `>=`, `<=` - for ranges, min/max, conditionals
- **Equality**: `==` (double), `===` (triple), `!=`, `!==` - for exact matches, switches
- **NOT supported**: `=` (single equals) - This is assignment, correctly rejected by parser
- All evaluate to boolean internally → ternary uses boolean → returns **Decimal**
- No boolean/string types exposed - clean, simple, focused on math

**No changes needed** - Works perfectly with current design.

## Summary of Design Decisions

| Feature | Current Status | Maintainer Position | Required Action |
|---------|---------------|---------------------|-----------------|
| **Ternary operators** | ✅ Working | ✅ Liked (Decimal output) | Keep as-is |
| **Comparisons in ternary** | ✅ Working | ✅ **Love this!** | Keep as-is |
| **Standalone comparisons** | ⚠️ Returns undefined | ❌ Should be blocked | **FIX: Throw error** |
| **Single equals (`=`)** | ❌ Rejected | 🤔 **Algebraic equality?** | **DISCUSS: Should be primary?** |
| **Double equals (`==`)** | ✅ Supported | ⚠️ For programmers only? | **DISCUSS: Keep for compatibility?** |
| **Triple equals (`===`)** | ✅ Supported | ❌ Not needed in algebra? | **DISCUSS: Remove?** |
| **Logical operators in ternary** | ✅ Working | ✅ OK (in ternary only) | Keep for ternary |
| **Standalone logical ops** | ⚠️ Returns undefined | ❌ Should be blocked | **FIX: Throw error** |
| **Boolean literals** | ⚠️ Reserved | 🤔 TBD: Reserved vs algebraic | Decide Option 1-3 |
| **String literals** | 🐛 Bug | ❌ Should not be supported | **FIX: Remove** |
| **Boolean in output** | ❌ Not supported | ❌ Don't want | Don't change |
| **String in output** | ❌ Not supported | ❌ Don't want | Don't change |
| **Philosophy** | Mixed | 💡 **"Algebra, not code"** | **Document & implement** |

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

**For this PR:** The analysis is complete with new philosophical insight: **"Algebra, not code"**

### Maintainer's Position
- ✅ **Love the combination:** Comparison operators (`>`, `<`, etc.) with ternary operators
- ✅ Keep ternary operators (Decimal output only) - Already works perfectly
- ✅ Keep comparison operators **in ternary context** - Already works perfectly
- ❌ **Block standalone comparisons** - `a > b` alone should throw error (needs fix)
- ❌ Don't expose boolean/string values in results
- 🐛 String literals are a bug (separate issue to fix)
- 💡 **New philosophy: "Algebra, not code"** - Fundamentally changes operator thinking
- 🤔 **Equals sign discussion:** Should `=` be algebraic equality instead of `==`/`===`?

### The "Algebra, Not Code" Shift

This philosophical insight has major implications:

**Equality operators - Open question:**
1. **Single equals (`=`)** - Natural algebraic equality? Should be primary?
2. **Double equals (`==`)** - Supported only for programmer community?
3. **Triple equals (`===`)** - Not needed in algebraic context?

**In mathematics:** `x = 5` means "x equals 5" (equality), not assignment.
**In evalla:** Variables are defined via `{ name, expr }`, so `=` could mean equality.

**This is a design discussion point** - Should evalla embrace algebraic `=` for equality, or keep programming-style `==`/`===`?

### What Works Today (Keep It!)
```typescript
// Ternary + comparisons work beautifully - exactly what maintainer wants:
await evalla([
  { name: 'x', expr: '15' },
  { name: 'category', expr: 'x > 20 ? 3 : x > 10 ? 2 : x > 0 ? 1 : 0' },
  { name: 'bonus', expr: 'score == 100 ? 50 : 0' },  // Currently ==
  { name: 'sign', expr: 'x > 0 ? 1 : x < 0 ? -1 : 0' }
]);
// All results are Decimal values - clean and simple!
```

**Could become (with algebraic equals):**
```typescript
await evalla([
  { name: 'bonus', expr: 'score = 100 ? 50 : 0' },   // Algebraic =
  { name: 'match', expr: 'value = target ? 100 : 0' } // Natural
]);
```

### What Needs Fixing / Discussing

1. **HIGH PRIORITY:** Block standalone comparisons from returning undefined ⚠️
2. **DISCUSSION:** Should `=` be algebraic equality? 🤔
3. **DISCUSSION:** Should `===` be removed (not needed in algebra)? 🤔
4. **DISCUSSION:** Should `==` be kept only for programmer compatibility? 🤔
5. **Future:** Remove string literal bug 🐛
6. **Future:** Decide on boolean literal keywords 🤔

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

## Special Values: $null, Infinity, and NaN

### Question: What is `$null` for in an algebraic context?

**The maintainer's insight:** "I can only imagine it with an object missing values. What is null in algebra?"

#### In Programming Context
- `null` represents "no value" or "absence of a value"
- Used for optional properties, missing data, undefined state
- Example: `{ x: 10, y: null }` - y is explicitly absent

#### In Algebraic Context
**Null doesn't really exist in pure mathematics/algebra.**

In mathematics:
- Variables have values (numbers)
- Expressions evaluate to numbers
- There's no concept of "no value" - if something doesn't have a value, it's undefined (different concept)

#### When `$null` Might Be Useful in evalla

**Scenario 1: Object property handling**
```typescript
// JSON object with optional properties
{ name: 'config', value: { x: 10, y: null, z: 20 } }
{ name: 'yValue', expr: 'config.y ?? 0' }  // Nullish coalescing
```

**Scenario 2: Sentinel values for "no data"**
```typescript
{ name: 'optionalValue', expr: 'hasData ? value : $null' }
{ name: 'result', expr: 'optionalValue ?? defaultValue' }
```

**Scenario 3: Interoperability with JSON data**
- evalla accepts `value` property with objects
- JSON can contain `null` values
- Need to handle them gracefully

#### Recommendation for `$null`

**Probably NOT needed as a system constant** because:
1. ✅ **Grammar already supports `null` literal** - Can use `null` in expressions
2. ✅ **Nullish coalescing (`??`) works** - Already handles null/undefined
3. ❌ **Not algebraic** - Doesn't map to mathematical concept
4. ⚠️ **Only useful for object handling** - Limited use case

**Alternative:** Keep `null` as a literal (like JavaScript) for object handling, but don't promote it with `$null` system constant.

### Question: Should evalla support Infinity and NaN?

**The maintainer asks:** "Oh I guess we must also support infinity / NaN ??"

#### Mathematical Context

**Infinity in mathematics:**
- Represents unbounded growth or limits
- Not a number, but a concept
- Used in calculus: `lim(x→∞)`
- In some contexts: `1/0 = ∞` (in extended real numbers)

**NaN (Not a Number):**
- Programming concept from IEEE 754 floating point
- Result of undefined operations: `0/0`, `∞-∞`, `√(-1)` (in real numbers)
- **Not a pure mathematical concept** - more of an error state

#### Decimal.js Support

Decimal.js (evalla's numeric engine) **DOES support Infinity and NaN**:

```javascript
new Decimal(Infinity)    // Works: Infinity
new Decimal(1).div(0)    // Returns: Infinity
new Decimal(0).div(0)    // Returns: NaN
new Decimal(NaN)         // Works: NaN
```

**This means evalla already implicitly supports them!**

#### Current State in evalla

**What happens now:**
```typescript
// Division by zero
{ name: 'inf', expr: '1 / 0' }        // Returns Decimal(Infinity)
{ name: 'nan', expr: '0 / 0' }        // Returns Decimal(NaN)
```

Decimal.js handles these cases, so evalla **already supports infinity and NaN** through arithmetic operations.

#### Should We Add `$Infinity` and `$NaN` System Constants?

**Arguments FOR:**
- ✅ Already supported implicitly through arithmetic
- ✅ Useful for mathematical limits and bounds
- ✅ Can use in comparisons: `x > $Infinity ? impossible : possible`
- ✅ Explicit constants are clearer than `1/0`

**Arguments AGAINST:**
- ❌ Not truly "algebraic" - more programming/numerical analysis concepts
- ❌ Can achieve same with arithmetic: `1/0` for infinity
- ❌ Adds complexity to the "algebra, not code" philosophy
- ⚠️ Encourages non-algebraic patterns

#### Comparison with `$true`/`$false`

| Constant | Algebraic? | Already works via | Use case strength |
|----------|-----------|-------------------|-------------------|
| `$true` | ✅ Boolean flag/constant | N/A | ✅ Strong: Named flags |
| `$false` | ✅ Boolean flag/constant | N/A | ✅ Strong: Named flags |
| `$null` | ❌ No math equivalent | `null` literal | ⚠️ Weak: Objects only |
| `$Infinity` | ⚠️ Math concept, not algebra | `1/0` | ⚠️ Medium: Limits/bounds |
| `$NaN` | ❌ Error state, not algebra | `0/0` | ❌ Weak: Error handling |

### Recommendations

#### For `$null`
**Recommendation: NOT needed**
- Keep `null` as a literal for JSON object compatibility
- Don't promote with system constant
- Use case is too narrow (object handling only)
- Not algebraic

#### For `$Infinity`
**Recommendation: MAYBE, if needed for mathematical modeling**
- **PRO:** Legitimate mathematical concept (limits, bounds)
- **PRO:** Clearer than `1/0` magic number
- **CON:** Not pure algebra
- **Decision:** Add if users request it for limit/bound modeling

Example use case:
```typescript
{ name: 'maxBound', expr: '$Infinity' }
{ name: 'result', expr: 'x < maxBound ? x : maxBound' }  // Clamping
```

#### For `$NaN`
**Recommendation: NOT needed**
- Not algebraic - it's an error state
- Can achieve with `0/0` if really needed
- Better to avoid operations that produce NaN
- If you get NaN, something went wrong mathematically

### Summary: Special Values Philosophy

**"Algebra, not code" philosophy applied to special values:**

| Value | Include? | Reason |
|-------|----------|--------|
| `$true` | ✅ YES | Boolean constants for conditional logic |
| `$false` | ✅ YES | Boolean constants for conditional logic |
| `$null` | ❌ NO | Not algebraic; only for object handling |
| `$Infinity` | 🤔 MAYBE | Mathematical limits/bounds - consider if requested |
| `$NaN` | ❌ NO | Error state, not algebraic |

**Core principle:** Include system constants that serve **mathematical/algebraic purposes**, not programming conveniences.

- ✅ **Boolean constants** - Mathematical flags/conditions
- ⚠️ **Infinity** - Mathematical limits (borderline)
- ❌ **Null** - Programming concept
- ❌ **NaN** - Error state

This keeps evalla focused on its identity as a **mathematical expression evaluator**.

## DECISION: true, false, null as First-Class Reserved Value Names

### Maintainer's Decision (Latest Update)

**"I'm leaning into having true and false be first class reserved 'variable names' that cannot be reused by a user. We don't have this concept yet. I guess this includes null. I'm considering these as values, not JavaScript keywords."**

This is a **new concept** in evalla's design - values that are reserved and cannot be used as variable names.

### What This Means

**New category: Reserved Value Names**
- `true`, `false`, `null` are **reserved value names**
- They **cannot be used as user variable names**
- They are **values** (like mathematical constants), not JavaScript keywords
- Similar to how `$math.PI` is a system value, but `true`/`false`/`null` are fundamental enough to not need `$` prefix

### Distinction from JavaScript Keywords

**JavaScript keywords** (allowed as variables in evalla):
```typescript
{ name: 'return', expr: '10' }    // ✅ Allowed - not a value, just a keyword
{ name: 'if', expr: '20' }        // ✅ Allowed - not a value, just a keyword
{ name: 'while', expr: '30' }     // ✅ Allowed - not a value, just a keyword
```

**Reserved value names** (NOT allowed as variables):
```typescript
{ name: 'true', expr: '10' }      // ❌ Not allowed - true is a reserved value
{ name: 'false', expr: '0' }      // ❌ Not allowed - false is a reserved value
{ name: 'null', expr: '0' }       // ❌ Not allowed - null is a reserved value
```

### Current State vs Desired State

**Currently (grammar already does this):**
```pegjs
ReservedLiteral
  = ("true" / "false" / "null") ![a-zA-Z0-9_$]

Identifier
  = !ReservedLiteral name:$([a-zA-Z_$] [a-zA-Z0-9_$]*) { ... }
```

✅ **The grammar already implements this!** `true`, `false`, `null` are already reserved.

**However, there's a test that suggests they CAN be used as variable names:**
```typescript
// From test/keywords.test.ts:
test('reserved literals (true, false, null) are primarily for values', async () => {
  // Can even use as variable name (though discouraged in practice)
  const result2 = await evalla([
    { name: 'true', expr: '10' }
  ]);
  expect(result2.values.true.toString()).toBe('10');
});
```

This test appears to pass, which contradicts the grammar! Need to investigate.

### Implementation Requirements

If `true`, `false`, `null` are to be **first-class reserved value names**:

1. **Grammar: Already correct** ✅
   - `ReservedLiteral` blocks them as identifiers
   
2. **Validation: May need update** ⚠️
   - Check if validation allows these as variable names
   - Should reject with clear error: "Cannot use reserved value name"

3. **Tests: Need update** ⚠️
   - Remove or update test that allows `{ name: 'true', expr: '10' }`
   - Add tests confirming they're rejected as variable names
   - Keep tests showing they work as values in expressions

4. **Documentation: Need update** ⚠️
   - Clarify that `true`, `false`, `null` are reserved **value names**
   - Distinguished from JavaScript keywords (which can be variable names)
   - Explain they're mathematical values, not programming keywords

### Examples After Implementation

```typescript
// Reserved value names - NOT allowed:
{ name: 'true', expr: '10' }           // ❌ Error: reserved value name
{ name: 'false', expr: '0' }           // ❌ Error: reserved value name  
{ name: 'null', expr: '0' }            // ❌ Error: reserved value name

// JavaScript keywords - ALLOWED:
{ name: 'return', expr: '10' }         // ✅ OK: keyword, not a value
{ name: 'if', expr: '20' }             // ✅ OK: keyword, not a value

// Using reserved values in expressions - ALLOWED:
{ name: 'flag', expr: 'true' }         // ✅ OK: using true as a value
{ name: 'check', expr: 'x > 0 ? true : false' }  // ✅ OK: values in ternary
{ name: 'opt', expr: 'value ?? null' } // ✅ OK: using null as a value
```

### Conceptual Model

**Three categories of identifiers in evalla:**

1. **User variables** - Any name (including JS keywords)
   - Examples: `x`, `radius`, `return`, `if`, `myVariable`
   - Defined by users with `{ name, expr }`

2. **System namespaces** - Start with `$`, cannot be user variables
   - Examples: `$math`, `$unit`, `$angle`
   - Provide built-in functions and constants

3. **Reserved value names** - Fundamental values, cannot be user variables (NEW CONCEPT)
   - Examples: `true`, `false`, `null`
   - Built-in values like mathematical constants
   - Not prefixed with `$` because they're fundamental

### Benefits of This Approach

✅ **Clear semantics** - `true` always means boolean true, never a user variable
✅ **Consistency** - Values have stable meanings across all contexts
✅ **Mathematical purity** - Treats boolean values as mathematical entities
✅ **No system prefix needed** - `true` is cleaner than `$true`
✅ **Prevents confusion** - Users can't shadow these fundamental values

### Next Steps

1. **Verify grammar enforcement** - Check if validation actually blocks these names
2. **Update/fix tests** - Remove test allowing `{ name: 'true', expr: '10' }`
3. **Add validation tests** - Confirm rejection with clear error messages
4. **Update documentation** - Explain reserved value names vs keywords

This decision solidifies the **"algebra, not code"** philosophy by treating `true`, `false`, `null` as fundamental mathematical values rather than programming keywords.

## Thoughts on Infinity and NaN as Reserved Value Names

### Testing Results

**Current behavior discovered:**
```typescript
// These all WORK but SHOULDN'T (can shadow the values):
{ name: 'true', expr: '10' }        // ❌ Allows shadowing true
{ name: 'Infinity', expr: '10' }    // ❌ Allows shadowing Infinity  
{ name: 'NaN', expr: '10' }         // ❌ Allows shadowing NaN

// Arithmetic produces Infinity/NaN correctly:
{ name: 'inf', expr: '1 / 0' }      // ✅ Returns Decimal(Infinity)
{ name: 'negInf', expr: '-1 / 0' }  // ✅ Returns Decimal(-Infinity)
{ name: 'nan', expr: '0 / 0' }      // ✅ Returns Decimal(NaN)

// Infinity works in comparisons:
{ name: 'check', expr: 'inf > 10 ? 1 : 0' }  // ✅ Returns 1
```

### Should Infinity Be a Reserved Value Name?

**Arguments FOR including Infinity:**
✅ **Fundamental mathematical concept** - Represents unboundedness, limits
✅ **Already works through arithmetic** - `1/0` produces Infinity
✅ **Useful in comparisons** - `x > Infinity` (always false), `x < Infinity` (always true for finite x)
✅ **Prevents user shadowing** - Ensures `Infinity` always means infinity
✅ **Mathematical modeling** - Useful for bounds, constraints, limits
✅ **Algebraic legitimacy** - Used in extended real number system

**Use cases:**
```typescript
// Maximum bounds
{ name: 'maxValue', expr: 'Infinity' }
{ name: 'clamped', expr: 'x < maxValue ? x : maxValue' }

// Infinity in ternary conditions
{ name: 'category', expr: 'x = Infinity ? 0 : x > 100 ? 3 : 2' }

// Limits
{ name: 'limit', expr: 'value < Infinity ? value : 0' }
```

**My recommendation: ✅ YES - Include Infinity**

Infinity is a legitimate mathematical value (extended reals). It's fundamental enough to deserve reserved status alongside `true`, `false`, `null`.

### Should NaN Be a Reserved Value Name?

**Arguments FOR including NaN:**
⚠️ **Represents undefined operations** - `0/0`, `∞-∞`, `√(-1)` in reals
⚠️ **Already produced by arithmetic** - Division by zero, invalid operations
⚠️ **Prevents user shadowing** - Ensures consistent behavior

**Arguments AGAINST including NaN:**
❌ **Not a mathematical value** - It's an error state, not a number
❌ **Should be avoided** - Indicates something went wrong mathematically
❌ **Not algebraic** - More of a IEEE 754 programming concept
❌ **Less useful in practice** - You generally want to avoid producing NaN

**Use cases are weak:**
```typescript
// Checking for NaN?
{ name: 'check', expr: 'value = NaN ? 0 : value' }  // ⚠️ NaN != NaN in math!

// Better approach: avoid operations that produce NaN
{ name: 'safe', expr: 'denominator = 0 ? 0 : numerator / denominator' }
```

**The problem with NaN:**
- `NaN = NaN` is **false** (NaN doesn't equal itself)
- `NaN > x`, `NaN < x` are all **false**
- It's a "poison value" that propagates through calculations
- Not a value you want to work with intentionally

**My recommendation: ❌ NO - Don't include NaN**

NaN is an **error state**, not a mathematical value. While Decimal.js supports it for IEEE 754 compliance, it doesn't fit the "algebra, not code" philosophy. If an operation produces NaN, it indicates a mathematical error that should be handled differently (validation, error checking), not worked with as a first-class value.

### Proposed Set of Reserved Value Names

**First-class reserved value names (cannot be used as variables):**

| Value | Include? | Rationale |
|-------|----------|-----------|
| `true` | ✅ YES | Fundamental boolean value for conditions |
| `false` | ✅ YES | Fundamental boolean value for conditions |
| `null` | ✅ YES | Absence of value, useful for objects/nullish coalescing |
| `Infinity` | ✅ YES | Mathematical infinity, extended real numbers |
| `-Infinity` | 🤔 Maybe? | Negative infinity (or just use `-Infinity` expression?) |
| `NaN` | ❌ NO | Error state, not a mathematical value |

**Rationale for Infinity:**
- Legitimate mathematical concept (limits, bounds, extended reals)
- Already works perfectly through arithmetic
- Useful in modeling (maximum bounds, limit cases)
- Should be protected from user shadowing

**Rationale against NaN:**
- Not a value you want to work with intentionally
- Indicates mathematical error
- Better to prevent NaN-producing operations
- Can still be produced through arithmetic if needed (`0/0`)

### Implementation Notes

**Currently:** Grammar has `ReservedLiteral` but it doesn't actually block variable names (validation gap)

**Needs implementation:**
1. Add `Infinity` to reserved literals in grammar
2. Add validation to reject `true`, `false`, `null`, `Infinity` as variable names
3. Update tests to verify rejection
4. Document these as reserved value names (not JavaScript keywords)

**Example desired behavior:**
```typescript
// Should all be rejected:
{ name: 'true', expr: '10' }       // ❌ Error: reserved value name
{ name: 'Infinity', expr: '10' }   // ❌ Error: reserved value name
{ name: 'NaN', expr: '10' }        // ✅ OK (NaN not reserved)

// Should all work:
{ name: 'return', expr: '10' }     // ✅ OK: keyword, not a value
{ name: 'x', expr: 'Infinity' }    // ✅ OK: using Infinity as value
{ name: 'check', expr: 'x < Infinity ? 1 : 0' }  // ✅ OK
```

### Summary

**Reserved value names (first-class):**
- ✅ `true`, `false`, `null` - Boolean/null values
- ✅ `Infinity` - Mathematical infinity
- ❌ `NaN` - Not reserved (error state, not a value)

This aligns with "algebra, not code" by treating these as **fundamental mathematical values** rather than programming constructs, while excluding error states (NaN) from first-class status.

## CRITICAL QUESTION: Should Booleans Appear in Outputs?

### The Maintainer's Insight

**"If we go so far as to say they're first class 'named' entities, I suppose then they can have effects that we'd want to see in results."**

This is a **profound shift** in the analysis. If `true`, `false`, `null`, and `Infinity` are first-class reserved value names (like mathematical constants), then their results should arguably be visible in output.

### Example: "Is This Slope Steep?"

```typescript
const result = await evalla([
  { name: 'angle', expr: '45' },
  { name: 'radians', expr: '$angle.toRad(angle)' },
  { name: 'slope', expr: '$math.tan(radians)' },
  { name: 'isSteep', expr: 'slope > 1 ? true : false' }
]);

// Current behavior:
console.log(result.values.isSteep);  // undefined

// If booleans in output:
console.log(result.values.isSteep);  // true (boolean value)
```

**The question:** Should `isSteep` return a boolean value to the user?

### The Logical Consistency Argument

**If we establish that:**
1. `true`, `false`, `null`, `Infinity` are **first-class values** (not keywords)
2. They are **fundamental mathematical entities**
3. They are **reserved** (cannot be shadowed by users)
4. They can be **used in expressions** and **returned from ternary operators**

**Then logically:**
- A variable assigned `true` should have `true` in the output
- A variable assigned `Infinity` should have `Infinity` in the output
- These are **legitimate results**, not intermediate values

### Current Inconsistency

**What works (returns value in output):**
```typescript
{ name: 'pi', expr: '$math.PI' }        // Returns Decimal(3.14159...)
{ name: 'inf', expr: '1 / 0' }          // Returns Decimal(Infinity)
{ name: 'result', expr: 'x > 0 ? 1 : 0' }  // Returns Decimal(1 or 0)
```

**What doesn't work (returns undefined):**
```typescript
{ name: 'flag', expr: 'true' }          // Returns undefined (inconsistent!)
{ name: 'check', expr: 'x > 0 ? true : false' }  // Returns undefined (inconsistent!)
```

**The inconsistency:** If `true` and `Infinity` are both first-class reserved values, why does one appear in output and the other doesn't?

### Two Design Options

#### Option A: First-Class Values → Visible in Output

**Philosophy:** If something is a first-class value, it should be visible in results.

```typescript
interface EvaluationResult {
  values: Record<string, Decimal | boolean | null>;
  order: string[];
}
```

**Behavior:**
```typescript
{ name: 'isSteep', expr: 'slope > 1 ? true : false' }  // Returns true (boolean)
{ name: 'maxBound', expr: 'Infinity' }                 // Returns Infinity (Decimal)
{ name: 'optional', expr: 'hasValue ? value : null' }  // Returns null
{ name: 'x', expr: '10' }                              // Returns Decimal(10)
```

**Pros:**
- ✅ Logically consistent - first-class values are visible
- ✅ Useful for validation flags: `isSteep`, `isValid`, `hasError`
- ✅ Natural semantics - result matches expression intent
- ✅ Infinity already appears as Decimal(Infinity)

**Cons:**
- ⚠️ Output type is now polymorphic: `Decimal | boolean | null`
- ⚠️ Users must handle multiple types
- ⚠️ May confuse "what is evalla?" (still a decimal calculator?)

#### Option B: Reserved Values → Still Internal Only

**Philosophy:** Reserved values are for internal logic only, output is still Decimal-only.

```typescript
interface EvaluationResult {
  values: Record<string, Decimal>;
  order: string[];
}
```

**Behavior:**
```typescript
{ name: 'isSteep', expr: 'slope > 1 ? true : false' }  // Returns undefined
{ name: 'isSteep2', expr: 'slope > 1 ? 1 : 0' }        // Returns Decimal(1)
{ name: 'maxBound', expr: 'Infinity' }                 // Returns Decimal(Infinity)
```

**Pros:**
- ✅ Simple type system - always Decimal
- ✅ Clear identity - evalla is a decimal calculator
- ✅ Users convert booleans to numbers (algebraic convention)

**Cons:**
- ❌ Logically inconsistent - `Infinity` is visible but `true` isn't
- ❌ Less natural - `isSteep` returns undefined instead of true/false
- ❌ Forces workarounds - use 1/0 instead of true/false

### The "Is This Slope Steep?" Test Case

**Option A (Booleans in output):**
```typescript
const result = await evalla([
  { name: 'slope', expr: '$math.tan($angle.toRad(45))' },
  { name: 'isSteep', expr: 'slope > 1 ? true : false' }
]);

console.log(result.values.isSteep);  // true (boolean)
```
✅ **Natural:** The result directly answers the question

**Option B (Decimal-only output):**
```typescript
const result = await evalla([
  { name: 'slope', expr: '$math.tan($angle.toRad(45))' },
  { name: 'isSteep', expr: 'slope > 1 ? 1 : 0' }
]);

console.log(result.values.isSteep);  // Decimal(1)
console.log(result.values.isSteep.toNumber() === 1 ? 'steep' : 'not steep');
```
⚠️ **Works but less natural:** Requires conversion/interpretation

### Recommendation: If First-Class Values → Include in Output

**My position:**

If `true`, `false`, `null`, and `Infinity` are being established as **first-class reserved value names**, then **they should appear in output** for logical consistency.

**Rationale:**
1. **Consistency:** All first-class values should be visible
2. **Semantic clarity:** `isSteep` should return true/false, not 1/0
3. **Natural expressions:** Matches user intent
4. **Infinity already visible:** `Infinity` appears as `Decimal(Infinity)` - extending to boolean is consistent

**Type system:**
```typescript
interface EvaluationResult {
  values: Record<string, Decimal | boolean | null>;
  order: string[];
}
```

**Note:** `Infinity` would still be `Decimal(Infinity)`, not a separate type.

### Alternative: Algebraic Convention (1/0 instead of true/false)

**If wanting to maintain Decimal-only output:**

```typescript
// Algebraic convention: 1 = true, 0 = false
{ name: 'isSteep', expr: 'slope > 1 ? 1 : 0' }        // Returns Decimal(1)
{ name: 'isFlat', expr: 'slope < 0.1 ? 1 : 0' }       // Returns Decimal(1 or 0)
```

**Pros:**
- ✅ Algebraic tradition - boolean algebra uses 1/0
- ✅ Keeps output simple (Decimal only)
- ✅ Still works for all logic

**Cons:**
- ❌ Less semantic - "is it steep?" → "1" (not "yes")
- ❌ Inconsistent if `true`/`false` are first-class values
- ❌ Why have `true`/`false` if we use 1/0?

### The Decision Point

**Key question:** Are `true`, `false`, `null` **mathematical values** or **logical operators**?

**If mathematical values (like π, Infinity):**
→ They should appear in output
→ Type: `Decimal | boolean | null`
→ Example: `isSteep` returns `true`

**If logical operators (like `&&`, `||`):**
→ They power ternary logic only
→ Type: `Decimal` only
→ Example: `isSteep` returns `Decimal(1)`

**The maintainer's perspective seems to lean toward:** They're **values**, which suggests they should be in output.

### Practical Impact

**For the "steep slope" example:**

```typescript
// With boolean output:
const result = await evalla([
  { name: 'angle', expr: '60' },
  { name: 'slope', expr: '$math.tan($angle.toRad(angle))' },
  { name: 'isSteep', expr: 'slope > 1' },  // Would need to allow standalone comparison
  { name: 'category', expr: 'isSteep ? "steep" : "gentle"' }
]);
// isSteep: true, category: "steep" (but strings are a bug!)

// With Decimal output (current):
const result = await evalla([
  { name: 'angle', expr: '60' },
  { name: 'slope', expr: '$math.tan($angle.toRad(angle))' },
  { name: 'steepness', expr: 'slope > 1 ? 1 : 0' }
]);
// steepness: Decimal(1)
```

### Summary

The question "where do we stand on booleans in outputs?" is directly tied to the decision about first-class values.

**If `true`/`false` are first-class mathematical values:**
→ **They should appear in output** (Option A)

**If keeping Decimal-only simplicity:**
→ Use 1/0 convention, don't need `true`/`false` as reserved names

**The maintainer's example ("is it steep?") suggests:** Boolean output would be more natural and useful, which implies **Option A**.

## API Consistency: $ Prefix for Namespaces vs Reserved Values

### The Maintainer's Concern

**"I'm kind of an API nut - and I like consistency. Since we have reserved values, it makes me think that our namespaces might just lose the $ prefix. But they're namespaces, not values."**

This raises an important design question about the `$` prefix convention.

### Current Design

**With `$` prefix:**
- `$math`, `$unit`, `$angle` - Namespaces (contain functions/constants)
- `true`, `false`, `null`, `Infinity` - Reserved values (standalone values)

**Without `$` prefix:**
- Both would look similar: `math.PI`, `unit.mmToInch()`, `true`, `false`

### Why the Distinction Makes Sense

**Namespaces (`$` prefix):**
- Are **containers** of functions and constants
- Accessed via dot notation: `$math.PI`, `$math.sqrt(x)`
- Cannot be used standalone: `$math` alone is meaningless
- Cannot be in comparisons: `x < $math` is nonsensical

**Reserved values (no `$` prefix):**
- Are **standalone values** - complete entities
- Used directly: `true`, `false`, `Infinity`
- Can be in comparisons: `x < Infinity` makes sense
- Can be assigned: `{ name: 'flag', expr: 'true' }`

### The Conceptual Model

```
evalla concepts:

1. User variables (no prefix)
   - Examples: x, radius, slope, return, if
   - Defined by users
   - Can be any identifier (including JS keywords)

2. Namespaces ($ prefix)
   - Examples: $math, $unit, $angle
   - System-provided containers
   - Cannot be used as values
   - Accessed via dot notation only

3. Reserved values (no prefix)
   - Examples: true, false, null, Infinity
   - System-provided fundamental values
   - Cannot be redefined by users
   - Can be used as values, in comparisons, etc.
```

### Why `$true` Feels Different

**The maintainer noted:** "Like we could have used $true - but that felt different."

**Why it feels different:**
- `$true` suggests a namespace member (like `$math.PI`)
- But `true` is a standalone value, not a member of anything
- `true` is more fundamental than even `$math.PI`
- The lack of `$` elevates it to "core language value" status

**Consistency check:**
```typescript
// These feel right:
$math.PI         // Member of math namespace ✅
$unit.mmToInch   // Member of unit namespace ✅
true             // Fundamental value ✅
Infinity         // Fundamental value ✅

// These feel wrong:
$true            // True is not a namespace member ❌
$false           // False is not a namespace member ❌
math.PI          // Without $, looks like user variable ❌
```

### The `$` Convention Is Actually Consistent

**Rule:** `$` prefix indicates **system-provided namespaces**, not individual values.

- Values in namespaces: `$math.PI` (has `$`)
- Standalone reserved values: `true`, `Infinity` (no `$`)
- User variables: `x`, `slope`, `return` (no `$`)

This is **clean and justified**:
- `$` marks system **containers**
- No `$` for standalone values (system or user)
- Clear semantic distinction

### Side Note: Namespace Heads in Comparisons

**Important constraint to document:**

**ILLEGAL:** Using namespace heads (without member access) in comparisons
```typescript
{ name: 'bad', expr: 'x < $math' }       // ❌ Illegal - namespace, not value
{ name: 'bad', expr: '$unit > 5' }       // ❌ Illegal - namespace, not value
```

**LEGAL:** Using namespace members
```typescript
{ name: 'good', expr: 'x < $math.PI' }   // ✅ OK - accessing value
{ name: 'good', expr: '$math.sqrt(x) > 0' }  // ✅ OK - function result
```

**Reason:** Namespaces are containers, not values. Only their members can be used in expressions.

**Implementation:** This should throw a clear error if attempted.

## Better Justification for `$` Prefix: User Freedom

### The Real Reason (From Maintainer)

**"A user doesn't have to say to themselves 'oh, I just wanted to calculate angle of something, but it's a reserved word' and they 'need a reference'. Keep it natural."**

This is the **true justification** for the `$` prefix - not just "marking containers."

### The User Freedom Philosophy

**Without `$` prefix (bad design):**
```typescript
// User wants to calculate angle:
{ name: 'angle', expr: 'atan2(y, x)' }  // ❌ Error: 'angle' is reserved!
// User must rename: angleValue, myAngle, theta, etc. (frustrating!)

// User wants to do math:
{ name: 'math', expr: 'a + b' }  // ❌ Error: 'math' is reserved!
// User must rename: mathResult, calculation, etc. (annoying!)
```

**With `$` prefix (good design):**
```typescript
// System namespace has $ prefix:
{ name: 'result', expr: '$angle.toRad(45)' }  // System function

// User is FREE to use natural names:
{ name: 'angle', expr: 'atan2(y, x)' }        // ✅ User variable (no conflict!)
{ name: 'math', expr: 'a + b' }               // ✅ User variable (no conflict!)
{ name: 'unit', expr: 'kg * m / s^2' }        // ✅ User variable (no conflict!)
```

### Why This Matters

**Users think naturally in domain terms:**
- Geometry: `angle`, `radius`, `diameter`, `arc`
- Physics: `force`, `mass`, `acceleration`, `unit`
- Engineering: `stress`, `strain`, `modulus`
- General: `result`, `value`, `total`, `math`

**The `$` prefix protects user freedom:**
- ✅ Users can use ANY natural name for their domain
- ✅ No surprises: "Oh no, `angle` is reserved!"
- ✅ System names are explicitly marked (won't collide)
- ✅ Future-proof: Can add `$chemistry`, `$physics` without breaking user code

### Contrast with Reserved Values

**Reserved values (`true`, `false`, `null`, `Infinity`):**

**Why no `$` prefix?**
- These are **fundamental mathematical values**, not domain-specific
- Users **wouldn't naturally name variables** `true` or `Infinity`
- These words have **universal mathematical meaning**
- Like mathematical constants (π, e), they're fundamental enough to not need qualification

**Natural naming test:**
```typescript
// Would a user naturally write these?
{ name: 'true', expr: '...' }      // ❌ No - true is a value, not a variable name
{ name: 'Infinity', expr: '...' }  // ❌ No - Infinity is a value, not a quantity
{ name: 'null', expr: '...' }      // ❌ No - null is a concept, not a measurement

// Would a user naturally write these?
{ name: 'angle', expr: '...' }     // ✅ YES - common in geometry
{ name: 'math', expr: '...' }      // ✅ YES - might want to store calculation
{ name: 'unit', expr: '...' }      // ✅ YES - common in physics/engineering
```

### The Complete Picture

**`$` prefix is about USER FREEDOM, not just "marking":**

1. **User freedom:** Can use natural domain names without fear of collision
2. **Explicit system:** System namespaces are clearly marked
3. **Future-proof:** Can add new namespaces without breaking code
4. **Natural:** Users wouldn't name variables `true` or `Infinity`, so those don't need `$`

**The design principle:**
- **Domain-specific system features** → Need `$` (users might want those names)
- **Universal mathematical values** → No `$` (users wouldn't use those names)

### Examples

**User writes geometry code:**
```typescript
// User naturally wants to use:
{ name: 'angle', expr: 'atan2(y, x)' }           // ✅ Works! (no conflict)
{ name: 'radius', expr: 'sqrt(x^2 + y^2)' }      // ✅ Works!
{ name: 'degrees', expr: '$angle.toDeg(angle)' } // ✅ Uses system, no conflict

// If system didn't have $:
{ name: 'angle', expr: '...' }  // ❌ Would error! (reserved by system)
// User forced to rename to: myAngle, angleValue, theta (frustrating)
```

**User writes physics code:**
```typescript
// User naturally wants to use:
{ name: 'force', expr: 'mass * acceleration' }   // ✅ Works!
{ name: 'unit', expr: '"newtons"' }              // ✅ Could work! (no conflict)
{ name: 'meters', expr: '$unit.ftToM(feet)' }    // ✅ Uses system, no conflict
```

### Why Reserved Values Don't Need `$`

**`true`, `false`, `null`, `Infinity` are:**
- Universal (not domain-specific)
- Fundamental (like π, e in math)
- Not variable names (they're values themselves)
- Wouldn't cause natural naming conflicts

**A user writing "is this steep?" wouldn't name a variable `true`:**
```typescript
// Natural user code:
{ name: 'slope', expr: 'rise / run' }
{ name: 'isSteep', expr: 'slope > 1 ? true : false' }  // ✅ Natural

// Unnatural (user wouldn't write):
{ name: 'true', expr: 'slope > 1' }  // ❌ Doesn't make sense as variable name
```

### Summary

**`$` prefix exists to give users FREEDOM:**
- Freedom to use natural domain names
- Freedom from "reserved word" surprises
- Freedom to evolve their code without worrying about future namespace additions

**Reserved values don't need `$` because:**
- They're universal, not domain-specific
- Users wouldn't naturally name variables `true` or `Infinity`
- They're fundamental mathematical entities, not namespaced features

This keeps evalla **natural and user-friendly** while maintaining clear system boundaries.
