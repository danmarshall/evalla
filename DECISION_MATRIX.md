# Decision Matrix: Decimal Places Implementation

This document provides a quick decision matrix to help finalize the implementation approach.

## 🎯 Quick Decision Required

| Question | Option A | Option B | Recommended |
|----------|----------|----------|-------------|
| **What should the default be?** | Unlimited (non-breaking) | 7 places (user-friendly) | **A for v0.2.x, consider B for v1.0.0** |
| **When to implement?** | Now (v0.2.x) | Wait for v1.0.0 | **A - Implement now with safe default** |
| **Breaking change?** | No | Yes | **No (initially)** |

## 📊 Decision Scenarios

### Scenario 1: Conservative Approach (Recommended)

**Characteristics:**
- ✅ Non-breaking
- ✅ Users opt-in to formatting
- ✅ Can deploy immediately
- ✅ Safe migration path

**Default**: `undefined` (unlimited)

**User Code:**
```typescript
// No change needed - works as before
const result = await evalla(inputs);

// Opt-in to formatting
const result = await evalla(inputs, { decimalPlaces: 7 });
```

**Timeline:**
- v0.2.x: Add feature with unlimited default
- v0.3.x: Gather user feedback
- v1.0.0: Consider changing default to 7 based on feedback

**Pros:**
- Safe and gradual adoption
- No breaking changes
- Time to gather feedback
- Clear upgrade path

**Cons:**
- Extra step for users who want formatting
- Default remains verbose

---

### Scenario 2: User-Friendly Approach

**Characteristics:**
- ⚠️ Breaking change
- ✅ Better default for most users
- ⚠️ Requires major version bump
- ✅ Simpler for new users

**Default**: `7` decimal places

**User Code:**
```typescript
// New behavior - 7 decimal places by default
const result = await evalla(inputs);
console.log(result.values.pi.toString()); // "3.1415927"

// Opt-out for unlimited precision
const result = await evalla(inputs, { decimalPlaces: undefined });
console.log(result.values.pi.toString()); // "3.14159265358979323846"
```

**Timeline:**
- v1.0.0: Release with 7 as default
- Provide migration guide
- Update all examples and documentation

**Pros:**
- Better UX for most users
- Less code needed (no `.toFixed()` calls)
- Natural default for display

**Cons:**
- Breaking change requiring major version
- Migration effort for existing users
- Need comprehensive communication

---

## 🎬 Implementation Steps

### If Scenario 1 (Conservative - Recommended)

1. **Phase 1: Implementation** (Now - v0.2.x)
   ```typescript
   // Add optional parameter
   export const evalla = async (
     inputs: ExpressionInput[],
     options?: { decimalPlaces?: number }
   ): Promise<EvaluationResult> => {
     // ... existing code ...
     
     // Apply formatting if specified
     const decimalPlaces = options?.decimalPlaces;
     if (decimalPlaces !== undefined && decimalPlaces >= 0) {
       for (const [name, value] of Object.entries(values)) {
         if (value instanceof Decimal && value.isFinite()) {
           values[name] = value.toDecimalPlaces(decimalPlaces);
         }
       }
     }
     
     return { values, order };
   };
   ```

2. **Phase 2: Testing**
   - Add `decimal-places.test.ts`
   - Test various decimal place values
   - Test edge cases
   - Ensure backward compatibility

3. **Phase 3: Documentation**
   - Update README with new option
   - Add examples showing usage
   - Document edge cases

4. **Phase 4: Playground**
   - Add decimal places control
   - Default to unlimited (empty input)
   - Add preset buttons (2, 7, unlimited)

5. **Phase 5: Gather Feedback**
   - Release v0.2.x
   - Monitor usage patterns
   - Collect user feedback

6. **Phase 6: Evaluate for v1.0.0**
   - Based on feedback, decide if 7 should become default
   - Plan migration if changing default

---

### If Scenario 2 (User-Friendly)

1. **Phase 1: Implementation** (v1.0.0)
   - Same code as Scenario 1
   - Default to 7 instead of undefined

2. **Phase 2: Migration Guide**
   - Document breaking change
   - Show how to maintain old behavior
   - Update all examples

3. **Phase 3: Communication**
   - Clear CHANGELOG entry
   - Blog post or announcement
   - Update documentation

