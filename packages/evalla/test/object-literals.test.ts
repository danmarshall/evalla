import { evalla } from '../src/index';
import Decimal from 'decimal.js';

describe('Objects via value property', () => {
  test('object property access', async () => {
    const result = await evalla([
      { name: 'point', value: {x: 10, y: 20} },
      { name: 'sum', expr: 'point.x + point.y' }
    ]);
    
    expect((result.values.sum as Decimal).toString()).toBe('30');
  });

  test('nested object property access', async () => {
    const result = await evalla([
      { name: 'data', value: {pos: {x: 5, y: 10}, scale: 2} },
      { name: 'scaledX', expr: 'data.pos.x * data.scale' },
      { name: 'scaledY', expr: 'data.pos.y * data.scale' }
    ]);
    
    expect((result.values.scaledX as Decimal).toString()).toBe('10');
    expect((result.values.scaledY as Decimal).toString()).toBe('20');
  });

  test('multiple objects with property access', async () => {
    const result = await evalla([
      { name: 'point', value: {x: 100, y: 200} },
      { name: 'offset', value: {x: 5, y: 10} },
      { name: 'resultX', expr: 'point.x + offset.x' },
      { name: 'resultY', expr: 'point.y + offset.y' }
    ]);
    
    expect((result.values.resultX as Decimal).toString()).toBe('105');
    expect((result.values.resultY as Decimal).toString()).toBe('210');
  });

  test('deeply nested property access', async () => {
    const result = await evalla([
      { name: 'config', value: {dimensions: {width: {value: 100, unit: "mm"}, height: {value: 50, unit: "mm"}}} },
      { name: 'area', expr: 'config.dimensions.width.value * config.dimensions.height.value' }
    ]);
    
    expect((result.values.area as Decimal).toString()).toBe('5000');
  });

  test('object with namespace functions', async () => {
    const result = await evalla([
      { name: 'circle', value: {radius: 10} },
      { name: 'circumference', expr: '2 * $math.PI * circle.radius' },
      { name: 'area', expr: '$math.PI * $math.pow(circle.radius, 2)' }
    ]);
    
    const expectedCirc = 2 * Math.PI * 10;
    const expectedArea = Math.PI * 100;
    
    expect(Math.abs((result.values.circumference as Decimal).toNumber() - expectedCirc)).toBeLessThan(0.000001);
    expect(Math.abs((result.values.area as Decimal).toNumber() - expectedArea)).toBeLessThan(0.000001);
  });

  test('array of objects with property access', async () => {
    const result = await evalla([
      { name: 'points', value: [{x: 1, y: 2}, {x: 3, y: 4}] },
      { name: 'firstX', expr: 'points[0].x' },
      { name: 'secondY', expr: 'points[1].y' }
    ]);
    
    expect((result.values.firstX as Decimal).toString()).toBe('1');
    expect((result.values.secondY as Decimal).toString()).toBe('4');
  });

  test('object dependencies in topological order', async () => {
    const result = await evalla([
      { name: 'base', value: {x: 10, y: 20} },
      { name: 'factor', expr: '2' },
      { name: 'scaledX', expr: 'base.x * factor' },
      { name: 'scaledY', expr: 'base.y * factor' }
    ]);
    
    // Check order
    const factorIdx = result.order.indexOf('factor');
    const baseIdx = result.order.indexOf('base');
    const scaledXIdx = result.order.indexOf('scaledX');
    const scaledYIdx = result.order.indexOf('scaledY');
    
    expect(factorIdx).toBeLessThan(scaledXIdx);
    expect(baseIdx).toBeLessThan(scaledXIdx);
    expect(factorIdx).toBeLessThan(scaledYIdx);
    expect(baseIdx).toBeLessThan(scaledYIdx);
  });
});

describe('Arrays in expressions', () => {
  test('array literals with numeric values', async () => {
    const result = await evalla([
      { name: 'data', expr: '[1, 2, 3, 4, 5]' },
      { name: 'first', expr: 'data[0]' },
      { name: 'third', expr: 'data[2]' },
      { name: 'sum', expr: 'data[0] + data[1] + data[2]' }
    ]);
    
    expect((result.values.first as Decimal).toString()).toBe('1');
    expect((result.values.third as Decimal).toString()).toBe('3');
    expect((result.values.sum as Decimal).toString()).toBe('6');
  });

  test('array access via value property', async () => {
    const result = await evalla([
      { name: 'data', value: [10, 20, 30, 40, 50] },
      { name: 'first', expr: 'data[0]' },
      { name: 'last', expr: 'data[4]' },
      { name: 'average', expr: '(data[0] + data[1] + data[2] + data[3] + data[4]) / 5' }
    ]);
    
    expect((result.values.first as Decimal).toString()).toBe('10');
    expect((result.values.last as Decimal).toString()).toBe('50');
    expect((result.values.average as Decimal).toString()).toBe('30');
  });

  test('nested array access', async () => {
    const result = await evalla([
      { name: 'matrix', value: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] },
      { name: 'center', expr: 'matrix[1][1]' },
      { name: 'corner', expr: 'matrix[2][2]' }
    ]);
    
    expect((result.values.center as Decimal).toString()).toBe('5');
    expect((result.values.corner as Decimal).toString()).toBe('9');
  });
});
