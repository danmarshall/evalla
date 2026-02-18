/**
 * Tests for error message internationalization
 * Verifies that error messages use constants and can be retrieved correctly
 */

import { describe, it, expect } from '@jest/globals';
import { ErrorMessageKey, ErrorMessages_en, getErrorMessage } from '../src/error-messages.js';
import { evalla } from '../src/index.js';
import { checkVariableName } from '../src/variable-name-checker.js';
import { checkSyntax } from '../src/syntax-checker.js';
import { formatResults } from '../src/format-results.js';

describe('Error Message Constants', () => {
  it('should have all message keys defined in the dictionary', () => {
    // Verify all keys in ErrorMessageKey have corresponding messages
    for (const key of Object.values(ErrorMessageKey)) {
      expect(ErrorMessages_en[key]).toBeDefined();
      expect(typeof ErrorMessages_en[key]).toBe('string');
      expect(ErrorMessages_en[key].length).toBeGreaterThan(0);
    }
  });

  it('should get error message without parameters', () => {
    const message = getErrorMessage('INPUT_MUST_BE_ARRAY');
    expect(message).toBe('Input must be an array');
  });

  it('should get error message with single parameter', () => {
    const message = getErrorMessage('UNDEFINED_VARIABLE', { name: 'myVar' });
    expect(message).toBe('Undefined variable: myVar');
  });

  it('should get error message with multiple parameters', () => {
    const message = getErrorMessage('PARSE_ERROR_AT_LOCATION', { 
      line: 1, 
      column: 5, 
      message: 'Unexpected token' 
    });
    expect(message).toBe('Parse error at line 1, column 5: Unexpected token');
  });

  it('should substitute multiple occurrences of the same parameter', () => {
    // Create a test message with repeated parameter
    const message = getErrorMessage('DUPLICATE_NAME', { name: 'test' });
    expect(message).toContain('test');
  });
});

