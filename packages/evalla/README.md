# evalla

Safe math evaluator with variables, dependencies, and precision.

```typescript
import { evalla } from 'evalla';

const result = await evalla([
  { name: 'a', expr: 'c + 5' },          // depends on c
  { name: 'b', expr: 'a * 2' },          // depends on a
  { name: 'c', expr: '1 + 1' }           // base constant
]);

console.log(result.values.a.toString()); // "7"
console.log(result.values.b.toString()); // "14"
console.log(result.values.c.toString()); // "2"
console.log(result.order);               // ['c', 'a', 'b']
```

## Features

- ✅ **Decimal Precision**: Uses [decimal.js](https://mikemcl.github.io/decimal.js/) internally for accurate arithmetic
- ✅ **Variable References**: Support dependencies between expressions
- ✅ **Dot-Traversal**: Reference nested properties (e.g., `point.x`, `offset.y`)
- ✅ **Topological Ordering**: Evaluates in correct dependency order (DAG)
- ✅ **Circular Detection**: Throws error on circular dependencies
- ✅ **Safe Evaluation**: Parses with [Peggy](https://peggyjs.org/) parser, evaluates AST (no `eval()` or `Function()`)
- ✅ **Keywords as Variables**: Unlike JavaScript, keywords like `return`, `if`, etc. can be used as variable names
- ✅ [**Namespaces**](#namespaces): Built-in `$math`, `$unit`, and `$angle` functions

## Installation

```bash
npm install evalla
```

### Input Format

```typescript
interface ExpressionInput {
  name: string;         // Variable name (cannot start with $)
  expr?: string;        // Math expression (optional if value is provided)
  value?: any;          // Direct value (optional if expr is provided)
}
```

You must provide either `expr` or `value` per item. The `value` property allows you to pass objects directly without stringifying them into expressions.

**Using expressions:**
```typescript
const result = await evalla([
  { name: 'width', expr: '100' },
  { name: 'height', expr: '50' }
]);
```

**Using direct values:**
```typescript
const result = await evalla([
  { name: 'point', value: { x: 10, y: 20 } },
  { name: 'offset', value: { x: 5, y: 10 } }
]);
```

**Mixing both:**
```typescript
const result = await evalla([
  { name: 'data', value: { width: 100, height: 50 } },
  { name: 'area', expr: 'data.width * data.height' }
]);
```

### Output Format

```typescript
interface EvaluationResult {
  values: Record<string, Decimal>;  // Computed values as Decimal objects
  order: string[];                  // Evaluation order (topologically sorted)
}
```

## Examples

### Basic Arithmetic with Precision

```typescript
const result = await evalla([
  { name: 'x', expr: '0.1 + 0.2' }
]);

console.log(result.values.x.toString()); // "0.3" (exact!)
```

### Variable Dependencies

```typescript
const result = await evalla([
  { name: 'd', expr: 'c * 2' },
  { name: 'b', expr: 'a + 10' },
  { name: 'c', expr: 'b * 3' },
  { name: 'a', expr: '5' }
]);

// Automatically orders: a, b, c, d
console.log(result.order); // ['a', 'b', 'c', 'd']
console.log(result.values.d.toString()); // "90"
```

### Dot-Traversal with Object Literals

Variable names must be simple identifiers (no dots), but expressions can use object literals and dot-notation:

```typescript
const result = await evalla([
  { name: 'point', expr: '{x: 10, y: 20}' },
  { name: 'offset', expr: '{x: 5, y: 10}' },
  { name: 'resultX', expr: 'point.x + offset.x' },
  { name: 'resultY', expr: 'point.y + offset.y' }
]);

console.log(result.values.resultX.toString()); // "15"
console.log(result.values.resultY.toString()); // "25"
```

### Nested Property Access

```typescript
const result = await evalla([
  { name: 'data', expr: '{pos: {x: 5, y: 10}, scale: 2}' },
  { name: 'scaledX', expr: 'data.pos.x * data.scale' }
]);

console.log(result.values.scaledX.toString()); // "10"
```

### Namespaces

Variables may not begin with $, this is reserved for namespaces for built-in functions and constants.

#### $math Namespace

Mathematical constants and functions:

```typescript
const result = await evalla([
  { name: 'circumference', expr: '2 * $math.PI * 10' },
  { name: 'absVal', expr: '$math.abs(-42)' },
  { name: 'sqrtVal', expr: '$math.sqrt(16)' },
  { name: 'maxVal', expr: '$math.max(10, 5, 20, 3)' }
]);
```

**Available:**
- Constants: `PI`, `E`, `SQRT2`, `SQRT1_2`, `LN2`, `LN10`, `LOG2E`, `LOG10E`
- Functions: `abs`, `sqrt`, `cbrt`, `floor`, `ceil`, `round`, `trunc`, `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`, `exp`, `ln`, `log`, `log10`, `log2`, `pow`, `min`, `max`

#### $unit Namespace

Unit conversion functions:

```typescript
const result = await evalla([
  { name: 'inches', expr: '$unit.mmToInch(25.4)' },
  { name: 'mm', expr: '$unit.inchToMm(1)' }
]);
```

**Available:**
- `mmToInch`, `inchToMm`
- `cmToInch`, `inchToCm`
- `mToFt`, `ftToM`

#### $angle Namespace

Angle conversion functions:

```typescript
const result = await evalla([
  { name: 'radians', expr: '$angle.toRad(180)' },
  { name: 'degrees', expr: '$angle.toDeg($math.PI)' }
]);
```

**Available:**
- `toRad` (degrees to radians)
- `toDeg` (radians to degrees)

### Circular Dependency Detection

```typescript
try {
  await evalla([
    { name: 'a', expr: 'b + 1' },
    { name: 'b', expr: 'a + 1' }
  ]);
} catch (error) {
  console.log(error.message); // "Circular dependency detected: b -> a -> b"
}
```

### Variable naming

Variables may not begin with a number, double underscore(__), or $ (see namespaces above).

#### Keywords as Variable Names

Unlike JavaScript, algebra-like variable names can include JavaScript keywords:

```typescript
const result = await evalla([
  { name: 'return', expr: '10' },
  { name: 'if', expr: '20' },
  { name: 'for', expr: 'return + if' }
]);

console.log(result.values.for.toString()); // "30"
```

## Security

**Safe by design:**
- ❌ No access to `eval()`, `Function()`, or other dangerous globals
- ❌ No access to `process`, `require`, or Node.js internals
- ❌ No access to dangerous properties: `prototype`, `__proto__`, `constructor`, or any property starting with `__`
- ✅ Only whitelisted functions in namespaces
- ✅ Uses AST parsing (Peggy) + safe evaluation
- ✅ Variable names cannot start with `$` (reserved for system)
- ✅ Sandboxed scope with `Object.create(null)`
- ✅ No prototype pollution

**Blocked property access examples:**
```typescript
// These will throw SecurityError
await evalla([{ name: 'bad', expr: 'obj.prototype' }]);
await evalla([{ name: 'bad', expr: 'obj.__proto__' }]);
await evalla([{ name: 'bad', expr: 'obj.constructor' }]);
await evalla([{ name: 'bad', expr: 'obj.__defineGetter__' }]);
```

Properties starting with `__` are blocked because they typically provide access to JavaScript internals that could be exploited for prototype pollution or other security vulnerabilities.

## API

### `evalla(inputs: ExpressionInput[]): Promise<EvaluationResult>`

Evaluates an array of math expressions with dependencies.

**Parameters:**
- `inputs`: Array of `{ name, expr }` objects

**Returns:**
- Promise resolving to `{ values, order }`

**Throws:**
- `ValidationError` - Invalid input (missing name, duplicate names, invalid variable names)
  - Properties: `variableName`
- `CircularDependencyError` - Circular dependencies detected
  - Properties: `cycle` (array of variable names in the cycle)
- `ParseError` - Syntax/parsing errors in expressions (extends `EvaluationError`)
  - Properties: `variableName`, `expression`, `line`, `column`
- `EvaluationError` - Runtime evaluation errors (undefined variables, type errors)
  - Properties: `variableName`
- `SecurityError` - Attempt to access blocked properties (prototype, __proto__, constructor, __*)
  - Properties: `property`

All errors include structured details for programmatic access - no need to parse error messages!

**Error Handling:**
```typescript
import { evalla, ParseError, SecurityError, CircularDependencyError, ValidationError, EvaluationError } from 'evalla';

try {
  const result = await evalla(inputs);
} catch (error) {
  // Catch ParseError first since it extends EvaluationError
  if (error instanceof ParseError) {
    console.error(`Syntax error in "${error.variableName}" at ${error.line}:${error.column}`);
    console.error(`Expression: ${error.expression}`);
  } else if (error instanceof EvaluationError) {
    console.error(`Runtime error in "${error.variableName}"`);
  } else if (error instanceof SecurityError) {
    console.error(`Security violation: attempted to access "${error.property}"`);
  } else if (error instanceof CircularDependencyError) {
    console.error(`Circular dependency: ${error.cycle.join(' -> ')}`);
  } else if (error instanceof ValidationError) {
    console.error(`Invalid variable: "${error.variableName}"`);
  }
}
```

### `checkSyntax(expr: string): SyntaxCheckResult`

Checks the syntax of an expression without evaluating it. Useful for text editors to validate expressions before sending them for evaluation.

**Parameters:**
- `expr`: The expression string to check

**Returns:**
- Object with the following properties:
  - `valid`: boolean - Whether the syntax is valid
  - `error?`: string - Error message if syntax is invalid
  - `line?`: number - Line number where error occurred (1-indexed)
  - `column?`: number - Column number where error occurred (1-indexed)

**Example:**
```typescript
import { checkSyntax } from 'evalla';

// Valid expression
const result1 = checkSyntax('a + b * 2');
console.log(result1.valid); // true

// Invalid expression - missing closing parenthesis
const result2 = checkSyntax('(a + b');
console.log(result2.valid); // false
console.log(result2.error); // "Parse error at line 1, column 7: Expected..."
console.log(result2.line); // 1
console.log(result2.column); // 7
```

**Usage Patterns:**

When to use `checkSyntax()` vs just calling `evalla()`:

```typescript
import { checkSyntax, evalla, EvaluationError } from 'evalla';

// Pattern 1: Pre-validate for immediate user feedback (recommended for text editors/UI)
const inputs = [
  { name: 'a', expr: 'c + 5' },
  { name: 'b', expr: 'a * 2' }
];

// Check syntax of each expression before calling evalla
for (const input of inputs) {
  if (input.expr) {
    const check = checkSyntax(input.expr);
    if (!check.valid) {
      console.error(`Invalid syntax in "${input.name}": ${check.error}`);
      return; // Don't call evalla with invalid syntax
    }
  }
}

// All syntax valid, now evaluate
const result = await evalla(inputs);

// Pattern 2: Let evalla handle all validation (simpler for batch processing)
try {
  const result = await evalla(inputs);
  // Success - use result
} catch (error) {
  // Catch ParseError specifically to handle syntax errors
  if (error instanceof ParseError) {
    console.error(`Syntax error in "${error.variableName}" at ${error.line}:${error.column}`);
  } else if (error instanceof EvaluationError) {
    console.error('Runtime evaluation error:', error.message);
  }
  // Handle other error types (ValidationError, CircularDependencyError, etc.)
}
```

**Note:** 
- `checkSyntax()` only validates expression syntax. It does not check variable names, detect circular dependencies, or validate that referenced variables exist.
- `evalla()` throws `ParseError` for syntax errors with the same details (line, column, message) as `checkSyntax()`, plus identifies which variable has the error.
- `ParseError` extends `EvaluationError`, so catch `ParseError` first if you want to handle syntax errors differently from runtime errors.
- Use `checkSyntax()` for pre-flight validation (e.g., real-time feedback as user types). Use `evalla()` for complete validation and evaluation.

## Philosophy

- **Minimal**: Bare minimum dependencies and code
- **Modular**: Separated concerns (parser, evaluator, namespaces, toposort)
- **DRY**: No code duplication
- **Testable**: Small, focused functions with clear interfaces
- **Safe & Secure**: No arbitrary code execution, whitelist-only approach
- **Efficient**: Parse once, use for both dependency extraction and evaluation

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test
```

For detailed API documentation and examples, see the sections above.

## License

MIT
