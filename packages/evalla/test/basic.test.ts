import { evalla } from '../src/index';

describe('Basic Arithmetic', () => {
  test('basic arithmetic expressions', async () => {
    const result = await evalla([
      { name: 'a', expr: '10' },
      { name: 'b', expr: '20' },
      { name: 'c', expr: 'a + b' }
    ]);
    
    expect((result.values.c as any).toString()).toBe('30');
    expect(result.order).toEqual(['a', 'b', 'c']);
  });

  test('decimal precision', async () => {
    const result = await evalla([
      { name: 'x', expr: '0.1 + 0.2' }
    ]);
    
    expect((result.values.x as any).toString()).toBe('0.3');
  });

  test('expressions with multiple operators', async () => {
    const result = await evalla([
      { name: 'result', expr: '(10 + 5) * 2 - 3' }
    ]);
    
    expect((result.values.result as any).toString()).toBe('27');
  });

  test('empty input', async () => {
    const result = await evalla([]);
    expect(Object.keys(result.values).length).toBe(0);
    expect(result.order).toEqual([]);
  });
});
