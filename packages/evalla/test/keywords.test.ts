import { evalla, ValidationError } from '../src/index';

describe('Keywords as Variable Names', () => {
  test('JavaScript keywords work as variable names', async () => {
    const result = await evalla([
      { name: 'return', expr: '10' },
      { name: 'if', expr: '20' },
      { name: 'result', expr: 'return + if' }
    ]);
    
    expect((result.values.return as any).toString()).toBe('10');
    expect((result.values.if as any).toString()).toBe('20');
    expect((result.values.result as any).toString()).toBe('30');
    expect(result.order).toEqual(['return', 'if', 'result']);
  });

  test('various JavaScript keywords work', async () => {
    const result = await evalla([
      { name: 'while', expr: '5' },
      { name: 'for', expr: '3' },
      { name: 'break', expr: 'while * for' },
      { name: 'continue', expr: 'break + 2' }
    ]);
    
    expect((result.values.while as any).toString()).toBe('5');
    expect((result.values.for as any).toString()).toBe('3');
    expect((result.values.break as any).toString()).toBe('15');
    expect((result.values.continue as any).toString()).toBe('17');
  });

  test('keywords in complex expressions', async () => {
    const result = await evalla([
      { name: 'function', expr: '100' },
      { name: 'class', expr: '50' },
      { name: 'const', expr: '(function - class) / 2' }
    ]);
    
    expect((result.values.function as any).toString()).toBe('100');
    expect((result.values.class as any).toString()).toBe('50');
    expect((result.values.const as any).toString()).toBe('25');
  });

  test('keywords with object literals', async () => {
    const result = await evalla([
      { name: 'import', expr: '{x: 10, y: 20}' },
      { name: 'export', expr: 'import.x + import.y' }
    ]);
    
    expect((result.values.export as any).toString()).toBe('30');
  });

  test('keywords with namespaces', async () => {
    const result = await evalla([
      { name: 'switch', expr: '$math.PI' },
      { name: 'case', expr: '$math.abs(-42)' },
      { name: 'default', expr: 'switch + case' }
    ]);
    
    expect((result.values.case as any).toString()).toBe('42');
    expect((result.values.default as any).toNumber()).toBeCloseTo(45.14159, 3);
  });

  test('reserved literals (true, false, null) are now reserved', async () => {
    // Reserved literals can be used as literal values in expressions
    const result1 = await evalla([
      { name: 'x', expr: 'true' }  // true as a literal value
    ]);
    expect(result1.order).toContain('x');
    expect(result1.values.x).toBe(true);  // Boolean output
    
    // But cannot be used as variable names (reserved)
    await expect(
      evalla([{ name: 'true', expr: '10' }])
    ).rejects.toThrow(ValidationError);
    
    await expect(
      evalla([{ name: 'false', expr: '10' }])
    ).rejects.toThrow(ValidationError);
    
    await expect(
      evalla([{ name: 'null', expr: '10' }])
    ).rejects.toThrow(ValidationError);
  });
});
