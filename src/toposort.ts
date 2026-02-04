import * as parser from './parser.js';
import { ExpressionInput } from './types';
import { extractVariablesFromAST } from './ast-variables';
import { CircularDependencyError, EvaluationError } from './errors';

// Parse an expression and return the AST
// Uses Peggy parser which allows keywords as identifiers
export const parseExpression = (expr: string): any => {
  try {
    return parser.parse(expr.trim());
  } catch (error: any) {
    // Handle Peggy syntax errors
    if (error.location) {
      const { line, column } = error.location.start;
      throw new EvaluationError(`Parse error at line ${line}, column ${column}: ${error.message}`);
    }
    throw new EvaluationError(`Parse error: ${error.message}`);
  }
};

// Extract variable dependencies from an expression AST
const extractDependencies = (ast: any): string[] => {
  return extractVariablesFromAST(ast);
};

// Topological sort with cycle detection
// Returns ordered list of names or throws on circular dependency
// Also returns parsed ASTs for efficiency (parse once, use for both deps and eval)
export const topologicalSort = (inputs: ExpressionInput[]): { order: string[]; asts: Map<string, any> } => {
  const graph = new Map<string, string[]>();
  const names = new Set<string>();
  const asts = new Map<string, any>();
  
  // First, collect all variable names and parse expressions
  for (const input of inputs) {
    names.add(input.name);
    
    // Parse expression if it exists
    if (input.expr) {
      try {
        const ast = parseExpression(input.expr);
        asts.set(input.name, ast);
      } catch (error) {
        throw new EvaluationError(`Failed to parse expression for "${input.name}": ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  
  // Then build dependency graph using parsed ASTs
  for (const input of inputs) {
    // If no expr, there are no dependencies from expressions
    if (!input.expr) {
      graph.set(input.name, []);
      continue;
    }
    
    const ast = asts.get(input.name);
    if (!ast) {
      throw new EvaluationError(`No AST found for: ${input.name}`);
    }
    
    const deps = extractDependencies(ast);
    // Filter to only include dependencies that are in our input set
    const validDeps = deps.filter(d => names.has(d));
    graph.set(input.name, validDeps);
  }
  
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const order: string[] = [];
  
  const visit = (name: string, path: string[] = []) => {
    if (visited.has(name)) return;
    
    if (visiting.has(name)) {
      // Circular dependency detected
      const cycle = [...path, name];
      throw new CircularDependencyError(`Circular dependency detected: ${cycle.join(' -> ')}`);
    }
    
    visiting.add(name);
    const deps = graph.get(name) || [];
    
    for (const dep of deps) {
      if (names.has(dep)) {
        visit(dep, [...path, name]);
      }
    }
    
    visiting.delete(name);
    visited.add(name);
    order.push(name);
  };
  
  // Visit all nodes
  for (const name of names) {
    visit(name);
  }
  
  return { order, asts };
};
