import { evalla } from '../src/index';

describe('Boolean Literals and Operations', () => {
  test('boolean literals', async () => {
    const result = await evalla([
      { name: 'trueVal', expr: 'true' },
      { name: 'falseVal', expr: 'false' }
    ]);
    
    expect(result.values.trueVal).toBe(true);
    expect(result.values.falseVal).toBe(false);
    expect(result.order).toEqual(['trueVal', 'falseVal']);
  });

  test('logical AND operator', async () => {
    const result = await evalla([
      { name: 't', expr: 'true' },
      { name: 'f', expr: 'false' },
      { name: 'tt', expr: 't && t' },
      { name: 'tf', expr: 't && f' },
      { name: 'ft', expr: 'f && t' },
      { name: 'ff', expr: 'f && f' }
    ]);
    
    expect(result.values.tt).toBe(true);
    expect(result.values.tf).toBe(false);
    expect(result.values.ft).toBe(false);
    expect(result.values.ff).toBe(false);
  });

  test('logical OR operator', async () => {
    const result = await evalla([
      { name: 't', expr: 'true' },
      { name: 'f', expr: 'false' },
      { name: 'tt', expr: 't || t' },
      { name: 'tf', expr: 't || f' },
      { name: 'ft', expr: 'f || t' },
      { name: 'ff', expr: 'f || f' }
    ]);
    
    expect(result.values.tt).toBe(true);
    expect(result.values.tf).toBe(true);
    expect(result.values.ft).toBe(true);
    expect(result.values.ff).toBe(false);
  });

  test('logical NOT operator', async () => {
    const result = await evalla([
      { name: 't', expr: 'true' },
      { name: 'f', expr: 'false' },
      { name: 'notT', expr: '!t' },
      { name: 'notF', expr: '!f' }
    ]);
    
    expect(result.values.notT).toBe(false);
    expect(result.values.notF).toBe(true);
  });

  test('comparison operators return booleans', async () => {
    const result = await evalla([
      { name: 'a', expr: '5' },
      { name: 'b', expr: '10' },
      { name: 'gt', expr: 'a > b' },
      { name: 'lt', expr: 'a < b' },
      { name: 'gte', expr: 'a >= b' },
      { name: 'lte', expr: 'a <= b' },
      { name: 'eq', expr: 'a == a' },
      { name: 'neq', expr: 'a != b' }
    ]);
    
    expect(result.values.gt).toBe(false);
    expect(result.values.lt).toBe(true);
    expect(result.values.gte).toBe(false);
    expect(result.values.lte).toBe(true);
    expect(result.values.eq).toBe(true);
    expect(result.values.neq).toBe(true);
  });

  test('nullish coalescing operator', async () => {
    const result = await evalla([
      { name: 'n', expr: 'null' },
      { name: 'zero', expr: '0' },
      { name: 'f', expr: 'false' },
      { name: 'coalesce1', expr: 'n ?? 42' },
      { name: 'coalesce2', expr: 'zero ?? 42' },
      { name: 'coalesce3', expr: 'f ?? 42' }
    ]);
    
    expect(result.values.coalesce1.toString()).toBe('42');
    expect(result.values.coalesce2.toString()).toBe('0');
    expect(result.values.coalesce3).toBe(false);
  });

  test('complex boolean expressions', async () => {
    const result = await evalla([
      { name: 'a', expr: '10' },
      { name: 'b', expr: '20' },
      { name: 'c', expr: '15' },
      { name: 'complex1', expr: '(a < b) && (b > c)' },
      { name: 'complex2', expr: '(a > b) || (c < b)' },
      { name: 'complex3', expr: '!(a > b) && (c >= a)' }
    ]);
    
    expect(result.values.complex1).toBe(true);
    expect(result.values.complex2).toBe(true);
    expect(result.values.complex3).toBe(true);
  });

  test('boolean short-circuit evaluation', async () => {
    // This test verifies that logical operators short-circuit properly
    const result = await evalla([
      { name: 't', expr: 'true' },
      { name: 'f', expr: 'false' },
      { name: 'num', expr: '42' },
      // && short-circuits on false
      { name: 'shortAnd', expr: 'f && num' },
      // || short-circuits on true
      { name: 'shortOr', expr: 't || num' }
    ]);
    
    expect(result.values.shortAnd).toBe(false);
    expect(result.values.shortOr).toBe(true);
  });

  test('booleans cannot be used in arithmetic operations', async () => {
    await expect(
      evalla([
        { name: 'bool', expr: 'true' },
        { name: 'result', expr: 'bool + 5' }
      ])
    ).rejects.toThrow();
  });
});

