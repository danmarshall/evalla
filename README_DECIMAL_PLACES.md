# 📋 Decimal Places Discussion - Complete Package

> **Status**: 🟡 Discussion Phase - Awaiting Decisions

This directory contains a complete analysis and proposal for adding configurable decimal places to evalla.

## 🎯 The Proposal (REVISED)

**New approach**: Separate formatting function instead of options parameter

```typescript
// Evaluate with full precision (evalla unchanged)
const result = await evalla([{ name: 'pi', expr: '3.14159265358979323846' }]);

// Format for display using new function
const formatted = formatResults(result, { decimalPlaces: 7 });
console.log(formatted.values.pi.toString()); // "3.1415927"
```

**Original proposal**: Pass `decimalPlaces` as option to `evalla()`
**Revised proposal**: New `formatResults()` function for better separation of concerns

**Your feedback**: "maybe its not an input parameter then (since its not used until display) - perhaps we have a new function roundResults?"

This makes sense! Formatting is purely for display, not evaluation logic.

## 📚 Documentation

### Quick Start
1. **[START HERE: REVISED_PROPOSAL.md](./REVISED_PROPOSAL.md)** - Updated design with separate function
2. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - 5-minute overview (updated)
3. **[RUN THIS: `node decimal-places-poc.js`](./decimal-places-poc.js)** - See it in action

### Decision Making
3. **[REVISED_PROPOSAL.md](./REVISED_PROPOSAL.md)** - Updated API design (separate function)
4. **[DECISION_MATRIX.md](./DECISION_MATRIX.md)** - Decision checklist and scenarios
5. **[DECISION_POINTS.md](./DECISION_POINTS.md)** - Detailed design trade-offs

### Technical Details  
6. **[DECIMAL_PLACES_PROPOSAL.md](./DECIMAL_PLACES_PROPOSAL.md)** - Original proposal (options parameter)
7. **[VISUAL_COMPARISON.md](./VISUAL_COMPARISON.md)** - Side-by-side examples
8. **[API_MOCKUP.ts](./API_MOCKUP.ts)** - Implementation preview (to be updated)

## 🧪 Try It Yourself

```bash
cd /home/runner/work/evalla/evalla
node decimal-places-poc.js
```

This demonstrates:
- ✅ Current behavior (full precision)
- ✅ With 7 decimal places (proposed default)
- ✅ With 2 decimal places (financial)
- ✅ Edge cases (Infinity, very small numbers)
- ✅ Real-world calculations
- ✅ Why internal precision matters

## 🔑 Critical Decisions

### Decision 1: Default Value

**Option A: Unlimited (Non-breaking)** ⭐ Recommended
```typescript
// No change to existing code
const result = await evalla(inputs);

// Opt-in to formatting
const result = await evalla(inputs, { decimalPlaces: 7 });
```

**Option B: 7 Decimal Places (User-friendly but breaking)**
```typescript
// Default is now 7 decimal places
const result = await evalla(inputs);

// Opt-out for unlimited
const result = await evalla(inputs, { decimalPlaces: undefined });
```

### Decision 2: Version Target

- **v0.2.x** - Implement now with safe default (unlimited) ⭐
- **v1.0.0** - Wait for major release if changing default to 7

### Decision 3: API Design

```typescript
interface EvallaOptions {
  decimalPlaces?: number;  // undefined = unlimited
}

const evalla = async (
  inputs: ExpressionInput[],
  options?: EvallaOptions
): Promise<EvaluationResult>;
```

Is this approved? ✅ Looks good to me

## 📊 Summary Table

| Aspect | Current | Proposed (Unlimited Default) | Proposed (7 Default) |
|--------|---------|------------------------------|---------------------|
| Default output | Full precision | Full precision | 7 decimal places |
| Breaking change? | N/A | ❌ No | ✅ Yes |
| Code changes needed | N/A | None (opt-in) | Add `decimalPlaces: undefined` |
| Version | v0.2.0 | v0.2.x | v1.0.0 |
| User experience | Verbose | Backward compatible | Cleaner by default |

## 🎬 What Happens Next?

### If You Approve (Recommended: Unlimited Default)

1. **I will implement** (~2-3 hours):
   - [ ] Update types and main function
   - [ ] Add comprehensive tests
   - [ ] Update documentation
   - [ ] Add playground decimal places control
   - [ ] Run all quality checks

2. **You will get**:
   - ✅ Non-breaking feature addition
   - ✅ Backward compatible
   - ✅ Users can opt-in to formatting
   - ✅ Playground control for experimentation
   - ✅ Clear path to make 7 default in v1.0.0

3. **Timeline**:
   - Implementation: 2-3 hours
   - Testing: 1 hour
   - Documentation: 1 hour
   - **Total: ~4-5 hours**

### If You Want 7 as Default Now

Same implementation, but:
- ⚠️ Breaking change (requires v1.0.0)
- ⚠️ Need to update all existing tests
- ⚠️ Migration guide required
- ⚠️ Communication plan needed

## ❓ Common Questions

**Q: Why not just make 7 the default now?**
A: It's a breaking change. Users who rely on full precision will see different output. Better to let them opt-in first, gather feedback, then consider making it default in v1.0.0.

**Q: Won't users have to write more code with unlimited default?**
A: Yes, they'll need to add `{ decimalPlaces: 7 }`. But this is safer than breaking existing code. We can change the default in v1.0.0 based on feedback.

**Q: Will internal calculations lose precision?**
A: No! Formatting is applied only at output. Internal calculations always use full precision.

**Q: What about Infinity?**
A: We check `.isFinite()` before formatting. Infinity remains "Infinity".

**Q: What about very small numbers?**
A: They may round to 0 with limited decimal places. Users who need small numbers can use more decimal places or unlimited.

## 🚀 Ready to Proceed?

**Just say one of these:**

1. ✅ **"Approved - unlimited default"** - I'll implement with safe, non-breaking default
2. ✅ **"Approved - 7 as default"** - I'll implement with 7 as default (breaking, needs v1.0.0)
3. ⏸️ **"Wait, I have questions"** - Ask away!
4. ❌ **"Not yet, I need to review X"** - Let me know what you need

## 📁 Files in This Package

```
/home/runner/work/evalla/evalla/
├── README.md (this file)
├── QUICK_REFERENCE.md          ← Start here
├── DECISION_MATRIX.md          ← For decision making
├── DECISION_POINTS.md          ← Design considerations
├── DECIMAL_PLACES_PROPOSAL.md  ← Complete analysis
├── VISUAL_COMPARISON.md        ← Side-by-side examples
├── API_MOCKUP.ts              ← Implementation preview
└── decimal-places-poc.js       ← Run this!
```

## 🎓 Key Insights from Analysis

1. **Internal Precision Matters**: Full precision during calculations prevents compounding errors
2. **7 is Reasonable**: Covers most engineering use cases (~0.0001mm precision)
3. **Non-breaking is Safer**: Let users try before making it default
4. **Playground Benefits**: Visual experimentation helps users understand
5. **Clear Migration Path**: If we start unlimited, we can make 7 default in v1.0.0

## 📞 Next Steps

**Your turn!** Review the documents (especially QUICK_REFERENCE.md) and let me know:

1. Which default do you prefer?
2. When do you want it implemented?
3. Any other requirements?

Then I'll implement immediately. 🚀

---

**Status**: ⏸️ **WAITING FOR YOUR DECISION**

**Implementation Ready**: ✅ Yes, just waiting for approval

**Estimated Time**: ~4-5 hours from approval to completion
