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
    if (typeof input.expr !== 'string') {
      throw new Error('Each input must have a string "expr"');
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
  
  // Create lookup for expressions
  const exprMap = new Map<string, string>();
  for (const input of inputs) {
    exprMap.set(input.name, input.expr);
  }
  
  // Evaluate in topological order
  const values: Record<string, Decimal> = Object.create(null);
  const context: Record<string, any> = Object.create(null);
  
  for (const name of order) {
    const expr = exprMap.get(name);
    if (!expr) {
      throw new Error(`No expression found for: ${name}`);
    }
    
    // Evaluate with current context (Decimal values for precision)
    const value = await evaluateExpression(expr, context);
    values[name] = value;
    
    // Update context for next evaluations
    // Support dot-traversal: if name contains dots, create nested objects
    if (name.includes('.')) {
      const parts = name.split('.');
      let obj: any = context;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!obj[part]) {
          obj[part] = Object.create(null);
        }
        obj = obj[part];
      }
      obj[parts[parts.length - 1]] = value;
    } else {
      context[name] = value;
    }
  }
  
  return { values, order };
};

// Export types and utilities for external use
export { ExpressionInput, EvaluationResult } from './types';
export { Decimal };
