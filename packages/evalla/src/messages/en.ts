import { ErrorMessage } from '../error-message-keys.js';

/**
 * English error messages dictionary
 */
export const messages_en: Record<ErrorMessage, string> = {
  // Validation errors
  [ErrorMessage.INPUT_MUST_BE_ARRAY]: 'Input must be an array',
  [ErrorMessage.INPUT_MUST_BE_OBJECT]: 'Each input must be an object',
  [ErrorMessage.INPUT_NAME_REQUIRED]: 'Each input must have a non-empty string "name"',
  [ErrorMessage.INPUT_EXPR_OR_VALUE_REQUIRED]: 'Each input must have either "expr" or "value": {variableName}',
  [ErrorMessage.INPUT_EXPR_MUST_BE_STRING]: '"expr" must be a string if provided: {variableName}',
  [ErrorMessage.DUPLICATE_NAME]: 'Duplicate name: {variableName}',
  
  // Variable name validation errors
  [ErrorMessage.VARIABLE_NAME_MUST_BE_STRING]: 'Variable name must be a string',
  [ErrorMessage.VARIABLE_NAME_EMPTY]: 'Variable name cannot be empty',
  [ErrorMessage.VARIABLE_NAME_WHITESPACE]: 'Variable name cannot have leading or trailing whitespace',
  [ErrorMessage.VARIABLE_NAME_DOLLAR_PREFIX]: 'Variable names cannot start with $ (reserved for system namespaces)',
  [ErrorMessage.VARIABLE_NAME_DOUBLE_UNDERSCORE]: 'Variable names cannot start with __ (reserved for security reasons)',
  [ErrorMessage.VARIABLE_NAME_RESERVED]: 'Variable name cannot be a reserved value: {variableName}',
  [ErrorMessage.VARIABLE_NAME_STARTS_WITH_NUMBER]: 'Variable names cannot start with a number',
  [ErrorMessage.VARIABLE_NAME_CONTAINS_DOT]: 'Variable names cannot contain dots (dots are only for property access in expressions)',
  [ErrorMessage.VARIABLE_NAME_INVALID_CHARS]: 'Variable name contains invalid characters (only letters, digits, underscore, or $ allowed)',
  
  // Parse errors
  [ErrorMessage.PARSE_ERROR]: 'Parse error: {message}',
  [ErrorMessage.PARSE_ERROR_AT_LOCATION]: 'Parse error at line {line}, column {column}: {message}',
  [ErrorMessage.PARSE_ERROR_FOR_VARIABLE]: 'Failed to parse expression for "{variableName}": {message}',
  
  // Evaluation errors
  [ErrorMessage.UNDEFINED_VARIABLE]: 'Undefined variable: {variableName}',
  [ErrorMessage.UNDEFINED_NAMESPACE_PROPERTY]: 'Undefined property "{property}" in namespace {namespace}',
  [ErrorMessage.CANNOT_ACCESS_PROPERTY]: 'Cannot access property of {value}',
  [ErrorMessage.CALLEE_NOT_FUNCTION]: 'Callee is not a function',
  [ErrorMessage.UNSUPPORTED_LOGICAL_OPERATOR]: 'Unsupported logical operator: {operator}',
  [ErrorMessage.UNSUPPORTED_NODE_TYPE]: 'Unsupported node type: {type}',
  [ErrorMessage.UNSUPPORTED_BINARY_OPERATOR]: 'Unsupported binary operator: {operator}',
  [ErrorMessage.UNSUPPORTED_UNARY_OPERATOR]: 'Unsupported unary operator: {operator}',
  [ErrorMessage.NO_AST_FOUND]: 'No AST found for: {variableName}',
  [ErrorMessage.FAILED_TO_EVALUATE]: 'Failed to evaluate expression: {originalMessage}',
  
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
  
  // Internationalization errors
  [ErrorMessage.UNSUPPORTED_LANGUAGE]: 'Unsupported language: {lang}',
};
