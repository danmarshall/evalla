import Decimal from 'decimal.js';
import { EvaluationResult } from './types.js';
import { ErrorMessage } from './error-messages.js';

/**
 * Format Decimal values in evaluation results to specified decimal places.
 * 
 * This function is useful for displaying results with appropriate precision
 * without affecting the evaluation logic. Boolean and null values are 
 * preserved unchanged.
 * 
 * @param result - Evaluation result from evalla()
 * @param options - Formatting options
 * @returns New result with formatted Decimal values
 * 
 * @example
 * ```typescript
 * const result = await evalla([{ name: 'pi', expr: '3.14159265358979323846' }]);
 * const formatted = formatResults(result, { decimalPlaces: 7 });
 * console.log(formatted.values.pi.toString()); // "3.1415927"
 * ```
 * 
 * @example
 * ```typescript
 * // Financial precision (2 decimal places)
 * const result = await evalla([
 *   { name: 'price', expr: '19.99' },
 *   { name: 'quantity', expr: '7' },
 *   { name: 'total', expr: 'price * quantity' }
 * ]);
 * const formatted = formatResults(result, { decimalPlaces: 2 });
 * console.log(formatted.values.total.toString()); // "139.93"
 * ```
 */
export function formatResults(
  result: EvaluationResult,
  options: { decimalPlaces: number }
): EvaluationResult {
  const { decimalPlaces } = options;
  
  // Validate input
  if (typeof decimalPlaces !== 'number' || decimalPlaces < 0 || !Number.isInteger(decimalPlaces)) {
    throw new Error(ErrorMessage.DECIMAL_PLACES_INVALID);
  }
  
  // Create new values object with formatted Decimals
  const values: Record<string, Decimal | boolean | null> = {};
  
  for (const [name, value] of Object.entries(result.values)) {
    if (value instanceof Decimal && value.isFinite()) {
      // Format finite Decimal values
      values[name] = value.toDecimalPlaces(decimalPlaces);
    } else {
      // Preserve boolean, null, and Infinity unchanged
      values[name] = value;
    }
  }
  
  // Return new result object (immutable)
  return {
    values,
    order: result.order
  };
}