describe('Ternary Operator (Conditional Expression)', () => {
  test('basic ternary operator', async () => {
    const result = await evalla([
      { name: 'x', expr: '10' },
      { name: 'result', expr: 'x > 5 ? 100 : 50' }
    ]);
    
    expect(result.values.result.toString()).toBe('100');
  });

  test('ternary with false condition', async () => {
    const result = await evalla([
      { name: 'x', expr: '3' },
      { name: 'result', expr: 'x > 5 ? 100 : 50' }
    ]);
    
    expect(result.values.result.toString()).toBe('50');
  });

  test('nested ternary operators', async () => {
    const result = await evalla([
      { name: 'score', expr: '85' },
      { name: 'grade', expr: 'score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "F"' }
    ]);
    
    expect(result.values.grade).toBe('B');
  });

  test('ternary with boolean condition directly', async () => {
    const result = await evalla([
      { name: 'isValid', expr: 'true' },
      { name: 'message', expr: 'isValid ? "Valid" : "Invalid"' }
    ]);
    
    expect(result.values.message).toBe('Valid');
  });

  test('ternary with complex conditions', async () => {
    const result = await evalla([
      { name: 'a', expr: '10' },
      { name: 'b', expr: '20' },
      { name: 'c', expr: '15' },
      { name: 'result', expr: '(a < b && c > a) ? a + b : b - a' }
    ]);
    
    expect(result.values.result.toString()).toBe('30');
  });

  test('ternary returning booleans', async () => {
    const result = await evalla([
      { name: 'x', expr: '10' },
      { name: 'isPositive', expr: 'x > 0 ? true : false' }
    ]);
    
    expect(result.values.isPositive).toBe(true);
  });

  test('ternary with null values', async () => {
    const result = await evalla([
      { name: 'hasValue', expr: 'false' },
      { name: 'result', expr: 'hasValue ? 42 : null' }
    ]);
    
    expect(result.values.result).toBe(null);
  });

  test('multiple ternary expressions', async () => {
    const result = await evalla([
      { name: 'x', expr: '5' },
      { name: 'y', expr: '10' },
      { name: 'max', expr: 'x > y ? x : y' },
      { name: 'min', expr: 'x < y ? x : y' }
    ]);
    
    expect(result.values.max.toString()).toBe('10');
    expect(result.values.min.toString()).toBe('5');
  });

  test('ternary with mathematical expressions', async () => {
    const result = await evalla([
      { name: 'a', expr: '10' },
      { name: 'b', expr: '5' },
      { name: 'result', expr: 'a > b ? a * 2 : b * 2' }
    ]);
    
    expect(result.values.result.toString()).toBe('20');
  });

  test('ternary operator precedence', async () => {
    const result = await evalla([
      { name: 'x', expr: '5' },
      // Without parentheses, should parse as: (x > 3) ? (x * 2) : (x + 1)
      { name: 'result', expr: 'x > 3 ? x * 2 : x + 1' }
    ]);
    
    expect(result.values.result.toString()).toBe('10');
  });

  test('logical comparator with ternary - user example', async () => {
    // Test exact user example: a > 3 ? -1 : 1
    const result1 = await evalla([
      { name: 'a', expr: '5' },
      { name: 'result', expr: 'a > 3 ? -1 : 1' }
    ]);
    expect(result1.values.result.toString()).toBe('-1');

    const result2 = await evalla([
      { name: 'a', expr: '2' },
      { name: 'result', expr: 'a > 3 ? -1 : 1' }
    ]);
    expect(result2.values.result.toString()).toBe('1');
  });

  test('sign function with comparators', async () => {
    // Implements sign(x) = x > 0 ? 1 : x < 0 ? -1 : 0
    const testCases = [
      { x: '10', expected: '1' },
      { x: '-5', expected: '-1' },
      { x: '0', expected: '0' }
    ];

    for (const tc of testCases) {
      const result = await evalla([
        { name: 'x', expr: tc.x },
        { name: 'sign', expr: 'x > 0 ? 1 : x < 0 ? -1 : 0' }
      ]);
      expect(result.values.sign.toString()).toBe(tc.expected);
    }
  });

  test('range checking with comparators and logical operators', async () => {
    const result = await evalla([
      { name: 'x', expr: '15' },
      { name: 'inRange', expr: 'x >= 10 && x <= 30 ? true : false' },
      { name: 'outOfRange', expr: 'x < 0 || x > 100 ? true : false' }
    ]);
    
    expect(result.values.inRange).toBe(true);
    expect(result.values.outOfRange).toBe(false);
  });
});

describe('Combined Boolean and Ternary Operations', () => {
  test('ternary with boolean literals', async () => {
    const result = await evalla([
      { name: 'condition', expr: 'true' },
      { name: 'result', expr: 'condition ? true : false' }
    ]);
    
    expect(result.values.result).toBe(true);
  });

  test('boolean operations in ternary conditions', async () => {
    const result = await evalla([
      { name: 'a', expr: 'true' },
      { name: 'b', expr: 'false' },
      { name: 'result', expr: '(a || b) ? 100 : 0' }
    ]);
    
    expect(result.values.result.toString()).toBe('100');
  });

  test('chained logical and ternary operators', async () => {
    const result = await evalla([
      { name: 'x', expr: '10' },
      { name: 'y', expr: '20' },
      { name: 'z', expr: '15' },
      { name: 'result', expr: 'x < y && y > z ? true : false' }
    ]);
    
    expect(result.values.result).toBe(true);
  });

  test('practical example: discount calculation', async () => {
    const result = await evalla([
      { name: 'price', expr: '100' },
      { name: 'isMember', expr: 'true' },
      { name: 'quantity', expr: '5' },
      { name: 'discount', expr: 'isMember && quantity > 3 ? 0.15 : isMember ? 0.10 : 0' },
      { name: 'finalPrice', expr: 'price * (1 - discount)' }
    ]);
    
    expect(result.values.discount.toString()).toBe('0.15');
    expect(result.values.finalPrice.toString()).toBe('85');
  });

  test('practical example: grade validation', async () => {
    const result = await evalla([
      { name: 'score', expr: '92' },
      { name: 'isValid', expr: 'score >= 0 && score <= 100' },
      { name: 'grade', expr: 'isValid ? (score >= 90 ? "A" : score >= 80 ? "B" : "C") : "Invalid"' }
    ]);
    
    expect(result.values.isValid).toBe(true);
    expect(result.values.grade).toBe('A');
  });
});
