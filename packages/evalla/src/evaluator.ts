import Decimal from 'decimal.js';
import { createNamespaces, isNamespaceHead } from './namespaces.js';
import { evaluateAST } from './ast-evaluator.js';
import { EvallaError, SecurityError, EvaluationError } from './errors.js';
import { ErrorMessage } from './error-messages.js';

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
        ErrorMessage.NAMESPACE_HEAD_AS_VALUE
      );
    }
    
    // Security check: block function aliasing
    // Functions from namespaces must be called, not assigned to variables
    if (typeof result === 'function') {
      throw new SecurityError(
        ErrorMessage.FUNCTION_ALIASING_DENIED
      );
    }
    
    // Type restriction: expressions cannot return objects, arrays, or strings
    // Objects, arrays, and strings can only be provided via the value property
    if (typeof result === 'object' && result !== null && !(result instanceof Decimal)) {
      if (Array.isArray(result)) {
        throw new EvaluationError(
          ErrorMessage.EXPRESSION_CANNOT_RETURN_ARRAY
        );
      } else {
        throw new EvaluationError(
          ErrorMessage.EXPRESSION_CANNOT_RETURN_OBJECT
        );
      }
    }
    
    // Reject string results (except when converting numeric strings to Decimal)
    if (typeof result === 'string') {
      // Try to convert numeric strings to Decimal
      if (!isNaN(Number(result))) {
        return new Decimal(result);
      }
      // Non-numeric strings are not allowed
      throw new EvaluationError(
        ErrorMessage.EXPRESSION_CANNOT_RETURN_STRING
      );
    }
    
    // Convert numeric results to Decimal for precision
    if (result instanceof Decimal) {
      return result;
    } else if (typeof result === 'number') {
      return new Decimal(result);
    } else if (typeof result === 'boolean' || result === null) {
      // Boolean and null values pass through
      return result;
    } else if (result === undefined) {
      // Convert undefined to null (e.g., accessing non-existent property)
      return null;
    } else {
      // This should not be reached due to the checks above
      throw new EvaluationError(ErrorMessage.UNSUPPORTED_RESULT_TYPE, undefined, { resultType: typeof result });
    }
  } catch (error) {
    // Re-throw our custom error types directly
    if (error instanceof EvallaError) {
      throw error;
    }
    // Wrap other errors with the original message in context
    const originalMessage = error instanceof Error ? error.message : String(error);
    throw new EvaluationError(
      ErrorMessage.FAILED_TO_EVALUATE,
      undefined,
      { originalMessage },
      error instanceof Error ? error : undefined
    );
  }
};
