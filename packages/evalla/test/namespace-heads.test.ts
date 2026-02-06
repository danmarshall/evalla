import { evalla, EvaluationError } from '../src/index';
import Decimal from 'decimal.js';

describe('Namespace Heads', () => {
  describe('should reject namespace heads as standalone values', () => {
    test('$math namespace head should throw error', async () => {
      await expect(
        evalla([
          { name: 'a', expr: '$math' }
        ])
      ).rejects.toThrow(EvaluationError);
      
      await expect(
        evalla([
          { name: 'a', expr: '$math' }
        ])
      ).rejects.toThrow('Cannot use namespace head as a value');
    });

    test('$angle namespace head should throw error', async () => {
      await expect(
        evalla([
          { name: 'a', expr: '$angle' }
        ])
      ).rejects.toThrow(EvaluationError);
      
      await expect(
        evalla([
          { name: 'a', expr: '$angle' }
        ])
      ).rejects.toThrow('Cannot use namespace head as a value');
    });

    test('$unit namespace head should throw error', async () => {
      await expect(
        evalla([
          { name: 'a', expr: '$unit' }
        ])
      ).rejects.toThrow(EvaluationError);
      
      await expect(
        evalla([
          { name: 'a', expr: '$unit' }
        ])
      ).rejects.toThrow('Cannot use namespace head as a value');
    });
  });

  describe('should reject namespace heads in comparisons', () => {
    test('namespace head in less-than comparison', async () => {
      await expect(
        evalla([
          { name: 'a', value: 5 },
          { name: 'b', expr: 'a < $math' }
        ])
      ).rejects.toThrow(EvaluationError);
      
      await expect(
        evalla([
          { name: 'a', value: 5 },
          { name: 'b', expr: 'a < $math' }
        ])
      ).rejects.toThrow('Cannot use namespace head in operations');
    });

    test('namespace head in greater-than comparison', async () => {
      await expect(
        evalla([
          { name: 'a', value: 5 },
          { name: 'b', expr: 'a > $angle' }
        ])
      ).rejects.toThrow(EvaluationError);
    });

    test('namespace head in equality comparison', async () => {
      await expect(
        evalla([
          { name: 'a', value: 5 },
          { name: 'b', expr: 'a = $unit' }
        ])
      ).rejects.toThrow(EvaluationError);
    });

    test('namespace head in inequality comparison', async () => {
      await expect(
        evalla([
          { name: 'a', value: 5 },
          { name: 'b', expr: 'a != $math' }
        ])
      ).rejects.toThrow(EvaluationError);
    });

    test('namespace head on left side of comparison', async () => {
      await expect(
        evalla([
          { name: 'a', value: 5 },
          { name: 'b', expr: '$angle < a' }
        ])
      ).rejects.toThrow(EvaluationError);
    });

    test('namespace heads on both sides of comparison', async () => {
      await expect(
        evalla([
          { name: 'b', expr: '$angle < $math' }
        ])
      ).rejects.toThrow(EvaluationError);
    });
  });

  describe('should reject namespace heads in arithmetic operations', () => {
    test('namespace head in addition', async () => {
      await expect(
        evalla([
          { name: 'a', value: 5 },
          { name: 'b', expr: 'a + $math' }
        ])
      ).rejects.toThrow(EvaluationError);
    });

    test('namespace head in subtraction', async () => {
      await expect(
        evalla([
          { name: 'a', value: 5 },
          { name: 'b', expr: 'a - $angle' }
        ])
      ).rejects.toThrow(EvaluationError);
    });

    test('namespace head in multiplication', async () => {
      await expect(
        evalla([
          { name: 'a', value: 5 },
          { name: 'b', expr: 'a * $unit' }
        ])
      ).rejects.toThrow(EvaluationError);
    });

    test('namespace head in division', async () => {
      await expect(
        evalla([
          { name: 'a', value: 5 },
          { name: 'b', expr: 'a / $math' }
        ])
      ).rejects.toThrow(EvaluationError);
    });
  });

  describe('should allow valid namespace usage', () => {
    test('namespace property access for constants', async () => {
      const result = await evalla([
        { name: 'pi', expr: '$math.PI' },
        { name: 'e', expr: '$math.E' }
      ]);
      
      expect(Math.abs((result.values.pi as Decimal).toNumber() - Math.PI)).toBeLessThan(0.000001);
      expect(Math.abs((result.values.e as Decimal).toNumber() - Math.E)).toBeLessThan(0.000001);
    });

    test('namespace method calls', async () => {
      const result = await evalla([
        { name: 'absVal', expr: '$math.abs(-42)' },
        { name: 'sqrtVal', expr: '$math.sqrt(16)' }
      ]);
      
      expect((result.values.absVal as Decimal).toString()).toBe('42');
      expect((result.values.sqrtVal as Decimal).toString()).toBe('4');
    });

    test('namespace usage in expressions', async () => {
      const result = await evalla([
        { name: 'radius', value: 10 },
        { name: 'circumference', expr: '2 * $math.PI * radius' }
      ]);
      
      const expected = 2 * Math.PI * 10;
      expect(Math.abs((result.values.circumference as Decimal).toNumber() - expected)).toBeLessThan(0.000001);
    });

    test('comparisons with namespace properties', async () => {
      const result = await evalla([
        { name: 'a', value: 3 },
        { name: 'b', expr: 'a < $math.PI' }
      ]);
      
      expect(result.values.b).toBe(true);
    });

    test('arithmetic with namespace properties', async () => {
      const result = await evalla([
        { name: 'a', expr: '$math.PI + $math.E' }
      ]);
      
      const expected = Math.PI + Math.E;
      expect(Math.abs((result.values.a as Decimal).toNumber() - expected)).toBeLessThan(0.000001);
    });
  });
});
