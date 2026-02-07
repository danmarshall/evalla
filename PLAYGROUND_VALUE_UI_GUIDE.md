# Playground Value Property UI Implementation Guide

## Context

This document provides instructions for implementing the playground value property UI feature in a new Copilot session. This work was deferred from the main PR to avoid merge conflicts.

## Background

**Related Documents:**
- `OBJECT_SUPPORT_ANALYSIS.md` - Analysis of object support implications
- `IMPLEMENTATION_PLAN.md` - Overall implementation plan
- `.github/copilot-instructions.md` - Project conventions and patterns

**What's Already Complete:**
- ✅ Grammar changes: Object literals removed from expressions (commit 2fdac0d)
- ✅ Type checking: Strong validation for operations (commit 2fdac0d)
- ✅ Tests: All 229 passing, updated for value property (commit 207e508)
- ✅ Documentation: README updated (commit b30d3f1)
- ✅ Core evalla library: Supports `{ name: 'x', value: {a: 10} }` input format

**What Needs Implementation:**
- Playground UI to support dual input modes (expression vs value)
- Examples using actual value property with objects
- Integration with existing real-time validation

## Problem Statement

Currently, objects can be passed to evalla via the `value` property, but the playground UI only supports expression input (single-line textbox). Users need a way to input JSON objects/arrays directly in the playground.

**Current limitation:**
```typescript
// This works in code but not in playground UI:
{ name: 'point', value: {x: 10, y: 20} }
```

**Desired playground UI:**
- Two input modes: Expression (textbox) and Value (textarea for JSON)
- Separate "Add Expression" and "Add Value" buttons
- Mode locked after row creation
- Visual indicators showing which mode each row uses

## Implementation Requirements

### 1. Update Expression Interface

**File:** `/packages/playground/src/data/examples.ts`

Add optional fields to support dual modes:

```typescript
interface Expression {
  name: string;
  expr?: string;      // For expression mode
  value?: any;        // For value mode (JSON objects/arrays)
  mode?: 'expr' | 'value';  // Track input mode
}
```

### 2. Update PlaygroundApp Component

**File:** `/packages/playground/src/components/PlaygroundApp.tsx`

**Key Changes Needed:**

#### A. Add State for Mode Tracking
```typescript
// Add alongside existing expressions state
const [expressions, setExpressions] = useState<Expression[]>([]);
```

#### B. Update Add Buttons (Two Separate Buttons)
```tsx
{/* Replace single "Add Expression" button with two buttons */}
<button 
  onClick={() => addExpression('expr')}
  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
>
  Add Expression
</button>
<button 
  onClick={() => addExpression('value')}
  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
>
  Add Value
</button>
```

#### C. Update addExpression Function
```typescript
const addExpression = (mode: 'expr' | 'value' = 'expr') => {
  setExpressions([
    ...expressions,
    { 
      name: `var${expressions.length + 1}`, 
      expr: mode === 'expr' ? '' : undefined,
      value: mode === 'value' ? undefined : undefined,
      mode 
    },
  ]);
};
```

#### D. Conditional Input Rendering
```tsx
{/* In the expression list rendering */}
{expression.mode === 'value' ? (
  <textarea
    rows={3}
    value={expression.value ? JSON.stringify(expression.value, null, 2) : ''}
    onChange={(e) => updateExpression(index, 'value', e.target.value)}
    className="flex-1 px-3 py-2 border rounded font-mono text-sm"
    placeholder='{"x": 10, "y": 20}'
  />
) : (
  <input
    type="text"
    value={expression.expr || ''}
    onChange={(e) => updateExpression(index, 'expr', e.target.value)}
    className="flex-1 px-3 py-2 border rounded font-mono"
    placeholder="e.g., a + b * 2"
  />
)}

{/* Mode indicator */}
<div className="text-xs text-gray-500 mt-1">
  {expression.mode === 'value' ? 'Value mode (JSON)' : 'Expression mode'}
</div>
```

#### E. Update updateExpression Function
```typescript
const updateExpression = (index: number, field: string, value: string) => {
  const updated = [...expressions];
  
  if (field === 'value') {
    // Parse JSON for value mode
    try {
      updated[index].value = value ? JSON.parse(value) : undefined;
    } catch (e) {
      // Keep raw string if JSON is invalid (user still typing)
      updated[index].value = value;
    }
  } else {
    updated[index][field] = value;
  }
  
  setExpressions(updated);
  
  // Existing validation logic...
  if (field === 'expr' && updated[index].mode === 'expr') {
    debouncedValidation(index, value);
  }
};
```

#### F. Update evaluate Function
```typescript
const evaluate = () => {
  try {
    // Format inputs for evalla
    const inputs = expressions.map(e => {
      if (e.mode === 'value') {
        // Value mode: pass value property
        return { name: e.name, value: e.value };
      } else {
        // Expression mode: pass expr property
        return { name: e.name, expr: e.expr || '' };
      }
    });
    
    const result = evalla(inputs);
    // ... rest of evaluation logic
  } catch (error) {
    // ... error handling
  }
};
```

