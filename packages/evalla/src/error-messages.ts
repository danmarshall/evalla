/**
 * Error message keys for evalla errors.
 * 
 * These enum values are used as error messages throughout the library.
 * For internationalization, use the `formatErrorMessage()` function to get
 * human-readable messages in different languages.
 * 
 * ## Usage
 * 
 * ```typescript
 * // Throw an error with the key
 * throw new ValidationError(ErrorMessage.INPUT_MUST_BE_ARRAY);
 * 
 * // Get a human-readable message
 * const message = formatErrorMessage(ErrorMessage.INPUT_MUST_BE_ARRAY, 'en');
 * // Returns: "Input must be an array"
 * ```
 * 
 * ## Adding a New Error
 * 
 * 1. Add to the enum:
 * ```typescript
 * export enum ErrorMessage {
 *   // ... existing
 *   MY_NEW_ERROR = 'MY_NEW_ERROR',
 * }
 * ```
 * 
 * 2. Add to the language dictionary:
 * ```typescript
 * const messages_en: Record<ErrorMessage, string> = {
 *   // ... existing
 *   [ErrorMessage.MY_NEW_ERROR]: 'My error message',
 * };
 * ```
 * 
 * ## Adding a New Language
 * 
 * ```typescript
 * const messages_es: Record<ErrorMessage, string> = {
 *   [ErrorMessage.INPUT_MUST_BE_ARRAY]: 'La entrada debe ser un array',
 *   // ... translate all messages
 * };
 * 
 * // Update formatErrorMessage to support the new language
 * ```
 */

/**
 * Error message enum - used as error messages throughout evalla
 */
export enum ErrorMessage {
  // Validation errors
  INPUT_MUST_BE_ARRAY = 'INPUT_MUST_BE_ARRAY',
  INPUT_MUST_BE_OBJECT = 'INPUT_MUST_BE_OBJECT',
  INPUT_NAME_REQUIRED = 'INPUT_NAME_REQUIRED',
  INPUT_EXPR_OR_VALUE_REQUIRED = 'INPUT_EXPR_OR_VALUE_REQUIRED',
  INPUT_EXPR_MUST_BE_STRING = 'INPUT_EXPR_MUST_BE_STRING',
  DUPLICATE_NAME = 'DUPLICATE_NAME',
  
  // Variable name validation errors
  VARIABLE_NAME_MUST_BE_STRING = 'VARIABLE_NAME_MUST_BE_STRING',
  VARIABLE_NAME_EMPTY = 'VARIABLE_NAME_EMPTY',
  VARIABLE_NAME_WHITESPACE = 'VARIABLE_NAME_WHITESPACE',
  VARIABLE_NAME_DOLLAR_PREFIX = 'VARIABLE_NAME_DOLLAR_PREFIX',
  VARIABLE_NAME_DOUBLE_UNDERSCORE = 'VARIABLE_NAME_DOUBLE_UNDERSCORE',
  VARIABLE_NAME_RESERVED = 'VARIABLE_NAME_RESERVED',
  VARIABLE_NAME_STARTS_WITH_NUMBER = 'VARIABLE_NAME_STARTS_WITH_NUMBER',
  VARIABLE_NAME_CONTAINS_DOT = 'VARIABLE_NAME_CONTAINS_DOT',
  VARIABLE_NAME_INVALID_CHARS = 'VARIABLE_NAME_INVALID_CHARS',
  
  // Parse errors
  PARSE_ERROR = 'PARSE_ERROR',
  PARSE_ERROR_AT_LOCATION = 'PARSE_ERROR_AT_LOCATION',
  PARSE_ERROR_FOR_VARIABLE = 'PARSE_ERROR_FOR_VARIABLE',
  
  // Evaluation errors
  UNDEFINED_VARIABLE = 'UNDEFINED_VARIABLE',
  CANNOT_ACCESS_PROPERTY = 'CANNOT_ACCESS_PROPERTY',
  CALLEE_NOT_FUNCTION = 'CALLEE_NOT_FUNCTION',
  UNSUPPORTED_LOGICAL_OPERATOR = 'UNSUPPORTED_LOGICAL_OPERATOR',
  UNSUPPORTED_NODE_TYPE = 'UNSUPPORTED_NODE_TYPE',
  UNSUPPORTED_BINARY_OPERATOR = 'UNSUPPORTED_BINARY_OPERATOR',
  UNSUPPORTED_UNARY_OPERATOR = 'UNSUPPORTED_UNARY_OPERATOR',
  NO_AST_FOUND = 'NO_AST_FOUND',
  FAILED_TO_EVALUATE = 'FAILED_TO_EVALUATE',
  
