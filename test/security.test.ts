import { evalla } from '../src/index';

describe('Security Hardening', () => {
  describe('Dangerous property access', () => {
    test('should block prototype access', async () => {
      await expect(
        evalla([
          { name: 'obj', value: { x: 10 } },
          { name: 'bad', expr: 'obj.prototype' }
        ])
      ).rejects.toThrow(/Access to property "prototype" is not allowed/);
    });

    test('should block __proto__ access', async () => {
      await expect(
        evalla([
          { name: 'obj', value: { x: 10 } },
          { name: 'bad', expr: 'obj.__proto__' }
        ])
      ).rejects.toThrow(/Access to property "__proto__" is not allowed/);
    });

    test('should block constructor access', async () => {
      await expect(
        evalla([
          { name: 'obj', value: { x: 10 } },
          { name: 'bad', expr: 'obj.constructor' }
        ])
      ).rejects.toThrow(/Access to property "constructor" is not allowed/);
    });

    test('should block properties starting with __', async () => {
      await expect(
        evalla([
          { name: 'obj', value: { x: 10 } },
          { name: 'bad', expr: 'obj.__defineGetter__' }
        ])
      ).rejects.toThrow(/Access to property "__defineGetter__" is not allowed/);
    });

    test('should allow safe property access', async () => {
      const result = await evalla([
        { name: 'obj', value: { x: 10, y: 20 } },
        { name: 'sum', expr: 'obj.x + obj.y' }
      ]);
      
      expect(result.values.sum.toString()).toBe('30');
    });

    test('should allow nested safe property access', async () => {
      const result = await evalla([
        { name: 'obj', value: { nested: { value: 42 } } },
        { name: 'val', expr: 'obj.nested.value' }
      ]);
      
      expect(result.values.val.toString()).toBe('42');
    });
  });
});
