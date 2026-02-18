/**
 * Error message constants and internationalization support for evalla.
 * 
 * All error messages are defined as constants to enable:
 * - Consistency across the codebase
 * - Easy internationalization
 * - Better maintainability
 * - Type safety for error messages
 * 
 * ## Adding a New Error Message
 * 
 * 1. Add a new key to `ErrorMessageKey`:
 * ```typescript
 * export const ErrorMessageKey = {
 *   // ... existing keys
 *   MY_NEW_ERROR: 'MY_NEW_ERROR',
 * };
 * ```
 * 
 * 2. Add the message to `ErrorMessages_en`:
 * ```typescript
 * export const ErrorMessages_en: Record<ErrorMessageKey, string> = {
 *   // ... existing messages
 *   MY_NEW_ERROR: 'This is my new error message with {param}',
 * };
 * ```
 * 
 * 3. Use it in your code:
 * ```typescript
 * throw new ValidationError(getErrorMessage('MY_NEW_ERROR', { param: 'value' }));
 * ```
 * 
 * ## Adding Support for a New Language
 * 
 * To add support for a new language (e.g., Spanish):
 * 
 * 1. Create a new dictionary:
 * ```typescript
 * export const ErrorMessages_es: Record<ErrorMessageKey, string> = {
 *   INPUT_MUST_BE_ARRAY: 'La entrada debe ser un array',
 *   // ... translate all messages
 * };
 * ```
 * 
 * 2. Update `getErrorMessage()` to accept a language parameter:
 * ```typescript
 * export function getErrorMessage(
 *   key: ErrorMessageKey, 
 *   params?: Record<string, any>,
 *   lang: 'en' | 'es' = 'en'
 * ): string {
 *   const dictionary = lang === 'es' ? ErrorMessages_es : ErrorMessages_en;
 *   let message = dictionary[key];
 *   // ... rest of implementation
 * }
 * ```
 */

/**
 * Error message keys - constants for referencing error messages
 */
