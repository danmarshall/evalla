/**
 * Tests for error message system
 * Verifies that error messages use enum constants and can be formatted
 */

import { describe, it, expect } from '@jest/globals';
import { ErrorMessage, formatErrorMessage } from '../src/error-messages.js';
import { evalla } from '../src/index.js';
import { checkVariableName } from '../src/variable-name-checker.js';
import { checkSyntax } from '../src/syntax-checker.js';
import { formatResults } from '../src/format-results.js';

describe('Error Message Exports', () => {
  it('should export error message utilities from main index', async () => {
    // Test that the exports are available from the main package
    const { 
      ErrorMessage: ExportedEnum, 
      formatErrorMessage: exportedFormatErrorMessage 
    } = await import('../src/index.js');
    
    expect(ExportedEnum).toBeDefined();
    expect(typeof exportedFormatErrorMessage).toBe('function');
    
    // Test that they work
    const message = exportedFormatErrorMessage(ExportedEnum.INPUT_MUST_BE_ARRAY, 'en');
    expect(message).toBe('Input must be an array');
  });
});

describe('Error Message Enum', () => {
  it('should have all enum values as strings', () => {
    // Verify all enum values are strings
    expect(typeof ErrorMessage.INPUT_MUST_BE_ARRAY).toBe('string');
    expect(typeof ErrorMessage.UNDEFINED_VARIABLE).toBe('string');
    expect(typeof ErrorMessage.CIRCULAR_DEPENDENCY).toBe('string');
  });

  it('should format error message without parameters', () => {
    const message = formatErrorMessage(ErrorMessage.INPUT_MUST_BE_ARRAY, 'en');
    expect(message).toBe('Input must be an array');
  });

  it('should format error message with single parameter', () => {
    const message = formatErrorMessage(ErrorMessage.UNDEFINED_VARIABLE, 'en', { name: 'myVar' });
    expect(message).toBe('Undefined variable: myVar');
  });

  it('should format error message with multiple parameters', () => {
    const message = formatErrorMessage(ErrorMessage.PARSE_ERROR_AT_LOCATION, 'en', { 
      line: 1, 
      column: 5, 
      message: 'Unexpected token' 
    });
    expect(message).toBe('Parse error at line 1, column 5: Unexpected token');
  });
});

