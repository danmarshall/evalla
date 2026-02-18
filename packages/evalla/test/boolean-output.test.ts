import { ErrorMessage } from '../src/error-messages.js';
import { evalla, ValidationError } from '../src/index';
import Decimal from 'decimal.js';

describe('Boolean and Null Output', () => {
  describe('Boolean Literals in Ternary', () => {
    test('ternary with boolean true branch', async () => {
      const result = await evalla([
        { name: 'x', expr: '10' },
        { name: 'result', expr: 'x > 5 ? true : false' }
      ]);
      
      expect(result.values.result).toBe(true);
      expect(typeof result.values.result).toBe('boolean');
      expect(result.order).toContain('result');
    });

    test('ternary with boolean false branch', async () => {
      const result = await evalla([
        { name: 'x', expr: '2' },
        { name: 'result', expr: 'x > 5 ? true : false' }
      ]);
      
      expect(result.values.result).toBe(false);
      expect(typeof result.values.result).toBe('boolean');
    });

    test('ternary with null branch', async () => {
      const result = await evalla([
        { name: 'x', expr: '2' },
        { name: 'result', expr: 'x > 5 ? 100 : null' }
      ]);
      
      expect(result.values.result).toBe(null);
      expect(result.order).toContain('result');
    });
  });

  describe('Standalone Comparisons Returning Boolean', () => {
    test('less than comparison', async () => {
      const result = await evalla([
        { name: 'a', expr: '5' },
        { name: 'b', expr: '10' },
        { name: 'test', expr: 'a < b' }
      ]);
      
      expect(result.values.test).toBe(true);
    });

    test('greater than comparison', async () => {
      const result = await evalla([
        { name: 'a', expr: '15' },
        { name: 'b', expr: '10' },
        { name: 'test', expr: 'a > b' }
      ]);
      
      expect(result.values.test).toBe(true);
    });

    test('less than or equal comparison', async () => {
      const result = await evalla([
        { name: 'a', expr: '10' },
        { name: 'b', expr: '10' },
        { name: 'test', expr: 'a <= b' }
      ]);
      
      expect(result.values.test).toBe(true);
    });

    test('greater than or equal comparison', async () => {
      const result = await evalla([
        { name: 'a', expr: '10' },
        { name: 'b', expr: '5' },
        { name: 'test', expr: 'a >= b' }
      ]);
      
      expect(result.values.test).toBe(true);
    });

    test('double equals comparison', async () => {
      const result = await evalla([
        { name: 'a', expr: '5' },
        { name: 'b', expr: '5' },
        { name: 'test', expr: 'a == b' }
      ]);
      
      expect(result.values.test).toBe(true);
    });

    test('single equals comparison (new operator)', async () => {
      const result = await evalla([
        { name: 'a', expr: '5' },
        { name: 'b', expr: '5' },
        { name: 'test', expr: 'a = b' }
      ]);
      
      expect(result.values.test).toBe(true);
    });

    test('not equals comparison', async () => {
      const result = await evalla([
        { name: 'a', expr: '5' },
        { name: 'b', expr: '10' },
        { name: 'test', expr: 'a != b' }
      ]);
      
      expect(result.values.test).toBe(true);
    });

    test('comparison returns false', async () => {
      const result = await evalla([
        { name: 'a', expr: '5' },
        { name: 'b', expr: '10' },
        { name: 'test', expr: 'a > b' }
      ]);
      
      expect(result.values.test).toBe(false);
    });
  });

  describe('Standalone Logical Operations Returning Boolean', () => {
    test('AND operation true', async () => {
      const result = await evalla([
        { name: 'a', expr: '5' },
        { name: 'b', expr: '10' },
        { name: 'test', expr: 'a > 0 && b > 0' }
      ]);
      
      expect(result.values.test).toBe(true);
    });

    test('AND operation false', async () => {
      const result = await evalla([
        { name: 'a', expr: '5' },
        { name: 'b', expr: '10' },
        { name: 'test', expr: 'a > 10 && b > 0' }
      ]);
      
      expect(result.values.test).toBe(false);
    });

    test('OR operation true', async () => {
      const result = await evalla([
        { name: 'a', expr: '5' },
        { name: 'b', expr: '10' },
        { name: 'test', expr: 'a > 10 || b > 0' }
      ]);
      
      expect(result.values.test).toBe(true);
    });

    test('OR operation false', async () => {
      const result = await evalla([
        { name: 'a', expr: '5' },
        { name: 'b', expr: '10' },
        { name: 'test', expr: 'a > 10 || b < 0' }
      ]);
      
      expect(result.values.test).toBe(false);
    });

    test('NOT operation', async () => {
      const result = await evalla([
        { name: 'a', expr: '5' },
        { name: 'test', expr: '!(a > 10)' }
      ]);
      
      expect(result.values.test).toBe(true);
    });

    test('nullish coalescing', async () => {
      const result = await evalla([
        { name: 'a', expr: 'null' },
        { name: 'test', expr: 'a ?? 42' }
      ]);
      
      expect((result.values.test as any).toString()).toBe('42');
    });
  });

  describe('Reserved Value Name Validation', () => {
    test('cannot use "true" as variable name', async () => {
      await expect(
        evalla([{ name: 'true', expr: '10' }])
      ).rejects.toThrow(ValidationError);
      
      await expect(
        evalla([{ name: 'true', expr: '10' }])
      ).rejects.toThrow(ErrorMessage.VARIABLE_NAME_RESERVED);
    });

    test('cannot use "false" as variable name', async () => {
      await expect(
        evalla([{ name: 'false', expr: '10' }])
      ).rejects.toThrow(ValidationError);
    });

    test('cannot use "null" as variable name', async () => {
      await expect(
        evalla([{ name: 'null', expr: '10' }])
      ).rejects.toThrow(ValidationError);
    });

    test('cannot use "Infinity" as variable name', async () => {
      await expect(
        evalla([{ name: 'Infinity', expr: '10' }])
      ).rejects.toThrow(ValidationError);
    });

    test('can use "NaN" as variable name', async () => {
      // NaN is NOT reserved
      const result = await evalla([
        { name: 'NaN', expr: '10' }
      ]);
      
      expect((result.values.NaN as any).toString()).toBe('10');
    });
  });

  describe('Null Values in Output', () => {
    test('null literal', async () => {
      const result = await evalla([
        { name: 'x', expr: 'null' }
      ]);
      
      expect(result.values.x).toBe(null);
      expect(result.order).toContain('x');
    });

    test('null from ternary', async () => {
      const result = await evalla([
        { name: 'x', expr: '5' },
        { name: 'y', expr: 'x > 10 ? 100 : null' }
      ]);
      
      expect(result.values.y).toBe(null);
    });

    test('null can be used in expressions', async () => {
      const result = await evalla([
        { name: 'x', expr: 'null' },
        { name: 'y', expr: 'x ?? 42' }
      ]);
      
      expect(result.values.x).toBe(null);
      expect((result.values.y as any).toString()).toBe('42');
    });
  });

  describe('Boolean Literals as Expressions', () => {
    test('true literal', async () => {
      const result = await evalla([
        { name: 'x', expr: 'true' }
      ]);
      
      expect(result.values.x).toBe(true);
    });

    test('false literal', async () => {
      const result = await evalla([
        { name: 'x', expr: 'false' }
      ]);
      
      expect(result.values.x).toBe(false);
    });

    test('boolean used in logical expression', async () => {
      const result = await evalla([
        { name: 'a', expr: 'true' },
        { name: 'b', expr: 'false' },
        { name: 'and', expr: 'a && b' },
        { name: 'or', expr: 'a || b' }
      ]);
      
      expect(result.values.a).toBe(true);
      expect(result.values.b).toBe(false);
      expect(result.values.and).toBe(false);
      expect(result.values.or).toBe(true);
    });
  });

  describe('Mixed Types in Results', () => {
    test('results can contain Decimal, boolean, and null', async () => {
      const result = await evalla([
        { name: 'num', expr: '42' },
        { name: 'bool', expr: 'num > 0' },
        { name: 'nully', expr: 'null' },
        { name: 'ternary', expr: 'bool ? num : nully' }
      ]);
      
      expect(result.values.num).toBeInstanceOf(Decimal);
      expect((result.values.num as any).toString()).toBe('42');
      expect(result.values.bool).toBe(true);
      expect(result.values.nully).toBe(null);
      expect(result.values.ternary).toBeInstanceOf(Decimal);
      expect((result.values.ternary as any).toString()).toBe('42');
    });
  });

  describe('Single Equals Operator', () => {
    test('single equals works with numbers', async () => {
      const result = await evalla([
        { name: 'a', expr: '5' },
        { name: 'b', expr: '5' },
        { name: 'equal', expr: 'a = b' }
      ]);
      
      expect(result.values.equal).toBe(true);
    });

    test('single equals works in complex expression', async () => {
      const result = await evalla([
        { name: 'x', expr: '10' },
        { name: 'y', expr: '20' },
        { name: 'result', expr: '(x + 10) = y' }
      ]);
      
      expect(result.values.result).toBe(true);
    });

    test('single equals returns false when not equal', async () => {
      const result = await evalla([
        { name: 'a', expr: '5' },
        { name: 'b', expr: '10' },
        { name: 'equal', expr: 'a = b' }
      ]);
      
      expect(result.values.equal).toBe(false);
    });
  });
});
