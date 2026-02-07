import Decimal from 'decimal.js';
import { createNamespaces, isNamespaceHead } from './namespaces.js';
import { evaluateAST } from './ast-evaluator.js';
import { EvallaError, SecurityError, EvaluationError } from './errors.js';

// Safe expression evaluator - no arbitrary code execution
// Accepts a pre-parsed AST for efficiency (no double parsing)
export const evaluateExpression = async (
  ast: any,
  context: Record<string, any>
): Promise<any> => {
  try {
    // Create safe evaluation scope with namespaces
    const namespaces = createNamespaces();
    const safeScope = Object.create(null);
    
    // Add context variables (previously computed values)
    for (const [key, value] of Object.entries(context)) {
      safeScope[key] = value;
    }
    
    // Add namespaces to scope
    for (const [key, value] of Object.entries(namespaces)) {
      safeScope[key] = value;
    }
    
    // Evaluate AST with custom evaluator that uses Decimal for precision
    const result = await evaluateAST(ast, safeScope);
    
    // Security check: block namespace heads
    // Namespace heads like $math, $angle should never be used as standalone values
    if (isNamespaceHead(result)) {
      throw new EvaluationError(
        'Cannot use namespace head as a value - namespace heads must be used with property access (e.g., $math.PI) or method calls (e.g., $math.abs(x))'
      );
    }
    
    // Security check: block function aliasing
    // Functions from namespaces must be called, not assigned to variables
    if (typeof result === 'function') {
      throw new SecurityError(
        'Cannot alias functions - functions must be called with parentheses'
      );
    }
    
    // Type restriction: expressions cannot return objects or arrays
    // Objects and arrays can only be provided via the value property
    if (typeof result === 'object' && result !== null && !(result instanceof Decimal)) {
      if (Array.isArray(result)) {
        throw new EvaluationError(
          'Expressions cannot return arrays - arrays must be provided via the value property'
        );
      } else {
        throw new EvaluationError(
          'Expressions cannot return objects - objects must be provided via the value property'
        );
      }
    }
    
    // Convert numeric results to Decimal for precision
    if (result instanceof Decimal) {
      return result;
    } else if (typeof result === 'number') {
      return new Decimal(result);
    } else if (typeof result === 'string' && !isNaN(Number(result))) {
      return new Decimal(result);
    } else if (typeof result === 'boolean' || result === null) {
      // Boolean and null values pass through
      return result;
    } else {
      // This should not be reached due to the check above
      throw new EvaluationError(
        `Unsupported expression result type: ${typeof result}`
      );
    }
  } catch (error) {
    // Re-throw our custom error types directly
    if (error instanceof EvallaError) {
      throw error;
    }
    // Wrap other errors
    throw new Error(`Failed to evaluate expression: ${error instanceof Error ? error.message : String(error)}`);
  }
};
