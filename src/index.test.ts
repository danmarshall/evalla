import { strict as assert } from 'assert';
import { test } from 'node:test';
import { evalla, Decimal } from './index';

test('basic arithmetic expressions', async () => {
  const result = await evalla([
    { name: 'a', expr: '10' },
    { name: 'b', expr: '20' },
    { name: 'c', expr: 'a + b' }
  ]);
  
  assert.equal(result.values.c.toString(), '30');
  assert.deepEqual(result.order, ['a', 'b', 'c']);
});

test('decimal precision', async () => {
  const result = await evalla([
    { name: 'x', expr: '0.1 + 0.2' }
  ]);
  
  assert.equal(result.values.x.toString(), '0.3');
});

test('variable dependencies', async () => {
  const result = await evalla([
    { name: 'width', expr: '100' },
    { name: 'height', expr: '50' },
    { name: 'area', expr: 'width * height' }
  ]);
  
  assert.equal(result.values.area.toString(), '5000');
});

test('complex dependency chain', async () => {
  const result = await evalla([
    { name: 'd', expr: 'c * 2' },
    { name: 'b', expr: 'a + 10' },
    { name: 'c', expr: 'b * 3' },
    { name: 'a', expr: '5' }
  ]);
  
  assert.equal(result.values.a.toString(), '5');
  assert.equal(result.values.b.toString(), '15');
  assert.equal(result.values.c.toString(), '45');
  assert.equal(result.values.d.toString(), '90');
  assert.deepEqual(result.order, ['a', 'b', 'c', 'd']);
});

test('circular dependency detection', async () => {
  await assert.rejects(
    async () => await evalla([
      { name: 'a', expr: 'b + 1' },
      { name: 'b', expr: 'a + 1' }
    ]),
    /Circular dependency detected/
  );
});

test('self-reference detection', async () => {
  await assert.rejects(
    async () => await evalla([
      { name: 'a', expr: 'a + 1' }
    ]),
    /Circular dependency detected/
  );
});

test('$math namespace - constants', async () => {
  const result = await evalla([
    { name: 'pi', expr: '$math.PI' },
    { name: 'sqrt2', expr: '$math.SQRT2' }
  ]);
  
  assert.ok(Math.abs(result.values.pi.toNumber() - Math.PI) < 0.000001);
  assert.ok(Math.abs(result.values.sqrt2.toNumber() - Math.SQRT2) < 0.000001);
});

test('$math namespace - functions', async () => {
  const result = await evalla([
    { name: 'absVal', expr: '$math.abs(-42)' },
    { name: 'sqrtVal', expr: '$math.sqrt(16)' },
    { name: 'floorVal', expr: '$math.floor(4.9)' },
    { name: 'ceilVal', expr: '$math.ceil(4.1)' },
    { name: 'roundVal', expr: '$math.round(4.5)' }
  ]);
  
  assert.equal(result.values.absVal.toString(), '42');
  assert.equal(result.values.sqrtVal.toString(), '4');
  assert.equal(result.values.floorVal.toString(), '4');
  assert.equal(result.values.ceilVal.toString(), '5');
  assert.equal(result.values.roundVal.toString(), '5');
});

test('$math.min and $math.max', async () => {
  const result = await evalla([
    { name: 'minVal', expr: '$math.min(10, 5, 20, 3)' },
    { name: 'maxVal', expr: '$math.max(10, 5, 20, 3)' }
  ]);
  
  assert.equal(result.values.minVal.toString(), '3');
  assert.equal(result.values.maxVal.toString(), '20');
});

test('$unit namespace - conversions', async () => {
  const result = await evalla([
    { name: 'inches', expr: '$unit.mmToInch(25.4)' },
    { name: 'mm', expr: '$unit.inchToMm(1)' }
  ]);
  
  assert.equal(result.values.inches.toString(), '1');
  assert.equal(result.values.mm.toString(), '25.4');
});

