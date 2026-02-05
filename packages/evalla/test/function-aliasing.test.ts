import { evalla, SecurityError } from '../src/index';

describe('Function Aliasing Prevention', () => {
  test('should not allow aliasing $math functions', async () => {
    await expect(
      evalla([{ name: 'myabs', expr: '$math.abs' }])
    ).rejects.toThrow(SecurityError);
    
    await expect(
      evalla([{ name: 'mysqrt', expr: '$math.sqrt' }])
    ).rejects.toThrow(SecurityError);
    
    await expect(
      evalla([{ name: 'mymax', expr: '$math.max' }])
    ).rejects.toThrow(SecurityError);
  });

  test('should not allow aliasing $unit functions', async () => {
    await expect(
      evalla([{ name: 'myconv', expr: '$unit.mmToInch' }])
    ).rejects.toThrow(SecurityError);
    
    await expect(
      evalla([{ name: 'myconv2', expr: '$unit.inchToMm' }])
    ).rejects.toThrow(SecurityError);
  });

  test('should not allow aliasing $angle functions', async () => {
    await expect(
      evalla([{ name: 'myrad', expr: '$angle.toRad' }])
    ).rejects.toThrow(SecurityError);
    
    await expect(
      evalla([{ name: 'mydeg', expr: '$angle.toDeg' }])
    ).rejects.toThrow(SecurityError);
  });

  test('should not allow indirect aliasing through object property', async () => {
    await expect(
      evalla([
        { name: 'mathObj', expr: '$math' },
        { name: 'fn', expr: 'mathObj.abs' }
      ])
    ).rejects.toThrow(SecurityError);
  });

  test('should not allow using aliased functions', async () => {
    // This should fail at the aliasing step, not when trying to use it
    await expect(
      evalla([
        { name: 'myabs', expr: '$math.abs' },
        { name: 'result', expr: 'myabs(-5)' }
      ])
    ).rejects.toThrow(SecurityError);
  });

  test('should still allow calling functions normally', async () => {
    const result = await evalla([
      { name: 'absVal', expr: '$math.abs(-42)' },
      { name: 'sqrtVal', expr: '$math.sqrt(16)' },
      { name: 'convVal', expr: '$unit.mmToInch(25.4)' },
      { name: 'angleVal', expr: '$angle.toRad(180)' }
    ]);
    
    expect(result.values.absVal.toString()).toBe('42');
    expect(result.values.sqrtVal.toString()).toBe('4');
    expect(result.values.convVal.toString()).toBe('1');
    expect(Math.abs(result.values.angleVal.toNumber() - Math.PI)).toBeLessThan(0.000001);
  });

  test('should allow accessing constants', async () => {
    const result = await evalla([
      { name: 'pi', expr: '$math.PI' },
      { name: 'e', expr: '$math.E' }
    ]);
    
    expect(Math.abs(result.values.pi.toNumber() - Math.PI)).toBeLessThan(0.000001);
    expect(Math.abs(result.values.e.toNumber() - Math.E)).toBeLessThan(0.000001);
  });

  test('error message should be descriptive', async () => {
    await expect(
      evalla([{ name: 'myabs', expr: '$math.abs' }])
    ).rejects.toThrow(SecurityError);
    
    // Verify specific error message content
    try {
      await evalla([{ name: 'myabs', expr: '$math.abs' }]);
    } catch (error) {
      if (error instanceof SecurityError) {
        expect(error.message).toContain('Cannot alias functions');
        expect(error.message).toContain('parentheses');
      }
    }
  });
});