export const ErrorMessageKey = {
  // Validation errors
  INPUT_MUST_BE_ARRAY: 'INPUT_MUST_BE_ARRAY',
  INPUT_MUST_BE_OBJECT: 'INPUT_MUST_BE_OBJECT',
  INPUT_NAME_REQUIRED: 'INPUT_NAME_REQUIRED',
  INPUT_EXPR_OR_VALUE_REQUIRED: 'INPUT_EXPR_OR_VALUE_REQUIRED',
  INPUT_EXPR_MUST_BE_STRING: 'INPUT_EXPR_MUST_BE_STRING',
  DUPLICATE_NAME: 'DUPLICATE_NAME',
  
  // Variable name validation errors
  VARIABLE_NAME_MUST_BE_STRING: 'VARIABLE_NAME_MUST_BE_STRING',
  VARIABLE_NAME_EMPTY: 'VARIABLE_NAME_EMPTY',
  VARIABLE_NAME_WHITESPACE: 'VARIABLE_NAME_WHITESPACE',
  VARIABLE_NAME_DOLLAR_PREFIX: 'VARIABLE_NAME_DOLLAR_PREFIX',
  VARIABLE_NAME_DOUBLE_UNDERSCORE: 'VARIABLE_NAME_DOUBLE_UNDERSCORE',
  VARIABLE_NAME_RESERVED: 'VARIABLE_NAME_RESERVED',
  VARIABLE_NAME_STARTS_WITH_NUMBER: 'VARIABLE_NAME_STARTS_WITH_NUMBER',
  VARIABLE_NAME_CONTAINS_DOT: 'VARIABLE_NAME_CONTAINS_DOT',
  VARIABLE_NAME_INVALID_CHARS: 'VARIABLE_NAME_INVALID_CHARS',
  
  // Parse errors
  PARSE_ERROR: 'PARSE_ERROR',
  PARSE_ERROR_AT_LOCATION: 'PARSE_ERROR_AT_LOCATION',
  PARSE_ERROR_FOR_VARIABLE: 'PARSE_ERROR_FOR_VARIABLE',
  
  // Evaluation errors
  UNDEFINED_VARIABLE: 'UNDEFINED_VARIABLE',
  CANNOT_ACCESS_PROPERTY: 'CANNOT_ACCESS_PROPERTY',
  CALLEE_NOT_FUNCTION: 'CALLEE_NOT_FUNCTION',
  UNSUPPORTED_LOGICAL_OPERATOR: 'UNSUPPORTED_LOGICAL_OPERATOR',
  UNSUPPORTED_NODE_TYPE: 'UNSUPPORTED_NODE_TYPE',
  UNSUPPORTED_BINARY_OPERATOR: 'UNSUPPORTED_BINARY_OPERATOR',
  UNSUPPORTED_UNARY_OPERATOR: 'UNSUPPORTED_UNARY_OPERATOR',
  NO_AST_FOUND: 'NO_AST_FOUND',
  FAILED_TO_EVALUATE: 'FAILED_TO_EVALUATE',
  
  // Type errors
  NAMESPACE_HEAD_AS_VALUE: 'NAMESPACE_HEAD_AS_VALUE',
  NAMESPACE_HEAD_IN_OPERATION: 'NAMESPACE_HEAD_IN_OPERATION',
  EXPRESSION_CANNOT_RETURN_ARRAY: 'EXPRESSION_CANNOT_RETURN_ARRAY',
  EXPRESSION_CANNOT_RETURN_OBJECT: 'EXPRESSION_CANNOT_RETURN_OBJECT',
  EXPRESSION_CANNOT_RETURN_STRING: 'EXPRESSION_CANNOT_RETURN_STRING',
  UNSUPPORTED_RESULT_TYPE: 'UNSUPPORTED_RESULT_TYPE',
  STRING_IN_OPERATION: 'STRING_IN_OPERATION',
  OBJECT_IN_OPERATION: 'OBJECT_IN_OPERATION',
  ARRAY_IN_OPERATION: 'ARRAY_IN_OPERATION',
  STRING_WITH_UNARY: 'STRING_WITH_UNARY',
  OBJECT_WITH_UNARY: 'OBJECT_WITH_UNARY',
  ARRAY_WITH_UNARY: 'ARRAY_WITH_UNARY',
  
  // Security errors
  PROPERTY_ACCESS_DENIED: 'PROPERTY_ACCESS_DENIED',
  FUNCTION_ALIASING_DENIED: 'FUNCTION_ALIASING_DENIED',
  
  // Circular dependency
  CIRCULAR_DEPENDENCY: 'CIRCULAR_DEPENDENCY',
  
  // Format errors
  DECIMAL_PLACES_INVALID: 'DECIMAL_PLACES_INVALID',
  
  // Syntax errors
  EXPRESSION_MUST_BE_STRING: 'EXPRESSION_MUST_BE_STRING',
  EXPRESSION_EMPTY: 'EXPRESSION_EMPTY',
} as const;

export type ErrorMessageKey = typeof ErrorMessageKey[keyof typeof ErrorMessageKey];

/**
 * English error messages dictionary
 */
