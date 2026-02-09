/**
 * API Mockup: Decimal Places Implementation
 * 
 * This file shows exactly what the API would look like once implemented.
 * DO NOT IMPLEMENT until decisions are finalized.
 */

import Decimal from 'decimal.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ExpressionInput {
  name: string;
  expr?: string;
  value?: any;
}

interface EvallaOptions {
  /**
   * Number of decimal places for output formatting.
   * 
   * - Set to a number (e.g., 7) to format Decimal values to that many decimal places
   * - Set to undefined or omit for unlimited precision (current behavior)
   * 
   * Note: This only affects output formatting. Internal calculations always use
   * full precision to maintain accuracy.
   * 
   * @default undefined (unlimited precision)
   * 
   * @example
   * // Format to 7 decimal places
   * await evalla(inputs, { decimalPlaces: 7 });
   * 
   * @example
   * // Financial precision (2 decimal places)
   * await evalla(inputs, { decimalPlaces: 2 });
   * 
   * @example
   * // Unlimited precision (current behavior)
   * await evalla(inputs);
   * await evalla(inputs, { decimalPlaces: undefined });
   */
  decimalPlaces?: number;
}

interface EvaluationResult {
  values: Record<string, Decimal | boolean | null>;
  order: string[];
}

// ============================================================================
// FUNCTION SIGNATURE (Updated)
// ============================================================================

/**
 * Evaluate mathematical expressions with dependencies
 * 
 * @param inputs - Array of expressions to evaluate
 * @param options - Optional configuration
 * @returns Evaluation result with values and order
 * 
 * @example
 * // Basic usage (unlimited precision)
 * const result = await evalla([
 *   { name: 'a', expr: '10' },
 *   { name: 'b', expr: 'a * 2' }
 * ]);
 * 
 * @example
 * // With 7 decimal places
 * const result = await evalla([
 *   { name: 'pi', expr: '3.14159265358979323846' }
 * ], { decimalPlaces: 7 });
 * console.log(result.values.pi.toString()); // "3.1415927"
 */
declare function evalla(
  inputs: ExpressionInput[],
  options?: EvallaOptions
): Promise<EvaluationResult>;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

// Example 1: Backward compatible (current behavior)
async function example1() {
  const result = await evalla([
    { name: 'a', expr: '10' },
    { name: 'b', expr: '20' },
    { name: 'c', expr: 'a + b' }
  ]);
  
  console.log(result.values.c.toString()); // "30"
  // No change from current behavior
}

// Example 2: With 7 decimal places (proposed default)
async function example2() {
  const result = await evalla([
    { name: 'pi', expr: '3.14159265358979323846' },
    { name: 'oneThird', expr: '1/3' },
    { name: 'calculation', expr: 'pi * oneThird' }
  ], { decimalPlaces: 7 });
  
  console.log(result.values.pi.toString());          // "3.1415927"
  console.log(result.values.oneThird.toString());    // "0.3333333"
  console.log(result.values.calculation.toString()); // "1.047198"
  
  // Note: Internal calculation used full precision:
  // 3.14159265358979323846 * 0.33333333333333333333 = 1.04719755119659774615333...
  // Then formatted to: 1.047198 (7 decimal places)
}

// Example 3: Financial precision (2 decimal places)
async function example3() {
  const result = await evalla([
    { name: 'price', expr: '19.99' },
    { name: 'quantity', expr: '7' },
    { name: 'subtotal', expr: 'price * quantity' },
    { name: 'tax', expr: 'subtotal * 0.08' },
    { name: 'total', expr: 'subtotal + tax' }
  ], { decimalPlaces: 2 });
  
  console.log(`Subtotal: $${result.values.subtotal}`); // "139.93"
  console.log(`Tax:      $${result.values.tax}`);      // "11.19"
  console.log(`Total:    $${result.values.total}`);    // "151.12"
}

