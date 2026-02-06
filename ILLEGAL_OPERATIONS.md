# Illegal Operations and Restrictions in evalla

This document compiles all illegal operations, restrictions, and validation rules discovered during the boolean/ternary operator analysis.

---

## 1. Variable Name Restrictions

### Cannot Start with `$`
```typescript
{ name: '$myVar', expr: '10' }  // ❌ Error: $ reserved for system namespaces
```
**Reason:** `$` prefix is reserved for system-provided namespaces (`$math`, `$unit`, `$angle`). This prevents user collision with system functionality and provides clear namespace freedom for future expansion.

**Status:** ✅ Already enforced (validation in index.ts line 21-26)

---

### Cannot Start with `__` (Double Underscore)
```typescript
{ name: '__private', expr: '10' }  // ❌ Error: __ reserved for security
```
**Reason:** Double underscore prefix reserved for security reasons (prevents prototype pollution and internal property access).

**Status:** ✅ Already enforced (validation in index.ts line 27-32)

---

### Cannot Start with a Number
```typescript
{ name: '5x', expr: '10' }  // ❌ Error: Cannot start with number
```
**Reason:** Standard identifier rules - must start with letter, `_`, or `$`.

**Status:** ✅ Already enforced (validation in index.ts line 33-38)

---

### Cannot Contain Dots
```typescript
{ name: 'my.var', expr: '10' }  // ❌ Error: Dots only for property access
```
**Reason:** Dots are reserved for property access in expressions (`obj.prop`), not for variable names.

**Status:** ✅ Already enforced (validation in index.ts line 39-44)

---

### Cannot Use Reserved Value Names
```typescript
{ name: 'true', expr: '10' }      // ❌ Error: Reserved value name
{ name: 'false', expr: '10' }     // ❌ Error: Reserved value name
{ name: 'null', expr: '10' }      // ❌ Error: Reserved value name
{ name: 'Infinity', expr: '10' }  // ❌ Error: Reserved value name
```
**Reason:** These are first-class mathematical values that should have stable, consistent meanings. They cannot be shadowed by users.

**Status:** ⚠️ NOT ENFORCED - Grammar declares `ReservedLiteral` but validation doesn't check. **Needs implementation.**

---

## 2. Expression Restrictions

### Standalone Comparisons Not Allowed
```typescript
{ name: 'x', expr: 'a > b' }      // ❌ Error: Standalone comparison
{ name: 'y', expr: 'x == 5' }     // ❌ Error: Standalone comparison
{ name: 'z', expr: 'a === b' }    // ❌ Error: Standalone comparison
```
**Reason:** evalla focuses on Decimal outputs. Comparisons should only be used in ternary operators to produce Decimal results, not boolean results.

**Correct usage:**
```typescript
{ name: 'result', expr: 'a > b ? 10 : 20' }  // ✅ OK: Returns Decimal
```

**Status:** ⚠️ Currently returns `undefined` instead of throwing error. **Needs fix.**

---

### Standalone Logical Operations Not Allowed
```typescript
{ name: 'x', expr: 'a && b' }     // ❌ Error: Standalone logical operation
{ name: 'y', expr: 'a || b' }     // ❌ Error: Standalone logical operation
{ name: 'z', expr: '!a' }         // ❌ Error: Standalone logical operation
```
**Reason:** Same as comparisons - logical operations evaluate to booleans and should only be used in ternary context.

**Correct usage:**
```typescript
{ name: 'result', expr: 'a && b ? 100 : 0' }  // ✅ OK: Returns Decimal
```

**Status:** ⚠️ Currently returns `undefined` instead of throwing error. **Needs fix.**

**EXCEPTION:** If boolean output is enabled, these may be allowed to return boolean values directly.

---

### String Literals Not Allowed
```typescript
{ name: 'text', expr: '"hello"' }     // ❌ Error: String literals not supported
{ name: 'grade', expr: 'score > 90 ? "A" : "B"' }  // ❌ Error: Strings in ternary
```
**Reason:** evalla is a mathematical expression evaluator. Strings are a programming concept, not algebraic. They dilute the library's focus.

**Exception - Object property keys:**
```typescript
{ name: 'obj', expr: '{x: 10, "weird-name": 20}' }  // ✅ OK: Property name
```

**Status:** ⚠️ Currently allowed (bug). **Needs removal** from grammar (except in object literal property keys).

---

### Namespace Heads in Comparisons Not Allowed
```typescript
{ name: 'bad', expr: 'x < $math' }     // ❌ Error: Namespace not a value
{ name: 'bad', expr: '$unit > 5' }     // ❌ Error: Namespace not a value
{ name: 'bad', expr: '$angle == x' }   // ❌ Error: Namespace not a value
```
**Reason:** Namespaces are containers (like modules), not values. You cannot compare a container to a number.

**Correct usage:**
```typescript
{ name: 'good', expr: 'x < $math.PI' }         // ✅ OK: Comparing to value
{ name: 'good', expr: '$math.sqrt(x) > 0' }    // ✅ OK: Comparing function result
```

**Status:** ⚠️ May not be enforced. **Needs validation.**

---

### Booleans in Arithmetic Not Allowed
```typescript
{ name: 'result', expr: 'true + 5' }   // ❌ Error: Cannot use boolean in arithmetic
{ name: 'calc', expr: 'false * 10' }   // ❌ Error: Cannot use boolean in arithmetic
```
**Reason:** Type safety - booleans are not numbers. This prevents confusion and enforces clear semantics.

**Status:** ✅ Already enforced by Decimal.js - throws error: "Invalid argument: true"

---

### Function Aliasing Not Allowed
```typescript
{ name: 'mySqrt', expr: '$math.sqrt' }  // ❌ Error: Cannot alias functions
```
**Reason:** Security - functions must be called with parentheses, not assigned to variables. This prevents function aliasing attacks.

**Status:** ✅ Already enforced (security check in evaluator.ts)

---

## 3. Implicit Rules

### Assignment Operator Not Supported
```typescript
{ name: 'x', expr: 'a = 5' }  // ❌ Error: = treated as assignment (not supported)
```
**Current:** Single equals `=` is rejected by parser as assignment operator.

**Proposed:** Change to support `=` as algebraic equality operator (like `==`).

**Status:** Grammar rejects `=`, needs change if adopting algebraic equality.

---

### Variables Must Have Expression or Value
```typescript
{ name: 'x' }  // ❌ Error: Must have expr or value
```
**Reason:** Every variable must be defined - either by expression or direct value.

**Status:** ✅ Already enforced (validation in index.ts)

---

## 4. Summary of Illegal Operations

**Variable naming:**
1. ❌ Cannot start with `$` (system namespaces)
2. ❌ Cannot start with `__` (security)
3. ❌ Cannot start with number
4. ❌ Cannot contain dots
5. ❌ Cannot use reserved value names: `true`, `false`, `null`, `Infinity` **(needs enforcement)**

**Expression restrictions:**
6. ❌ Cannot use standalone comparisons (return undefined, should error) **(needs fix)**
7. ❌ Cannot use standalone logical operations (return undefined, should error) **(needs fix)**
8. ❌ Cannot use string literals (bug, needs removal) **(needs fix)**
9. ❌ Cannot use namespace heads in comparisons **(needs validation)**
10. ❌ Cannot use booleans in arithmetic (enforced by Decimal.js)
11. ❌ Cannot alias functions (security, already enforced)
12. ❌ Cannot use assignment operator `=` (currently, may change)

**Total identified: 12 illegal operations/restrictions**
