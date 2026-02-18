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
    const message = formatErrorMessage(ErrorMessage.UNDEFINED_VARIABLE, 'en', { variableName: 'myVar' });
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
      expect(result.error).toBe(ErrorMessage.PARSE_ERROR_AT_LOCATION);
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

describe('Error Message Placeholder Verification', () => {
  describe('Validation error placeholders', () => {
    it('should populate {variableName} in INPUT_EXPR_OR_VALUE_REQUIRED', async () => {
      try {
        await evalla([{ name: 'testVar' } as any]);
      } catch (err: any) {
        const formatted = formatErrorMessage(err.message, 'en', err);
        expect(formatted).toContain('testVar');
        expect(formatted).not.toContain('{variableName}');
      }
    });

    it('should populate {variableName} in INPUT_EXPR_MUST_BE_STRING', async () => {
      try {
        await evalla([{ name: 'testVar', expr: 123 } as any]);
      } catch (err: any) {
        expect(err.message).toBe(ErrorMessage.INPUT_EXPR_MUST_BE_STRING);
        const formatted = formatErrorMessage(err.message, 'en', err);
        expect(formatted).toContain('testVar');
        expect(formatted).not.toContain('{variableName}');
      }
    });

    it('should populate {variableName} in DUPLICATE_NAME', async () => {
      try {
        await evalla([
          { name: 'dupName', expr: '1' },
          { name: 'dupName', expr: '2' }
        ]);
      } catch (err: any) {
        const formatted = formatErrorMessage(err.message, 'en', err);
        expect(formatted).toContain('dupName');
        expect(formatted).not.toContain('{variableName}');
      }
    });

    it('should populate {variableName} in VARIABLE_NAME_RESERVED', () => {
      const result = checkVariableName('true');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorMessage.VARIABLE_NAME_RESERVED);
      if (result.error) {
        const formatted = formatErrorMessage(result.error as ErrorMessage, 'en', { variableName: 'true' });
        expect(formatted).toContain('true');
        expect(formatted).not.toContain('{variableName}');
      }
    });
  });

  describe('Parse error placeholders', () => {
    it('should populate {line}, {column}, {message} in PARSE_ERROR_AT_LOCATION', () => {
      const result = checkSyntax('(a + b');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(ErrorMessage.PARSE_ERROR_AT_LOCATION);
      if (result.error && result.line !== undefined && result.column !== undefined) {
        const formatted = formatErrorMessage(result.error as ErrorMessage, 'en', { 
          line: result.line, 
          column: result.column,
          message: 'Expected )' 
        });
        expect(formatted).toMatch(/line \d+/);
        expect(formatted).toMatch(/column \d+/);
        expect(formatted).not.toContain('{line}');
        expect(formatted).not.toContain('{column}');
        expect(formatted).not.toContain('{message}');
      }
    });

    it('should populate {variableName} and {message} in PARSE_ERROR_FOR_VARIABLE', async () => {
      try {
        await evalla([{ name: 'badVar', expr: '(unclosed' }]);
      } catch (err: any) {
        if (err.message === ErrorMessage.PARSE_ERROR_FOR_VARIABLE) {
          const formatted = formatErrorMessage(err.message, 'en', {
            variableName: err.variableName,
            message: err.originalMessage || 'parse error'
          });
          expect(formatted).toContain('badVar');
          expect(formatted).not.toContain('{variableName}');
          expect(formatted).not.toContain('{message}');
        }
      }
    });
  });

  describe('Evaluation error placeholders', () => {
    it('should populate {variableName} in UNDEFINED_VARIABLE', async () => {
      try {
        await evalla([{ name: 'y', expr: 'undefinedVar + 1' }]);
      } catch (err: any) {
        const formatted = formatErrorMessage(err.message, 'en', err);
        expect(formatted).toContain('undefinedVar');
        expect(formatted).not.toContain('{variableName}');
      }
    });

    it('should populate {property} and {namespace} in UNDEFINED_NAMESPACE_PROPERTY', async () => {
      try {
        await evalla([{ name: 'x', expr: '$math.nonExistent' }]);
      } catch (err: any) {
        expect(err.message).toBe(ErrorMessage.UNDEFINED_NAMESPACE_PROPERTY);
        const formatted = formatErrorMessage(err.message, 'en', err);
        expect(formatted).toContain('nonExistent');
        expect(formatted).toContain('$math');
        expect(formatted).not.toContain('{property}');
        expect(formatted).not.toContain('{namespace}');
      }
    });

    it('should populate {operator} in STRING_IN_OPERATION', async () => {
      try {
        await evalla([
          { name: 'obj', value: { str: 'hello' } },
          { name: 'result', expr: 'obj.str + 1' }
        ]);
      } catch (err: any) {
        const formatted = formatErrorMessage(err.message, 'en', err);
        expect(formatted).toContain('+');
        expect(formatted).not.toContain('{operator}');
      }
    });

    it('should populate {operator} in OBJECT_IN_OPERATION', async () => {
      try {
        await evalla([
          { name: 'obj', value: { nested: {} } },
          { name: 'result', expr: 'obj.nested * 2' }
        ]);
      } catch (err: any) {
        expect(err.message).toBe(ErrorMessage.OBJECT_IN_OPERATION);
        const formatted = formatErrorMessage(err.message, 'en', err);
        expect(formatted).toContain('*');
        expect(formatted).not.toContain('{operator}');
      }
    });

    it('should populate {operator} in ARRAY_IN_OPERATION', async () => {
      try {
        await evalla([
          { name: 'obj', value: { arr: [1, 2] } },
          { name: 'result', expr: 'obj.arr - 1' }
        ]);
      } catch (err: any) {
        expect(err.message).toBe(ErrorMessage.ARRAY_IN_OPERATION);
        const formatted = formatErrorMessage(err.message, 'en', err);
        expect(formatted).toContain('-');
        expect(formatted).not.toContain('{operator}');
      }
    });

    it('should populate {operator} in STRING_WITH_UNARY', async () => {
      try {
        await evalla([
          { name: 'obj', value: { str: 'test' } },
          { name: 'result', expr: '-obj.str' }
        ]);
      } catch (err: any) {
        expect(err.message).toBe(ErrorMessage.STRING_WITH_UNARY);
        const formatted = formatErrorMessage(err.message, 'en', err);
        expect(formatted).toContain('-');
        expect(formatted).not.toContain('{operator}');
      }
    });

    it('should populate {operator} in OBJECT_WITH_UNARY', async () => {
      try {
        await evalla([
          { name: 'obj', value: { nested: {} } },
          { name: 'result', expr: '+obj.nested' }
        ]);
      } catch (err: any) {
        expect(err.message).toBe(ErrorMessage.OBJECT_WITH_UNARY);
        const formatted = formatErrorMessage(err.message, 'en', err);
        expect(formatted).toContain('+');
        expect(formatted).not.toContain('{operator}');
      }
    });

    it('should populate {operator} in ARRAY_WITH_UNARY', async () => {
      try {
        await evalla([
          { name: 'obj', value: { arr: [1] } },
          { name: 'result', expr: '-obj.arr' }
        ]);
      } catch (err: any) {
        expect(err.message).toBe(ErrorMessage.ARRAY_WITH_UNARY);
        const formatted = formatErrorMessage(err.message, 'en', err);
        expect(formatted).toContain('-');
        expect(formatted).not.toContain('{operator}');
      }
    });

    it('should populate {cycle} in CIRCULAR_DEPENDENCY', async () => {
      try {
        await evalla([
          { name: 'a', expr: 'b' },
          { name: 'b', expr: 'a' }
        ]);
      } catch (err: any) {
        const formatted = formatErrorMessage(err.message, 'en', err);
        expect(formatted).toContain('a');
        expect(formatted).toContain('b');
        expect(formatted).not.toContain('{cycle}');
      }
    });
  });

  describe('Security error placeholders', () => {
    it('should populate {property} in PROPERTY_ACCESS_DENIED', async () => {
      try {
        await evalla([
          { name: 'obj', value: { test: 'value' } },
          { name: 'result', expr: 'obj.__proto__' }
        ]);
      } catch (err: any) {
        const formatted = formatErrorMessage(err.message, 'en', err);
        expect(formatted).toContain('__proto__');
        expect(formatted).not.toContain('{property}');
      }
    });
  });

  describe('Internationalization error placeholders', () => {
    it('should populate {lang} in UNSUPPORTED_LANGUAGE', () => {
      try {
        formatErrorMessage(ErrorMessage.INPUT_MUST_BE_ARRAY, 'fr');
      } catch (err: any) {
        expect(err.message).toBe(ErrorMessage.UNSUPPORTED_LANGUAGE);
        // The variableName property holds the lang value
        const formatted = formatErrorMessage(err.message, 'en', { lang: err.variableName });
        expect(formatted).toContain('fr');
        expect(formatted).not.toContain('{lang}');
      }
    });
  });
});