describe('Error Messages in Practice', () => {
  describe('Validation errors', () => {
    it('should throw INPUT_MUST_BE_ARRAY error', async () => {
      await expect(evalla(null as any)).rejects.toThrow(ErrorMessage.INPUT_MUST_BE_ARRAY);
    });

    it('should throw INPUT_MUST_BE_OBJECT error', async () => {
      await expect(evalla(['not an object'] as any)).rejects.toThrow(ErrorMessage.INPUT_MUST_BE_OBJECT);
    });

    it('should throw INPUT_NAME_REQUIRED error', async () => {
      await expect(evalla([{ name: '' } as any])).rejects.toThrow(ErrorMessage.INPUT_NAME_REQUIRED);
    });

    it('should throw DUPLICATE_NAME error', async () => {
      await expect(evalla([
        { name: 'x', expr: '1' },
        { name: 'x', expr: '2' }
      ])).rejects.toThrow(ErrorMessage.DUPLICATE_NAME);
    });

    it('should throw INPUT_EXPR_OR_VALUE_REQUIRED error', async () => {
      await expect(evalla([
        { name: 'x' } as any
      ])).rejects.toThrow(ErrorMessage.INPUT_EXPR_OR_VALUE_REQUIRED);
    });
  });

  describe('Variable name validation errors', () => {
    it('should use VARIABLE_NAME_EMPTY message', () => {
      const result = checkVariableName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorMessage.VARIABLE_NAME_EMPTY);
    });

    it('should use VARIABLE_NAME_DOLLAR_PREFIX message', () => {
      const result = checkVariableName('$myVar');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorMessage.VARIABLE_NAME_DOLLAR_PREFIX);
    });

    it('should use VARIABLE_NAME_RESERVED message', () => {
      const result = checkVariableName('true');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorMessage.VARIABLE_NAME_RESERVED);
    });

    it('should use VARIABLE_NAME_STARTS_WITH_NUMBER message', () => {
      const result = checkVariableName('1abc');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorMessage.VARIABLE_NAME_STARTS_WITH_NUMBER);
    });

    it('should use VARIABLE_NAME_CONTAINS_DOT message', () => {
      const result = checkVariableName('a.b');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorMessage.VARIABLE_NAME_CONTAINS_DOT);
    });
  });

  describe('Parse errors', () => {
    it('should use EXPRESSION_EMPTY message', () => {
      const result = checkSyntax('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorMessage.EXPRESSION_EMPTY);
    });

    it('should use EXPRESSION_MUST_BE_STRING message', () => {
      const result = checkSyntax(123 as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorMessage.EXPRESSION_MUST_BE_STRING);
    });

    it('should use PARSE_ERROR_AT_LOCATION message', () => {
      const result = checkSyntax('(a + b');
      expect(result.valid).toBe(false);
      expect(result.error).toContain(ErrorMessage.PARSE_ERROR_AT_LOCATION);
    });
  });

  describe('Evaluation errors', () => {
    it('should use UNDEFINED_VARIABLE message', async () => {
      await expect(evalla([
        { name: 'y', expr: 'x + 1' }
      ])).rejects.toThrow(ErrorMessage.UNDEFINED_VARIABLE);
    });

    it('should use CIRCULAR_DEPENDENCY message', async () => {
      await expect(evalla([
        { name: 'a', expr: 'b' },
        { name: 'b', expr: 'a' }
      ])).rejects.toThrow(ErrorMessage.CIRCULAR_DEPENDENCY);
    });

    it('should use NAMESPACE_HEAD_AS_VALUE message', async () => {
      await expect(evalla([
        { name: 'x', expr: '$math' }
      ])).rejects.toThrow(ErrorMessage.NAMESPACE_HEAD_AS_VALUE);
    });

    it('should use FUNCTION_ALIASING_DENIED message', async () => {
      await expect(evalla([
        { name: 'fn', expr: '$math.abs' }
      ])).rejects.toThrow(ErrorMessage.FUNCTION_ALIASING_DENIED);
    });

    it('should use EXPRESSION_CANNOT_RETURN_STRING message', async () => {
      await expect(evalla([
        { name: 'obj', value: { str: 'hello' } },
        { name: 'result', expr: 'obj.str' }
      ])).rejects.toThrow(ErrorMessage.EXPRESSION_CANNOT_RETURN_STRING);
    });

    it('should use EXPRESSION_CANNOT_RETURN_ARRAY message', async () => {
      await expect(evalla([
        { name: 'obj', value: { arr: [1, 2, 3] } },
        { name: 'result', expr: 'obj.arr' }
      ])).rejects.toThrow(ErrorMessage.EXPRESSION_CANNOT_RETURN_ARRAY);
    });

    it('should use STRING_IN_OPERATION message', async () => {
      await expect(evalla([
        { name: 'obj', value: { str: 'hello' } },
        { name: 'result', expr: 'obj.str + 1' }
      ])).rejects.toThrow(ErrorMessage.STRING_IN_OPERATION);
    });
  });

  describe('Format errors', () => {
    it('should use DECIMAL_PLACES_INVALID message', async () => {
      const result = await evalla([{ name: 'x', expr: '3.14159' }]);
      expect(() => formatResults(result, { decimalPlaces: -1 }))
        .toThrow(ErrorMessage.DECIMAL_PLACES_INVALID);
    });

    it('should use DECIMAL_PLACES_INVALID message for non-integer', async () => {
      const result = await evalla([{ name: 'x', expr: '3.14159' }]);
      expect(() => formatResults(result, { decimalPlaces: 2.5 }))
        .toThrow(ErrorMessage.DECIMAL_PLACES_INVALID);
    });
  });

  describe('Security errors', () => {
    it('should use PROPERTY_ACCESS_DENIED message', async () => {
      await expect(evalla([
        { name: 'obj', value: { test: 'value' } },
        { name: 'result', expr: 'obj.__proto__' }
      ])).rejects.toThrow(ErrorMessage.PROPERTY_ACCESS_DENIED);
    });
  });
});
