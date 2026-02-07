# Implementation Plan: Remove Object Literals from Grammar

**Date:** 2026-02-06  
**Updated:** 2026-02-06 (Keep arrays per maintainer feedback)  
**Based on:** OBJECT_SUPPORT_ANALYSIS.md (Option 3)  
**Maintainer Feedback:** Remove object parsing, add type checking, keep arrays

## Objectives

1. **Remove object literal syntax** from grammar (no more `{x: 10}` in expressions)
2. **Keep array literal syntax** (maintainer decision: arrays are useful for mathematical operations)
3. **Add strong type checking** to prevent comparing with strings/objects
4. **Confirm array bracket access** is working properly (already implemented)
5. **Maintain backward compatibility** for `value` property ingestion

## Current State Analysis

### Already Working ✅
- **Array bracket access:** Grammar line 111 already supports `array[0]` syntax
- **Array literals:** `[1, 2, 3]` in expressions work
- **Value property ingestion:** Objects can be passed via `value` property
- **Property access:** Dot notation `point.x` works for objects in context

### To Remove ❌
- **Object literal syntax in expressions:** `{x: 10, y: 20}` in `expr` field

### To Keep ✅
- **Array literal syntax:** `[1, 2, 3]` in expressions (maintainer decision)
- Arrays are useful for mathematical operations (min, max, statistical functions)
- Arrays can still contain numeric values only (objects blocked by type checking)

## Implementation Steps

### 1. Grammar Changes (grammar.pegjs)

**File:** `packages/evalla/src/grammar.pegjs`

#### 1.1 Remove ObjectLiteral from PrimaryExpression (Keep ArrayLiteral)

**Current (lines 138-143):**
```pegjs
PrimaryExpression
  = Literal
  / ArrayLiteral
  / ObjectLiteral
  / Identifier
  / "(" _ expr:Expression _ ")" { return expr; }
```

**New:**
```pegjs
PrimaryExpression
  = Literal
  / ArrayLiteral
  / Identifier
  / "(" _ expr:Expression _ ")" { return expr; }
```

**Note:** Keep `ArrayLiteral` - arrays are useful for mathematical operations.

#### 1.2 Remove ObjectLiteral definition (lines 211-242)

Delete entire section:
- `ObjectLiteral` rule
- `PropertyList` rule
- `Property` rule
- `PropertyKey` rule

#### 1.3 Keep ArrayLiteral definition (lines 197-209)

**No changes** - arrays remain supported for mathematical operations.

#### 1.4 Remove StringLiteral definition (lines 167-195)

Delete entire section since strings are only used for object keys:
- `StringLiteral` rule
- `DoubleStringCharacter` rule
- `SingleStringCharacter` rule
- `EscapeSequence` rule

**Note:** Keep square bracket syntax in `MemberExpression` for array access.

### 2. Type Checking for Operations (ast-evaluator.ts)

**File:** `packages/evalla/src/ast-evaluator.ts`

#### 2.1 Add Type Validation in evaluateBinaryOp

**Current issue:** `toDecimal()` function accepts any value and converts it

**Add before operator switch:**
```typescript
const evaluateBinaryOp = (operator: string, left: any, right: any): any => {
  // Check for namespace heads in binary operations
  if (isNamespaceHead(left) || isNamespaceHead(right)) {
    throw new EvaluationError(
      'Cannot use namespace head in operations - namespace heads must be used with property access (e.g., $math.PI) or method calls (e.g., $math.abs(x))'
    );
  }
  
  // NEW: Type validation for arithmetic and comparison operators
  const arithmeticOps = ['+', '-', '*', '/', '%', '**'];
  const comparisonOps = ['<', '>', '<=', '>='];
  
  if (arithmeticOps.includes(operator) || comparisonOps.includes(operator)) {
    // Check left operand
    if (typeof left === 'string') {
      throw new EvaluationError(
        `Cannot use string in ${operator} operation - strings are not supported in mathematical expressions`
      );
    }
    if (typeof left === 'object' && !(left instanceof Decimal)) {
      throw new EvaluationError(
        `Cannot use object in ${operator} operation - only numeric values are allowed`
      );
    }
    
    // Check right operand
    if (typeof right === 'string') {
      throw new EvaluationError(
        `Cannot use string in ${operator} operation - strings are not supported in mathematical expressions`
      );
    }
    if (typeof right === 'object' && !(right instanceof Decimal)) {
      throw new EvaluationError(
        `Cannot use object in ${operator} operation - only numeric values are allowed`
      );
    }
  }
  
  // For equality operators, allow any types but provide clear semantics
  if (operator === '==' || operator === '=' || operator === '!=') {
    // Decimals: use Decimal.eq()
    if (left instanceof Decimal && right instanceof Decimal) {
      const equal = left.eq(right);
      return operator === '!=' ? !equal : equal;
    }
    
    // Booleans and null: use === for type-safe comparison
    if (typeof left === 'boolean' || left === null || 
        typeof right === 'boolean' || right === null) {
      const equal = left === right;
      return operator === '!=' ? !equal : equal;
    }
    
    // Mixed types: never equal
    const equal = false;
    return operator === '!=' ? !equal : equal;
  }
  
  const toDecimal = (val: any): Decimal => {
    if (val instanceof Decimal) return val;
    return new Decimal(val);
  };
  
  switch (operator) {
    // ... rest of operators
  }
};
```

