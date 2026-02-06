import { evalla, Decimal } from '../src/index';

test('object literals and property access', async () => {
  const result = await evalla([
    { name: 'point', expr: '{x: 10, y: 20}' },
    { name: 'sum', expr: 'point.x + point.y' }
  ]);
  
  expect((result.values.sum as any).toString()).toBe('30');
});

test('nested object property access', async () => {
  const result = await evalla([
    { name: 'data', expr: '{pos: {x: 5, y: 10}, scale: 2}' },
    { name: 'scaledX', expr: 'data.pos.x * data.scale' },
    { name: 'scaledY', expr: 'data.pos.y * data.scale' }
  ]);
  
  expect((result.values.scaledX as any).toString()).toBe('10');
  expect((result.values.scaledY as any).toString()).toBe('20');
});

test('multiple objects with property access', async () => {
  const result = await evalla([
    { name: 'point', expr: '{x: 100, y: 200}' },
    { name: 'offset', expr: '{x: 5, y: 10}' },
    { name: 'resultX', expr: 'point.x + offset.x' },
    { name: 'resultY', expr: 'point.y + offset.y' }
  ]);
  
  expect((result.values.resultX as any).toString()).toBe('105');
  expect((result.values.resultY as any).toString()).toBe('210');
});

test('deeply nested property access', async () => {
  const result = await evalla([
    // Use direct value instead of string literals in expression
    { name: 'config', value: {dimensions: {width: {value: 100, unit: "mm"}, height: {value: 50, unit: "mm"}}} },
    { name: 'area', expr: 'config.dimensions.width.value * config.dimensions.height.value' }
  ]);
  
  expect((result.values.area as any).toString()).toBe('5000');
});

test('object with namespace functions', async () => {
  const result = await evalla([
    { name: 'circle', expr: '{radius: 10}' },
    { name: 'circumference', expr: '2 * $math.PI * circle.radius' },
    { name: 'area', expr: '$math.PI * $math.pow(circle.radius, 2)' }
  ]);
  
  const expectedCirc = 2 * Math.PI * 10;
  const expectedArea = Math.PI * 100;
  
  expect(Math.abs((result.values.circumference as any).toNumber() - expectedCirc)).toBeLessThan(0.000001);
  expect(Math.abs((result.values.area as any).toNumber() - expectedArea)).toBeLessThan(0.000001);
});

test('array of objects with property access', async () => {
  const result = await evalla([
    { name: 'points', expr: '[{x: 1, y: 2}, {x: 3, y: 4}]' },
    { name: 'firstX', expr: 'points[0].x' },
    { name: 'secondY', expr: 'points[1].y' }
  ]);
  
  expect((result.values.firstX as any).toString()).toBe('1');
  expect((result.values.secondY as any).toString()).toBe('4');
});

test('object dependencies in topological order', async () => {
  const result = await evalla([
    { name: 'scaled', expr: '{x: base.x * factor, y: base.y * factor}' },
    { name: 'base', expr: '{x: 10, y: 20}' },
    { name: 'factor', expr: '2' }
  ]);
  
  // Check order
  const factorIdx = result.order.indexOf('factor');
  const baseIdx = result.order.indexOf('base');
  const scaledIdx = result.order.indexOf('scaled');
  
  expect(factorIdx).toBeLessThan(scaledIdx);
  expect(baseIdx).toBeLessThan(scaledIdx);
});
