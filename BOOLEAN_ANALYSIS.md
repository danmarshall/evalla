# Boolean and Ternary Operator Analysis

## Executive Summary

This document analyzes the costs, benefits, and trade-offs of exposing boolean values in evalla's evaluation results. The grammar **already fully supports** booleans, ternary operators, and logical operations internally - the question is whether to expose boolean results in the output.

## Current State

### What Already Works
- ✅ **Grammar parsing**: Boolean literals (`true`, `false`, `null`), ternary operator (`? :`), comparison operators (`>`, `<`, `==`, etc.), and logical operators (`&&`, `||`, `!`, `??`) are all parsed correctly
- ✅ **Internal evaluation**: Booleans work perfectly in conditions and logical expressions
- ✅ **String literals**: String values are also parsed and evaluated internally
- ✅ **Type safety**: Attempting to use booleans in arithmetic operations correctly throws an error

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

Boolean values are evaluated but **not included in the output** - they're treated like objects/arrays (available in context for references but not in results).

## Question 1: Why Include Strings?

**Answer**: The grammar already supports string literals and they're used in the codebase:

```typescript
// Example from syntax-checker.test.ts
checkSyntax('"hello"').valid // true
checkSyntax("'world'").valid  // true

// Ternary operators can return strings
{ name: 'grade', expr: 'score >= 90 ? "A" : "B"' }
```

If we expose booleans in output, strings face the same question: they're evaluated internally but not exposed. For consistency, if booleans are exposed, strings should be too.

## Cost-Benefit Analysis

### Benefits of Exposing Booleans

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
