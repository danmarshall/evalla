/**
 * Result of checking a variable name
 */
export interface VariableNameCheckResult {
  /** Whether the variable name is valid */
  valid: boolean;
  /** Error message if variable name is invalid */
  error?: string;
}

/**
 * Check if a variable name is valid according to evalla's naming rules.
 * Useful for text editors to validate variable names before evaluation.
 * 
 * @param name - The variable name to check
 * @returns Object with validation result and error message if invalid
 * 
 * @example
 * ```typescript
 * // Valid variable name
 * const result1 = checkVariableName('myVar');
 * console.log(result1.valid); // true
 * 
 * // Invalid - starts with $
 * const result2 = checkVariableName('$myVar');
 * console.log(result2.valid); // false
 * console.log(result2.error); // "Variable names cannot start with $ (reserved for system namespaces)"
 * 
 * // Invalid - reserved value name
 * const result3 = checkVariableName('true');
 * console.log(result3.valid); // false
 * console.log(result3.error); // "Variable name cannot be a reserved value: true"
 * ```
 */
export const checkVariableName = (name: string): VariableNameCheckResult => {
  // Type check
  if (typeof name !== 'string') {
    return {
      valid: false,
      error: 'Variable name must be a string'
    };
  }

  // Empty check
  if (name === '') {
    return {
      valid: false,
      error: 'Variable name cannot be empty'
    };
  }

  // Check for $ prefix (reserved for system namespaces)
  if (name.startsWith('$')) {
    return {
      valid: false,
      error: 'Variable names cannot start with $ (reserved for system namespaces)'
    };
  }

  // Check for __ prefix (reserved for security)
  if (name.startsWith('__')) {
    return {
      valid: false,
      error: 'Variable names cannot start with __ (reserved for security reasons)'
    };
  }

  // Check for reserved value names
  const reservedValues = ['true', 'false', 'null', 'Infinity'];
  if (reservedValues.includes(name)) {
    return {
      valid: false,
      error: `Variable name cannot be a reserved value: ${name}`
    };
  }

  // Check if starts with a number
  if (/^\d/.test(name)) {
    return {
      valid: false,
      error: 'Variable names cannot start with a number'
    };
  }

  // Check for dots (reserved for property access)
  if (name.includes('.')) {
    return {
      valid: false,
      error: 'Variable names cannot contain dots (dots are only for property access in expressions)'
    };
  }

  // Check if name is a valid identifier (must match: [a-zA-Z_$][a-zA-Z0-9_$]*)
  // This ensures the name can be referenced in expressions
  // This is a catch-all for any other invalid characters
  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
    return {
      valid: false,
      error: 'Variable name contains invalid characters (only letters, digits, underscore, or $ allowed)'
    };
  }

  // All checks passed
  return { valid: true };
};