test('$angle namespace - conversions', async () => {
  const result = await evalla([
    { name: 'radians', expr: '$angle.toRad(180)' },
    { name: 'degrees', expr: '$angle.toDeg($math.PI)' }
  ]);
  
  assert.ok(Math.abs(result.values.radians.toNumber() - Math.PI) < 0.000001);
  assert.ok(Math.abs(result.values.degrees.toNumber() - 180) < 0.000001);
});

test('input validation - non-array', async () => {
  await assert.rejects(
    async () => await evalla({} as any),
    /Input must be an array/
  );
});

test('input validation - missing name', async () => {
  await assert.rejects(
    async () => await evalla([{ name: '', expr: '1' }]),
    /non-empty string "name"/
  );
});

test('input validation - duplicate names', async () => {
  await assert.rejects(
    async () => await evalla([
      { name: 'a', expr: '1' },
      { name: 'a', expr: '2' }
    ]),
    /Duplicate name: a/
  );
});

test('input validation - variable names cannot start with $', async () => {
  await assert.rejects(
    async () => await evalla([
      { name: '$myvar', expr: '1' }
    ]),
    /Variable names cannot start with \$/
  );
});

test('input validation - variable names cannot contain dots', async () => {
  await assert.rejects(
    async () => await evalla([
      { name: 'point.x', expr: '10' }
    ]),
    /Variable names cannot contain dots/
  );
});

test('input validation - must provide either expr or value', async () => {
  await assert.rejects(
    async () => await evalla([
      { name: 'test' }
    ]),
    /must have either "expr" or "value"/
  );
});

test('value property - direct object value', async () => {
  const result = await evalla([
    { name: 'point', value: { x: 10, y: 20 } },
    { name: 'sum', expr: 'point.x + point.y' }
  ]);
  
  assert.equal(result.values.sum.toString(), '30');
});

test('value property - direct number value', async () => {
  const result = await evalla([
    { name: 'a', value: 10 },
    { name: 'b', value: 20 },
    { name: 'c', expr: 'a + b' }
  ]);
  
  assert.equal(result.values.c.toString(), '30');
});

test('value property - mixed with expr', async () => {
  const result = await evalla([
    { name: 'width', value: 100 },
    { name: 'height', expr: '50' },
    { name: 'area', expr: 'width * height' }
  ]);
  
  assert.equal(result.values.area.toString(), '5000');
});

test('value property - complex object without stringification', async () => {
  const complexObj = {
    dimensions: {
      width: 100,
      height: 50
    },
    scale: 2
  };
  
  const result = await evalla([
    { name: 'box', value: complexObj },
    { name: 'scaledWidth', expr: 'box.dimensions.width * box.scale' },
    { name: 'scaledHeight', expr: 'box.dimensions.height * box.scale' }
  ]);
  
  assert.equal(result.values.scaledWidth.toString(), '200');
  assert.equal(result.values.scaledHeight.toString(), '100');
});

test('empty input', async () => {
  const result = await evalla([]);
  assert.equal(Object.keys(result.values).length, 0);
  assert.deepEqual(result.order, []);
});

test('expressions with multiple operators', async () => {
  const result = await evalla([
    { name: 'result', expr: '(10 + 5) * 2 - 3' }
  ]);
  
  assert.equal(result.values.result.toString(), '27');
});

test('mathematical expression with namespaces and variables', async () => {
  const result = await evalla([
    { name: 'radius', expr: '10' },
    { name: 'circumference', expr: '2 * $math.PI * radius' },
    { name: 'area', expr: '$math.PI * $math.pow(radius, 2)' }
  ]);
  
  const expectedCirc = 2 * Math.PI * 10;
  const expectedArea = Math.PI * 100;
  
  assert.ok(Math.abs(result.values.circumference.toNumber() - expectedCirc) < 0.000001);
  assert.ok(Math.abs(result.values.area.toNumber() - expectedArea) < 0.000001);
});
