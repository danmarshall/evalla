/**
 * Regex pattern for valid variable names.
 * 
 * Matches names that:
 * - Start with a letter or single underscore (not `__` or `$`)
 * - Followed by letters, digits, underscores, or `$`
 * - Do not contain dots
 * 
 * Note: This pattern does not check for reserved value names (true, false, null, Infinity).
 * Use `isValidName()` or `checkVariableName()` for complete validation.
 * 
 * @example
 * ```typescript
 * VALID_NAME_PATTERN.test('myVar');     // true
 * VALID_NAME_PATTERN.test('var123');    // true
 * VALID_NAME_PATTERN.test('_private');  // true
 * VALID_NAME_PATTERN.test('my$var');    // true
 * VALID_NAME_PATTERN.test('$invalid');  // false (starts with $)
 * VALID_NAME_PATTERN.test('__proto__'); // false (starts with __)
 * VALID_NAME_PATTERN.test('123abc');    // false (starts with number)
 * VALID_NAME_PATTERN.test('a.b');       // false (contains dot)
 * VALID_NAME_PATTERN.test('true');      // true (pattern matches, but it's reserved - use isValidName())
 * ```
 */
export const VALID_NAME_PATTERN = /^(?![_$]{2})[a-zA-Z_][a-zA-Z0-9_$]*$/;

/**
 * Reserved value names that cannot be used as variable names.
 * Frozen to prevent runtime mutation by dependents.
 */
export const RESERVED_VALUES = Object.freeze(['true', 'false', 'null', 'Infinity'] as const);

/**
 * Result of checking a variable name
 */
export interface VariableNameCheckResult {
  /** Whether the variable name is valid */
  valid: boolean;
  /** Error message if variable name is invalid */
  error?: string;
}

import { ErrorMessage } from './error-messages.js';

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
      error: ErrorMessage.VARIABLE_NAME_MUST_BE_STRING
    };
  }

  // Empty or whitespace-only check
  if (name.trim() === '') {
    return {
      valid: false,
      error: ErrorMessage.VARIABLE_NAME_EMPTY
    };
  }

  // Check for leading or trailing whitespace
  if (name !== name.trim()) {
    return {
      valid: false,
      error: ErrorMessage.VARIABLE_NAME_WHITESPACE
    };
  }

  // Check for $ prefix (reserved for system namespaces)
  if (name.startsWith('$')) {
    return {
      valid: false,
      error: ErrorMessage.VARIABLE_NAME_DOLLAR_PREFIX
    };
  }

  // Check for __ prefix (reserved for security)
  if (name.startsWith('__')) {
    return {
      valid: false,
      error: ErrorMessage.VARIABLE_NAME_DOUBLE_UNDERSCORE
    };
  }

  // Check for reserved value names
  if (RESERVED_VALUES.includes(name as any)) {
    return {
      valid: false,
      error: `${ErrorMessage.VARIABLE_NAME_RESERVED}: ${name}`
    };
  }

  // Check if starts with a number
  if (/^\d/.test(name)) {
    return {
      valid: false,
      error: ErrorMessage.VARIABLE_NAME_STARTS_WITH_NUMBER
    };
  }

  // Check for dots (reserved for property access)
  if (name.includes('.')) {
    return {
      valid: false,
      error: ErrorMessage.VARIABLE_NAME_CONTAINS_DOT
    };
  }

  // Check if name matches the valid pattern
  // This ensures the name can be referenced in expressions (catch-all for invalid characters)
  if (!VALID_NAME_PATTERN.test(name)) {
    return {
      valid: false,
      error: ErrorMessage.VARIABLE_NAME_INVALID_CHARS
    };
  }

  // All checks passed
  return { valid: true };
};

/**
 * Check if a variable name is valid (simple boolean check).
 * This is a simpler alternative to `checkVariableName()` when you don't need detailed error messages.
 * 
 * @param name - The variable name to check
 * @returns `true` if the name is valid, `false` otherwise
 * 
 * @example
 * ```typescript
 * isValidName('myVar');      // true
 * isValidName('$myVar');     // false (starts with $)
 * isValidName('__private');  // false (starts with __)
 * isValidName('true');       // false (reserved value)
 * isValidName('123abc');     // false (starts with number)
 * isValidName('a.b');        // false (contains dot)
 * ```
 */
export const isValidName = (name: string): boolean => {
  return checkVariableName(name).valid;
};
