# Date Type Support in evalla - Comprehensive Analysis and Implications

## Executive Summary

This document analyzes whether evalla should support Date types, exploring three implementation options and their implications. Special attention is given to the collision between dates and decimals, and what this means for the type system and user experience.

**Key Finding:** Dates already work via the `value` property, but a `$date` namespace wrapping Day.js would provide superior UX while maintaining type safety.

---

## Table of Contents

1. [Current State](#current-state)
2. [Three Implementation Options](#three-implementation-options)
3. [Critical Issue: Date-Decimal Collision](#critical-issue-date-decimal-collision)
4. [Consumer Impact: If Date Were a First-Class Output Type](#consumer-impact-if-date-were-a-first-class-output-type)
5. [Implications Analysis](#implications-analysis)
6. [Recommendation](#recommendation)
7. [Open Questions](#open-questions)

---

## Current State

### Dates Work Today (via value property)

```typescript
const result = await evalla([
  { name: 'start', value: new Date('2024-01-01') },
  { name: 'end', value: new Date('2024-01-15') },
  { name: 'startMs', expr: 'start.getTime()' },
  { name: 'endMs', expr: 'end.getTime()' },
  { name: 'diffDays', expr: '(endMs - startMs) / (1000 * 60 * 60 * 24)' }
]);

// Works perfectly today:
console.log(result.values.diffDays.toString()); // "14"
console.log(result.values.start); // undefined (dates stay in context)
```

**How it works:**
- Date objects passed via `value` property
- Date methods accessible in expressions
- Results are Decimal numbers (timestamps, components)
- Date objects do NOT appear in output

---

## Three Implementation Options

### Option 1: Add Date as First-Class Output Type ❌

**What it means:**
```typescript
interface EvaluationResult {
  values: Record<string, Decimal | boolean | null | Date>;  // Add Date
}
```

**Problems:**
- **BREAKING CHANGE** - Changes output type signature
- Violates "Algebra, not code" philosophy
- Operator ambiguity (what does `date1 + date2` mean?)
- Timezone complexity
- Formatting complexity
- Maintenance burden

**Verdict:** Not recommended

### Option 2: Use Existing value Property (Status Quo) ✅

**What it means:**
- Continue using `value` property for dates
- Access via native JavaScript Date API
- Manual calculations with magic numbers

**Pros:**
- Already works
- No code changes needed
- No breaking changes
- No dependencies

**Cons:**
- Verbose
- Magic numbers (`1000 * 60 * 60 * 24`)
- No date arithmetic helpers
- User must know Date API

**Verdict:** Works, but not ideal

### Option 3: Add $date Namespace ✅ (Recommended)

**What it means:**
```typescript
// Clean, expressive API
$date.parse('2024-01-15')     // → Decimal(1705276800000)
$date.year(timestamp)         // → Decimal(2024)
$date.add(ts, 7, "day")       // → Decimal(new timestamp)
$date.diff(ts1, ts2, "day")   // → Decimal(7)
```

**Pros:**
- Clean API without magic numbers
- Date arithmetic built-in
- Consistent with $math, $unit, $angle
- No breaking changes (returns Decimal/boolean)
- Tiny bundle impact (2KB for Day.js)

**Cons:**
- New dependency (Day.js)
- Implementation effort (4-6 hours)
- Maintenance responsibility

**Verdict:** Best balance of UX and complexity

---

## Critical Issue: Date-Decimal Collision

### The Problem

**When a Date object encounters Decimal.js, it gets converted to a timestamp:**

```javascript
const date = new Date('2024-01-15T12:30:00Z');
const decimal = new Decimal(date);

console.log(decimal.toString());  // "1705321800000"
console.log(typeof decimal);       // "object" (Decimal instance)
console.log(date.getFullYear());   // 2024 ✅
console.log(decimal.getFullYear()); // undefined ❌
```

### What Happens

1. **Conversion Mechanism:**
   - `new Decimal(date)` calls `date.valueOf()`
   - `valueOf()` returns milliseconds since Unix epoch
   - Result: Decimal(1705321800000)

2. **Methods Are Lost:**
   - Original Date has methods: `getFullYear()`, `getMonth()`, etc.
   - Converted Decimal only has Decimal methods: `plus()`, `minus()`, etc.
   - Date methods are permanently lost after conversion

3. **Irreversible:**
   - Once converted to Decimal, cannot get Date object back
   - Timestamp is just a number
   - No way to know it was originally a Date

### What This Means

#### For Option 1 (Date as First-Class Type) - FATAL FLAW

```typescript
// User expects:
interface EvaluationResult {
  values: Record<string, Decimal | boolean | null | Date>;
}

// User writes:
const result = await evalla([
  { name: 'birthday', expr: '$date.parse("1990-05-15")' }
]);

// User expects:
result.values.birthday.getFullYear();  // Should return 1990

// But what happens:
// 1. $date.parse returns Date object
// 2. evalla stores it: new Decimal(dateObj) 
// 3. Date becomes Decimal(643939200000)
// 4. User gets Decimal, not Date
result.values.birthday.getFullYear();  // ❌ TypeError: not a function

// This is a BROKEN CONTRACT - type says Date, but it's a Decimal!
```

**Why this is fatal:**
- Type signature promises `Date` objects
- Reality delivers `Decimal` timestamps
- User code breaks unexpectedly
- No way to prevent the conversion (Decimal.js is core to evalla)

#### For Option 2 (value property) - Works

```typescript
// User provides Date via value
const result = await evalla([
  { name: 'birthday', value: new Date('1990-05-15') },
  { name: 'year', expr: 'birthday.getFullYear()' }
]);

// Date stays in context (not in results)
result.values.birthday;  // undefined ✅ (expected - values stay in context)
result.values.year;      // Decimal(1990) ✅ (extracted component)
```

**Why this works:**
- Date objects never go through Decimal conversion
- They stay in evaluation context
- Only extracted values (numbers) appear in results
- Clear expectation: dates in context, decimals in results

#### For Option 3 ($date namespace) - Perfect Solution

```typescript
// $date functions return Decimal timestamps (not Date objects)
const result = await evalla([
  { name: 'timestamp', expr: '$date.parse("1990-05-15")' },
  { name: 'year', expr: '$date.year(timestamp)' }
]);

// Results are Decimals (as documented)
result.values.timestamp;  // Decimal(643939200000) ✅
result.values.year;       // Decimal(1990) ✅

// No Date objects = No collision with Decimal.js!
```

**Why this is perfect:**
- Functions return Decimal timestamps (not Date objects)
- Type signature unchanged: `Record<string, Decimal | boolean | null>`
- No collision because Date objects never enter results
- Day.js used internally, Decimal returned
- Clear contract: $date functions return numbers

---

## Consumer Impact: If Date Were a First-Class Output Type

**Hypothetical scenario:** What if we added `Date` to the output type signature?

```typescript
// Hypothetical change (NOT recommended)
interface EvaluationResult {
  values: Record<string, Decimal | boolean | null | Date>;  // Add Date
}
```

### Consumer Code Without Date Output Type (Current & $date namespace)

**Simple, clean consumer code:**

```typescript
// Using $date namespace (recommended approach)
const result = await evalla([
  { name: 'start', value: '2024-01-01' },
  { name: 'startTs', expr: '$date.parse(start)' },
  { name: 'year', expr: '$date.year(startTs)' }
]);

// Consumer knows exact types - no type checking needed
const startTs: Decimal = result.values.startTs;  // Always Decimal
const year: Decimal = result.values.year;        // Always Decimal

console.log(startTs.toString());  // Works - Decimal has .toString()
console.log(year.toNumber());     // Works - Decimal has .toNumber()
```

**No casting, no type guards, no runtime checks.**

### Consumer Code WITH Date Output Type (Hypothetical)

**Complex consumer code requiring type checking:**

```typescript
// Hypothetical API if Date were a first-class type
const result = await evalla([
  { name: 'birthday', expr: '$date.parse("1990-05-15")' },  // Returns Date?
  { name: 'year', expr: '$date.year(birthday)' },           // Returns Decimal?
  { name: 'isAdult', expr: '$date.diff($date.now(), birthday, "year") >= 18' }  // Returns boolean?
]);

// Problem 1: Consumer doesn't know what type each result is
// Must use type guards for EVERY value:

const birthday = result.values.birthday;
if (birthday instanceof Date) {
  console.log(birthday.getFullYear());  // Safe
} else if (birthday instanceof Decimal) {
  console.log(birthday.toString());     // Safe
} else if (typeof birthday === 'boolean') {
  console.log(birthday);                // Safe
} else if (birthday === null) {
  console.log('null');                  // Safe
}

// Problem 2: Different access patterns for each type
function displayValue(value: Decimal | boolean | null | Date) {
  if (value instanceof Date) {
    return value.toISOString();         // Date method
  } else if (value instanceof Decimal) {
    return value.toString();            // Decimal method
  } else if (typeof value === 'boolean') {
    return String(value);               // Boolean primitive
  } else {
    return 'null';                      // null
  }
}

// Problem 3: Iteration requires type checking
for (const name of result.order) {
  const value = result.values[name];
  console.log(`${name}: ${displayValue(value)}`);  // Must handle all types
}

// Problem 4: JSON serialization inconsistency
const json = JSON.stringify(result.values);
// Decimals → strings (via .toString())
// Dates → ISO strings (via .toJSON())
// booleans → booleans
// null → null
// Parsing back is ambiguous - can't tell if "2024-01-01T00:00:00Z" was Date or string

// Problem 5: TypeScript doesn't help without metadata
// Which values are Dates? Consumer must know from documentation or runtime checks
const maybeBirthday = result.values.birthday;  // Type: Decimal | boolean | null | Date
// TypeScript can't narrow without runtime check
```

### Real-World Consumer Burden Example

**Scenario:** Display all results in a table

```typescript
// WITHOUT Date type (current/recommended):
function renderTable(result: EvaluationResult) {
  return result.order.map(name => {
    const value = result.values[name];
    // Simple - all values have .toString() or are primitives
    const display = value === null ? 'null' 
                  : typeof value === 'boolean' ? String(value)
                  : value.toString();  // Decimal
    
    return `<tr><td>${name}</td><td>${display}</td></tr>`;
  });
}

// WITH Date type (hypothetical):
function renderTable(result: EvaluationResult) {
  return result.order.map(name => {
    const value = result.values[name];
    
    // Complex - must handle 4 different types
    let display: string;
    if (value === null) {
      display = 'null';
    } else if (typeof value === 'boolean') {
      display = String(value);
    } else if (value instanceof Date) {
      // Which format? ISO? Locale? Timestamp?
      display = value.toISOString();  // Or .toLocaleString()? Or .getTime()?
    } else {  // Decimal
      display = value.toString();
    }
    
    return `<tr><td>${name}</td><td>${display}</td></tr>`;
  });
}
```

### Serialization/Deserialization Complexity

**WITHOUT Date type:**
```typescript
// Serialize
const json = JSON.stringify(result.values);
// {"age": "33", "isAdult": true, "account": null}

// Deserialize (if needed)
const parsed = JSON.parse(json);
// Simple mapping back to types if needed
```

**WITH Date type:**
```typescript
// Serialize
const json = JSON.stringify(result.values);
// {"birthday": "1990-05-15T00:00:00.000Z", "age": "33", "isAdult": true}
// ⚠️ Problem: Can't distinguish between Date and Decimal (both become strings)

// Deserialize
const parsed = JSON.parse(json);
// ⚠️ Lost type information - "1990-05-15T00:00:00.000Z" is now a string
// Consumer needs separate metadata to know which fields to re-parse as Dates

// Need type metadata schema:
const schema = {
  birthday: 'Date',
  age: 'Decimal',
  isAdult: 'boolean'
};

// Reconstruct types:
const reconstructed: Record<string, Decimal | boolean | null | Date> = {};
for (const [key, value] of Object.entries(parsed)) {
  switch (schema[key]) {
    case 'Date':
      reconstructed[key] = new Date(value as string);
      break;
    case 'Decimal':
      reconstructed[key] = new Decimal(value as string);
      break;
    case 'boolean':
      reconstructed[key] = value as boolean;
      break;
    default:
      reconstructed[key] = value;
  }
}
```

### API Confusion

**WITHOUT Date type ($date namespace):**
```typescript
// Clear contract: All $date functions return Decimal or boolean
$date.parse(str)       // → Decimal (timestamp)
$date.year(ts)         // → Decimal (year)
$date.diff(ts1, ts2)   // → Decimal (difference)
$date.isBefore(ts1, ts2) // → boolean

// Consumer knows: Decimal = use .toString(), .toNumber(), etc.
```

**WITH Date type:**
```typescript
// Confusing contract: What does each function return?
$date.parse(str)       // → Date? Or Decimal? Documentation required!
$date.year(date)       // → Decimal? Or number? Or Date?
$date.now()            // → Date? Or Decimal timestamp?

// Each function needs clear docs about return type
// Consumer must check types at runtime
```

### Summary: Consumer Burden

| Aspect | Without Date Type | With Date Type |
|--------|-------------------|----------------|
| **Type checking** | None needed | Required for every value |
| **Rendering** | Simple `.toString()` | Complex type-based logic |
| **JSON serialization** | Straightforward | Lossy, needs metadata |
| **JSON deserialization** | Simple | Requires schema mapping |
| **API clarity** | Clear (always Decimal/boolean) | Ambiguous (check docs) |
| **TypeScript support** | Precise types | Wide unions, limited help |
| **Consumer code complexity** | Low | High |
| **Runtime errors** | Unlikely | Common (wrong method on type) |

### Why This Matters

Adding `Date` as an output type shifts the complexity burden to **every consumer**:

1. **Type guard everywhere:** Every consumer must add `instanceof Date` checks
2. **Display logic complexity:** Can't just call `.toString()` on everything
3. **Serialization issues:** JSON round-trip loses type information
4. **API ambiguity:** Which functions return Date vs Decimal?
5. **Migration pain:** Existing code breaks when Dates appear in results

**Contrast with $date namespace:**
- Returns Decimal timestamps (integers) explicitly
- No type checking needed
- JSON serialization works identically to numbers
- Clear API contract: timestamps are numbers
- Zero consumer burden

---

## Implications Analysis

### 1. Type System Implications

#### Current Type System
```typescript
interface EvaluationResult {
  values: Record<string, Decimal | boolean | null>;
  order: string[];
}
```

**Implications of keeping this:**
- ✅ Clean, simple type signature
- ✅ Serializable to JSON (Decimal.toString())
- ✅ No ambiguity about what's in results
- ✅ Compatible with formatResults()

**Implications of adding Date:**
- ❌ Breaking change for all consumers
- ❌ JSON serialization issues (Date → string in JSON)
- ❌ Collision with Decimal.js (as shown above)
- ❌ formatResults() doesn't handle Dates

### 2. User Experience Implications

#### With Current State (value property)
```typescript
// Verbose, error-prone
{ name: 'diffDays', expr: '(end.getTime() - start.getTime()) / (1000*60*60*24)' }
```

**Implications:**
- ⚠️ Magic numbers easy to get wrong
- ⚠️ No timezone handling
- ⚠️ No date arithmetic (add months, etc.)
- ⚠️ Requires JavaScript Date API knowledge

#### With $date Namespace
```typescript
// Clean, readable
{ name: 'diffDays', expr: '$date.diff(end, start, "day")' }
```

**Implications:**
- ✅ Self-documenting code
- ✅ Timezone handling via Day.js
- ✅ Date arithmetic built-in
- ✅ Consistent with other namespaces

### 3. Precision Implications

**Date timestamps are integers:**
```javascript
new Date('2024-01-15').getTime()  // 1705276800000 (integer)
```

**Decimal.js handles integers perfectly:**
```javascript
new Decimal(1705276800000)  // Exact representation
// No floating point issues!
```

**Implications:**
- ✅ Full precision maintained for timestamps
- ✅ Date arithmetic is exact
- ✅ No rounding errors in date calculations

### 4. Security Implications

#### With Day.js
```javascript
dayjs('2024-01-15')  // Safe parsing
dayjs('invalid')     // Returns invalid date (doesn't throw)
```

**Implications:**
- ✅ Day.js is well-audited (46K+ stars)
- ✅ No eval or code execution
- ✅ Immutable (all operations return new instances)
- ⚠️ Need to validate: `if (!dayjs(x).isValid()) throw Error`

#### Security pattern for $date:
```typescript
$date.parse = (value) => {
  const d = dayjs(value);
  if (!d.isValid()) {
    throw new EvaluationError(`Invalid date: ${value}`);
  }
  return new Decimal(d.valueOf());
};
```

### 5. Bundle Size Implications

**Current state:**
- evalla core: ~X KB (current size)
- Dependencies: decimal.js only

**With $date namespace:**
- Day.js core: 2KB gzipped
- UTC plugin: 0.3KB gzipped
- Total addition: ~2.3KB

**Implications:**
- ✅ Minimal impact (2.3KB)
- ✅ Smaller than alternatives (date-fns: 13KB, Luxon: 22KB, Moment: 67KB)
- ✅ Tree-shakeable if not used (ES modules)

### 6. Maintenance Implications

**With $date namespace:**
- ⚠️ New dependency to maintain (Day.js version updates)
- ⚠️ Need to support Day.js API changes (rare, stable library)
- ⚠️ Need to test date edge cases (leap years, DST, etc.)
- ✅ But Day.js handles the complexity, not us

**Alternative (no $date):**
- ✅ No additional maintenance
- ❌ Users implement date logic themselves (error-prone)

### 7. Philosophy Implications ("Algebra, not code")

**Question: Are dates "algebraic"?**

**Against (dates = code):**
- Dates are temporal constructs (not mathematical)
- Timezone handling is programming complexity
- Date formatting is presentation logic

**For (dates = algebra):**
- Date arithmetic is mathematical: `endDate - startDate = duration`
- Durations are numbers (can add, subtract)
- Timestamp = integer = mathematical primitive
- Components (year, month) are extractions of numbers

**Verdict:**
- ✅ $date arithmetic (add/subtract/diff) = mathematical operations
- ✅ Returning timestamps/components = numbers = algebraic
- ❌ Date formatting/localization = programming (don't include)

**Implication:** $date namespace fits "Algebra, not code" if:
1. Functions return numbers (Decimal)
2. No formatting/localization
3. Focus on arithmetic and extraction

### 8. Namespace Collision Implications

**Date-Decimal collision explored above, but also consider:**

#### Variable Name Collisions
```typescript
// User might want to use "date" as variable name
const result = await evalla([
  { name: 'date', expr: '2024' }  // ✅ Allowed (user variable)
]);

// No collision with $date namespace ($ prefix protects it)
const result = await evalla([
  { name: 'date', value: '2024-01-15' },
  { name: 'timestamp', expr: '$date.parse(date)' }  // ✅ Works
]);
```

**Implication:** ✅ No collision thanks to `$` prefix

#### Function Name Collisions
```typescript
// What if user wants variable named "parse"?
const result = await evalla([
  { name: 'parse', expr: '42' },  // ✅ Allowed (user variable)
  { name: 'ts', expr: '$date.parse("2024-01-15")' }  // ✅ Works
]);
```

**Implication:** ✅ Namespace isolation prevents collisions

### 9. Timestamp Ambiguity Implications

**Problem: Are timestamps seconds or milliseconds?**

```typescript
// JavaScript Date uses milliseconds
new Date().getTime()  // 1705321800000 (ms)

// Unix timestamps use seconds
Date.now() / 1000     // 1705321800 (s)
```

**Implication for $date:**
- Need to choose: milliseconds (consistent with JS) or seconds (Unix standard)
- **Recommendation:** Use milliseconds (JavaScript convention)
- Provide conversion: `$date.unix(seconds)` for Unix timestamps

**Example:**
```typescript
$date.now()           // → Decimal(1705321800000) in milliseconds
$date.unix(1705321800) // → Decimal(1705321800000) converts from seconds
```

### 10. Invalid Date Implications

**JavaScript allows invalid dates:**
```javascript
const invalid = new Date('not-a-date');
invalid.getTime()  // NaN
```

**When converted to Decimal:**
```javascript
new Decimal(invalid)  // Decimal(NaN)
decimal.isNaN()       // true
```

**Implications:**
- ⚠️ Invalid dates become NaN in results (confusing)
- ✅ Need validation before conversion
- ✅ Throw clear error instead of returning NaN

**Solution:**
```typescript
$date.parse = (value) => {
  const d = dayjs(value);
  if (!d.isValid()) {
    throw new EvaluationError(`Invalid date: ${value}`);
  }
  return new Decimal(d.valueOf());
};
```

### 11. Timezone Implications

**JavaScript Date is timezone-aware:**
```javascript
new Date('2024-01-15')  // Local midnight
new Date('2024-01-15T00:00:00Z')  // UTC midnight (different times!)
```

**Implications:**
- ⚠️ Same string can parse to different timestamps
- ⚠️ Need to be explicit about timezone
- ✅ Day.js supports UTC plugin

**Recommendation:**
- Use UTC by default in $date namespace
- Document this behavior clearly
- Example: `$date.parse('2024-01-15')` → treats as UTC

### 12. Leap Year & DST Implications

**Complex date scenarios:**
```javascript
// Adding 1 month to Jan 31
dayjs('2024-01-31').add(1, 'month')  // → Feb 29 (2024 is leap year)

// DST transitions
dayjs('2024-03-10 01:30').add(1, 'hour')  // → 03:30 in US (DST jump)
```

**Implications:**
- ✅ Day.js handles these edge cases
- ✅ We don't need to implement complex logic
- ✅ Users get correct behavior automatically

**This is why using a library (Day.js) is better than DIY.**

### 13. Comparison Implications

**How to compare dates?**

```typescript
// Option A: Compare timestamps
$date.parse(date1) > $date.parse(date2)  // ❌ Comparing Decimals (no > operator)

// Option B: Use diff
$date.diff(date1, date2, "day") > 0  // ✅ Works (diff returns Decimal)

// Option C: Provide comparison functions
$date.isBefore(date1, date2)  // ✅ Returns boolean
$date.isAfter(date1, date2)   // ✅ Returns boolean
$date.isSame(date1, date2)    // ✅ Returns boolean
```

**Implication:** Need comparison helper functions that return boolean

### 14. Serialization Implications

**Current state:**
```typescript
JSON.stringify(result.values)  
// Decimals become strings via .toString()
// ✅ Works (though loses Decimal type)
```

**With Date objects (Option 1):**
```typescript
JSON.stringify(result.values)  
// Dates become ISO strings via .toJSON()
// ⚠️ Loses Date type AND timezone info
```

**With $date namespace (Option 3):**
```typescript
JSON.stringify(result.values)  
// Timestamps are Decimals → strings
// ✅ Works, consistent with current behavior
```

**Implication:** $date namespace maintains JSON serialization compatibility

---

## Recommendation

### ✅ Implement $date Namespace with Day.js

**Rationale:**
1. **Solves the collision problem** - Never puts Date objects in results
2. **Maintains type safety** - Output remains `Record<string, Decimal | boolean | null>`
3. **Superior UX** - Clean API without magic numbers
4. **Minimal cost** - 2.3KB bundle size, well-maintained library
5. **Fits philosophy** - Date arithmetic is mathematical
6. **No breaking changes** - Additive feature

### Implementation Approach

**API Design:**
```typescript
// Parsing
$date.now()              // Current timestamp (ms)
$date.parse(str)         // Parse ISO string → timestamp
$date.unix(seconds)      // Unix timestamp → ms timestamp

// Extraction
$date.year(timestamp)    // Extract year
$date.month(timestamp)   // Extract month (1-12)
$date.date(timestamp)    // Extract day of month
$date.day(timestamp)     // Extract day of week (0-6)
$date.hour(timestamp)    // Extract hour
$date.minute(timestamp)  // Extract minute
$date.second(timestamp)  // Extract second

// Arithmetic
$date.add(ts, amount, unit)      // Add time
$date.subtract(ts, amount, unit) // Subtract time
$date.diff(ts1, ts2, unit)       // Difference

// Utilities
$date.startOf(ts, unit)  // Start of day/month/year
$date.endOf(ts, unit)    // End of day/month/year

// Comparisons (return boolean)
$date.isValid(value)     // Validate date
$date.isBefore(ts1, ts2) // Before comparison
$date.isAfter(ts1, ts2)  // After comparison
$date.isSame(ts1, ts2)   // Equality comparison
```

**Key Principles:**
1. All functions return `Decimal` (timestamps/components) or `boolean` (validations)
2. Never return `Date` objects
3. Use Day.js internally, convert to Decimal before returning
4. Validate all inputs before processing
5. Use UTC by default, document clearly

### What NOT to Include

❌ **Formatting** - `$date.format(ts, "YYYY-MM-DD")` 
- Reason: This is presentation logic, not algebra
- Users should format outside evalla

❌ **Localization** - `$date.locale("fr")`
- Reason: Too complex, not mathematical
- Users should handle via Day.js externally

❌ **Timezone Conversion** - `$date.tz(ts, "America/New_York")`
- Reason: Opens timezone database complexity
- Use UTC; users handle timezone externally

---

## Open Questions

### 1. Should we include duration operations?

**Question:** Should `$date.diff` return a duration object or just a number?

**Current proposal:**
```typescript
$date.diff(ts1, ts2, "day")  // → Decimal(7)
```

**Alternative:**
```typescript
$date.diff(ts1, ts2)  // → Duration object? ❌
```

**Answer:** Return Decimal only (no duration objects). Keeps type system simple.

### 2. How to handle invalid dates?

**Options:**
- A) Throw error (recommended)
- B) Return NaN
- C) Return null

**Recommendation:** Throw `EvaluationError` with clear message

### 3. Should we support date ranges?

**Example:**
```typescript
$date.isInRange(ts, startTs, endTs)  // → boolean
```

**Answer:** Not initially. Can add later if users request it.

### 4. What about fiscal years?

**Example:**
```typescript
$date.fiscalYear(ts, startMonth)  // → Decimal(2024)
```

**Answer:** Not initially. Too domain-specific. Users can calculate.

### 5. Should we support relative dates?

**Example:**
```typescript
$date.parse("tomorrow")  // → timestamp
$date.parse("last monday")  // → timestamp
```

**Answer:** No. Too ambiguous. Require explicit dates.

---

## Summary of Implications

| Implication | Impact | Mitigation |
|-------------|--------|------------|
| **Date-Decimal Collision** | 🔴 Fatal for Option 1 | Use Option 3 (never return Date objects) |
| **Type System** | 🟢 No breaking changes | Return Decimal/boolean only |
| **Bundle Size** | 🟡 +2.3KB | Minimal, acceptable |
| **Maintenance** | 🟡 New dependency | Day.js is stable, well-maintained |
| **Security** | 🟢 Safe | Day.js is audited, no eval |
| **Precision** | 🟢 Full precision | Timestamps are integers |
| **UX** | 🟢 Much better | Clean API, no magic numbers |
| **Philosophy** | 🟢 Fits "Algebra" | Date arithmetic is mathematical |
| **Serialization** | 🟢 Compatible | JSON works same as today |
| **Timezone** | 🟡 Complex | Use UTC by default, document clearly |
| **Invalid Dates** | 🟡 Need handling | Validate and throw clear errors |
| **Leap Years/DST** | 🟢 Handled | Day.js handles edge cases |

---

## Conclusion

The **Date-Decimal collision** is the critical insight that makes Option 1 (Date as first-class type) impossible and Option 3 ($date namespace) the clear winner.

**Key Takeaway:** When Date objects pass through Decimal.js, they become timestamps and lose their methods. This means:
- ❌ Cannot return Date objects in results (they become Decimals anyway)
- ✅ Must return Decimal timestamps from $date functions
- ✅ This maintains type safety and avoids the collision

**Recommended Action:** Implement $date namespace with Day.js, returning Decimal timestamps and components, never Date objects. This provides excellent UX while maintaining type safety and avoiding the collision problem.

---

## Appendix: Detailed Examples

### Example 1: Project Timeline Calculations

```typescript
const result = await evalla([
  // Input dates
  { name: 'projectStart', value: '2024-01-01' },
  { name: 'projectEnd', value: '2024-06-30' },
  
  // Parse to timestamps
  { name: 'startTs', expr: '$date.parse(projectStart)' },
  { name: 'endTs', expr: '$date.parse(projectEnd)' },
  
  // Calculate duration
  { name: 'durationDays', expr: '$date.diff(endTs, startTs, "day")' },
  { name: 'durationWeeks', expr: 'durationDays / 7' },
  
  // Milestones
  { name: 'milestone1', expr: '$date.add(startTs, 30, "day")' },
  { name: 'milestone2', expr: '$date.add(startTs, 60, "day")' },
  
  // Check if on track
  { name: 'now', expr: '$date.now()' },
  { name: 'isOnTrack', expr: '$date.isBefore(now, endTs)' }
]);

// All results are Decimal/boolean:
// startTs: Decimal(1704067200000)
// endTs: Decimal(1719705600000)
// durationDays: Decimal(181)
// isOnTrack: true
```

### Example 2: Age Calculation

```typescript
const result = await evalla([
  { name: 'birthdate', value: '1990-05-15' },
  { name: 'birthTs', expr: '$date.parse(birthdate)' },
  { name: 'nowTs', expr: '$date.now()' },
  { name: 'ageDays', expr: '$date.diff(nowTs, birthTs, "day")' },
  { name: 'ageYears', expr: '$date.diff(nowTs, birthTs, "year")' }
]);

// Results:
// birthTs: Decimal(643939200000)
// ageYears: Decimal(33) or similar
```

### Example 3: Fiscal Quarter

```typescript
const result = await evalla([
  { name: 'dateStr', value: '2024-03-15' },
  { name: 'ts', expr: '$date.parse(dateStr)' },
  { name: 'month', expr: '$date.month(ts)' },
  { name: 'quarter', expr: '$math.ceil(month / 3)' }
]);

// Results:
// month: Decimal(3)
// quarter: Decimal(1)  // Q1
```

---

**Document Version:** 1.0  
**Date:** 2026-02-17  
**Status:** Analysis Complete - Awaiting Implementation Decision
