import { strict as assert } from 'assert';
import { test } from 'node:test';
import { evalla, Decimal } from './index';

test('dot-traversal - basic object property access', async () => {
  const result = await evalla([
    { name: 'point.x', expr: '10' },
    { name: 'point.y', expr: '20' },
    { name: 'sum', expr: 'point.x + point.y' }
  ]);
  
  assert.equal(result.values['point.x'].toString(), '10');
  assert.equal(result.values['point.y'].toString(), '20');
  assert.equal(result.values.sum.toString(), '30');
});

test('dot-traversal - complex nested properties', async () => {
  const result = await evalla([
    { name: 'offset.x', expr: '5' },
    { name: 'offset.y', expr: '10' },
    { name: 'point.x', expr: '100' },
    { name: 'point.y', expr: '200' },
    { name: 'result.x', expr: 'point.x + offset.x' },
    { name: 'result.y', expr: 'point.y + offset.y' }
  ]);
  
  assert.equal(result.values['result.x'].toString(), '105');
  assert.equal(result.values['result.y'].toString(), '210');
});

test('dot-traversal - mixed with regular variables', async () => {
  const result = await evalla([
    { name: 'scale', expr: '2' },
    { name: 'point.x', expr: '10' },
    { name: 'point.y', expr: '20' },
    { name: 'scaled.x', expr: 'point.x * scale' },
    { name: 'scaled.y', expr: 'point.y * scale' }
  ]);
  
  assert.equal(result.values['scaled.x'].toString(), '20');
  assert.equal(result.values['scaled.y'].toString(), '40');
});

test('dot-traversal - with namespaces', async () => {
  const result = await evalla([
    { name: 'angle.deg', expr: '90' },
    { name: 'angle.rad', expr: '$angle.toRad(angle.deg)' },
    { name: 'sine', expr: '$math.sin(angle.rad)' }
  ]);
  
  assert.ok(Math.abs(result.values.sine.toNumber() - 1) < 0.000001);
});

test('dot-traversal - dependencies are properly tracked', async () => {
  const result = await evalla([
    { name: 'c', expr: 'b.x + b.y' },
    { name: 'b.x', expr: 'a * 2' },
    { name: 'b.y', expr: 'a * 3' },
    { name: 'a', expr: '10' }
  ]);
  
  // Check order ensures 'a' comes before 'b.x' and 'b.y', which come before 'c'
  const aIndex = result.order.indexOf('a');
  const bxIndex = result.order.indexOf('b.x');
  const byIndex = result.order.indexOf('b.y');
  const cIndex = result.order.indexOf('c');
  
  assert.ok(aIndex < bxIndex);
  assert.ok(aIndex < byIndex);
  assert.ok(bxIndex < cIndex);
  assert.ok(byIndex < cIndex);
  
  assert.equal(result.values.c.toString(), '50');
});