  // Type errors
  NAMESPACE_HEAD_AS_VALUE = 'NAMESPACE_HEAD_AS_VALUE',
  NAMESPACE_HEAD_IN_OPERATION = 'NAMESPACE_HEAD_IN_OPERATION',
  EXPRESSION_CANNOT_RETURN_ARRAY = 'EXPRESSION_CANNOT_RETURN_ARRAY',
  EXPRESSION_CANNOT_RETURN_OBJECT = 'EXPRESSION_CANNOT_RETURN_OBJECT',
  EXPRESSION_CANNOT_RETURN_STRING = 'EXPRESSION_CANNOT_RETURN_STRING',
  UNSUPPORTED_RESULT_TYPE = 'UNSUPPORTED_RESULT_TYPE',
  STRING_IN_OPERATION = 'STRING_IN_OPERATION',
  OBJECT_IN_OPERATION = 'OBJECT_IN_OPERATION',
  ARRAY_IN_OPERATION = 'ARRAY_IN_OPERATION',
  STRING_WITH_UNARY = 'STRING_WITH_UNARY',
  OBJECT_WITH_UNARY = 'OBJECT_WITH_UNARY',
  ARRAY_WITH_UNARY = 'ARRAY_WITH_UNARY',
  
  // Security errors
  PROPERTY_ACCESS_DENIED = 'PROPERTY_ACCESS_DENIED',
  FUNCTION_ALIASING_DENIED = 'FUNCTION_ALIASING_DENIED',
  
  // Circular dependency
  CIRCULAR_DEPENDENCY = 'CIRCULAR_DEPENDENCY',
  
  // Format errors
  DECIMAL_PLACES_INVALID = 'DECIMAL_PLACES_INVALID',
  
  // Syntax errors
  EXPRESSION_MUST_BE_STRING = 'EXPRESSION_MUST_BE_STRING',
  EXPRESSION_EMPTY = 'EXPRESSION_EMPTY',
}

/**
 * English error messages dictionary
 */
