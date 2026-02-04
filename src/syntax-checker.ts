import * as parser from './parser.js';

/**
 * Result of syntax checking an expression
 */
export interface SyntaxCheckResult {
  /** Whether the syntax is valid */
  valid: boolean;
  /** Error message if syntax is invalid */
  error?: string;
  /** Line number where error occurred (1-indexed) */
  line?: number;
  /** Column number where error occurred (1-indexed) */
  column?: number;
}

/**
 * Check the syntax of an expression without evaluating it.
 * Useful for text editors to validate expressions before sending them for evaluation.
 * 
 * @param expr - The expression string to check
 * @returns Object with validation result and error details if invalid
 * 
 * @example
 * ```typescript
 * // Valid expression
 * const result1 = checkSyntax('a + b * 2');
 * console.log(result1.valid); // true
 * 
 * // Invalid expression - missing closing parenthesis
 * const result2 = checkSyntax('(a + b');
 * console.log(result2.valid); // false
 * console.log(result2.error); // "Parse error at line 1, column 7: Expected..."
 * console.log(result2.line); // 1
 * console.log(result2.column); // 7
 * 
 * // Invalid expression - consecutive operators
 * const result3 = checkSyntax('a + * b');
 * console.log(result3.valid); // false
 * console.log(result3.error); // "Parse error at line 1, column 5: Expected..."
 * ```
 */
export const checkSyntax = (expr: string): SyntaxCheckResult => {
  // Handle empty or whitespace-only expressions
  if (typeof expr !== 'string') {
    return {
      valid: false,
      error: 'Expression must be a string'
    };
  }

  const trimmed = expr.trim();
  if (trimmed === '') {
    return {
      valid: false,
      error: 'Expression cannot be empty'
    };
  }

  try {
    // Attempt to parse the expression using Peggy parser
    parser.parse(trimmed);
    
    // If parsing succeeds, syntax is valid
    return { valid: true };
  } catch (error: any) {
    // Handle Peggy syntax errors with location information
    if (error.location) {
      const { line, column } = error.location.start;
      return {
        valid: false,
        error: `Parse error at line ${line}, column ${column}: ${error.message}`,
        line,
        column
      };
    }
    
    // Handle other parsing errors without location
    return {
      valid: false,
      error: `Parse error: ${error.message || String(error)}`
    };
  }
};
