import Decimal from 'decimal.js';
import { ExpressionInput, EvaluationResult } from './types.js';
import { topologicalSort } from './toposort.js';
import { evaluateExpression } from './evaluator.js';
import { ValidationError } from './errors.js';
import { checkVariableName } from './variable-name-checker.js';
import { ErrorMessage } from './error-messages.js';

// Main evalla function - minimal, modular, DRY, testable, safe, secure
export const evalla = async (inputs: ExpressionInput[]): Promise<EvaluationResult> => {
  // Input validation - security first
  if (!Array.isArray(inputs)) {
    throw new ValidationError(ErrorMessage.INPUT_MUST_BE_ARRAY);
  }
  
  for (const input of inputs) {
    if (!input || typeof input !== 'object') {
      throw new ValidationError(ErrorMessage.INPUT_MUST_BE_OBJECT);
    }
    if (typeof input.name !== 'string' || !input.name) {
      throw new ValidationError(ErrorMessage.INPUT_NAME_REQUIRED);
    }
    
    // Validate variable name using checkVariableName
    const nameCheck = checkVariableName(input.name);
    if (!nameCheck.valid) {
      throw new ValidationError(
        `${nameCheck.error}: ${input.name}`,
        input.name
      );
    }
    
    // Allow blank/empty expr (will evaluate to null)
    // But require at least one of expr or value to be present
    if (input.expr === undefined && input.value === undefined) {
      throw new ValidationError(
        `${ErrorMessage.INPUT_EXPR_OR_VALUE_REQUIRED}: ${input.name}`,
        input.name
      );
    }
    if (input.expr !== undefined && typeof input.expr !== 'string') {
      throw new ValidationError(
        `${ErrorMessage.INPUT_EXPR_MUST_BE_STRING}: ${input.name}`,
        input.name
      );
    }
  }
  
  // Check for duplicate names
  const nameSet = new Set<string>();
  for (const input of inputs) {
    if (nameSet.has(input.name)) {
      throw new ValidationError(`${ErrorMessage.DUPLICATE_NAME}: ${input.name}`, input.name);
    }
    nameSet.add(input.name);
  }
  
  // Determine evaluation order using topological sort (handles DAG + cycle detection)
  // This also parses all expressions once and returns the ASTs
  const { order, asts } = topologicalSort(inputs);
  
  // Create lookup for values
  const valueMap = new Map<string, any>();
  for (const input of inputs) {
    if (input.value !== undefined) {
      valueMap.set(input.name, input.value);
    }
  }
  
  // Evaluate in topological order
  const values: Record<string, Decimal | boolean | null> = Object.create(null);
  const context: Record<string, any> = Object.create(null);
  
  for (const name of order) {
    let result: any;
    
    // If value is provided directly, use it
    if (valueMap.has(name)) {
      result = valueMap.get(name);
    } else {
      // Otherwise, evaluate the expression using the pre-parsed AST
      const ast = asts.get(name);
      if (!ast) {
        // No AST means blank/empty expression - return null
        result = null;
      } else {
        result = await evaluateExpression(ast, context);
      }
    }
    
    // Store result - can be Decimal, boolean, or null
    if (result instanceof Decimal) {
      values[name] = result;
      context[name] = result;
    } else if (typeof result === 'boolean' || result === null) {
      // Boolean and null values are now valid outputs
      values[name] = result;
      context[name] = result;
    } else {
      // Non-Decimal/boolean/null result (object, array, etc.) - store in context only
      context[name] = result;
      // For output, we need a valid type
      if (typeof result === 'number') {
        values[name] = new Decimal(result);
      } else {
        // Objects/arrays are stored in context for dot-access but not in output values
        // This allows intermediate object values that aren't final results
      }
    }
  }
  
  return { values, order };
};

// Export types and utilities for external use
export { ExpressionInput, EvaluationResult } from './types.js';
export { Decimal };
export { 
  EvallaError, 
  SecurityError, 
  CircularDependencyError, 
  ValidationError, 
  EvaluationError,
  ParseError
} from './errors.js';
export { checkSyntax, SyntaxCheckResult } from './syntax-checker.js';
export { 
  checkVariableName, 
  VariableNameCheckResult,
  isValidName,
  VALID_NAME_PATTERN,
  RESERVED_VALUES
} from './variable-name-checker.js';
export { formatResults } from './format-results.js';
export { 
  ErrorMessage,
  formatErrorMessage 
} from './error-messages.js';
