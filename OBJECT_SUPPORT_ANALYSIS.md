# Object Support Analysis Report

**Date:** 2026-02-06  
**Status:** Analysis/Discussion (No Implementation)  
**Issue:** Objects can be ingested and created but aren't output - should we change this?

## Executive Summary

evalla currently has **partial object support**: objects can be created via JSON-like syntax (`{x: 10, y: 20}`) and ingested via the `value` property, but they **cannot appear in the output**. Objects are stored in the internal context for property access (e.g., `point.x`) but are excluded from `EvaluationResult.values`. This report analyzes the implications of full object support and provides recommendations.

**Recommendation:** **Option 3** - Eliminate dynamic object creation syntax, keep value-only ingestion with clear documentation.

## Current State

### What Works Today

1. **Object Creation via Expression Syntax**
   ```typescript
   { name: 'point', expr: '{x: 10, y: 20}' }
   { name: 'nested', expr: '{display: {width: 1920, height: 1080}, scale: 2}' }
   ```

2. **Object Ingestion via Value Input**
   ```typescript
   { name: 'config', value: {dimensions: {width: 100, height: 50}}} }
   ```

3. **Property Access (Dot Notation)**
   ```typescript
   { name: 'sum', expr: 'point.x + point.y' }
   { name: 'scaledWidth', expr: 'config.display.width / config.scale' }
   ```

4. **Array Literals with Objects**
   ```typescript
   { name: 'points', expr: '[{x: 1, y: 2}, {x: 3, y: 4}]' }
   { name: 'firstX', expr: 'points[0].x' }
   ```

5. **Object Spread Operator (Partially Implemented)**
   - The AST evaluator has code for `SpreadElement` (lines 73-76 in ast-evaluator.ts)
   - Not currently in the grammar (no spread syntax like `...obj`)
   - Appears to be future-proofing code

### What Doesn't Work

1. **Objects Cannot Appear in Output**
   ```typescript
   const result = await evalla([
     { name: 'point', expr: '{x: 10, y: 20}' }
   ]);
   
   console.log(result.values.point); // undefined!
   // The object exists in internal context but isn't in output
   ```

2. **Arrays Cannot Appear in Output**
   - Same issue as objects - exist in context but not in `values`

3. **Strings Are Restricted**
   - String literals (`"hello"`) are **only** allowed as object property keys
   - Cannot use strings as standalone values or in expressions
   - This is by design to keep evalla focused on mathematics

## Current Output Type System

```typescript
interface EvaluationResult {
  values: Record<string, Decimal | boolean | null>;
  order: string[];
}
```

**Supported output types:**
- `Decimal` - All numeric values (including `Infinity`)
- `boolean` - From comparisons, literals (`true`, `false`)
- `null` - The null literal

**Implementation in index.ts (lines 108-125):**
```typescript
if (result instanceof Decimal) {
  values[name] = result;
  context[name] = result;
} else if (typeof result === 'boolean' || result === null) {
  values[name] = result;
  context[name] = result;
} else {
  // Objects/arrays are stored in context for dot-access but not in output values
  context[name] = result;
}
```

## Implications of Full Object Support

### If We Allow Objects in Output

#### 1. Type System Expansion
```typescript
interface EvaluationResult {
  values: Record<string, Decimal | boolean | null | object | any[]>;
  order: string[];
}
```

**Problems:**
- Breaks type safety - consumers must now handle arbitrary objects
- `any[]` opens Pandora's box for array element types
- Loss of clear contract about what evalla returns

#### 2. Spread Operator (`...`)
If objects are first-class outputs, users will naturally expect:
```typescript
{ name: 'point', expr: '{x: 10, y: 20}' }
{ name: 'point2', expr: '{...point, z: 30}' }  // Create shallow copy with z
```

**Implications:**
- Requires implementing spread syntax in grammar
- Shallow vs deep copy semantics
- Performance considerations for large objects

#### 3. String Type Support
Objects naturally lead to string properties and values:
```typescript
{ name: 'person', expr: '{name: "John", age: 30}' }
```

**Problems:**
- String operations (concat, split, substring, etc.)
- String comparisons and equality
- Escaping and encoding issues
- This was supposed to be a **math library**

