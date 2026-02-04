import { evalla, EvaluationError, ValidationError } from '../src/index';

describe('Malformed Expression Handling', () => {
  describe('Syntax Errors', () => {
    test('double dots in property access', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'foo..bar' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('expression starting with number', async () => {
      await expect(
        evalla([{ name: 'test', expr: '9foo' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('invalid assignment syntax', async () => {
      await expect(
        evalla([{ name: 'test', expr: '9foo=bar' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('unterminated string literal', async () => {
      await expect(
        evalla([{ name: 'test', expr: '"hello' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('dangling operator', async () => {
      await expect(
        evalla([{ name: 'test', expr: '1 +' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('just operator', async () => {
      await expect(
        evalla([{ name: 'test', expr: '+' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('unmatched parentheses - opening', async () => {
      await expect(
        evalla([{ name: 'test', expr: '(1 + 2' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('unmatched parentheses - closing', async () => {
      await expect(
        evalla([{ name: 'test', expr: '1 + 2)' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('unmatched braces - opening', async () => {
      await expect(
        evalla([{ name: 'test', expr: '{x: 1' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('unmatched braces - closing', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'x: 1}' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('unmatched brackets - opening', async () => {
      await expect(
        evalla([{ name: 'test', expr: '[1, 2' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('unmatched brackets - closing', async () => {
      await expect(
        evalla([{ name: 'test', expr: '1, 2]' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('invalid property name', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'obj.123invalid' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('consecutive operators', async () => {
      await expect(
        evalla([{ name: 'test', expr: '1 + * 2' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('missing operator', async () => {
      await expect(
        evalla([{ name: 'test', expr: '1 2' }])
      ).rejects.toThrow(EvaluationError);
    });
  });

  describe('Edge Cases', () => {
    test('empty expression throws ValidationError', async () => {
      // Empty string is caught by validation before parsing
      await expect(
        evalla([{ name: 'test', expr: '' }])
      ).rejects.toThrow(ValidationError);
    });

    test('only whitespace', async () => {
      await expect(
        evalla([{ name: 'test', expr: '   ' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('only newlines', async () => {
      await expect(
        evalla([{ name: 'test', expr: '\n\n' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('null character', async () => {
      await expect(
        evalla([{ name: 'test', expr: '\0' }])
      ).rejects.toThrow(EvaluationError);
    });
  });

  describe('Supported edge cases', () => {
    test('triple equals (===) is supported for strict equality', async () => {
      // Triple equals is supported for strict equality comparison
      const result = await evalla([
        { name: 'a', expr: '5' },
        { name: 'b', expr: '5' },
        { name: 'test', expr: 'a === b' }
      ]);
      // Boolean results appear in order but not in values (they're not Decimal)
      expect(result.order).toContain('test');
    });

    test('semicolons in expressions - evaluates first expression only', async () => {
      // Semicolons create an expression sequence, but we only use the first expression
      // This is intentional - acorn parses '1; 2' but we extract just the first expression
      const result = await evalla([{ name: 'test', expr: '1; 2' }]);
      // Should successfully evaluate to 1 (the first expression before semicolon)
      expect(result.values.test.toString()).toBe('1');
    });
  });

  describe('Unsupported constructs', () => {
    test('await keyword not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'await foo' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('function keyword not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'function() {}' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('arrow function not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: '() => 1' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('class keyword not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'class Foo {}' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('new keyword not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'new Date()' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('try/catch not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'try { 1 } catch(e) { 2 }' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('for loop not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'for(let i=0; i<10; i++) {}' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('while loop not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'while(true) {}' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('if statement not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'if(true) { 1 }' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('variable declaration not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'let x = 1' }])
      ).rejects.toThrow(EvaluationError);
    });
  });
});
