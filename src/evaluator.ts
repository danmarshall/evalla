import { parse } from 'acorn';
import Decimal from 'decimal.js';
import { createNamespaces } from './namespaces';
import { evaluateAST } from './ast-evaluator';

// Safe expression evaluator - no arbitrary code execution
export const evaluateExpression = async (
  expr: string,
  context: Record<string, any>
): Promise<any> => {
  try {
    // Wrap expression in parens if it starts with { to handle object literals
    const exprToParse = expr.trim().startsWith('{') ? `(${expr})` : expr;
    
    // Parse expression to AST using acorn - safe, no execution
    const program: any = parse(exprToParse, { ecmaVersion: 2020 });
    
    // Extract the expression from the Program node
    if (program.type !== 'Program' || !program.body || program.body.length === 0) {
      throw new Error('Invalid expression');
    }
    
    const statement = program.body[0];
    if (statement.type !== 'ExpressionStatement') {
      throw new Error('Expression must be a single expression statement');
    }
    
    const ast = statement.expression;
    
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
    throw new Error(`Failed to evaluate expression "${expr}": ${error instanceof Error ? error.message : String(error)}`);
  }
};