#### 4. Array Sub-Types
Arrays of what? Numbers? Objects? Mixed?
```typescript
{ name: 'data', expr: '[1, "hello", {x: 10}, true, null]' }  // Valid?
```

**Problems:**
- Array methods (map, filter, reduce, etc.)
- Type checking nightmare
- Performance implications

#### 5. Method Support
Do objects get methods? What about JSON compatibility?
```typescript
{ name: 'point', value: {
    x: 10,
    y: 20,
    distance: function() { return Math.sqrt(this.x**2 + this.y**2); }
  }}
```

**Problems:**
- Security concerns (already blocking function aliasing)
- Serialization challenges
- "Algebra, not code" philosophy violated

### Breaking Changes
If we add full object support:
- **Breaking:** Existing code expecting only `Decimal | boolean | null` breaks
- **Breaking:** Type guards in consuming applications need updates
- **Versioning:** Would require major version bump (1.0.0 → 2.0.0)

## Design Philosophy Conflict

### "Algebra, not code"
evalla's core philosophy is mathematical expressions, not programming:

**Current Alignment:**
- ✅ Numbers (Decimal) - Mathematical values
- ✅ Boolean - Mathematical comparisons and logic
- ✅ null - Missing/undefined in mathematical sense
- ✅ Infinity - Mathematical infinity (1/0)

**Problematic Additions:**
- ❌ Strings - Programming construct, not algebraic
- ❌ Complex objects - Data structures, not mathematical values
- ❌ Arrays with mixed types - Programming concept
- ❌ Object methods - Code, not algebra

### Current Use Case: Intermediate Data Structures
Objects work perfectly as **intermediate** values:
```typescript
{ name: 'point', expr: '{x: 10, y: 20}' },
{ name: 'distance', expr: '$math.sqrt(point.x**2 + point.y**2)' }
```
- Input: User needs structured data
- Processing: Dot-access for calculations
- Output: **Mathematical result** (distance as Decimal)

This pattern keeps evalla focused on mathematics while allowing convenient data organization.

## Options Analysis

### Option 1: Full Object Support
**Add objects/arrays to output type system**

**Pros:**
- Most flexible for users
- Natural extension of current partial support
- Enables data structure transformations

**Cons:**
- Breaks "Algebra, not code" philosophy
- Opens Pandora's box for strings, methods, etc.
- Breaking change to type system
- Type safety loss
- Feature creep into general-purpose language territory
- Maintenance burden increases dramatically

**Verdict:** ❌ Not recommended - fundamentally changes evalla's identity

### Option 2: Status Quo
**Keep current behavior - objects in context only**

**Pros:**
- No breaking changes
- Maintains philosophy
- Works for current use cases

**Cons:**
- Confusing for users (can create but not output)
- Asymmetric API (input ≠ output)
- Undocumented limitation
- Grammar supports creation but output doesn't support it

**Verdict:** ⚠️ Acceptable but confusing

### Option 3: Remove Object Creation, Keep Value Ingestion ⭐ RECOMMENDED
**Eliminate `{x: 10}` syntax in expressions, keep `value` property**

**Changes:**
```typescript
// ❌ Remove from grammar - no longer allowed in expressions
{ name: 'point', expr: '{x: 10, y: 20}' }

// ✅ Keep - value property for external data
{ name: 'point', value: {x: 10, y: 20} }

// ✅ Keep - property access still works
{ name: 'sum', expr: 'point.x + point.y' }
```