const messages_en: Record<ErrorMessage, string> = {
  // Validation errors
  [ErrorMessage.INPUT_MUST_BE_ARRAY]: 'Input must be an array',
  [ErrorMessage.INPUT_MUST_BE_OBJECT]: 'Each input must be an object',
  [ErrorMessage.INPUT_NAME_REQUIRED]: 'Each input must have a non-empty string "name"',
  [ErrorMessage.INPUT_EXPR_OR_VALUE_REQUIRED]: 'Each input must have either "expr" or "value": {name}',
  [ErrorMessage.INPUT_EXPR_MUST_BE_STRING]: '"expr" must be a string if provided: {name}',
  [ErrorMessage.DUPLICATE_NAME]: 'Duplicate name: {name}',
  
  // Variable name validation errors
  [ErrorMessage.VARIABLE_NAME_MUST_BE_STRING]: 'Variable name must be a string',
  [ErrorMessage.VARIABLE_NAME_EMPTY]: 'Variable name cannot be empty',
  [ErrorMessage.VARIABLE_NAME_WHITESPACE]: 'Variable name cannot have leading or trailing whitespace',
  [ErrorMessage.VARIABLE_NAME_DOLLAR_PREFIX]: 'Variable names cannot start with $ (reserved for system namespaces)',
  [ErrorMessage.VARIABLE_NAME_DOUBLE_UNDERSCORE]: 'Variable names cannot start with __ (reserved for security reasons)',
  [ErrorMessage.VARIABLE_NAME_RESERVED]: 'Variable name cannot be a reserved value: {name}',
  [ErrorMessage.VARIABLE_NAME_STARTS_WITH_NUMBER]: 'Variable names cannot start with a number',
  [ErrorMessage.VARIABLE_NAME_CONTAINS_DOT]: 'Variable names cannot contain dots (dots are only for property access in expressions)',
  [ErrorMessage.VARIABLE_NAME_INVALID_CHARS]: 'Variable name contains invalid characters (only letters, digits, underscore, or $ allowed)',
  
  // Parse errors
  [ErrorMessage.PARSE_ERROR]: 'Parse error: {message}',
  [ErrorMessage.PARSE_ERROR_AT_LOCATION]: 'Parse error at line {line}, column {column}: {message}',
  [ErrorMessage.PARSE_ERROR_FOR_VARIABLE]: 'Failed to parse expression for "{name}": {message}',
  
  // Evaluation errors
  [ErrorMessage.UNDEFINED_VARIABLE]: 'Undefined variable: {name}',
  [ErrorMessage.CANNOT_ACCESS_PROPERTY]: 'Cannot access property of {value}',
  [ErrorMessage.CALLEE_NOT_FUNCTION]: 'Callee is not a function',
  [ErrorMessage.UNSUPPORTED_LOGICAL_OPERATOR]: 'Unsupported logical operator: {operator}',
  [ErrorMessage.UNSUPPORTED_NODE_TYPE]: 'Unsupported node type: {type}',
  [ErrorMessage.UNSUPPORTED_BINARY_OPERATOR]: 'Unsupported binary operator: {operator}',
  [ErrorMessage.UNSUPPORTED_UNARY_OPERATOR]: 'Unsupported unary operator: {operator}',
  [ErrorMessage.NO_AST_FOUND]: 'No AST found for: {name}',
  [ErrorMessage.FAILED_TO_EVALUATE]: 'Failed to evaluate expression: {message}',
  
  // Type errors
  [ErrorMessage.NAMESPACE_HEAD_AS_VALUE]: 'Cannot use namespace head as a value - namespace heads must be used with property access (e.g., $math.PI) or method calls (e.g., $math.abs(x))',
  [ErrorMessage.NAMESPACE_HEAD_IN_OPERATION]: 'Cannot use namespace head in operations - namespace heads must be used with property access (e.g., $math.PI) or method calls (e.g., $math.abs(x))',
  [ErrorMessage.EXPRESSION_CANNOT_RETURN_ARRAY]: 'Expressions cannot return arrays - arrays must be provided via the value property',
  [ErrorMessage.EXPRESSION_CANNOT_RETURN_OBJECT]: 'Expressions cannot return objects - objects must be provided via the value property',
  [ErrorMessage.EXPRESSION_CANNOT_RETURN_STRING]: 'Expressions cannot return strings - strings must be provided via the value property',
  [ErrorMessage.UNSUPPORTED_RESULT_TYPE]: 'Unsupported expression result type: {type}',
  [ErrorMessage.STRING_IN_OPERATION]: 'Cannot use string in {operator} operation - strings are not supported in mathematical expressions',
  [ErrorMessage.OBJECT_IN_OPERATION]: 'Cannot use object in {operator} operation - only numeric values are allowed',
  [ErrorMessage.ARRAY_IN_OPERATION]: 'Cannot use array in {operator} operation - only numeric values are allowed',
  [ErrorMessage.STRING_WITH_UNARY]: 'Cannot use string with unary {operator} - strings are not supported in mathematical expressions',
  [ErrorMessage.OBJECT_WITH_UNARY]: 'Cannot use object with unary {operator} - only numeric values are allowed',
  [ErrorMessage.ARRAY_WITH_UNARY]: 'Cannot use array with unary {operator} - only numeric values are allowed',
  
  // Security errors
  [ErrorMessage.PROPERTY_ACCESS_DENIED]: 'Access to property "{property}" is not allowed for security reasons',
  [ErrorMessage.FUNCTION_ALIASING_DENIED]: 'Cannot alias functions - functions must be called with parentheses',
  
  // Circular dependency
  [ErrorMessage.CIRCULAR_DEPENDENCY]: 'Circular dependency detected: {cycle}',
  
  // Format errors
  [ErrorMessage.DECIMAL_PLACES_INVALID]: 'decimalPlaces must be a non-negative integer',
  
  // Syntax errors
  [ErrorMessage.EXPRESSION_MUST_BE_STRING]: 'Expression must be a string',
  [ErrorMessage.EXPRESSION_EMPTY]: 'Expression cannot be empty',
};

/**
 * Format an error message key into a human-readable message in the specified language.
 * 
 * This function is optional - error keys themselves are used as error messages.
 * Use this function when you need human-readable messages for display purposes.
 * 
 * @param key - The error message enum value
 * @param lang - Language code (currently only 'en' supported)
 * @param params - Optional parameters to substitute in the message
 * @returns The formatted, human-readable error message
 * 
 * @example
 * ```typescript
 * // Get English message
 * formatErrorMessage(ErrorMessage.UNDEFINED_VARIABLE, 'en', { name: 'x' })
 * // Returns: "Undefined variable: x"
 * 
 * // With location info
 * formatErrorMessage(ErrorMessage.PARSE_ERROR_AT_LOCATION, 'en', { 
 *   line: 1, 
 *   column: 5, 
 *   message: 'Unexpected token' 
 * })
 * // Returns: "Parse error at line 1, column 5: Unexpected token"
 * ```
 */
export function formatErrorMessage(
  key: ErrorMessage, 
  lang: 'en' = 'en',
  params?: Record<string, any>
): string {
  // Currently only English is supported
  const dictionary = messages_en;
  let message = dictionary[key];
  
  if (params) {
    // Replace {param} placeholders with actual values
    for (const [param, value] of Object.entries(params)) {
      message = message.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
    }
  }
  
  return message;
}
