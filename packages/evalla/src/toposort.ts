import * as parser from './parser.js';
import { ExpressionInput } from './types.js';
import { extractVariablesFromAST } from './ast-variables.js';
import { CircularDependencyError, EvaluationError, ParseError } from './errors.js';
import { ErrorMessage } from './error-messages.js';

// Parse an expression and return the AST
// Uses Peggy parser which allows keywords as identifiers
export const parseExpression = (expr: string): any => {
  try {
    return parser.parse(expr.trim());
  } catch (error: any) {
    // Handle Peggy syntax errors
    if (error.location) {
      const { line, column } = error.location.start;
      throw new ParseError(
        `${ErrorMessage.PARSE_ERROR_AT_LOCATION}: line ${line}, column ${column}: ${error.message}`,
        { line, column, expression: expr }
      );
    }
    throw new ParseError(`${ErrorMessage.PARSE_ERROR}: ${error.message}`, { expression: expr });
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
    
    // Parse expression if it exists and is not blank/whitespace-only
    if (input.expr && input.expr.trim()) {
      try {
        const ast = parseExpression(input.expr);
        asts.set(input.name, ast);
      } catch (error) {
        // Re-throw with variable name if it's a ParseError
        if (error instanceof ParseError) {
          throw new ParseError(
            `${ErrorMessage.PARSE_ERROR_FOR_VARIABLE}: "${input.name}": ${error.message}`,
            {
              variableName: input.name,
              expression: input.expr,
              line: error.line,
              column: error.column
            }
          );
        }
        throw new ParseError(
          `${ErrorMessage.PARSE_ERROR_FOR_VARIABLE}: "${input.name}": ${error instanceof Error ? error.message : String(error)}`,
          { variableName: input.name, expression: input.expr }
        );
      }
    }
  }
  
  // Then build dependency graph using parsed ASTs
  for (const input of inputs) {
    // If no expr or blank expr, there are no dependencies from expressions
    if (!input.expr || !input.expr.trim()) {
      graph.set(input.name, []);
      continue;
    }
    
    const ast = asts.get(input.name);
    if (!ast) {
      throw new EvaluationError(`${ErrorMessage.NO_AST_FOUND}: ${input.name}`);
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
      throw new CircularDependencyError(
        `${ErrorMessage.CIRCULAR_DEPENDENCY}: ${cycle.join(' -> ')}`,
        cycle
      );
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