**Pros:**
- Clear separation: JSON input (external data) vs mathematical expressions (algebra)
- Maintains "Algebra, not code" - expressions are pure math
- No breaking changes for `value` property users
- Simpler mental model: expressions are math, values are data
- Consistent with mathematical notation (you don't write objects in algebra)
- Reduces grammar complexity

**Cons:**
- Breaking change for those using `{...}` syntax in expressions
- Some examples in playground would need updating
- Less flexible for creating structured data from calculations

**Migration Path:**
```typescript
// Before (expression-based object creation)
{ name: 'point', expr: '{x: 10, y: 20}' }

// After (use value property or decompose)
{ name: 'point', value: {x: 10, y: 20} }
// OR
{ name: 'pointX', expr: '10' }
{ name: 'pointY', expr: '20' }
```

**Verdict:** ✅ Best balance - maintains philosophy while keeping useful features

### Option 4: Remove All Object Support
**Eliminate both object creation and value ingestion**

**Pros:**
- Simplest mental model
- Purest mathematical approach
- Smallest API surface

**Cons:**
- Breaks existing users of `value` property
- Forces flat variable structure for complex scenarios
- Loses convenient data organization
- Too restrictive for practical use

**Verdict:** ❌ Too extreme - throws out useful features

## Recommended Approach: Option 3

### Implementation Plan

1. **Grammar Changes**
   - Remove `ObjectLiteral` from `PrimaryExpression` in grammar.pegjs
   - Remove `ArrayLiteral` from `PrimaryExpression`
   - Keep property access (`MemberExpression`) for dot-notation
   - This makes objects only ingestible, not creatable in expressions

2. **Documentation Updates**
   - Master README (`packages/evalla/README.md`)
   - Clarify: `value` property accepts objects for structured input data
   - Clarify: Objects accessible via dot-notation but not output
   - Add "Design Philosophy" section explaining why objects aren't first-class

3. **Test Updates**
   - Update `test/object-literals.test.ts`
   - Remove tests that create objects via expressions
   - Keep tests that use `value` property
   - Keep tests for property access

4. **Example Updates**
   - Update `packages/playground/src/data/examples.ts`
   - Convert object creation examples to use `value` property
   - Keep property access examples

5. **Type System**
   - No changes needed - already correct
   - `EvaluationResult.values: Record<string, Decimal | boolean | null>`

6. **Migration Guide**
   - Add MIGRATION.md documenting the change
   - Provide examples of converting expression-based to value-based
   - Version as breaking change (bump major version)

### Alternative: Keep Status Quo with Better Documentation

If breaking changes are unacceptable right now, keep current behavior but add clear documentation:

1. **README Section: "Object Handling"**
   ```markdown
   ## Object Handling
   
   evalla supports objects as **intermediate values** for structured data,
   but they do not appear in the output. This keeps output focused on 
   mathematical results.
   
   ### Creating Objects
   Objects can be created in expressions or passed via the `value` property:
   
   // In expressions
   { name: 'point', expr: '{x: 10, y: 20}' }
   
   // Via value property
   { name: 'config', value: {width: 100, height: 50} }
   
   ### Property Access
   Access object properties using dot notation in expressions:
   
   { name: 'area', expr: 'config.width * config.height' }
   
   ### Important: Objects Don't Appear in Output
   Objects are stored internally for calculations but **not included in 
   `result.values`**. Only `Decimal`, `boolean`, and `null` values appear
   in output, keeping evalla focused on mathematical results.
   ```

2. **Add FAQ Section**
   ```markdown
   ## FAQ
   
   **Q: Why can't I see my object in the output?**
   A: evalla is a mathematical evaluator focused on numeric, boolean, and 
   null results. Objects serve as intermediate data structures for 
   organizing inputs and accessing properties, but the final output 
   contains only mathematical values.
   
   **Q: What if I need structured output?**
   A: Decompose your results into individual variables:
   ```typescript
   // Instead of trying to output {x: 10, y: 20}
   { name: 'x', expr: 'point.x' },
   { name: 'y', expr: 'point.y' }
   ```

## Security Considerations

Current protections that must be maintained regardless of option chosen:
- Property access blocks: `__proto__`, `constructor`, `prototype`
- Function aliasing prevention
- No `eval()` or `Function()` usage
- AST-based evaluation only

If objects become first-class (Option 1), additional concerns:
- Object method calls (security risk)
- Prototype chain manipulation
- Property injection attacks
- Serialization vulnerabilities

## Performance Considerations

Current approach (objects in context only):
- ✅ Minimal memory overhead
- ✅ No serialization needed for output
- ✅ Fast property access for calculations

Full object support would require:
- Deep cloning for immutability
- Serialization for safe output
- Type checking overhead
- Larger memory footprint

## User Impact Analysis

### Breaking Change Assessment (Option 3)

**Who's affected:**
- Users creating objects with `{...}` syntax in expressions
- Examples in playground using object literals

**Not affected:**
- Users passing objects via `value` property ✅
- Users doing property access with dot notation ✅
- 90%+ of math-focused use cases ✅

**Migration effort:**
- Low - simple syntax change
- Automated migration possible (find/replace patterns)

### Expected User Questions

**"Why can't I create objects in expressions anymore?"**
> evalla is a mathematical expression evaluator, not a programming language.
> Objects are data structures for organizing inputs - use the `value` property
> to pass them in. Expressions should focus on mathematical operations.

**"How do I work with structured data?"**
> Pass objects via the `value` property and access properties with dot notation
> in your mathematical expressions. Output will be the calculated mathematical
> values, not the objects themselves.

## Comparison with Other Libraries

### math.js
- Supports objects via scope variables
- Objects are not first-class values in expressions
- Similar to evalla's current approach

### expr-eval
- No object literal syntax
- Variables only (similar to our `value` property)
- Pure mathematical focus

### jsonpath / jq
- Full object/JSON manipulation
- Different purpose (data transformation, not math)
- Not comparable

**Conclusion:** evalla's current/proposed approach aligns with mathematical evaluators.

## Recommendations Summary

### Primary Recommendation: Option 3
**Remove object creation syntax from expressions, keep `value` ingestion**

**Rationale:**
1. Maintains "Algebra, not code" philosophy
2. Clear separation: expressions = math, value = data
3. Prevents feature creep into programming language territory
4. Keeps output type system clean and predictable
5. Reduces user confusion about what can/cannot be output

### Implementation Priority
1. **Documentation First (Immediate)** - Add clarity about current behavior
2. **Community Feedback (1-2 weeks)** - Discuss with users
3. **Grammar Change (v2.0.0)** - Breaking change if consensus reached
4. **Migration Guide** - Help users transition

### If Breaking Changes Are Not Acceptable
**Document current behavior clearly** and add "Object Handling" section to README explaining:
- Objects are intermediate values only
- How to use `value` property for input
- Why output is mathematical values only
- How to decompose structured results

## Appendix: Code References

### Current Object Handling
- **Grammar:** `packages/evalla/src/grammar.pegjs` lines 211-242 (ObjectLiteral, ArrayLiteral)
- **Evaluator:** `packages/evalla/src/index.ts` lines 116-124 (objects excluded from output)
- **AST Evaluator:** `packages/evalla/src/ast-evaluator.ts` lines 66-78 (ObjectExpression evaluation)
- **Tests:** `packages/evalla/test/object-literals.test.ts` (7 tests, all use objects as intermediate)
- **Examples:** `packages/playground/src/data/examples.ts` (objects, nestedObjects, mathMinMax)

### Related Design Decisions
- **Type System:** `packages/evalla/src/types.ts` lines 9-12 (EvaluationResult)
- **Reserved Values:** `packages/evalla/src/index.ts` lines 34-40 (true, false, null, Infinity)
- **Philosophy:** `.github/copilot-instructions.md` (Three-tier identifier model, design principles)

## Conclusion

evalla has **partial object support by design, not by accident**. Objects serve as a practical way to organize input data and enable property access in calculations, while the output remains focused on mathematical results (`Decimal`, `boolean`, `null`).

The current state creates some user confusion because the grammar allows object creation but they don't appear in output. **Option 3** (remove object creation syntax, keep value ingestion) provides the cleanest solution:

- ✅ Maintains mathematical focus
- ✅ Prevents scope creep
- ✅ Clear mental model
- ✅ Keeps useful features (value property, dot-access)
- ✅ Aligned with design philosophy

**Next Steps:**
1. Get maintainer feedback on this analysis
2. Decide between Option 3 (breaking change) or better documentation (no breaking change)
3. If Option 3: Draft migration guide and implement changes
4. If documentation: Write comprehensive "Object Handling" section

---

**Report prepared by:** GitHub Copilot Analysis Agent  
**Context:** Issue discussion about objects in evalla  
**Recommendation:** Option 3 - Remove object creation syntax, keep value ingestion
