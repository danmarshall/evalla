import { strict as assert } from 'assert';
import { test } from 'node:test';
import { evalla, Decimal } from '../src/index';

test('object literals and property access', async () => {
  const result = await evalla([
    { name: 'point', expr: '{x: 10, y: 20}' },
    { name: 'sum', expr: 'point.x + point.y' }
  ]);
  
  assert.equal(result.values.sum.toString(), '30');
});

test('nested object property access', async () => {
  const result = await evalla([
    { name: 'data', expr: '{pos: {x: 5, y: 10}, scale: 2}' },
    { name: 'scaledX', expr: 'data.pos.x * data.scale' },
    { name: 'scaledY', expr: 'data.pos.y * data.scale' }
  ]);
  
  assert.equal(result.values.scaledX.toString(), '10');
  assert.equal(result.values.scaledY.toString(), '20');
});

test('multiple objects with property access', async () => {
  const result = await evalla([
    { name: 'point', expr: '{x: 100, y: 200}' },
    { name: 'offset', expr: '{x: 5, y: 10}' },
    { name: 'resultX', expr: 'point.x + offset.x' },
    { name: 'resultY', expr: 'point.y + offset.y' }
  ]);
  
  assert.equal(result.values.resultX.toString(), '105');
  assert.equal(result.values.resultY.toString(), '210');
});

test('deeply nested property access', async () => {
  const result = await evalla([
    { name: 'config', expr: '{dimensions: {width: {value: 100, unit: "mm"}, height: {value: 50, unit: "mm"}}}' },
    { name: 'area', expr: 'config.dimensions.width.value * config.dimensions.height.value' }
  ]);
  
  assert.equal(result.values.area.toString(), '5000');
});

test('object with namespace functions', async () => {
  const result = await evalla([
    { name: 'circle', expr: '{radius: 10}' },
    { name: 'circumference', expr: '2 * $math.PI * circle.radius' },
    { name: 'area', expr: '$math.PI * $math.pow(circle.radius, 2)' }
  ]);
  
  const expectedCirc = 2 * Math.PI * 10;
  const expectedArea = Math.PI * 100;
  
  assert.ok(Math.abs(result.values.circumference.toNumber() - expectedCirc) < 0.000001);
  assert.ok(Math.abs(result.values.area.toNumber() - expectedArea) < 0.000001);
});

test('array of objects with property access', async () => {
  const result = await evalla([
    { name: 'points', expr: '[{x: 1, y: 2}, {x: 3, y: 4}]' },
    { name: 'firstX', expr: 'points[0].x' },
    { name: 'secondY', expr: 'points[1].y' }
  ]);
  
  assert.equal(result.values.firstX.toString(), '1');
  assert.equal(result.values.secondY.toString(), '4');
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
  
  assert.ok(factorIdx < scaledIdx);
  assert.ok(baseIdx < scaledIdx);
});
