import { parse } from 'acorn';
import Decimal from 'decimal.js';
import { createNamespaces } from './namespaces';
import { evaluateAST } from './ast-evaluator';

// Safe expression evaluator - no arbitrary code execution
export const evaluateExpression = async (
  expr: string,
  context: Record<string, any>
): Promise<Decimal> => {
  try {
    // Parse expression to AST using acorn - safe, no execution
    const program: any = parse(expr, { ecmaVersion: 2020 });
    
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
    
    // Convert result to Decimal if needed
    if (result instanceof Decimal) {
      return result;
    } else if (typeof result === 'number') {
      return new Decimal(result);
    } else if (typeof result === 'string') {
      return new Decimal(result);
    } else {
      throw new Error(`Expression result must be a number, got: ${typeof result}`);
    }
  } catch (error) {
    throw new Error(`Failed to evaluate expression "${expr}": ${error instanceof Error ? error.message : String(error)}`);
  }
};