### 3. Update Example Definitions

**File:** `/packages/playground/src/data/examples.ts`

Update object property examples to use actual value mode:

```typescript
objectProperties: {
  name: 'Object properties with dot notation',
  description: 'Access object properties using dot notation',
  expressions: [
    { 
      name: 'point', 
      value: {x: 10, y: 20}, 
      mode: 'value' as const
    },
    { name: 'scaledX', expr: 'point.x * 2' },
    { name: 'scaledY', expr: 'point.y * 2' },
    { name: 'distance', expr: '$math.sqrt(point.x ** 2 + point.y ** 2)' },
  ],
},

nestedObjects: {
  name: 'Nested objects with dot notation',
  description: 'Access nested object properties',
  expressions: [
    { 
      name: 'config', 
      value: {
        display: {
          width: 1920,
          height: 1080
        },
        scale: 2
      }, 
      mode: 'value' as const
    },
    { name: 'scaledWidth', expr: 'config.display.width / config.scale' },
    { name: 'scaledHeight', expr: 'config.display.height / config.scale' },
    { name: 'aspectRatio', expr: 'config.display.width / config.display.height' },
  ],
},
```

### 4. Integration with Existing Features

**Must Preserve:**
- Real-time syntax validation (300ms debouncing) for expression mode
- Variable name validation for both modes
- Orange highlighting for validation errors
- Existing error message display
- All current examples

**Validation Rules:**
- Expression mode: Run checkSyntax() on expression changes
- Value mode: Validate JSON parsing, but don't run checkSyntax()
- Both modes: Validate variable names with checkVariableName()

### 5. Visual Design

**Button Colors:**
- "Add Expression": Blue (`bg-blue-600`, `hover:bg-blue-700`)
- "Add Value": Green (`bg-green-600`, `hover:bg-green-700`)

**Mode Indicators:**
- Below each input field
- Gray text: `text-xs text-gray-500`
- "Expression mode" or "Value mode (JSON)"

**Input Fields:**
- Expression mode: Single-line textbox (existing style)
- Value mode: 3-row textarea, monospace font
- Both: Consistent border and padding styles

## Testing Checklist

After implementation, verify:

- [ ] Can add expression mode rows (blue button)
- [ ] Can add value mode rows (green button)  
- [ ] Expression mode shows textbox input
- [ ] Value mode shows textarea input (3 rows)
- [ ] Mode indicators display correctly
- [ ] JSON parsing works for valid JSON in value mode
- [ ] Can access object properties in expressions: `point.x`
- [ ] Can access nested properties: `config.display.width`
- [ ] Real-time validation works for expression mode
- [ ] Variable name validation works for both modes
- [ ] Error highlighting still works
- [ ] Object property examples load correctly
- [ ] All existing examples still work
- [ ] All 229 tests still pass

## Build and Test Commands

```bash
# Build evalla library
cd packages/evalla
npm run build

# Run tests
npm test

# Build playground
cd ../playground
npm run build

# Start dev server to test UI
npm run dev
```

## Reference Implementation

A complete working implementation exists in commit `26ec82c` (before it was reverted to resolve merge conflicts). You can reference that commit for:
- Complete PlaygroundApp.tsx changes
- Updated examples.ts structure
- Integration patterns with existing validation

## Success Criteria

Implementation is complete when:
1. ✅ Users can click "Add Value" to create value mode rows
2. ✅ Value mode displays textarea for JSON input
3. ✅ Users can input JSON objects like `{"x": 10, "y": 20}`
4. ✅ Object properties are accessible in other expressions: `point.x + point.y`
5. ✅ Nested property access works: `config.display.width`
6. ✅ Real-time validation still works for expression mode
7. ✅ All existing functionality preserved
8. ✅ All 229 tests passing
9. ✅ No merge conflicts with main branch

## Notes

- **Mode is locked:** Once a row is created, its mode cannot be changed (by design)
- **JSON validation:** Value mode should accept partial/invalid JSON while user is typing, only parse on evaluation
- **Existing patterns:** Follow existing code patterns in PlaygroundApp.tsx for consistency
- **TypeScript:** Ensure all types are properly defined and type-safe

## Questions?

If you encounter issues:
1. Check commit `26ec82c` for reference implementation
2. Review `OBJECT_SUPPORT_ANALYSIS.md` for design rationale
3. Check `.github/copilot-instructions.md` for project conventions
4. All tests should continue passing - if not, there's a regression

---

**Document created:** 2026-02-07  
**For PR:** Remove Object Literals from Grammar, Keep Arrays  
**Status:** Ready for implementation in new Copilot session