export const ErrorMessages_en: Record<ErrorMessageKey, string> = {
  // Validation errors
  INPUT_MUST_BE_ARRAY: 'Input must be an array',
  INPUT_MUST_BE_OBJECT: 'Each input must be an object',
  INPUT_NAME_REQUIRED: 'Each input must have a non-empty string "name"',
  INPUT_EXPR_OR_VALUE_REQUIRED: 'Each input must have either "expr" or "value": {name}',
  INPUT_EXPR_MUST_BE_STRING: '"expr" must be a string if provided: {name}',
  DUPLICATE_NAME: 'Duplicate name: {name}',
  
  // Variable name validation errors
  VARIABLE_NAME_MUST_BE_STRING: 'Variable name must be a string',
  VARIABLE_NAME_EMPTY: 'Variable name cannot be empty',
  VARIABLE_NAME_WHITESPACE: 'Variable name cannot have leading or trailing whitespace',
  VARIABLE_NAME_DOLLAR_PREFIX: 'Variable names cannot start with $ (reserved for system namespaces)',
  VARIABLE_NAME_DOUBLE_UNDERSCORE: 'Variable names cannot start with __ (reserved for security reasons)',
  VARIABLE_NAME_RESERVED: 'Variable name cannot be a reserved value: {name}',
  VARIABLE_NAME_STARTS_WITH_NUMBER: 'Variable names cannot start with a number',
  VARIABLE_NAME_CONTAINS_DOT: 'Variable names cannot contain dots (dots are only for property access in expressions)',
  VARIABLE_NAME_INVALID_CHARS: 'Variable name contains invalid characters (only letters, digits, underscore, or $ allowed)',
  
  // Parse errors
  PARSE_ERROR: 'Parse error: {message}',
  PARSE_ERROR_AT_LOCATION: 'Parse error at line {line}, column {column}: {message}',
  PARSE_ERROR_FOR_VARIABLE: 'Failed to parse expression for "{name}": {message}',
  
  // Evaluation errors
  UNDEFINED_VARIABLE: 'Undefined variable: {name}',
  CANNOT_ACCESS_PROPERTY: 'Cannot access property of {value}',
  CALLEE_NOT_FUNCTION: 'Callee is not a function',
  UNSUPPORTED_LOGICAL_OPERATOR: 'Unsupported logical operator: {operator}',
  UNSUPPORTED_NODE_TYPE: 'Unsupported node type: {type}',
  UNSUPPORTED_BINARY_OPERATOR: 'Unsupported binary operator: {operator}',
  UNSUPPORTED_UNARY_OPERATOR: 'Unsupported unary operator: {operator}',
  NO_AST_FOUND: 'No AST found for: {name}',
  FAILED_TO_EVALUATE: 'Failed to evaluate expression: {message}',
  
  // Type errors
  NAMESPACE_HEAD_AS_VALUE: 'Cannot use namespace head as a value - namespace heads must be used with property access (e.g., $math.PI) or method calls (e.g., $math.abs(x))',
  NAMESPACE_HEAD_IN_OPERATION: 'Cannot use namespace head in operations - namespace heads must be used with property access (e.g., $math.PI) or method calls (e.g., $math.abs(x))',
  EXPRESSION_CANNOT_RETURN_ARRAY: 'Expressions cannot return arrays - arrays must be provided via the value property',
  EXPRESSION_CANNOT_RETURN_OBJECT: 'Expressions cannot return objects - objects must be provided via the value property',
  EXPRESSION_CANNOT_RETURN_STRING: 'Expressions cannot return strings - strings must be provided via the value property',
  UNSUPPORTED_RESULT_TYPE: 'Unsupported expression result type: {type}',
  STRING_IN_OPERATION: 'Cannot use string in {operator} operation - strings are not supported in mathematical expressions',
  OBJECT_IN_OPERATION: 'Cannot use object in {operator} operation - only numeric values are allowed',
  ARRAY_IN_OPERATION: 'Cannot use array in {operator} operation - only numeric values are allowed',
  STRING_WITH_UNARY: 'Cannot use string with unary {operator} - strings are not supported in mathematical expressions',
  OBJECT_WITH_UNARY: 'Cannot use object with unary {operator} - only numeric values are allowed',
  ARRAY_WITH_UNARY: 'Cannot use array with unary {operator} - only numeric values are allowed',
  
  // Security errors
  PROPERTY_ACCESS_DENIED: 'Access to property "{property}" is not allowed for security reasons',
  FUNCTION_ALIASING_DENIED: 'Cannot alias functions - functions must be called with parentheses',
  
  // Circular dependency
  CIRCULAR_DEPENDENCY: 'Circular dependency detected: {cycle}',
  
  // Format errors
  DECIMAL_PLACES_INVALID: 'decimalPlaces must be a non-negative integer',
  
  // Syntax errors
  EXPRESSION_MUST_BE_STRING: 'Expression must be a string',
  EXPRESSION_EMPTY: 'Expression cannot be empty',
};

/**
 * Get an error message by key, optionally with parameter substitution
 * 
 * @param key - The error message key
 * @param params - Optional parameters to substitute in the message
 * @returns The formatted error message
 * 
 * @example
 * ```typescript
 * getErrorMessage('UNDEFINED_VARIABLE', { name: 'x' })
 * // Returns: "Undefined variable: x"
 * 
 * getErrorMessage('PARSE_ERROR_AT_LOCATION', { line: 1, column: 5, message: 'Unexpected token' })
 * // Returns: "Parse error at line 1, column 5: Unexpected token"
 * ```
 */
export function getErrorMessage(key: ErrorMessageKey, params?: Record<string, any>): string {
  let message = ErrorMessages_en[key];
  
  if (params) {
    // Replace {param} placeholders with actual values
    for (const [param, value] of Object.entries(params)) {
      message = message.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
    }
  }
  
  return message;
}