// Example 4: Custom precision for different use cases
async function example4() {
  // GPS coordinates (6-7 decimal places for meter accuracy)
  const gps = await evalla([
    { name: 'lat', expr: '37.7749295' },
    { name: 'lon', expr: '-122.4194155' }
  ], { decimalPlaces: 7 });
  
  // Temperature (1-2 decimal places)
  const temp = await evalla([
    { name: 'celsius', expr: '37' },
    { name: 'fahrenheit', expr: 'celsius * 9/5 + 32' }
  ], { decimalPlaces: 1 });
  
  // Engineering (6-7 decimal places)
  const engineering = await evalla([
    { name: 'radius', expr: '10' },
    { name: 'area', expr: '$math.PI * $math.pow(radius, 2)' }
  ], { decimalPlaces: 6 });
}

// Example 5: Explicit unlimited precision
async function example5() {
  const result = await evalla([
    { name: 'pi', expr: '3.14159265358979323846' }
  ], { decimalPlaces: undefined });
  
  console.log(result.values.pi.toString()); // "3.14159265358979323846"
  // Same as not passing options at all
}

// Example 6: Edge cases
async function example6() {
  const result = await evalla([
    { name: 'infinity', expr: '1/0' },
    { name: 'small', expr: '0.0000000123' },
    { name: 'isTrue', expr: 'true' },
    { name: 'empty', expr: '' }
  ], { decimalPlaces: 7 });
  
  console.log(result.values.infinity.toString()); // "Infinity" (not formatted)
  console.log(result.values.small.toString());    // "0" (precision loss)
  console.log(result.values.isTrue);              // true (not formatted)
  console.log(result.values.empty);               // null (not formatted)
}

// ============================================================================
// IMPLEMENTATION PSEUDOCODE
// ============================================================================

/**
 * Simplified implementation (actual code would be in src/index.ts)
 */
async function evallaImpl(
  inputs: ExpressionInput[],
  options?: EvallaOptions
): Promise<EvaluationResult> {
  // ... existing validation and evaluation logic ...
  
  const values: Record<string, Decimal | boolean | null> = {};
  
  // ... evaluate all expressions (using full precision) ...
  // ... populate values object ...
  
  // NEW: Apply decimal places formatting if specified
  const decimalPlaces = options?.decimalPlaces;
  if (decimalPlaces !== undefined && decimalPlaces >= 0) {
    for (const [name, value] of Object.entries(values)) {
      if (value instanceof Decimal && value.isFinite()) {
        // Format the Decimal value to specified decimal places
        values[name] = value.toDecimalPlaces(decimalPlaces);
      }
      // Boolean and null values are not affected
      // Infinity is not formatted (checked with .isFinite())
    }
  }
  
  return { values, order: [] };
}

// ============================================================================
// PLAYGROUND USAGE
// ============================================================================

/**
 * Playground component mockup (actual code would be in PlaygroundApp.tsx)
 */
