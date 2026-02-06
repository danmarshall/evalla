import { evalla, EvaluationError } from '../src/index';
import Decimal from 'decimal.js';

describe('Namespaces', () => {
  describe('$math namespace', () => {
    test('constants', async () => {
      const result = await evalla([
        { name: 'pi', expr: '$math.PI' },
        { name: 'sqrt2', expr: '$math.SQRT2' }
      ]);
      
      expect(Math.abs((result.values.pi as Decimal).toNumber() - Math.PI)).toBeLessThan(0.000001);
      expect(Math.abs((result.values.sqrt2 as Decimal).toNumber() - Math.SQRT2)).toBeLessThan(0.000001);
    });

    test('functions', async () => {
      const result = await evalla([
        { name: 'absVal', expr: '$math.abs(-42)' },
        { name: 'sqrtVal', expr: '$math.sqrt(16)' },
        { name: 'floorVal', expr: '$math.floor(4.9)' },
        { name: 'ceilVal', expr: '$math.ceil(4.1)' },
        { name: 'roundVal', expr: '$math.round(4.5)' }
      ]);
      
      expect((result.values.absVal as Decimal).toString()).toBe('42');
      expect((result.values.sqrtVal as Decimal).toString()).toBe('4');
      expect((result.values.floorVal as Decimal).toString()).toBe('4');
      expect((result.values.ceilVal as Decimal).toString()).toBe('5');
      expect((result.values.roundVal as Decimal).toString()).toBe('5');
    });

    test('min and max', async () => {
      const result = await evalla([
        { name: 'minVal', expr: '$math.min(10, 5, 20, 3)' },
        { name: 'maxVal', expr: '$math.max(10, 5, 20, 3)' }
      ]);
      
      expect((result.values.minVal as Decimal).toString()).toBe('3');
      expect((result.values.maxVal as Decimal).toString()).toBe('20');
    });

    test('with variables', async () => {
      const result = await evalla([
        { name: 'radius', expr: '10' },
        { name: 'circumference', expr: '2 * $math.PI * radius' },
        { name: 'area', expr: '$math.PI * $math.pow(radius, 2)' }
      ]);
      
      const expectedCirc = 2 * Math.PI * 10;
      const expectedArea = Math.PI * 100;
      
      expect(Math.abs((result.values.circumference as Decimal).toNumber() - expectedCirc)).toBeLessThan(0.000001);
      expect(Math.abs((result.values.area as Decimal).toNumber() - expectedArea)).toBeLessThan(0.000001);
    });
  });

  describe('$unit namespace', () => {
    test('conversions', async () => {
      const result = await evalla([
        { name: 'inches', expr: '$unit.mmToInch(25.4)' },
        { name: 'mm', expr: '$unit.inchToMm(1)' }
      ]);
      
      expect((result.values.inches as Decimal).toString()).toBe('1');
      expect((result.values.mm as Decimal).toString()).toBe('25.4');
    });
  });

  describe('$angle namespace', () => {
    test('conversions', async () => {
      const result = await evalla([
        { name: 'radians', expr: '$angle.toRad(180)' },
        { name: 'degrees', expr: '$angle.toDeg($math.PI)' }
      ]);
      
      expect(Math.abs((result.values.radians as Decimal).toNumber() - Math.PI)).toBeLessThan(0.000001);
      expect(Math.abs((result.values.degrees as Decimal).toNumber() - 180)).toBeLessThan(0.000001);
    });
  });
});