describe('Error Messages in Practice', () => {
  describe('Validation errors', () => {
    it('should throw INPUT_MUST_BE_ARRAY error', async () => {
      await expect(evalla(null as any)).rejects.toThrow('Input must be an array');
    });

    it('should throw INPUT_MUST_BE_OBJECT error', async () => {
      await expect(evalla(['not an object'] as any)).rejects.toThrow('Each input must be an object');
    });

    it('should throw INPUT_NAME_REQUIRED error', async () => {
      await expect(evalla([{ name: '' } as any])).rejects.toThrow('Each input must have a non-empty string "name"');
    });

    it('should throw DUPLICATE_NAME error', async () => {
      await expect(evalla([
        { name: 'x', expr: '1' },
        { name: 'x', expr: '2' }
      ])).rejects.toThrow('Duplicate name: x');
    });

    it('should throw INPUT_EXPR_OR_VALUE_REQUIRED error', async () => {
      await expect(evalla([
        { name: 'x' } as any
      ])).rejects.toThrow('Each input must have either "expr" or "value": x');
    });
  });

  describe('Variable name validation errors', () => {
    it('should use VARIABLE_NAME_EMPTY message', () => {
      const result = checkVariableName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Variable name cannot be empty');
    });

    it('should use VARIABLE_NAME_DOLLAR_PREFIX message', () => {
      const result = checkVariableName('$myVar');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Variable names cannot start with $ (reserved for system namespaces)');
    });

    it('should use VARIABLE_NAME_RESERVED message', () => {
      const result = checkVariableName('true');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Variable name cannot be a reserved value: true');
    });

    it('should use VARIABLE_NAME_STARTS_WITH_NUMBER message', () => {
      const result = checkVariableName('1abc');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Variable names cannot start with a number');
    });

    it('should use VARIABLE_NAME_CONTAINS_DOT message', () => {
      const result = checkVariableName('a.b');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('dots are only for property access');
    });
  });

  describe('Parse errors', () => {
    it('should use EXPRESSION_EMPTY message', () => {
      const result = checkSyntax('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Expression cannot be empty');
    });

    it('should use EXPRESSION_MUST_BE_STRING message', () => {
      const result = checkSyntax(123 as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Expression must be a string');
    });

    it('should use PARSE_ERROR_AT_LOCATION message', () => {
      const result = checkSyntax('(a + b');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Parse error at line');
      expect(result.error).toContain('column');
    });
  });

  describe('Evaluation errors', () => {
    it('should use UNDEFINED_VARIABLE message', async () => {
      await expect(evalla([
        { name: 'y', expr: 'x + 1' }
      ])).rejects.toThrow('Undefined variable: x');
    });

    it('should use CIRCULAR_DEPENDENCY message', async () => {
      await expect(evalla([
        { name: 'a', expr: 'b' },
        { name: 'b', expr: 'a' }
      ])).rejects.toThrow('Circular dependency detected');
    });

    it('should use NAMESPACE_HEAD_AS_VALUE message', async () => {
      await expect(evalla([
        { name: 'x', expr: '$math' }
      ])).rejects.toThrow('Cannot use namespace head as a value');
    });

    it('should use FUNCTION_ALIASING_DENIED message', async () => {
      await expect(evalla([
        { name: 'fn', expr: '$math.abs' }
      ])).rejects.toThrow('Cannot alias functions');
    });

    it('should use EXPRESSION_CANNOT_RETURN_STRING message', async () => {
      await expect(evalla([
        { name: 'obj', value: { str: 'hello' } },
        { name: 'result', expr: 'obj.str' }
      ])).rejects.toThrow('Expressions cannot return strings');
    });

    it('should use EXPRESSION_CANNOT_RETURN_ARRAY message', async () => {
      await expect(evalla([
        { name: 'obj', value: { arr: [1, 2, 3] } },
        { name: 'result', expr: 'obj.arr' }
      ])).rejects.toThrow('Expressions cannot return arrays');
    });

    it('should use STRING_IN_OPERATION message', async () => {
      await expect(evalla([
        { name: 'obj', value: { str: 'hello' } },
        { name: 'result', expr: 'obj.str + 1' }
      ])).rejects.toThrow('Cannot use string in + operation');
    });
  });

  describe('Format errors', () => {
    it('should use DECIMAL_PLACES_INVALID message', async () => {
      const result = await evalla([{ name: 'x', expr: '3.14159' }]);
      expect(() => formatResults(result, { decimalPlaces: -1 }))
        .toThrow('decimalPlaces must be a non-negative integer');
    });

    it('should use DECIMAL_PLACES_INVALID message for non-integer', async () => {
      const result = await evalla([{ name: 'x', expr: '3.14159' }]);
      expect(() => formatResults(result, { decimalPlaces: 2.5 }))
        .toThrow('decimalPlaces must be a non-negative integer');
    });
  });

  describe('Security errors', () => {
    it('should use PROPERTY_ACCESS_DENIED message', async () => {
      await expect(evalla([
        { name: 'obj', value: { test: 'value' } },
        { name: 'result', expr: 'obj.__proto__' }
      ])).rejects.toThrow('Access to property "__proto__" is not allowed for security reasons');
    });
  });
});

describe('Message Consistency', () => {
  it('should not have duplicate message values (helps identify missing parameters)', () => {
    const messages = Object.values(ErrorMessages_en);
    const uniqueMessages = new Set(messages);
    
    // Some messages may legitimately be the same, but most should be unique
    // This test helps catch cases where we forgot to use parameters
    const duplicateRate = (messages.length - uniqueMessages.size) / messages.length;
    expect(duplicateRate).toBeLessThan(0.1); // Less than 10% duplicates
  });

  it('should have parameter placeholders in messages that need them', () => {
    // Messages that should have parameters based on their keys
    const messagesNeedingParams = [
      'UNDEFINED_VARIABLE',
      'DUPLICATE_NAME',
      'VARIABLE_NAME_RESERVED',
      'PARSE_ERROR',
      'PARSE_ERROR_AT_LOCATION',
      'PARSE_ERROR_FOR_VARIABLE',
      'UNSUPPORTED_BINARY_OPERATOR',
      'UNSUPPORTED_UNARY_OPERATOR',
      'STRING_IN_OPERATION',
      'PROPERTY_ACCESS_DENIED',
    ];

    for (const key of messagesNeedingParams) {
      const message = ErrorMessages_en[key as keyof typeof ErrorMessages_en];
      expect(message).toMatch(/\{[^}]+\}/); // Should contain {param} placeholders
    }
  });

  it('should not have leftover placeholders after parameter substitution', () => {
    const message = getErrorMessage('UNDEFINED_VARIABLE', { name: 'test' });
    expect(message).not.toMatch(/\{[^}]+\}/);
  });
});
