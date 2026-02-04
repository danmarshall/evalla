import { ExpressionInput } from './types';

// Extract variable references from an expression
// Security: only extracts identifiers, no code execution
export const extractDependencies = (expr: string): string[] => {
  const deps = new Set<string>();
  // Match identifiers including dot-notation (e.g., point.x, offset.y)
  // But exclude namespace prefixes ($math, $unit, $angle)
  const identifierRegex = /\b(?!\$)[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*/g;
  const matches = expr.match(identifierRegex) || [];
  
  for (const match of matches) {
    // For dotted paths like "base.x", extract just the root variable "base"
    // This is the actual variable dependency, not the property access
    const root = match.split('.')[0];
    deps.add(root);
  }
  
  return Array.from(deps);
};

// Topological sort with cycle detection
// Returns ordered list of names or throws on circular dependency
export const topologicalSort = (inputs: ExpressionInput[]): string[] => {
  const graph = new Map<string, string[]>();
  const names = new Set<string>();
  
  // First, collect all variable names
  for (const input of inputs) {
    names.add(input.name);
  }
  
  // Then build dependency graph
  for (const input of inputs) {
    const deps = extractDependencies(input.expr);
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
      throw new Error(`Circular dependency detected: ${cycle.join(' -> ')}`);
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
  
  return order;
};
