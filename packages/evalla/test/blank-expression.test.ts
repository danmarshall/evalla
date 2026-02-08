import { evalla } from '../src/index';
import Decimal from 'decimal.js';

describe('Blank Expression Handling', () => {
  test('blank expression returns null', async () => {
    const result = await evalla([
      { name: 'x', expr: '' }
    ]);
    
    expect(result.values.x).toBe(null);
    expect(result.order).toEqual(['x']);
  });

  test('whitespace-only expression returns null', async () => {
    // Expressions with only whitespace are trimmed in parser,
    // resulting in blank expression that returns null
    const result = await evalla([
      { name: 'y', expr: '   ' }
    ]);
    
    expect(result.values.y).toBe(null);
    expect(result.order).toEqual(['y']);
  });

  test('blank expression with other valid expressions', async () => {
    const result = await evalla([
      { name: 'a', expr: '10' },
      { name: 'b', expr: '' },
      { name: 'c', expr: 'a * 2' }
    ]);
    
    expect((result.values.a as Decimal).toString()).toBe('10');
    expect(result.values.b).toBe(null);
    expect((result.values.c as Decimal).toString()).toBe('20');
    expect(result.order).toEqual(['a', 'b', 'c']);
  });

  test('blank expression can be referenced in other expressions', async () => {
    const result = await evalla([
      { name: 'blank', expr: '' },
      { name: 'check', expr: 'blank' }
    ]);
    
    expect(result.values.blank).toBe(null);
    expect(result.values.check).toBe(null);
    expect(result.order).toEqual(['blank', 'check']);
  });

  test('multiple blank expressions', async () => {
    const result = await evalla([
      { name: 'x', expr: '' },
      { name: 'y', expr: '   ' },
      { name: 'z', expr: '\n\n' }
    ]);
    
    expect(result.values.x).toBe(null);
    expect(result.values.y).toBe(null);
    expect(result.values.z).toBe(null);
    expect(result.order).toEqual(['x', 'y', 'z']);
  });

  test('must provide expr or value field', async () => {
    // Still require either expr or value to be present
    await expect(
      evalla([{ name: 'test' } as any])
    ).rejects.toThrow('Each input must have either "expr" or "value"');
  });

  test('expr can be empty string but not undefined', async () => {
    // expr: '' is valid (returns null)
    const result1 = await evalla([{ name: 'x', expr: '' }]);
    expect(result1.values.x).toBe(null);

    // expr: undefined with no value is invalid
    await expect(
      evalla([{ name: 'y' } as any])
    ).rejects.toThrow('Each input must have either "expr" or "value"');
  });
});
