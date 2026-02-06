# GitHub Copilot Instructions for evalla

## Project Overview

evalla is a **mathematical expression evaluator** (not a programming language) built on Decimal.js. It follows an "Algebra, not code" philosophy.

## Documentation Structure

**IMPORTANT: README Master Location**

The **master source** for README.md is:
```
packages/evalla/README.md
```

This file is automatically copied to multiple locations by the `sync-readme` script:
- Root: `README.md`
- Playground docs: `packages/playground/src/content/docs/readme.md`

**Always edit** `packages/evalla/README.md` and then run:
```bash
npm run sync-readme
```

Never edit the copied versions directly - your changes will be overwritten!

## Core Design Philosophy

### "Algebra, not code"

evalla is a mathematical expression evaluator, not a programming language. Design decisions favor mathematical conventions over programming ones.

### Three-Tier Identifier Model

1. **User Variables** (no prefix)
   - Examples: `x`, `angle`, `math`, `unit`, `return`, `if`
   - Any identifier except reserved values
   - Can use JavaScript keywords - they're just mathematical symbols

2. **System Namespaces** (`$` prefix)
   - Examples: `$math`, `$unit`, `$angle`
   - Containers of functions and constants
   - Cannot be used as standalone values
   - `$` provides user freedom (can add `$interest`, `$statistic` without breaking user code)

3. **Reserved Value Names** (no prefix, cannot be user variables)
   - `true`, `false`, `null`, `Infinity`
   - Universal mathematical primitives
   - Users wouldn't naturally name variables these

### Output Type System

```typescript
interface EvaluationResult {
  values: Record<string, Decimal | boolean | null>;
  order: string[];
}
```

Results can be:
- `Decimal` - All numeric values (including `Infinity`)
- `boolean` - From comparisons, logical operations, or boolean literals
- `null` - Explicit null value

### Equality Operators

- `=` (single equals) - Primary algebraic equality
- `==` (double equals) - For programmer community
- Both work identically (no loose vs strict - this is algebra, not JavaScript)
- `===` (triple equals) - **NOT supported** (removed)

## Variable Naming Restrictions

Variables **cannot**:
1. Start with `$` (reserved for system namespaces)
2. Start with `__` (double underscore - security)
3. Start with a number
4. Contain dots (reserved for property access)
5. Be named: `true`, `false`, `null`, or `Infinity` (reserved values)

## Illegal Operations

1. Cannot use namespace heads in comparisons: `x < $math` (error)
2. Cannot use string literals in expressions (except JSON object property keys)
3. Cannot use booleans in arithmetic: `true + 5` (error)
4. Cannot alias functions (security)

## Testing

- Tests are in `packages/evalla/test/`
- Run tests: `npm test`
- Run specific test: `npm test -- boolean-output.test.ts`
- Build before testing: `npm run build` or `npm run build:evalla`

## Common Tasks

### Adding New Features

1. Update types in `packages/evalla/src/types.ts`
2. Update grammar in `packages/evalla/src/parser.peggy` if needed
3. Update evaluator in `packages/evalla/src/evaluator.ts`
4. Add validation in `packages/evalla/src/index.ts`
5. Add tests in `packages/evalla/test/`
6. **Update `packages/evalla/README.md`** (master source)
7. Run `npm run sync-readme` to copy README
8. Add examples to `packages/playground/src/data/examples.ts`

### Grammar Changes

The PEG grammar is in `packages/evalla/src/parser.peggy`. After changes:
```bash
npm run build:parser
npm run build
npm test
```

### Playground Examples

Examples are in `packages/playground/src/data/examples.ts`. Each example should:
- Have a clear title and description
- Demonstrate practical use cases
- Show the "Algebra, not code" philosophy
- Be concise but complete

## Design Principles

1. **User Freedom**: Users can use natural domain names without hitting reserved words
2. **Future-Proofing**: Can add system namespaces (`$interest`, `$chemistry`) without breaking user code
3. **Mathematical Semantics**: Favor algebraic conventions (like `=` for equality)
4. **Type Safety**: Boolean values cannot be used in arithmetic
5. **Simplicity**: Clear semantics, predictable behavior
6. **First-Class Values**: Reserved values (`true`, `false`, `null`, `Infinity`) are visible in output

## Security

- CodeQL scans are required before merging
- No security vulnerabilities should be introduced
- Function aliasing is blocked for security
- `__` prefix is reserved for security reasons

## References

- Design analysis: `FINAL_DECISIONS.md`
- Implementation checklist: Check `FINAL_DECISIONS.md` for remaining items
- Philosophy: "Algebra, not code" - evalla is a mathematical expression evaluator
