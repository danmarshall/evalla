import { checkSyntax, SyntaxCheckResult } from '../src/index';

describe('checkSyntax - Expression Syntax Validation', () => {
  describe('Valid Expressions', () => {
    test('simple arithmetic', () => {
      const result = checkSyntax('1 + 2');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.line).toBeUndefined();
      expect(result.column).toBeUndefined();
    });

    test('variable references', () => {
      expect(checkSyntax('a + b').valid).toBe(true);
      expect(checkSyntax('myVar').valid).toBe(true);
      expect(checkSyntax('_private').valid).toBe(true);
      expect(checkSyntax('$math.PI').valid).toBe(true);
    });

    test('complex arithmetic expressions', () => {
      expect(checkSyntax('(10 + 5) * 2 - 3').valid).toBe(true);
      expect(checkSyntax('a + b * c / d').valid).toBe(true);
      expect(checkSyntax('2 ** 3').valid).toBe(true);
      expect(checkSyntax('10 % 3').valid).toBe(true);
    });

    test('unary operators', () => {
      expect(checkSyntax('-5').valid).toBe(true);
      expect(checkSyntax('+10').valid).toBe(true);
      expect(checkSyntax('!true').valid).toBe(true);
      expect(checkSyntax('-a').valid).toBe(true);
    });

    test('comparison operators', () => {
      expect(checkSyntax('a > b').valid).toBe(true);
      expect(checkSyntax('a < b').valid).toBe(true);
      expect(checkSyntax('a >= b').valid).toBe(true);
      expect(checkSyntax('a <= b').valid).toBe(true);
      expect(checkSyntax('a == b').valid).toBe(true);
      expect(checkSyntax('a === b').valid).toBe(true);
      expect(checkSyntax('a != b').valid).toBe(true);
      expect(checkSyntax('a !== b').valid).toBe(true);
    });

    test('logical operators', () => {
      expect(checkSyntax('a && b').valid).toBe(true);
      expect(checkSyntax('a || b').valid).toBe(true);
      expect(checkSyntax('a ?? b').valid).toBe(true);
      expect(checkSyntax('!a').valid).toBe(true);
    });

    test('ternary operator', () => {
      expect(checkSyntax('a ? b : c').valid).toBe(true);
      expect(checkSyntax('x > 0 ? 1 : -1').valid).toBe(true);
      expect(checkSyntax('a ? b ? c : d : e').valid).toBe(true);
    });

    test('member access', () => {
      expect(checkSyntax('obj.prop').valid).toBe(true);
      expect(checkSyntax('obj.nested.prop').valid).toBe(true);
      expect(checkSyntax('obj["prop"]').valid).toBe(true);
      expect(checkSyntax('arr[0]').valid).toBe(true);
    });

    test('function calls', () => {
      expect(checkSyntax('$math.sqrt(16)').valid).toBe(true);
      expect(checkSyntax('$math.max(1, 2, 3)').valid).toBe(true);
      expect(checkSyntax('func()').valid).toBe(true);
    });

    test('object literals', () => {
      expect(checkSyntax('{x: 1, y: 2}').valid).toBe(true);
      expect(checkSyntax('{nested: {a: 1}}').valid).toBe(true);
      expect(checkSyntax('{}').valid).toBe(true);
    });

    test('array literals', () => {
      expect(checkSyntax('[1, 2, 3]').valid).toBe(true);
      expect(checkSyntax('[[1, 2], [3, 4]]').valid).toBe(true);
      expect(checkSyntax('[]').valid).toBe(true);
    });

    test('string literals', () => {
      expect(checkSyntax('"hello"').valid).toBe(true);
      expect(checkSyntax("'world'").valid).toBe(true);
      expect(checkSyntax('"hello world"').valid).toBe(true);
    });

    test('boolean and null literals', () => {
      expect(checkSyntax('true').valid).toBe(true);
      expect(checkSyntax('false').valid).toBe(true);
      expect(checkSyntax('null').valid).toBe(true);
    });

    test('keywords as identifiers', () => {
      // The Peggy parser allows keywords as identifiers
      expect(checkSyntax('return').valid).toBe(true);
      expect(checkSyntax('if').valid).toBe(true);
      expect(checkSyntax('for').valid).toBe(true);
      expect(checkSyntax('while').valid).toBe(true);
    });

    test('whitespace handling', () => {
      expect(checkSyntax('  a + b  ').valid).toBe(true);
      expect(checkSyntax('a+b').valid).toBe(true);
      expect(checkSyntax('a    +    b').valid).toBe(true);
      expect(checkSyntax('a\n+\nb').valid).toBe(true);
    });
  });

  describe('Invalid Expressions', () => {
    test('empty string', () => {
      const result = checkSyntax('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    test('only whitespace', () => {
      const result = checkSyntax('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    test('non-string input', () => {
      const result = checkSyntax(123 as any);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a string');
    });

    test('dangling operators', () => {
      const result = checkSyntax('1 +');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.line).toBeDefined();
      expect(result.column).toBeDefined();
    });

    test('consecutive operators', () => {
      const result = checkSyntax('1 + * 2');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('missing operator', () => {
      const result = checkSyntax('1 2');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('unmatched opening parenthesis', () => {
      const result = checkSyntax('(1 + 2');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.line).toBeDefined();
      expect(result.column).toBeDefined();
    });

    test('unmatched closing parenthesis', () => {
      const result = checkSyntax('1 + 2)');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('unmatched opening brace', () => {
      const result = checkSyntax('{x: 1');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('unmatched closing brace', () => {
      const result = checkSyntax('x: 1}');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('unmatched opening bracket', () => {
      const result = checkSyntax('[1, 2');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('unmatched closing bracket', () => {
      const result = checkSyntax('1, 2]');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('unterminated string with double quotes', () => {
      const result = checkSyntax('"hello');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('unterminated string with single quotes', () => {
      const result = checkSyntax("'hello");
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('invalid property access', () => {
      const result = checkSyntax('obj..prop');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('invalid identifier starting with number', () => {
      const result = checkSyntax('9invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('just an operator', () => {
      const result = checkSyntax('+');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('assignment operator (single equals)', () => {
      const result = checkSyntax('a = 5');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('assignment with addition', () => {
      const result = checkSyntax('a = b + 1');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('semicolon at end', () => {
      const result = checkSyntax('1 + 2;');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('semicolon between expressions', () => {
      const result = checkSyntax('1; 2');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('semicolon in middle of expression', () => {
      const result = checkSyntax('a + b; c + d');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('incomplete ternary', () => {
      const result = checkSyntax('a ? b');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('invalid object literal syntax', () => {
      const result = checkSyntax('{1}');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Error Location Information', () => {
    test('provides line and column for parse errors', () => {
      const result = checkSyntax('1 + (2 * 3');
      expect(result.valid).toBe(false);
      expect(result.line).toBe(1);
      expect(result.column).toBeGreaterThan(0);
    });

    test('error message includes location', () => {
      const result = checkSyntax('a +');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('line');
      expect(result.error).toContain('column');
    });
  });

  describe('Practical Use Cases', () => {
    test('validates common mathematical expressions', () => {
      const expressions = [
        '2 * $math.PI * radius',
        'length * width * height',
        '$math.sqrt(a**2 + b**2)',
        'price * (1 + taxRate)',
        '$unit.mmToInch(25.4)'
      ];

      expressions.forEach(expr => {
        const result = checkSyntax(expr);
        expect(result.valid).toBe(true);
      });
    });

    test('detects common mistakes', () => {
      const invalidExpressions = [
        'a +',           // missing operand
        '* b',           // missing operand
        '(a + b',        // unmatched paren
        '{x: 1, y:}',    // incomplete object
        '[1, 2,',        // incomplete array
      ];

      invalidExpressions.forEach(expr => {
        const result = checkSyntax(expr);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });
});
