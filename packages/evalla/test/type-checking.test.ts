import { evalla } from '../src/index';
import { EvaluationError } from '../src/errors';
import Decimal from 'decimal.js';

describe('Type checking in operations', () => {
  describe('Arithmetic operations reject invalid types', () => {
    test('arithmetic with objects should error', async () => {
      await expect(evalla([
        { name: 'obj', value: {x: 10} },
        { name: 'result', expr: 'obj + 5' }
      ])).rejects.toThrow(EvaluationError);
      
      await expect(evalla([
        { name: 'obj', value: {x: 10} },
        { name: 'result', expr: '5 * obj' }
      ])).rejects.toThrow(EvaluationError);
    });
    
    test('arithmetic with arrays should error', async () => {
      await expect(evalla([
        { name: 'arr', value: [1, 2, 3] },
        { name: 'result', expr: 'arr * 2' }
      ])).rejects.toThrow(EvaluationError);
      
      await expect(evalla([
        { name: 'arr', value: [1, 2, 3] },
        { name: 'result', expr: 'arr + 10' }
      ])).rejects.toThrow(EvaluationError);
    });
  });
  
  describe('Comparison operations reject invalid types', () => {
    test('comparison with objects should error', async () => {
      await expect(evalla([
        { name: 'obj', value: {x: 10} },
        { name: 'result', expr: 'obj > 5' }
      ])).rejects.toThrow(EvaluationError);
      
      await expect(evalla([
        { name: 'obj', value: {x: 10} },
        { name: 'result', expr: 'obj < 20' }
      ])).rejects.toThrow(EvaluationError);
    });
    
    test('comparison with arrays should error', async () => {
      await expect(evalla([
        { name: 'arr', value: [1, 2, 3] },
        { name: 'result', expr: 'arr >= 5' }
      ])).rejects.toThrow(EvaluationError);
    });
  });
  
  describe('Unary operations reject invalid types', () => {
    test('unary minus with object should error', async () => {
      await expect(evalla([
        { name: 'obj', value: {x: 10} },
        { name: 'result', expr: '-obj' }
      ])).rejects.toThrow(EvaluationError);
    });
    
    test('unary plus with array should error', async () => {
      await expect(evalla([
        { name: 'arr', value: [1, 2, 3] },
        { name: 'result', expr: '+arr' }
      ])).rejects.toThrow(EvaluationError);
    });
  });
  
  describe('Equality operations with mixed types', () => {
    test('equality with different types returns false', async () => {
      const result = await evalla([
        { name: 'num', expr: '10' },
        { name: 'bool', expr: 'true' },
        { name: 'equal', expr: 'num == bool' }
      ]);
      expect(result.values.equal).toBe(false);
    });
    
    test('equality with same types works', async () => {
      const result = await evalla([
        { name: 'a', expr: 'true' },
        { name: 'b', expr: 'true' },
        { name: 'equal', expr: 'a == b' }
      ]);
      expect(result.values.equal).toBe(true);
    });
    
    test('null equality works', async () => {
      const result = await evalla([
        { name: 'a', expr: 'null' },
        { name: 'b', expr: 'null' },
        { name: 'equal', expr: 'a == b' }
      ]);
      expect(result.values.equal).toBe(true);
    });
  });
  
  describe('Valid numeric operations', () => {
    test('arithmetic with Decimal values works', async () => {
      const result = await evalla([
        { name: 'a', expr: '10' },
        { name: 'b', expr: '5' },
        { name: 'sum', expr: 'a + b' },
        { name: 'product', expr: 'a * b' }
      ]);
      expect((result.values.sum as Decimal).toString()).toBe('15');
      expect((result.values.product as Decimal).toString()).toBe('50');
    });
    
    test('comparisons with Decimal values work', async () => {
      const result = await evalla([
        { name: 'a', expr: '10' },
        { name: 'b', expr: '5' },
        { name: 'greater', expr: 'a > b' },
        { name: 'less', expr: 'a < b' }
      ]);
      expect(result.values.greater).toBe(true);
      expect(result.values.less).toBe(false);
    });
  });
});