#### 2.2 Add Type Validation in evaluateUnaryOp

**For unary minus/plus:**
```typescript
const evaluateUnaryOp = (operator: string, argument: any): any => {
  switch (operator) {
    case '-':
    case '+':
      if (typeof argument === 'string') {
        throw new EvaluationError(
          `Cannot use string with unary ${operator} - strings are not supported in mathematical expressions`
        );
      }
      if (typeof argument === 'object' && !(argument instanceof Decimal)) {
        throw new EvaluationError(
          `Cannot use object with unary ${operator} - only numeric values are allowed`
        );
      }
      if (operator === '-') {
        if (argument instanceof Decimal) {
          return argument.neg();
        }
        return -argument;
      } else {
        if (argument instanceof Decimal) {
          return argument;
        }
        return +argument;
      }
    case '!':
      return !argument;
    default:
      throw new EvaluationError(`Unsupported unary operator: ${operator}`);
  }
};
```

### 3. Remove ObjectExpression Handling (ast-evaluator.ts)

**File:** `packages/evalla/src/ast-evaluator.ts`

**Remove case 'ObjectExpression' (lines 66-78):**
```typescript
// DELETE THIS ENTIRE CASE
case 'ObjectExpression':
  const obj: any = {};
  for (const prop of node.properties) {
    if (prop.type === 'Property') {
      const key = prop.key.type === 'Identifier' ? prop.key.name : await evaluateAST(prop.key, context);
      const value = await evaluateAST(prop.value, context);
      obj[key] = value;
    } else if (prop.type === 'SpreadElement') {
      const spread = await evaluateAST(prop.argument, context);
      Object.assign(obj, spread);
    }
  }
  return obj;
```

### 4. Keep ArrayExpression Handling (ast-evaluator.ts)

**File:** `packages/evalla/src/ast-evaluator.ts`

**No changes** - `ArrayExpression` case remains to support array literals `[1, 2, 3]`.

Arrays are useful for mathematical operations and will be validated by type checking to ensure they contain only valid mathematical values.

### 5. Update Tests

#### 5.1 Rename and Rewrite object-literals.test.ts → value-property-objects.test.ts

**File:** `packages/evalla/test/value-property-objects.test.ts` (new name)

**Keep these tests (using `value` property):**
- `deeply nested property access` (already uses `value`)

**Rewrite these tests to use `value` property:**
- `object literals and property access` → `objects via value property`
- `nested object property access` → `nested objects via value property`
- `multiple objects with property access` → `multiple objects via value property`
- `object with namespace functions` → `object with namespace functions via value`
- `object dependencies in topological order` → `object dependencies via value`

**Update to keep arrays but remove objects:**
- `array of objects with property access` → Split into:
  - Array passed via `value` with objects in it (keep)
  - Array literals with numeric values (update to keep: `[1, 2, 3, 4, 5]`)

**Update to keep arrays:**
- Update test that previously removed arrays with objects:
  - Keep: `array of objects with property access` but pass array via `value` property

**Add new tests:**
- `array literals with numeric values` - Test `[1, 2, 3, 4, 5]` works in expressions
- `array access via value property` - Pass array via `value`, access with `arr[0]`

#### 5.2 Update syntax-checker.test.ts

**File:** `packages/evalla/test/syntax-checker.test.ts`

