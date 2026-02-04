import { evalla, Decimal } from '../src/index';

test('basic arithmetic expressions', async () => {
  const result = await evalla([
    { name: 'a', expr: '10' },
    { name: 'b', expr: '20' },
    { name: 'c', expr: 'a + b' }
  ]);
  
  expect(result.values.c.toString()).toBe('30');
  expect(result.order).toEqual(['a', 'b', 'c']);
});

test('decimal precision', async () => {
  const result = await evalla([
    { name: 'x', expr: '0.1 + 0.2' }
  ]);
  
  expect(result.values.x.toString()).toBe('0.3');
});

test('variable dependencies', async () => {
  const result = await evalla([
    { name: 'width', expr: '100' },
    { name: 'height', expr: '50' },
    { name: 'area', expr: 'width * height' }
  ]);
  
  expect(result.values.area.toString()).toBe('5000');
});

test('complex dependency chain', async () => {
  const result = await evalla([
    { name: 'd', expr: 'c * 2' },
    { name: 'b', expr: 'a + 10' },
    { name: 'c', expr: 'b * 3' },
    { name: 'a', expr: '5' }
  ]);
  
  expect(result.values.a.toString()).toBe('5');
  expect(result.values.b.toString()).toBe('15');
  expect(result.values.c.toString()).toBe('45');
  expect(result.values.d.toString()).toBe('90');
  expect(result.order).toEqual(['a', 'b', 'c', 'd']);
});

test('circular dependency detection', async () => {
  await expect(
    evalla([
      { name: 'a', expr: 'b + 1' },
      { name: 'b', expr: 'a + 1' }
    ])
  ).rejects.toThrow(/Circular dependency detected/);
});

test('self-reference detection', async () => {
  await expect(
    evalla([
      { name: 'a', expr: 'a + 1' }
    ])
  ).rejects.toThrow(/Circular dependency detected/);
});

test('$math namespace - constants', async () => {
  const result = await evalla([
    { name: 'pi', expr: '$math.PI' },
    { name: 'sqrt2', expr: '$math.SQRT2' }
  ]);
  
  expect(Math.abs(result.values.pi.toNumber() - Math.PI)).toBeLessThan(0.000001);
  expect(Math.abs(result.values.sqrt2.toNumber() - Math.SQRT2)).toBeLessThan(0.000001);
});

test('$math namespace - functions', async () => {
  const result = await evalla([
    { name: 'absVal', expr: '$math.abs(-42)' },
    { name: 'sqrtVal', expr: '$math.sqrt(16)' },
    { name: 'floorVal', expr: '$math.floor(4.9)' },
    { name: 'ceilVal', expr: '$math.ceil(4.1)' },
    { name: 'roundVal', expr: '$math.round(4.5)' }
  ]);
  
  expect(result.values.absVal.toString()).toBe('42');
  expect(result.values.sqrtVal.toString()).toBe('4');
  expect(result.values.floorVal.toString()).toBe('4');
  expect(result.values.ceilVal.toString()).toBe('5');
  expect(result.values.roundVal.toString()).toBe('5');
});

test('$math.min and $math.max', async () => {
  const result = await evalla([
    { name: 'minVal', expr: '$math.min(10, 5, 20, 3)' },
    { name: 'maxVal', expr: '$math.max(10, 5, 20, 3)' }
  ]);
  
  expect(result.values.minVal.toString()).toBe('3');
  expect(result.values.maxVal.toString()).toBe('20');
});

test('$unit namespace - conversions', async () => {
  const result = await evalla([
    { name: 'inches', expr: '$unit.mmToInch(25.4)' },
    { name: 'mm', expr: '$unit.inchToMm(1)' }
  ]);
  
  expect(result.values.inches.toString()).toBe('1');
  expect(result.values.mm.toString()).toBe('25.4');
});

test('$angle namespace - conversions', async () => {
  const result = await evalla([
    { name: 'radians', expr: '$angle.toRad(180)' },
    { name: 'degrees', expr: '$angle.toDeg($math.PI)' }
  ]);
  
  expect(Math.abs(result.values.radians.toNumber() - Math.PI)).toBeLessThan(0.000001);
  expect(Math.abs(result.values.degrees.toNumber() - 180)).toBeLessThan(0.000001);
});

test('input validation - non-array', async () => {
  await expect(
    evalla({} as any)
  ).rejects.toThrow(/Input must be an array/);
});

test('input validation - missing name', async () => {
  await expect(
    evalla([{ name: '', expr: '1' }])
  ).rejects.toThrow(/non-empty string "name"/);
});

test('input validation - duplicate names', async () => {
  await expect(
    evalla([
      { name: 'a', expr: '1' },
      { name: 'a', expr: '2' }
    ])
  ).rejects.toThrow(/Duplicate name: a/);
});

test('input validation - variable names cannot start with $', async () => {
  await expect(
    evalla([
      { name: '$myvar', expr: '1' }
    ])
  ).rejects.toThrow(/Variable names cannot start with \$/);
});

test('input validation - variable names cannot contain dots', async () => {
  await expect(
    evalla([
      { name: 'point.x', expr: '10' }
    ])
  ).rejects.toThrow(/Variable names cannot contain dots/);
});

test('input validation - must provide either expr or value', async () => {
  await expect(
    evalla([
      { name: 'test' }
    ])
  ).rejects.toThrow(/must have either "expr" or "value"/);
});

test('value property - direct object value', async () => {
  const result = await evalla([
    { name: 'point', value: { x: 10, y: 20 } },
    { name: 'sum', expr: 'point.x + point.y' }
  ]);
  
  expect(result.values.sum.toString()).toBe('30');
});

test('value property - direct number value', async () => {
  const result = await evalla([
    { name: 'a', value: 10 },
    { name: 'b', value: 20 },
    { name: 'c', expr: 'a + b' }
  ]);
  
  expect(result.values.c.toString()).toBe('30');
});

test('value property - mixed with expr', async () => {
  const result = await evalla([
    { name: 'width', value: 100 },
    { name: 'height', expr: '50' },
    { name: 'area', expr: 'width * height' }
  ]);
  
  expect(result.values.area.toString()).toBe('5000');
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
  
  expect(result.values.scaledWidth.toString()).toBe('200');
  expect(result.values.scaledHeight.toString()).toBe('100');
});

test('empty input', async () => {
  const result = await evalla([]);
  expect(Object.keys(result.values).length).toBe(0);
  expect(result.order).toEqual([]);
});

test('expressions with multiple operators', async () => {
  const result = await evalla([
    { name: 'result', expr: '(10 + 5) * 2 - 3' }
  ]);
  
  expect(result.values.result.toString()).toBe('27');
});

test('mathematical expression with namespaces and variables', async () => {
  const result = await evalla([
    { name: 'radius', expr: '10' },
    { name: 'circumference', expr: '2 * $math.PI * radius' },
    { name: 'area', expr: '$math.PI * $math.pow(radius, 2)' }
  ]);
  
  const expectedCirc = 2 * Math.PI * 10;
  const expectedArea = Math.PI * 100;
  
  expect(Math.abs(result.values.circumference.toNumber() - expectedCirc)).toBeLessThan(0.000001);
  expect(Math.abs(result.values.area.toNumber() - expectedArea)).toBeLessThan(0.000001);
});
