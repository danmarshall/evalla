import { evalla, EvaluationError, ValidationError } from '../src/index';

describe('Malformed Expression Handling', () => {
  describe('Variable naming rules', () => {
    test('variable names cannot start with numbers', async () => {
      // Variable names starting with numbers are invalid JavaScript identifiers
      await expect(
        evalla([{ name: '9test', expr: '1' }])
      ).rejects.toThrow(ValidationError);
    });

    test('variable names cannot start with double underscore', async () => {
      // Double underscore prefix is reserved for security (blocks __proto__ etc.)
      await expect(
        evalla([{ name: '__test', expr: '1' }])
      ).rejects.toThrow(ValidationError);
    });

    test('variable names cannot start with dollar sign', async () => {
      // Dollar sign is reserved for namespaces like $math, $unit, $angle
      await expect(
        evalla([{ name: '$test', expr: '1' }])
      ).rejects.toThrow(ValidationError);
    });

    test('non-reserved keywords can be used as variable names', async () => {
      // Note: The expression language uses acorn (a JavaScript parser)
      // This means JavaScript reserved words (if, while, for, new, return, etc.) 
      // CANNOT be used as variable names due to parser limitations
      // However, non-reserved words work fine
      const result = await evalla([
        { name: 'let', expr: '10' },      // 'let' is NOT reserved in expression context
        { name: 'async', expr: '5' },    // 'async' is contextual, works here
        { name: 'await', expr: '3' },    // 'await' is contextual, works here  
        { name: 'result1', expr: 'let + async' },
        { name: 'result2', expr: 'let * await' }
      ]);
      
      expect(result.values.let.toString()).toBe('10');
      expect(result.values.async.toString()).toBe('5');
      expect(result.values.await.toString()).toBe('3');
      expect(result.values.result1.toString()).toBe('15');
      expect(result.values.result2.toString()).toBe('30');
    });

    test('reserved words as property names DO work', async () => {
      // Reserved words CAN be used as property names in JavaScript
      // So obj.if, obj.while, obj.new, etc. all work fine
      const result = await evalla([
        { name: 'obj', value: { if: 10, while: 20, for: 30, new: 40, return: 50 } },
        { name: 'sum', expr: 'obj.if + obj.while + obj.for' },
        { name: 'product', expr: 'obj.new * obj.return' }
      ]);
      
      expect(result.values.sum.toString()).toBe('60');
      expect(result.values.product.toString()).toBe('2000');
    });

    test('reserved words as object literal keys DO work', async () => {
      // Reserved words are also valid as object literal keys
      const result = await evalla([
        { name: 'obj', expr: '{if: 1, while: 2, for: 3, new: 4, class: 5}' },
        { name: 'total', expr: 'obj.if + obj.while + obj.for + obj.new + obj.class' }
      ]);
      
      expect(result.values.total.toString()).toBe('15');
    });

    test('reserved words as variable names do NOT work (parser limitation)', async () => {
      // JavaScript reserved words cannot be used as variable names
      // This is a limitation of using acorn (JavaScript parser)
      await expect(
        evalla([{ name: 'validName', expr: 'if + 1' }])
      ).rejects.toThrow(EvaluationError);
      
      await expect(
        evalla([{ name: 'validName', expr: 'while + 1' }])
      ).rejects.toThrow(EvaluationError);
      
      await expect(
        evalla([{ name: 'validName', expr: 'new + new' }])
      ).rejects.toThrow(EvaluationError);
    });
  });

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

    test('semicolons in expressions - not supported', async () => {
      // Semicolons are not supported in expressions with Peggy parser
      // This is intentional - mathematical expressions don't use semicolons
      await expect(
        evalla([{ name: 'test', expr: '1; 2' }])
      ).rejects.toThrow();
    });
  });

  describe('Unsupported AST node types (statements, not expressions)', () => {
    // This expression language only supports expressions, not statements
    // The AST evaluator uses a whitelist of supported node types
    // Statement constructs (if, while, for, etc.) produce AST nodes that are rejected
    
    test('await expressions not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'await foo' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('function declarations not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'function() {}' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('arrow functions not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: '() => 1' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('class declarations not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'class Foo {}' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('new expressions not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'new Date()' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('try/catch statements not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'try { 1 } catch(e) { 2 }' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('for statements not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'for(let i=0; i<10; i++) {}' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('while statements not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'while(true) {}' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('if statements not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'if(true) { 1 }' }])
      ).rejects.toThrow(EvaluationError);
    });

    test('variable declarations not allowed', async () => {
      await expect(
        evalla([{ name: 'test', expr: 'let x = 1' }])
      ).rejects.toThrow(EvaluationError);
    });
  });
});