**Update string literals test:**
```typescript
test('string literals not allowed', () => {
  expect(checkSyntax('"hello"').valid).toBe(false);
  expect(checkSyntax("'world'").valid).toBe(false);
});
```

**Add new tests:**
```typescript
test('object literals not allowed in expressions', () => {
  expect(checkSyntax('{x: 10}').valid).toBe(false);
  expect(checkSyntax('{x: 10, y: 20}').valid).toBe(false);
});

test('array literals ARE allowed in expressions', () => {
  expect(checkSyntax('[1, 2, 3]').valid).toBe(true);
  expect(checkSyntax('[10, 20, 30, 40]').valid).toBe(true);
});

test('array bracket access still allowed', () => {
  expect(checkSyntax('arr[0]').valid).toBe(true);
  expect(checkSyntax('arr[i + 1]').valid).toBe(true);
  expect(checkSyntax('matrix[i][j]').valid).toBe(true);
});
```

#### 5.3 Add Type Checking Tests

**File:** `packages/evalla/test/type-checking.test.ts` (new file)

```typescript
import { evalla } from '../src/index';
import { EvaluationError } from '../src/errors';

describe('Type checking in operations', () => {
  test('arithmetic with objects should error', async () => {
    await expect(evalla([
      { name: 'obj', value: {x: 10} },
      { name: 'result', expr: 'obj + 5' }
    ])).rejects.toThrow(EvaluationError);
  });
  
  test('comparison with objects should error', async () => {
    await expect(evalla([
      { name: 'obj', value: {x: 10} },
      { name: 'result', expr: 'obj > 5' }
    ])).rejects.toThrow(EvaluationError);
  });
  
  test('arithmetic with arrays should error', async () => {
    await expect(evalla([
      { name: 'arr', value: [1, 2, 3] },
      { name: 'result', expr: 'arr * 2' }
    ])).rejects.toThrow(EvaluationError);
  });
  
  test('unary minus with object should error', async () => {
    await expect(evalla([
      { name: 'obj', value: {x: 10} },
      { name: 'result', expr: '-obj' }
    ])).rejects.toThrow(EvaluationError);
  });
  
  test('equality with mixed types', async () => {
    const result = await evalla([
      { name: 'num', expr: '10' },
      { name: 'bool', expr: 'true' },
      { name: 'equal', expr: 'num == bool' }
    ]);
    expect(result.values.equal).toBe(false);
  });
  
  test('equality with same types', async () => {
    const result = await evalla([
      { name: 'a', expr: 'true' },
      { name: 'b', expr: 'true' },
      { name: 'equal', expr: 'a == b' }
    ]);
    expect(result.values.equal).toBe(true);
  });
});
```

### 6. Update Playground Examples and UI

**File:** `packages/playground/src/data/examples.ts`

**Update examples that used object literals:**

```typescript
objects: {
  name: 'Object properties',
  expressions: [
    // Remove this example - will need new UI for value property
    // See section 6.1 below for UI implementation
  ]
},

nestedObjects: {
  name: 'Deep nested objects',
  expressions: [
    // Remove this example - will need new UI for value property
    // See section 6.1 below for UI implementation
  ]
},

mathMinMax: {
  name: '$math - Min/Max',
  expressions: [
    // OLD: { name: 'values', expr: '{a: 42, b: 17, c: 99, d: 8}' },
    // NEW: Use array literal (arrays are still supported!)
    { name: 'values', expr: '[42, 17, 99, 8]' },
    { name: 'minVal', expr: '$math.min(values[0], values[1], values[2], values[3])' },
    { name: 'maxVal', expr: '$math.max(values[0], values[1], values[2], values[3])' },
    { name: 'range', expr: 'maxVal - minVal' }
  ]
}
```

**Note:** Arrays can still be created in expressions, so array examples continue to work.

#### 6.1 Playground UI Enhancement (Future Work)

**Maintainer's proposal:** Each expression row should support two input modes:
1. **Expression mode:** Textbox for mathematical expressions (current)
2. **Value mode:** Textarea for JSON object/array values (new)

**Implementation approach:**
- Mode cannot be changed after row creation
- Separate "Add Expression" and "Add Value" buttons
- Value mode shows textarea that accepts JSON
- Expression mode shows textbox (current behavior)

**Files to modify:**
- `packages/playground/src/components/PlaygroundApp.tsx`
- Add `mode: 'expr' | 'value'` to expression state
- Conditional rendering based on mode
- JSON validation for value mode
- Two add buttons in UI

