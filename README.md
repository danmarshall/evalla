# evalla

Safe math evaluator with variables, dependencies, and precision.

**Minimal TypeScript library that SAFELY evaluates strings of math expressions with variable references.**

## Philosophy

- **Minimal**: Bare minimum dependencies and code
- **Modular**: Separated concerns (parser, evaluator, namespaces, toposort)
- **DRY**: No code duplication
- **Testable**: Small, focused functions with clear interfaces
- **Safe & Secure**: No arbitrary code execution, whitelist-only approach

## Features

- ✅ **Decimal Precision**: Uses `decimal.js` internally for accurate arithmetic
- ✅ **Variable References**: Support dependencies between expressions
- ✅ **Dot-Traversal**: Reference nested properties (e.g., `point.x`, `offset.y`)
- ✅ **Topological Ordering**: Evaluates in correct dependency order (DAG)
- ✅ **Circular Detection**: Throws error on circular dependencies
- ✅ **Safe Evaluation**: Parses with `acorn`, evaluates AST (no `eval()` or `Function()`)
- ✅ **Namespaces**: Built-in `$math`, `$unit`, and `$angle` functions

## Installation

```bash
npm install evalla
```

## Usage

```typescript
import { evalla } from 'evalla';

const result = await evalla([
  { name: 'width', expr: '100' },
  { name: 'height', expr: '50' },
  { name: 'area', expr: 'width * height' }
]);

console.log(result.values.area.toString()); // "5000"
console.log(result.order); // ['width', 'height', 'area']
```

### Input Format

```typescript
interface ExpressionInput {
  name: string;  // Variable name (cannot start with $)
  expr: string;  // Math expression
}
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

## Security

**Safe by design:**
- ❌ No access to `eval()`, `Function()`, or other dangerous globals
- ❌ No access to `process`, `require`, or Node.js internals
- ✅ Only whitelisted functions in namespaces
- ✅ Uses AST parsing (acorn) + safe evaluation
- ✅ Variable names cannot start with `$` (reserved for system)
- ✅ Sandboxed scope with `Object.create(null)`
- ✅ No prototype pollution

## API

### `evalla(inputs: ExpressionInput[]): Promise<EvaluationResult>`

Evaluates an array of math expressions with dependencies.

**Parameters:**
- `inputs`: Array of `{ name, expr }` objects

**Returns:**
- Promise resolving to `{ values, order }`

**Throws:**
- Input validation errors
- Circular dependency errors
- Expression evaluation errors

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Watch mode
npm run test:watch
```

## License

MIT