4. **Phase 4: Update Tests**
   - Update existing tests to specify `decimalPlaces: undefined`
   - Or update expected values to 7 decimal places

---

## 📝 What You Need to Decide

### Critical Decisions (Choose One)

**Decision 1: Default Behavior**
- [ ] **Option A**: Unlimited (non-breaking) - Safe, opt-in formatting
- [ ] **Option B**: 7 decimal places - User-friendly but breaking

**Decision 2: Version Target**
- [ ] **Option A**: v0.2.x - Deploy soon with safe default
- [ ] **Option B**: v1.0.0 - Wait and release with preferred default

**Decision 3: API Design** (Already looks good, confirm?)
- [ ] **Approved**: `{ decimalPlaces: 7 }` is good
- [ ] **Need changes**: Suggest alternative

### Secondary Decisions (Can decide later)

**Decision 4: Playground Presets**
- [ ] Add preset buttons (2, 7, 10, unlimited)?
- [ ] Just a number input?

**Decision 5: Documentation Level**
- [ ] Basic (show option in README)
- [ ] Comprehensive (separate guide with examples)

---

## 🚦 Recommended Path Forward

**For immediate implementation:**

1. ✅ **Implement Scenario 1** (Conservative approach)
   - Default: `undefined` (unlimited)
   - Non-breaking change
   - Deploy in v0.2.x

2. ✅ **Add comprehensive documentation**
   - Show examples with different decimal places
   - Explain when to use what

3. ✅ **Update playground**
   - Add decimal places control
   - Preset buttons for common values

4. ✅ **Gather feedback** (3-6 months)
   - How often do users set `decimalPlaces`?
   - What values do they use most?
   - Any complaints about default?

5. ✅ **Evaluate for v1.0.0**
   - If 7 is widely used, make it default
   - If unlimited is preferred, keep current
   - Update documentation accordingly

---

## 📋 Implementation Checklist

Once decision is made:

### Core Implementation
- [ ] Update `packages/evalla/src/types.ts` - Add `EvallaOptions` interface
- [ ] Update `packages/evalla/src/index.ts` - Add options parameter and formatting logic
- [ ] Create `packages/evalla/test/decimal-places.test.ts` - Comprehensive tests
- [ ] Update `packages/evalla/README.md` - Document new option

### Playground
- [ ] Update `packages/playground/src/components/PlaygroundApp.tsx` - Add UI control
- [ ] Add state management for decimal places setting
- [ ] Update evaluate function to pass option
- [ ] Add help text explaining the feature

### Documentation
- [ ] Add "Output Formatting" section to README
- [ ] Show examples with different use cases
- [ ] Document edge cases (Infinity, small numbers)
- [ ] Update TypeScript definitions

### Quality Assurance
- [ ] Run all existing tests (ensure no breakage)
- [ ] Run new decimal places tests
- [ ] Test playground UI
- [ ] Test edge cases manually
- [ ] Update CHANGELOG

---

## ⚡ Express Decision Form

**Copy this and fill it out:**

```
DECIMAL PLACES IMPLEMENTATION DECISION

1. Default behavior:
   [X] Unlimited (non-breaking, recommended)
   [ ] 7 decimal places (user-friendly, breaking)

2. Version target:
   [X] v0.2.x (deploy soon)
   [ ] v1.0.0 (wait for major release)

3. API design approved?
   [X] Yes, { decimalPlaces: 7 } is good
   [ ] No, I want: _______________

4. Additional requirements:
   [ ] None
   [ ] Add: _______________

5. Ready to implement?
   [ ] Yes, go ahead
   [ ] No, I have questions: _______________
```

---

## 🎯 TL;DR

**Recommended Decision:**
1. Default to `undefined` (unlimited precision)
2. Implement in v0.2.x (now)
3. API: `{ decimalPlaces: 7 }`
4. Gather feedback
5. Reconsider default for v1.0.0

**Why?**
- ✅ Non-breaking (safe)
- ✅ Can deploy immediately
- ✅ Users get feature now
- ✅ Time to gather feedback
- ✅ Clear upgrade path

**Implementation time**: ~2-3 hours
- Core: 30 min
- Tests: 45 min
- Docs: 30 min
- Playground: 45 min

**Ready to proceed?** Just say the word! 🚀
