import { ErrorMessage } from '../src/error-messages.js';
import { evalla, EvaluationError } from '../src/index';

describe('Undefined namespace property', () => {
  test('should throw error for undefined property in $math namespace', async () => {
    await expect(evalla([
      { name: 'x', expr: '$math.foobar' }
    ])).rejects.toThrow(EvaluationError);
    
    try {
      await evalla([{ name: 'x', expr: '$math.foobar' }]);
    } catch (err: any) {
      expect(err.message).toBe(ErrorMessage.UNDEFINED_NAMESPACE_PROPERTY);
      expect(err.context).toEqual({ property: 'foobar', namespace: '$math' });
    }
  });

  test('should throw error for undefined property in $unit namespace', async () => {
    await expect(evalla([
      { name: 'x', expr: '$unit.invalid' }
    ])).rejects.toThrow(EvaluationError);
    
    try {
      await evalla([{ name: 'x', expr: '$unit.invalid' }]);
    } catch (err: any) {
      expect(err.message).toBe(ErrorMessage.UNDEFINED_NAMESPACE_PROPERTY);
      expect(err.context).toEqual({ property: 'invalid', namespace: '$unit' });
    }
  });

  test('should throw error for undefined property in $angle namespace', async () => {
    await expect(evalla([
      { name: 'x', expr: '$angle.badProperty' }
    ])).rejects.toThrow(EvaluationError);
    
    try {
      await evalla([{ name: 'x', expr: '$angle.badProperty' }]);
    } catch (err: any) {
      expect(err.message).toBe(ErrorMessage.UNDEFINED_NAMESPACE_PROPERTY);
      expect(err.context).toEqual({ property: 'badProperty', namespace: '$angle' });
    }
  });

  test('should throw error when undefined property is used in operation', async () => {
    await expect(evalla([
      { name: 'radius', expr: '10' },
      { name: 'area', expr: '$math.PI * $math.nonexistent' }
    ])).rejects.toThrow(EvaluationError);
    
    try {
      await evalla([
        { name: 'radius', expr: '10' },
        { name: 'area', expr: '$math.PI * $math.nonexistent' }
      ]);
    } catch (err: any) {
      expect(err.message).toBe(ErrorMessage.UNDEFINED_NAMESPACE_PROPERTY);
      expect(err.context).toEqual({ property: 'nonexistent', namespace: '$math' });
    }
  });

  test('should throw error when undefined property is used in function call', async () => {
    await expect(evalla([
      { name: 'x', expr: '$math.notAFunction(10)' }
    ])).rejects.toThrow(EvaluationError);
    
    try {
      await evalla([{ name: 'x', expr: '$math.notAFunction(10)' }]);
    } catch (err: any) {
      expect(err.message).toBe(ErrorMessage.UNDEFINED_NAMESPACE_PROPERTY);
      expect(err.context).toEqual({ property: 'notAFunction', namespace: '$math' });
    }
  });

  test('should allow valid properties in namespaces', async () => {
    const result = await evalla([
      { name: 'pi', expr: '$math.PI' },
      { name: 'sqrt2', expr: '$math.SQRT2' },
      { name: 'absVal', expr: '$math.abs(-5)' },
      { name: 'mmToInch', expr: '$unit.mmToInch(25.4)' },
      { name: 'toRad', expr: '$angle.toRad(180)' }
    ]);
    
    expect(result.values.pi).toBeDefined();
    expect(result.values.sqrt2).toBeDefined();
    expect(result.values.absVal).toBeDefined();
    expect(result.values.absVal?.toString()).toBe('5');
    expect(result.values.mmToInch?.toString()).toBe('1');
    if (result.values.toRad && typeof result.values.toRad !== 'boolean' && result.values.toRad !== null) {
      expect(Math.abs(result.values.toRad.toNumber() - Math.PI)).toBeLessThan(0.000001);
    }
  });

  test('should provide clear error for typos in property names', async () => {
    // Common typo: PI vs Pi
    try {
      await evalla([{ name: 'x', expr: '$math.Pi' }]);
      fail('Should have thrown an error');
    } catch (err: any) {
      expect(err.message).toBe(ErrorMessage.UNDEFINED_NAMESPACE_PROPERTY);
      expect(err.context).toEqual({ property: 'Pi', namespace: '$math' });
    }
    
    // Common typo: sqrt vs sqr
    try {
      await evalla([{ name: 'x', expr: '$math.sqr(4)' }]);
      fail('Should have thrown an error');
    } catch (err: any) {
      expect(err.message).toBe(ErrorMessage.UNDEFINED_NAMESPACE_PROPERTY);
      expect(err.context).toEqual({ property: 'sqr', namespace: '$math' });
    }
  });
});