function PlaygroundMockup() {
  // State
  const [decimalPlaces, setDecimalPlaces] = React.useState<number | undefined>(undefined);
  const [expressions, setExpressions] = React.useState<ExpressionInput[]>([]);
  const [result, setResult] = React.useState<EvaluationResult | null>(null);
  
  // Evaluate handler
  const handleEvaluate = async () => {
    try {
      const evalResult = await evalla(expressions, { 
        decimalPlaces: decimalPlaces 
      });
      setResult(evalResult);
    } catch (error) {
      console.error(error);
    }
  };
  
  // UI mockup
  return (
    <div>
      {/* Decimal Places Control */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Decimal Places:
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max="20"
            value={decimalPlaces ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setDecimalPlaces(val === '' ? undefined : parseInt(val));
            }}
            placeholder="Unlimited"
            className="border px-2 py-1 rounded w-24"
          />
          <button
            onClick={() => setDecimalPlaces(undefined)}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Unlimited
          </button>
          <button
            onClick={() => setDecimalPlaces(7)}
            className="px-3 py-1 bg-blue-200 rounded"
          >
            7 (Default)
          </button>
          <button
            onClick={() => setDecimalPlaces(2)}
            className="px-3 py-1 bg-green-200 rounded"
          >
            2 (Financial)
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {decimalPlaces === undefined 
            ? 'Full precision (current behavior)' 
            : `Formatted to ${decimalPlaces} decimal places`}
        </p>
      </div>
      
      {/* ... rest of playground UI ... */}
      
      {/* Evaluate Button */}
      <button onClick={handleEvaluate}>
        Evaluate
      </button>
      
      {/* Results Display */}
      {result && (
        <div>
          {Object.entries(result.values).map(([name, value]) => (
            <div key={name}>
              {name}: {String(value)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TESTING MOCKUP
// ============================================================================

describe('Decimal Places', () => {
  test('formats to 7 decimal places', async () => {
    const result = await evalla(
      [{ name: 'pi', expr: '3.14159265358979323846' }],
      { decimalPlaces: 7 }
    );
    expect((result.values.pi as Decimal).toString()).toBe('3.1415927');
  });
  
  test('formats to 2 decimal places', async () => {
    const result = await evalla(
      [{ name: 'price', expr: '19.99' }],
      { decimalPlaces: 2 }
    );
    expect((result.values.price as Decimal).toString()).toBe('19.99');
  });
  
  test('unlimited precision by default', async () => {
    const result = await evalla([{ name: 'pi', expr: '3.14159265358979323846' }]);
    expect((result.values.pi as Decimal).toString()).toBe('3.14159265358979323846');
  });
  
  test('handles Infinity without error', async () => {
    const result = await evalla(
      [{ name: 'inf', expr: '1/0' }],
      { decimalPlaces: 7 }
    );
    expect((result.values.inf as Decimal).toString()).toBe('Infinity');
  });
  
  test('does not format boolean values', async () => {
    const result = await evalla(
      [{ name: 'isTrue', expr: 'true' }],
      { decimalPlaces: 7 }
    );
    expect(result.values.isTrue).toBe(true);
  });
  
  test('does not format null values', async () => {
    const result = await evalla(
      [{ name: 'empty', expr: '' }],
      { decimalPlaces: 7 }
    );
    expect(result.values.empty).toBe(null);
  });
  
  test('maintains precision during calculation', async () => {
    const result = await evalla([
      { name: 'a', expr: '1/3' },
      { name: 'b', expr: 'a * 3' }
    ], { decimalPlaces: 7 });
    
    // 1/3 = 0.3333333... (calculated with full precision)
    // 0.3333333... * 3 = 1.0 (exactly)
    // Then formatted:
    expect((result.values.a as Decimal).toString()).toBe('0.3333333');
    expect((result.values.b as Decimal).toString()).toBe('1'); // Exact!
  });
});

// ============================================================================
// DOCUMENTATION SNIPPET
// ============================================================================

/**
 * README.md addition:
 * 
 * ## Output Formatting
 * 
 * By default, evalla returns Decimal values with full precision. You can control
 * the number of decimal places in the output by passing the `decimalPlaces` option:
 * 
 * ```typescript
 * const result = await evalla([
 *   { name: 'pi', expr: '3.14159265358979323846' }
 * ], { decimalPlaces: 7 });
 * 
 * console.log(result.values.pi.toString()); // "3.1415927"
 * ```
 * 
 * **Important**: The `decimalPlaces` option only affects output formatting. Internal
 * calculations always use full precision to maintain accuracy.
 * 
 * ### Common Use Cases
 * 
 * - **Financial**: `{ decimalPlaces: 2 }` - Two decimal places for money
 * - **Engineering**: `{ decimalPlaces: 6 }` or `{ decimalPlaces: 7 }` - High precision
 * - **Scientific**: `{ decimalPlaces: 4 }` or higher - Depends on measurement accuracy
 * - **Default**: Omit option or use `undefined` for unlimited precision
 * 
 * ### Example
 * 
 * ```typescript
 * // Financial calculation with 2 decimal places
 * const invoice = await evalla([
 *   { name: 'price', expr: '19.99' },
 *   { name: 'quantity', expr: '7' },
 *   { name: 'total', expr: 'price * quantity' }
 * ], { decimalPlaces: 2 });
 * 
 * console.log(`Total: $${invoice.values.total}`); // "Total: $139.93"
 * ```
 */

export {};
