# Decision Status: What's Firmed Up vs Open Questions

## FIRMED UP ✅ (Ready to Implement)

### 1. Reserved Value Names
**DECISION: Implement first-class reserved value names**
- ✅ `true` - Cannot be user variable name
- ✅ `false` - Cannot be user variable name
- ✅ `null` - Cannot be user variable name
- ✅ `Infinity` - Cannot be user variable name
- ✅ `NaN` - NOT reserved (users can shadow if needed)

**Status:** FIRMED UP - Ready for implementation

---

### 2. Ternary Operators
**DECISION: Keep as-is (work perfectly)**
- ✅ Allow ternary operators with comparisons
- ✅ Return Decimal (or boolean if enabling boolean output)

**Status:** FIRMED UP - Already working, no changes needed

---

### 3. Comparisons in Ternary Context
**DECISION: Keep working (already perfect)**
- ✅ `a > b ? 10 : 20` works beautifully
- ✅ All comparison operators work (>, <, >=, <=, ==, ===, !=, !==)
- ✅ Infinity works in comparisons

**Status:** FIRMED UP - Keep as-is

---

### 4. String Literals
**DECISION: Remove (bug)**
- ❌ Remove string literals from grammar
- ✅ Exception: Keep for JSON object property keys only

**Status:** FIRMED UP - Needs implementation (removal)

---

### 5. `$` Prefix Philosophy
**DECISION: Keep `$` for user freedom**
- ✅ `$` prefix for system namespaces (gives users freedom to use natural names)
- ✅ No `$` for reserved values (universal fundamentals)
- **Justification:** Users can use `angle`, `math`, `unit` as variables without conflicts

**Status:** FIRMED UP - Clear rationale established

---

### 6. Namespace Head Restriction
**DECISION: Block namespace heads in comparisons**
- ❌ `x < $math` should error (namespace not a value)
- ✅ `x < $math.PI` works (accessing member)

**Status:** FIRMED UP - Needs implementation

---

### 7. NaN Exclusion
**DECISION: Do NOT reserve NaN**
- ❌ Not a first-class value (error state)
- ✅ Can still be produced via `0/0`
- ✅ Users can shadow if they want

**Status:** FIRMED UP - Excluded from reserved values

---

## OPEN QUESTIONS 🤔 (Need Decision)

### 1. Boolean Values in Output ⚠️ CRITICAL
**Question:** Should boolean values appear in evaluation results?

**Option A:** Include booleans in output
```typescript
interface EvaluationResult {
  values: Record<string, Decimal | boolean | null>;
}
```
- ✅ Pro: First-class values should be visible ("is it steep?" → `true`)
- ⚠️ Con: Polymorphic output type

**Option B:** Keep Decimal-only output
```typescript
interface EvaluationResult {
  values: Record<string, Decimal>;
}
```
- ✅ Pro: Simple type system
- ❌ Con: `isSteep` returns undefined or forces 1/0 convention

**Maintainer's lean:** "If they're first class 'named' entities, I suppose then they can have effects we'd want to see in results" → **Suggests Option A**

**STATUS:** 🔴 **OPEN** - Leaning toward Option A but needs final confirmation

---

### 2. Standalone Comparisons ⚠️ CRITICAL
**Question:** Should standalone comparisons be allowed if boolean output is enabled?

**Current:** `{ name: 'check', expr: 'a > b' }` returns undefined (should error)

**If boolean output is ENABLED:**
```typescript
{ name: 'check', expr: 'a > b' }  // Could return true/false (boolean)
```

**If boolean output is DISABLED:**
```typescript
{ name: 'check', expr: 'a > b' }  // Should throw error (no boolean output)
```

**STATUS:** 🔴 **OPEN** - Depends on Question #1 (boolean output decision)

---

### 3. Equality Operator: `=` vs `==` vs `===` ⚠️ IMPORTANT
**Question:** Which equality operators should be supported?

**Option A:** Single equals only (pure algebraic)
- `=` for equality (like math)
- Remove `==` and `===`

**Option B:** Single + double equals (gradual/compatible)
- `=` primary (algebraic)
- `==` for programmer community
- Remove `===`

**Option C:** Keep current (pragmatic)
- Keep `==` and `===`
- Don't add `=`

**Maintainer's lean:** "We support a single equals sign - and have no need for a triple equals and a double would be supported only for supporting a programmer community"
→ **Suggests Option B (support both `=` and `==`, remove `===`)**

**STATUS:** 🟡 **MOSTLY FIRMED UP** - Leaning toward Option B, just needs final confirmation

---

### 4. Standalone Logical Operations
**Question:** Should `a && b`, `a || b`, `!a` be allowed standalone?

**Depends on:** Boolean output decision (Question #1)

**If boolean output enabled:** Could allow (returns boolean)
**If boolean output disabled:** Should error (no boolean output)

**STATUS:** 🔴 **OPEN** - Depends on Question #1

---

## Summary

### READY TO IMPLEMENT (7 decisions firmed up)
1. ✅ Reserved value names: `true`, `false`, `null`, `Infinity`
2. ✅ NaN NOT reserved
3. ✅ Ternary operators (keep)
4. ✅ Comparisons in ternary (keep)
5. ✅ Remove string literals
6. ✅ `$` prefix for user freedom
7. ✅ Block namespace heads in comparisons

### NEEDS FINAL DECISION (4 open questions)
1. 🔴 **Boolean output:** Include boolean/null in results? (CRITICAL - blocks #2 and #4)
2. 🔴 **Standalone comparisons:** Allow if boolean output enabled? (Depends on #1)
3. 🟡 **Equality operator:** `=` + `==` (remove `===`)? (MOSTLY DECIDED - Option B)
4. 🔴 **Standalone logical ops:** Allow if boolean output enabled? (Depends on #1)

### The Critical Path

**ONE decision blocks the rest: Boolean output (Question #1)**

Once decided:
- If YES → Allow standalone comparisons/logical ops (return boolean)
- If NO → Block standalone comparisons/logical ops (error)

**Maintainer's lean based on "is it steep?" example:** → Enable boolean output

**If we enable boolean output, then we're essentially firmed up on everything.**

### Recommended Decision

Based on all discussions, **my recommendation:**

1. **Enable boolean output** ✅
   - Type: `Decimal | boolean | null`
   - Natural semantics for "is it steep?" → `true`
   
2. **Allow standalone comparisons** ✅ (consequence of #1)
   - `{ name: 'isSteep', expr: 'slope > 1' }` returns `true`
   
3. **Support `=` and `==`, remove `===`** ✅
   - `=` for algebraic equality
   - `==` for programmer community
   - No need for `===`
   
4. **Allow standalone logical ops** ✅ (consequence of #1)
   - `{ name: 'bothValid', expr: 'a && b' }` returns boolean

This creates a **clean, natural mathematical expression evaluator** with first-class boolean values.
