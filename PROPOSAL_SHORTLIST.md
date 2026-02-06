# evalla Design Proposal - Shortlist

## Overall Proposal Summary

Based on the "Algebra, not code" philosophy, this proposal establishes clear semantics for values, operators, and outputs in evalla.

---

## 1. Reserved Value Names (NEW CONCEPT)

**First-class reserved values that cannot be used as user variable names:**

- ✅ `true` - Boolean value
- ✅ `false` - Boolean value
- ✅ `null` - Absence of value
- ✅ `Infinity` - Mathematical infinity
- ❌ `NaN` - Not reserved (error state, can still be produced via `0/0`)

**Status:** New concept - needs implementation
- Grammar declares `ReservedLiteral` but validation doesn't enforce
- Should throw error: "Cannot use reserved value name: true"

---

## 2. Boolean Values in Output

**If establishing first-class reserved values → Include in output**

```typescript
interface EvaluationResult {
  values: Record<string, Decimal | boolean | null>;
  order: string[];
}
```

**Examples:**
```typescript
{ name: 'isSteep', expr: 'slope > 1 ? true : false' }  // Returns: true (boolean)
{ name: 'max', expr: 'Infinity' }                       // Returns: Decimal(Infinity)
{ name: 'x', expr: '10' }                              // Returns: Decimal(10)
```

**Rationale:** First-class values should be visible in results for consistency and semantic clarity.

---

## 3. Equality Operator: Single Equals

**Use `=` for algebraic equality (not `==` or `===`)**

In mathematics: `x = 5` means "x equals 5" (equality, not assignment)

**Proposed:**
- ✅ `=` - Primary equality operator (algebraic)
- ⚠️ `==` - Optional for programmer community
- ❌ `===` - Remove (no loose vs strict in algebra)

**Examples:**
```typescript
{ name: 'bonus', expr: 'score = 100 ? 50 : 0' }    // Natural algebra
{ name: 'match', expr: 'x = y ? 1 : 0' }           // Clear equality
```

**Status:** Needs grammar change to support `=` as comparison operator

---

## 4. Ternary Operators

**Keep ternary operators - work perfectly**

```typescript
{ name: 'result', expr: 'a > b ? 10 : 20' }        // ✅ Works
{ name: 'sign', expr: 'x > 0 ? 1 : x < 0 ? -1 : 0' }  // ✅ Works
```

**Status:** Already implemented, keep as-is

---

## 5. Comparison Operators

**Support in ternary context, block standalone usage**

**Relational:** `>`, `<`, `>=`, `<=`
**Equality:** `=` (or `==` for compatibility)

**Allow:**
```typescript
{ name: 'result', expr: 'a > b ? 10 : 20' }  // ✅ In ternary
```

**Block:**
```typescript
{ name: 'check', expr: 'a > b' }  // ❌ Error: standalone comparison
```

**Status:** 
- Ternary usage works ✅
- Standalone returns undefined (needs fix to throw error) ⚠️

---

## 6. String Literals

**Remove string literal support (except object property names)**

**Block:**
```typescript
{ name: 'text', expr: '"hello"' }     // ❌ Error
{ name: 'grade', expr: 'score > 90 ? "A" : "B"' }  // ❌ Error
```

**Allow (object keys only):**
```typescript
{ name: 'obj', expr: '{x: 10, "weird-name": 20}' }  // ✅ OK
```

**Status:** Currently allowed (bug), needs removal

---

## 7. API Consistency: $ Prefix

**`$` prefix for namespaces (containers), not individual values**

**Namespaces (with `$`):**
- `$math`, `$unit`, `$angle` - System containers
- Cannot be used as values
- Members accessed via dot: `$math.PI`, `$unit.mmToInch(x)`

**Reserved values (without `$`):**
- `true`, `false`, `null`, `Infinity` - Standalone values
- Can be used directly in expressions
- More fundamental than namespace members

**Rationale:** `$` marks system **containers**, not individual values. This is clean and consistent.

---

## 8. Namespace Head Restriction

**ILLEGAL: Using namespace heads in comparisons**

```typescript
{ name: 'bad', expr: 'x < $math' }      // ❌ Error: namespace not a value
{ name: 'bad', expr: '$unit > 5' }      // ❌ Error: namespace not a value
```

**LEGAL: Using namespace members**
```typescript
{ name: 'good', expr: 'x < $math.PI' }  // ✅ OK: value from namespace
```

**Status:** Should throw error, may need implementation

---

## Implementation Priorities

### HIGH PRIORITY
1. **Enforce reserved value names** - Reject `true`, `false`, `null`, `Infinity` as variable names
2. **Block standalone comparisons** - Throw error instead of returning undefined
3. **Add boolean/null to output type** - Update interface and evaluator

### MEDIUM PRIORITY
4. **Add single equals (`=`)** - Support algebraic equality operator
5. **Remove string literals** - Except in object property keys
6. **Namespace head validation** - Block comparisons with namespace heads

### DOCUMENTATION
7. **Update README** - Document reserved values, equality operator
8. **Add examples** - Show boolean output, comparison usage
9. **Philosophy section** - Explain "algebra, not code"

---

## Conceptual Model

```
evalla has three types of identifiers:

1. User Variables (no special prefix)
   - Any identifier except reserved values
   - Includes JavaScript keywords: return, if, while
   - Examples: x, slope, return, myValue

2. System Namespaces ($ prefix)
   - Containers of functions and constants
   - Cannot be used as standalone values
   - Examples: $math, $unit, $angle

3. Reserved Value Names (no prefix, cannot be user variables)
   - Fundamental mathematical values
   - Cannot be shadowed by users
   - Examples: true, false, null, Infinity
```

---

## Type System

```typescript
interface EvaluationResult {
  values: Record<string, Decimal | boolean | null>;
  order: string[];
}
```

**Value types:**
- `Decimal` - All numeric values (including `Infinity`)
- `boolean` - `true` or `false`
- `null` - Absence of value

---

## Philosophy

**"Algebra, not code"**

- Reserved values are mathematical entities, not programming keywords
- Equality is `=` (algebraic), not `==` (programming)
- Variables can use JavaScript keywords (return, if) - they're just symbols
- Focus on mathematical semantics over programming conventions
- Decimal precision for all numeric operations
- Ternary operators for conditional logic (like piecewise functions)
