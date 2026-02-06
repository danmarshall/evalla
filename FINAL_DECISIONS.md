# FINAL DECISIONS - All Confirmed ✅

## Status: READY TO IMPLEMENT

All design decisions have been finalized. No open questions remain.

---

## 1. Reserved Value Names ✅ CONFIRMED
**First-class reserved values that cannot be user variable names:**
- ✅ `true` - Boolean value
- ✅ `false` - Boolean value  
- ✅ `null` - Absence of value
- ✅ `Infinity` - Mathematical infinity
- ❌ `NaN` - NOT reserved (error state, users can shadow)

**Implementation:** Needs validation to reject these as variable names

---

## 2. Boolean Output ✅ CONFIRMED
**Decision: YES - Include booleans in output**

```typescript
interface EvaluationResult {
  values: Record<string, Decimal | boolean | null>;
  order: string[];
}
```

**Rationale:**
- First-class values should be visible
- "Is it steep?" → returns `true` (boolean), not `undefined`
- Semantic clarity and consistency

**Maintainer quote:** "boolean should be in results (i thought that was clear. well it is now 🤓)"

**Implementation:** Update type definitions and evaluator logic

---

## 3. Standalone Comparisons ✅ CONFIRMED
**Decision: ALLOW (consequence of boolean output)**

```typescript
{ name: 'isSteep', expr: 'slope > 1' }  // Returns: true (boolean) ✅
```

**Since boolean output is enabled, standalone comparisons can return boolean values.**

**Implementation:** Remove the "should error" restriction, allow boolean return

---

## 4. Standalone Logical Operations ✅ CONFIRMED
**Decision: ALLOW (consequence of boolean output)**

```typescript
{ name: 'bothValid', expr: 'a && b' }  // Returns: boolean ✅
{ name: 'either', expr: 'x || y' }     // Returns: boolean ✅
{ name: 'negated', expr: '!flag' }     // Returns: boolean ✅
```

**Implementation:** Allow boolean return values

---

## 5. Equality Operators ✅ CONFIRMED
**Decision: Support `=` and `==`, remove `===`**

- ✅ `=` (single equals) - Primary algebraic equality
- ✅ `==` (double equals) - For "friends in the venn diagram" (programmer community)
- ❌ `===` (triple equals) - Remove (not achievable in Decimal.js context, no need)

**Maintainer quote:** "single and double equals (for friends in the venn diagram) / no triple because thats probably not even achievable? and no need."

**Examples:**
```typescript
{ name: 'match', expr: 'x = 5 ? 100 : 0' }   // Algebraic equality
{ name: 'check', expr: 'x == y ? 1 : 0' }    // Programmer-friendly
```

**Implementation:** 
- Add `=` to grammar as comparison operator
- Keep `==` 
- Remove `===` from grammar

---

## 6. Ternary Operators ✅ CONFIRMED
**Decision: Keep as-is**

Already working perfectly. Can now return Decimal OR boolean depending on branches.

```typescript
{ name: 'value', expr: 'x > 0 ? 10 : 20' }       // Returns Decimal
{ name: 'flag', expr: 'x > 0 ? true : false' }   // Returns boolean
```

**Implementation:** No changes needed

---

## 7. String Literals ✅ CONFIRMED
**Decision: Remove (except object property keys)**

❌ Not allowed in expressions or ternary results
✅ Exception: JSON object property names

**Implementation:** Remove from grammar, keep only for object literal keys

---

## 8. `$` Prefix Convention ✅ CONFIRMED
**Decision: Keep `$` for system namespaces**

**Rationale (from maintainer):**
1. **User freedom:** Users can use natural names (`angle`, `math`, `unit`) without conflicts
2. **Future-proofing:** Can add `$interest`, `$statistic`, `$chemistry` without colliding with user code
3. **No `$` for reserved values:** `true`, `Infinity` are universal - users wouldn't name variables that

**Three-tier model:**
- User variables (no prefix): `x`, `angle`, `math`, `unit`
- System namespaces (`$`): `$math`, `$unit`, `$angle`
- Reserved values (no prefix): `true`, `false`, `null`, `Infinity`

**Implementation:** Keep current design

---

## 9. Namespace Head Restriction ✅ CONFIRMED
**Decision: Block namespace heads in comparisons**

```typescript
{ name: 'bad', expr: 'x < $math' }      // ❌ Error: namespace not a value
{ name: 'good', expr: 'x < $math.PI' }  // ✅ OK: comparing to value
```

**Implementation:** Add validation to throw error

---

## 10. NaN Exclusion ✅ CONFIRMED
**Decision: Do NOT reserve NaN**

- Users can shadow `NaN` if needed
- Can still produce via `0/0`
- It's an error state, not a first-class value

**Implementation:** No action needed (already not reserved)

---

## Summary: All Decisions Finalized

### READY TO IMPLEMENT (10 confirmed decisions):

1. ✅ Reserved value names: `true`, `false`, `null`, `Infinity`
2. ✅ Boolean output: Include `boolean` and `null` in results
3. ✅ Standalone comparisons: ALLOW (return boolean)
4. ✅ Standalone logical ops: ALLOW (return boolean)
5. ✅ Equality operators: `=` and `==` (remove `===`)
6. ✅ Ternary operators: Keep as-is
7. ✅ String literals: Remove (except object keys)
8. ✅ `$` prefix: Keep for user freedom and future-proofing
9. ✅ Namespace heads: Block in comparisons
10. ✅ NaN: NOT reserved

### NO OPEN QUESTIONS REMAIN ✅

All design decisions are complete and ready for implementation.

---

## Implementation Checklist

### HIGH PRIORITY

- [ ] **Type system:** Update `EvaluationResult.values` to `Decimal | boolean | null`
- [ ] **Evaluator:** Include boolean/null values in output (not just Decimal)
- [ ] **Validation:** Reject reserved value names (`true`, `false`, `null`, `Infinity`)
- [ ] **Grammar:** Add `=` as comparison operator
- [ ] **Grammar:** Remove `===` operator
- [ ] **Allow standalone comparisons:** Return boolean instead of error
- [ ] **Allow standalone logical ops:** Return boolean instead of error

### MEDIUM PRIORITY

- [ ] **Grammar:** Remove string literals (except object property keys)
- [ ] **Validation:** Block namespace heads in comparisons (`x < $math`)
- [ ] **Tests:** Add comprehensive boolean output tests
- [ ] **Tests:** Add `=` equality operator tests

### DOCUMENTATION

- [ ] **README:** Document reserved values
- [ ] **README:** Document boolean output
- [ ] **README:** Document `=` vs `==` equality
- [ ] **README:** Philosophy section (user freedom, future-proofing)
- [ ] **Examples:** Boolean use cases ("is it steep?")
- [ ] **Migration guide:** If needed for breaking changes

---

## Philosophy Summary

**"Algebra, not code"**
- evalla is a mathematical expression evaluator
- Reserved values are universal fundamentals (like π, e)
- `$` prefix gives user freedom to use natural domain names
- Boolean values as first-class mathematical entities
- Algebraic equality (`=`) as primary, `==` for programmer community

**User freedom and future-proofing:**
- Users can name variables `angle`, `math`, `unit`, `interest` without conflicts
- System can add `$interest`, `$statistic`, `$chemistry` without breaking user code
- Clean, predictable, scalable design