**This UI work is out of scope for the current grammar changes** but documented here for future implementation.

### 7. Update Documentation

**File:** `packages/evalla/README.md` (master source)

#### 7.1 Update "Input Format" Section

**Current mentions of object creation - update to:**
```markdown
### Input Format

The `value` property allows you to pass structured data (objects) directly. Arrays can also be created in expressions or passed via `value`.

**Using expressions:**
```typescript
const result = await evalla([
  { name: 'width', expr: '100' },
  { name: 'height', expr: '50' },
  { name: 'data', expr: '[1, 2, 3, 4, 5]' }  // Arrays work in expressions!
]);
```

**Using direct values (objects and arrays):**
```typescript
const result = await evalla([
  { name: 'point', value: { x: 10, y: 20 } },  // Objects via value
  { name: 'data', value: [1, 2, 3, 4, 5] }     // Arrays via value
]);
```

**Note:** Objects cannot be created within expressions. 
Arrays CAN be created in expressions: `[1, 2, 3]`. 
Use the `value` property to pass objects, then access 
properties with dot notation or brackets in expressions.
```

#### 7.2 Add "Working with Structured Data" Section

```markdown
## Working with Structured Data

evalla focuses on mathematical expressions. Objects must be passed via 
the `value` property, but arrays can be created in expressions or passed 
via `value`.

### Object Property Access (via value property)

```typescript
const result = await evalla([
  { name: 'point', value: { x: 10, y: 20 } },
  { name: 'distance', expr: '$math.sqrt(point.x**2 + point.y**2)' }
]);

console.log(result.values.distance.toString()); // "22.360679..."
```

### Array Element Access (expression or value)

Arrays can be created directly in expressions or passed via `value`:

```typescript
// Create array in expression
const result = await evalla([
  { name: 'data', expr: '[10, 20, 30, 40, 50]' },
  { name: 'first', expr: 'data[0]' },
  { name: 'third', expr: 'data[2]' },
  { name: 'sum', expr: 'data[0] + data[1] + data[2]' }
]);

console.log(result.values.first.toString());  // "10"
console.log(result.values.sum.toString());    // "60"
```

Or pass via value property:
```typescript
const result = await evalla([
  { name: 'data', value: [10, 20, 30, 40, 50] },
  { name: 'average', expr: '(data[0] + data[1] + data[2] + data[3] + data[4]) / 5' }
]);
```

### Nested Structures

```typescript
const result = await evalla([
  { 
    name: 'config', 
    value: { 
      dimensions: { width: 1920, height: 1080 },
      scale: 2 
    } 
  },
  { name: 'scaledWidth', expr: 'config.dimensions.width / config.scale' },
  { name: 'scaledHeight', expr: 'config.dimensions.height / config.scale' }
]);

console.log(result.values.scaledWidth.toString());  // "960"
console.log(result.values.scaledHeight.toString()); // "540"
```

### Why No Object Literals?

evalla follows an "Algebra, not code" philosophy. Expressions should 
be mathematical operations, not data structure construction. This keeps 
evalla focused on its core purpose: safe, precise mathematical evaluation.

**Objects:** Use `value` property (not algebraic)  
**Arrays:** Use `expr` for literals `[1, 2, 3]` or `value` property (algebraic for vectors/lists)  
**Mathematical operations:** Use `expr` field  
**Result:** Clean separation of concerns
```

#### 7.3 Update Examples Section

Update examples that show object creation - use `value` property instead.
Arrays can still be shown: `[1, 2, 3, 4, 5]`.

#### 7.4 Sync Documentation

After updating master README:
```bash
npm run sync-readme
```

### 8. Build and Test

#### 8.1 Rebuild Parser
```bash
npm run build:parser
```

#### 8.2 Build Package
```bash
npm run build:evalla
```

#### 8.3 Run All Tests
```bash
npm test
```

#### 8.4 Run Specific Test Suites
```bash
npm test -- value-property-objects.test.ts
npm test -- type-checking.test.ts
npm test -- syntax-checker.test.ts
```

### 9. Breaking Changes Documentation

**File:** `BREAKING_CHANGES_v2.md` (new file)

