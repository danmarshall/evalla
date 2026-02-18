import { ErrorMessage } from '../src/error-messages.js';
import { evalla, formatResults, Decimal } from '../src/index';

describe('formatResults', () => {
  test('formats Decimal values to specified decimal places', async () => {
    const result = await evalla([
      { name: 'pi', expr: '3.14159265358979323846' }
    ]);
    
    const formatted = formatResults(result, { decimalPlaces: 7 });
    
    expect((formatted.values.pi as Decimal).toString()).toBe('3.1415927');
    // Original result should be unchanged
    expect((result.values.pi as Decimal).toString()).toBe('3.14159265358979323846');
  });

  test('formats to 2 decimal places (financial)', async () => {
    const result = await evalla([
      { name: 'price', expr: '19.99' },
      { name: 'quantity', expr: '7' },
      { name: 'total', expr: 'price * quantity' }
    ]);
    
    const formatted = formatResults(result, { decimalPlaces: 2 });
    
    expect((formatted.values.price as Decimal).toString()).toBe('19.99');
    expect((formatted.values.quantity as Decimal).toString()).toBe('7');
    expect((formatted.values.total as Decimal).toString()).toBe('139.93');
  });

  test('formats to 0 decimal places', async () => {
    const result = await evalla([
      { name: 'value', expr: '123.456' }
    ]);
    
    const formatted = formatResults(result, { decimalPlaces: 0 });
    
    expect((formatted.values.value as Decimal).toString()).toBe('123');
  });

  test('preserves boolean values unchanged', async () => {
    const result = await evalla([
      { name: 'isTrue', expr: 'true' },
      { name: 'isFalse', expr: 'false' },
      { name: 'comparison', expr: '5 > 3' }
    ]);
    
    const formatted = formatResults(result, { decimalPlaces: 7 });
    
    expect(formatted.values.isTrue).toBe(true);
    expect(formatted.values.isFalse).toBe(false);
    expect(formatted.values.comparison).toBe(true);
  });

  test('preserves null values unchanged', async () => {
    const result = await evalla([
      { name: 'empty', expr: '' },
      { name: 'ternaryNull', expr: 'false ? 1 : null' }
    ]);
    
    const formatted = formatResults(result, { decimalPlaces: 7 });
    
    expect(formatted.values.empty).toBe(null);
    expect(formatted.values.ternaryNull).toBe(null);
  });

  test('preserves Infinity unchanged', async () => {
    const result = await evalla([
      { name: 'posInf', expr: '1/0' },
      { name: 'negInf', expr: '-1/0' }
    ]);
    
    const formatted = formatResults(result, { decimalPlaces: 7 });
    
    expect((formatted.values.posInf as Decimal).toString()).toBe('Infinity');
    expect((formatted.values.negInf as Decimal).toString()).toBe('-Infinity');
  });

  test('handles mixed value types', async () => {
    const result = await evalla([
      { name: 'decimal', expr: '3.14159' },
      { name: 'boolean', expr: 'true' },
      { name: 'nullValue', expr: 'null' },
      { name: 'infinity', expr: '1/0' }
    ]);
    
    const formatted = formatResults(result, { decimalPlaces: 2 });
    
    expect((formatted.values.decimal as Decimal).toString()).toBe('3.14');
    expect(formatted.values.boolean).toBe(true);
    expect(formatted.values.nullValue).toBe(null);
    expect((formatted.values.infinity as Decimal).toString()).toBe('Infinity');
  });

  test('formats repeating decimals', async () => {
    const result = await evalla([
      { name: 'oneThird', expr: '1/3' }
    ]);
    
    const formatted = formatResults(result, { decimalPlaces: 7 });
    
    expect((formatted.values.oneThird as Decimal).toString()).toBe('0.3333333');
  });

  test('preserves evaluation order', async () => {
    const result = await evalla([
      { name: 'c', expr: '30' },
      { name: 'a', expr: '10' },
      { name: 'b', expr: '20' }
    ]);
    
    const formatted = formatResults(result, { decimalPlaces: 2 });
    
    expect(formatted.order).toEqual(result.order);
    expect(formatted.order).toEqual(['c', 'a', 'b']);
  });

  test('does not mutate original result', async () => {
    const result = await evalla([
      { name: 'pi', expr: '3.14159265358979323846' }
    ]);
    
    const originalValue = (result.values.pi as Decimal).toString();
    formatResults(result, { decimalPlaces: 2 });
    
    // Original should be unchanged
    expect((result.values.pi as Decimal).toString()).toBe(originalValue);
    expect((result.values.pi as Decimal).toString()).toBe('3.14159265358979323846');
  });

  test('handles very small numbers', async () => {
    const result = await evalla([
      { name: 'small', expr: '0.0000000123' }
    ]);
    
    const formatted = formatResults(result, { decimalPlaces: 7 });
    
    // Very small number becomes 0 with limited decimal places
    expect((formatted.values.small as Decimal).toString()).toBe('0');
  });

  test('handles very large numbers', async () => {
    const result = await evalla([
      { name: 'large', expr: '123456789.987654321' }
    ]);
    
    const formatted = formatResults(result, { decimalPlaces: 2 });
    
    expect((formatted.values.large as Decimal).toString()).toBe('123456789.99');
  });

  test('throws error for negative decimal places', () => {
    const result = { 
      values: { x: new Decimal('1.234') }, 
      order: ['x'] 
    };
    
    expect(() => formatResults(result, { decimalPlaces: -1 }))
      .toThrow(ErrorMessage.DECIMAL_PLACES_INVALID);
  });

  test('throws error for non-integer decimal places', () => {
    const result = { 
      values: { x: new Decimal('1.234') }, 
      order: ['x'] 
    };
    
    expect(() => formatResults(result, { decimalPlaces: 2.5 }))
      .toThrow(ErrorMessage.DECIMAL_PLACES_INVALID);
  });

  test('throws error for non-numeric decimal places', () => {
    const result = { 
      values: { x: new Decimal('1.234') }, 
      order: ['x'] 
    };
    
    expect(() => formatResults(result, { decimalPlaces: '7' as any }))
      .toThrow(ErrorMessage.DECIMAL_PLACES_INVALID);
  });

  test('can format multiple times with different precisions', async () => {
    const result = await evalla([
      { name: 'value', expr: '123.456789' }
    ]);
    
    const formatted2 = formatResults(result, { decimalPlaces: 2 });
    const formatted5 = formatResults(result, { decimalPlaces: 5 });
    const formatted10 = formatResults(result, { decimalPlaces: 10 });
    
    expect((formatted2.values.value as Decimal).toString()).toBe('123.46');
    expect((formatted5.values.value as Decimal).toString()).toBe('123.45679');
    expect((formatted10.values.value as Decimal).toString()).toBe('123.456789');
    
    // Original unchanged
    expect((result.values.value as Decimal).toString()).toBe('123.456789');
  });

  test('maintains precision in calculations before formatting', async () => {
    const result = await evalla([
      { name: 'a', expr: '1/3' },
      { name: 'b', expr: 'a * 3' }
    ]);
    
    const formatted = formatResults(result, { decimalPlaces: 7 });
    
    // Internal calculation used full precision, so b is exactly 1
    expect((formatted.values.a as Decimal).toString()).toBe('0.3333333');
    expect((formatted.values.b as Decimal).toString()).toBe('1');
  });

  test('works with empty result', async () => {
    const result = await evalla([]);
    
    const formatted = formatResults(result, { decimalPlaces: 7 });
    
    expect(Object.keys(formatted.values).length).toBe(0);
    expect(formatted.order).toEqual([]);
  });

  test('formats complex calculation chain', async () => {
    const result = await evalla([
      { name: 'radius', expr: '10' },
      { name: 'circumference', expr: '2 * $math.PI * radius' },
      { name: 'area', expr: '$math.PI * $math.pow(radius, 2)' }
    ]);
    
    const formatted = formatResults(result, { decimalPlaces: 6 });
    
    expect((formatted.values.radius as Decimal).toString()).toBe('10');
    expect((formatted.values.circumference as Decimal).toString()).toBe('62.831853');
    expect((formatted.values.area as Decimal).toString()).toBe('314.159265');
  });
});
