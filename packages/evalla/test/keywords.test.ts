import { evalla } from '../src/index';

describe('Keywords as Variable Names', () => {
  test('JavaScript keywords work as variable names', async () => {
    const result = await evalla([
      { name: 'return', expr: '10' },
      { name: 'if', expr: '20' },
      { name: 'result', expr: 'return + if' }
    ]);
    
    expect(result.values.return.toString()).toBe('10');
    expect(result.values.if.toString()).toBe('20');
    expect(result.values.result.toString()).toBe('30');
    expect(result.order).toEqual(['return', 'if', 'result']);
  });

  test('various JavaScript keywords work', async () => {
    const result = await evalla([
      { name: 'while', expr: '5' },
      { name: 'for', expr: '3' },
      { name: 'break', expr: 'while * for' },
      { name: 'continue', expr: 'break + 2' }
    ]);
    
    expect(result.values.while.toString()).toBe('5');
    expect(result.values.for.toString()).toBe('3');
    expect(result.values.break.toString()).toBe('15');
    expect(result.values.continue.toString()).toBe('17');
  });

  test('keywords in complex expressions', async () => {
    const result = await evalla([
      { name: 'function', expr: '100' },
      { name: 'class', expr: '50' },
      { name: 'const', expr: '(function - class) / 2' }
    ]);
    
    expect(result.values.function.toString()).toBe('100');
    expect(result.values.class.toString()).toBe('50');
    expect(result.values.const.toString()).toBe('25');
  });

  test('keywords with object literals', async () => {
    const result = await evalla([
      { name: 'import', expr: '{x: 10, y: 20}' },
      { name: 'export', expr: 'import.x + import.y' }
    ]);
    
    expect(result.values.export.toString()).toBe('30');
  });

  test('keywords with namespaces', async () => {
    const result = await evalla([
      { name: 'switch', expr: '$math.PI' },
      { name: 'case', expr: '$math.abs(-42)' },
      { name: 'default', expr: 'switch + case' }
    ]);
    
    expect(result.values.case.toString()).toBe('42');
    expect(result.values.default.toNumber()).toBeCloseTo(45.14159, 3);
  });

  test('reserved literals (true, false, null) are primarily for values', async () => {
    // true, false, null are reserved as literals in expressions
    // However, they can technically be used as variable names (though not recommended)
    const result1 = await evalla([
      { name: 'x', expr: 'true' }  // true as a literal value
    ]);
    expect(result1.order).toContain('x');
    
    // Can even use as variable name (though discouraged in practice)
    const result2 = await evalla([
      { name: 'true', expr: '10' }
    ]);
    expect(result2.values.true.toString()).toBe('10');
  });
});