```markdown
# Breaking Changes in v2.0.0

## Removed: Object Literals in Expressions (Arrays Still Supported!)

**What changed:**
- Object literals (`{x: 10, y: 20}`) can no longer be used in expressions
- Array literals (`[1, 2, 3]`) STILL WORK in expressions (kept per maintainer decision)

**Why:**
- Maintains "Algebra, not code" philosophy
- Objects are data structures, not algebraic values
- Arrays are algebraic (vectors, lists) and useful for mathematical operations
- Clear separation: expressions = math (including arrays), value property = external data

**Migration:**

### Objects
```typescript
// Before (v1.x)
{ name: 'point', expr: '{x: 10, y: 20}' }

// After (v2.x) - Use value property
{ name: 'point', value: {x: 10, y: 20} }

// Property access still works the same
{ name: 'sum', expr: 'point.x + point.y' }
```

### Arrays (No Changes Required!)
```typescript
// Still works in v2.x - arrays are kept!
{ name: 'data', expr: '[1, 2, 3, 4, 5]' }
{ name: 'first', expr: 'data[0]' }
{ name: 'sum', expr: 'data[0] + data[1] + data[2]' }

// Can also use value property if preferred
{ name: 'data', value: [1, 2, 3, 4, 5] }
```

## Added: Strong Type Checking

**What changed:**
- Arithmetic operations (+, -, *, /, %, **) now reject strings and objects
- Comparison operations (<, >, <=, >=) now reject strings and objects
- Unary operations (+, -) now reject strings and objects
- Arrays are allowed in operations where they make sense

**Why:**
- Prevents confusing runtime behavior
- Clearer error messages
- Type safety for mathematical operations

**Impact:**
- Code that passed strings/objects to math operations will now throw errors
- This is intentional - such operations were not meaningful anyway
```

## Summary of Changes

### Files to Modify
1. `packages/evalla/src/grammar.pegjs` - Remove ObjectLiteral, StringLiteral (keep ArrayLiteral)
2. `packages/evalla/src/ast-evaluator.ts` - Add type checking, remove ObjectExpression (keep ArrayExpression)
3. `packages/evalla/test/object-literals.test.ts` → `value-property-objects.test.ts` - Rewrite tests
4. `packages/evalla/test/syntax-checker.test.ts` - Update tests
5. `packages/evalla/test/type-checking.test.ts` - New test file
6. `packages/playground/src/data/examples.ts` - Update examples
7. `packages/evalla/README.md` - Update documentation
8. `BREAKING_CHANGES_v2.md` - New file

### Files to Build
1. Parser regeneration: `npm run build:parser`
2. Package build: `npm run build:evalla`
3. Full build: `npm run build`

### Tests to Run
1. All tests: `npm test`
2. Specific: `npm test -- value-property-objects.test.ts type-checking.test.ts`

## Timeline

1. **Review updated plan** with maintainer (awaiting approval)
2. **Implement changes** in order (grammar → evaluator → tests → examples → docs)
3. **Test thoroughly** after each major change
4. **Update version** to 2.0.0 in package.json
5. **Playground UI enhancement** - decide if now or later
6. **Publish** with breaking changes notice

## Risk Assessment

**Low Risk:**
- Grammar changes are well-defined
- Type checking additions are isolated
- Value property continues to work

**Medium Risk:**
- Playground examples need careful updating
- Documentation needs comprehensive rewrite

**High Risk:**
- Users with object literals in expressions will break (arrays continue to work)
- Need clear migration guide and version bump

**Mitigation:**
- Comprehensive test coverage
- Clear error messages
- Detailed migration guide
- Semantic versioning (2.0.0)

## Resolved Questions

### 1. Arrays - Keep or Remove? ✅ RESOLVED
**Answer:** Keep arrays (maintainer decision)
- Arrays are useful for mathematical operations
- Algebraic concept (vectors, lists)
- Examples: `[1, 2, 3]`, `$math.min(...array elements)`

### 2. Playground Examples - Keep or Remove? ✅ RESOLVED  
**Answer:** Keep, but need UI enhancement
- Current UI only supports expression textboxes
- Future enhancement: Add textarea for JSON values
- Each row has either expression textbox OR value textarea
- Mode cannot be swapped after creation
- Separate "Add Expression" and "Add Value" buttons
- Object examples will be restored once UI is implemented

### 3. Any Other Open Questions?
**Please review and confirm:**
- Type checking approach (reject strings/objects in arithmetic/comparisons)
- Breaking change acceptable for v2.0.0
- Timeline for implementation
- Playground UI enhancement: implement now or later?
