import { evalla, CircularDependencyError } from '../src/index';
import Decimal from 'decimal.js';

describe('Variable Dependencies', () => {
  test('variable dependencies', async () => {
    const result = await evalla([
      { name: 'width', expr: '100' },
      { name: 'height', expr: '50' },
      { name: 'area', expr: 'width * height' }
    ]);
    
    expect((result.values.area as Decimal).toString()).toBe('5000');
  });

  test('complex dependency chain', async () => {
    const result = await evalla([
      { name: 'd', expr: 'c * 2' },
      { name: 'b', expr: 'a + 10' },
      { name: 'c', expr: 'b * 3' },
      { name: 'a', expr: '5' }
    ]);
    
    expect((result.values.a as Decimal).toString()).toBe('5');
    expect((result.values.b as Decimal).toString()).toBe('15');
    expect((result.values.c as Decimal).toString()).toBe('45');
    expect((result.values.d as Decimal).toString()).toBe('90');
    expect(result.order).toEqual(['a', 'b', 'c', 'd']);
  });

  test('circular dependency detection', async () => {
    await expect(
      evalla([
        { name: 'a', expr: 'b + 1' },
        { name: 'b', expr: 'a + 1' }
      ])
    ).rejects.toThrow(CircularDependencyError);
  });

  test('self-reference detection', async () => {
    await expect(
      evalla([
        { name: 'a', expr: 'a + 1' }
      ])
    ).rejects.toThrow(CircularDependencyError);
  });
});
