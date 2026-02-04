import Decimal from 'decimal.js';
import { createNamespaces } from './namespaces';
import { evaluateAST } from './ast-evaluator';

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
    
    // Convert numeric results to Decimal for precision
    if (result instanceof Decimal) {
      return result;
    } else if (typeof result === 'number') {
      return new Decimal(result);
    } else if (typeof result === 'string' && !isNaN(Number(result))) {
      return new Decimal(result);
    } else {
      // Return as-is for objects, arrays, etc.
      return result;
    }
  } catch (error) {
    throw new Error(`Failed to evaluate expression: ${error instanceof Error ? error.message : String(error)}`);
  }
};
