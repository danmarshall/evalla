import Decimal from 'decimal.js';
import { ExpressionInput, EvaluationResult } from './types';
import { topologicalSort } from './toposort';
import { evaluateExpression } from './evaluator';

// Main evalla function - minimal, modular, DRY, testable, safe, secure
export const evalla = async (inputs: ExpressionInput[]): Promise<EvaluationResult> => {
  // Input validation - security first
  if (!Array.isArray(inputs)) {
    throw new Error('Input must be an array');
  }
  
  for (const input of inputs) {
    if (!input || typeof input !== 'object') {
      throw new Error('Each input must be an object');
    }
    if (typeof input.name !== 'string' || !input.name) {
      throw new Error('Each input must have a non-empty string "name"');
    }
    if (input.name.startsWith('$')) {
      throw new Error(`Variable names cannot start with $: ${input.name} ($ is reserved for system namespaces)`);
    }
    if (input.name.includes('.')) {
      throw new Error(`Variable names cannot contain dots: ${input.name} (dots are only for property access in expressions)`);
    }
    if (!input.expr && input.value === undefined) {
      throw new Error(`Each input must have either "expr" or "value": ${input.name}`);
    }
    if (input.expr !== undefined && typeof input.expr !== 'string') {
      throw new Error(`"expr" must be a string if provided: ${input.name}`);
    }
  }
  
  // Check for duplicate names
  const nameSet = new Set<string>();
  for (const input of inputs) {
    if (nameSet.has(input.name)) {
      throw new Error(`Duplicate name: ${input.name}`);
    }
    nameSet.add(input.name);
  }
  
  // Determine evaluation order using topological sort (handles DAG + cycle detection)
  const order = topologicalSort(inputs);
  
  // Create lookup for expressions and values
  const exprMap = new Map<string, string>();
  const valueMap = new Map<string, any>();
  for (const input of inputs) {
    if (input.expr !== undefined) {
      exprMap.set(input.name, input.expr);
    }
    if (input.value !== undefined) {
      valueMap.set(input.name, input.value);
    }
  }
  
  // Evaluate in topological order
  const values: Record<string, Decimal> = Object.create(null);
  const context: Record<string, any> = Object.create(null);
  
  for (const name of order) {
    let result: any;
    
    // If value is provided directly, use it
    if (valueMap.has(name)) {
      result = valueMap.get(name);
    } else {
      // Otherwise, evaluate the expression
      const expr = exprMap.get(name);
      if (!expr) {
        throw new Error(`No expression or value found for: ${name}`);
      }
      result = await evaluateExpression(expr, context);
    }
    
    // Store result - if it's a Decimal, that's our value
    // If it's something else (object, array), store it in context but not in values
    if (result instanceof Decimal) {
      values[name] = result;
      context[name] = result;
    } else {
      // Non-Decimal result (object, array, etc.) - store in context only
      context[name] = result;
      // For output, we need a Decimal - this should not happen if design is correct
      // but let's handle it gracefully
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
export { ExpressionInput, EvaluationResult } from './types';
export { Decimal };
