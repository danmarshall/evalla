import { evalla, SecurityError } from '../src/index';
import Decimal from 'decimal.js';

describe('Security Hardening', () => {
  describe('Dangerous property access', () => {
    test('should block prototype access', async () => {
      await expect(
        evalla([
          { name: 'obj', value: { x: 10 } },
          { name: 'bad', expr: 'obj.prototype' }
        ])
      ).rejects.toThrow(SecurityError);
    });

    test('should block __proto__ access', async () => {
      await expect(
        evalla([
          { name: 'obj', value: { x: 10 } },
          { name: 'bad', expr: 'obj.__proto__' }
        ])
      ).rejects.toThrow(SecurityError);
    });

    test('should block constructor access', async () => {
      await expect(
        evalla([
          { name: 'obj', value: { x: 10 } },
          { name: 'bad', expr: 'obj.constructor' }
        ])
      ).rejects.toThrow(SecurityError);
    });

    test('should block properties starting with __', async () => {
      await expect(
        evalla([
          { name: 'obj', value: { x: 10 } },
          { name: 'bad', expr: 'obj.__defineGetter__' }
        ])
      ).rejects.toThrow(SecurityError);
    });

    test('should allow safe property access', async () => {
      const result = await evalla([
        { name: 'obj', value: { x: 10, y: 20 } },
        { name: 'sum', expr: 'obj.x + obj.y' }
      ]);
      
      expect((result.values.sum as Decimal).toString()).toBe('30');
    });

    test('should allow nested safe property access', async () => {
      const result = await evalla([
        { name: 'obj', value: { nested: { value: 42 } } },
        { name: 'val', expr: 'obj.nested.value' }
      ]);
      
      expect((result.values.val as Decimal).toString()).toBe('42');
    });
  });
});
