"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const node_test_1 = require("node:test");
const index_1 = require("../src/index");
(0, node_test_1.test)('basic arithmetic expressions', async () => {
    const result = await (0, index_1.evalla)([
        { name: 'a', expr: '10' },
        { name: 'b', expr: '20' },
        { name: 'c', expr: 'a + b' }
    ]);
    assert_1.strict.equal(result.values.c.toString(), '30');
    assert_1.strict.deepEqual(result.order, ['a', 'b', 'c']);
});
(0, node_test_1.test)('decimal precision', async () => {
    const result = await (0, index_1.evalla)([
        { name: 'x', expr: '0.1 + 0.2' }
    ]);
    assert_1.strict.equal(result.values.x.toString(), '0.3');
});
(0, node_test_1.test)('variable dependencies', async () => {
    const result = await (0, index_1.evalla)([
        { name: 'width', expr: '100' },
        { name: 'height', expr: '50' },
        { name: 'area', expr: 'width * height' }
    ]);
    assert_1.strict.equal(result.values.area.toString(), '5000');
});
(0, node_test_1.test)('complex dependency chain', async () => {
    const result = await (0, index_1.evalla)([
        { name: 'd', expr: 'c * 2' },
        { name: 'b', expr: 'a + 10' },
        { name: 'c', expr: 'b * 3' },
        { name: 'a', expr: '5' }
    ]);
    assert_1.strict.equal(result.values.a.toString(), '5');
    assert_1.strict.equal(result.values.b.toString(), '15');
    assert_1.strict.equal(result.values.c.toString(), '45');
    assert_1.strict.equal(result.values.d.toString(), '90');
    assert_1.strict.deepEqual(result.order, ['a', 'b', 'c', 'd']);
});
(0, node_test_1.test)('circular dependency detection', async () => {
    await assert_1.strict.rejects(async () => await (0, index_1.evalla)([
        { name: 'a', expr: 'b + 1' },
        { name: 'b', expr: 'a + 1' }
    ]), /Circular dependency detected/);
});
(0, node_test_1.test)('self-reference detection', async () => {
    await assert_1.strict.rejects(async () => await (0, index_1.evalla)([
        { name: 'a', expr: 'a + 1' }
    ]), /Circular dependency detected/);
});
(0, node_test_1.test)('$math namespace - constants', async () => {
    const result = await (0, index_1.evalla)([
        { name: 'pi', expr: '$math.PI' },
        { name: 'sqrt2', expr: '$math.SQRT2' }
    ]);
    assert_1.strict.ok(Math.abs(result.values.pi.toNumber() - Math.PI) < 0.000001);
    assert_1.strict.ok(Math.abs(result.values.sqrt2.toNumber() - Math.SQRT2) < 0.000001);
});
(0, node_test_1.test)('$math namespace - functions', async () => {
    const result = await (0, index_1.evalla)([
        { name: 'absVal', expr: '$math.abs(-42)' },
        { name: 'sqrtVal', expr: '$math.sqrt(16)' },
        { name: 'floorVal', expr: '$math.floor(4.9)' },
        { name: 'ceilVal', expr: '$math.ceil(4.1)' },
        { name: 'roundVal', expr: '$math.round(4.5)' }
    ]);
    assert_1.strict.equal(result.values.absVal.toString(), '42');
    assert_1.strict.equal(result.values.sqrtVal.toString(), '4');
    assert_1.strict.equal(result.values.floorVal.toString(), '4');
    assert_1.strict.equal(result.values.ceilVal.toString(), '5');
    assert_1.strict.equal(result.values.roundVal.toString(), '5');
});
(0, node_test_1.test)('$math.min and $math.max', async () => {
    const result = await (0, index_1.evalla)([
        { name: 'minVal', expr: '$math.min(10, 5, 20, 3)' },
        { name: 'maxVal', expr: '$math.max(10, 5, 20, 3)' }
    ]);
    assert_1.strict.equal(result.values.minVal.toString(), '3');
    assert_1.strict.equal(result.values.maxVal.toString(), '20');
});
(0, node_test_1.test)('$unit namespace - conversions', async () => {
    const result = await (0, index_1.evalla)([
        { name: 'inches', expr: '$unit.mmToInch(25.4)' },
        { name: 'mm', expr: '$unit.inchToMm(1)' }
    ]);
    assert_1.strict.equal(result.values.inches.toString(), '1');
    assert_1.strict.equal(result.values.mm.toString(), '25.4');
});
(0, node_test_1.test)('$angle namespace - conversions', async () => {
    const result = await (0, index_1.evalla)([
        { name: 'radians', expr: '$angle.toRad(180)' },
        { name: 'degrees', expr: '$angle.toDeg($math.PI)' }
    ]);
    assert_1.strict.ok(Math.abs(result.values.radians.toNumber() - Math.PI) < 0.000001);
    assert_1.strict.ok(Math.abs(result.values.degrees.toNumber() - 180) < 0.000001);
});
(0, node_test_1.test)('input validation - non-array', async () => {
    await assert_1.strict.rejects(async () => await (0, index_1.evalla)({}), /Input must be an array/);
});
(0, node_test_1.test)('input validation - missing name', async () => {
    await assert_1.strict.rejects(async () => await (0, index_1.evalla)([{ name: '', expr: '1' }]), /non-empty string "name"/);
});
(0, node_test_1.test)('input validation - duplicate names', async () => {
    await assert_1.strict.rejects(async () => await (0, index_1.evalla)([
        { name: 'a', expr: '1' },
        { name: 'a', expr: '2' }
    ]), /Duplicate name: a/);
});
(0, node_test_1.test)('input validation - variable names cannot start with $', async () => {
    await assert_1.strict.rejects(async () => await (0, index_1.evalla)([
        { name: '$myvar', expr: '1' }
    ]), /Variable names cannot start with \$/);
});
(0, node_test_1.test)('input validation - variable names cannot contain dots', async () => {
    await assert_1.strict.rejects(async () => await (0, index_1.evalla)([
        { name: 'point.x', expr: '10' }
    ]), /Variable names cannot contain dots/);
});
(0, node_test_1.test)('input validation - must provide either expr or value', async () => {
    await assert_1.strict.rejects(async () => await (0, index_1.evalla)([
        { name: 'test' }
    ]), /must have either "expr" or "value"/);
});
(0, node_test_1.test)('value property - direct object value', async () => {
    const result = await (0, index_1.evalla)([
        { name: 'point', value: { x: 10, y: 20 } },
        { name: 'sum', expr: 'point.x + point.y' }
    ]);
    assert_1.strict.equal(result.values.sum.toString(), '30');
});
(0, node_test_1.test)('value property - direct number value', async () => {
    const result = await (0, index_1.evalla)([
        { name: 'a', value: 10 },
        { name: 'b', value: 20 },
        { name: 'c', expr: 'a + b' }
    ]);
    assert_1.strict.equal(result.values.c.toString(), '30');
});
(0, node_test_1.test)('value property - mixed with expr', async () => {
    const result = await (0, index_1.evalla)([
        { name: 'width', value: 100 },
        { name: 'height', expr: '50' },
        { name: 'area', expr: 'width * height' }
    ]);
    assert_1.strict.equal(result.values.area.toString(), '5000');
});
(0, node_test_1.test)('value property - complex object without stringification', async () => {
    const complexObj = {
        dimensions: {
            width: 100,
            height: 50
        },
        scale: 2
    };
    const result = await (0, index_1.evalla)([
        { name: 'box', value: complexObj },
        { name: 'scaledWidth', expr: 'box.dimensions.width * box.scale' },
        { name: 'scaledHeight', expr: 'box.dimensions.height * box.scale' }
    ]);
    assert_1.strict.equal(result.values.scaledWidth.toString(), '200');
    assert_1.strict.equal(result.values.scaledHeight.toString(), '100');
});
(0, node_test_1.test)('empty input', async () => {
    const result = await (0, index_1.evalla)([]);
    assert_1.strict.equal(Object.keys(result.values).length, 0);
    assert_1.strict.deepEqual(result.order, []);
});
(0, node_test_1.test)('expressions with multiple operators', async () => {
    const result = await (0, index_1.evalla)([
        { name: 'result', expr: '(10 + 5) * 2 - 3' }
    ]);
    assert_1.strict.equal(result.values.result.toString(), '27');
});
(0, node_test_1.test)('mathematical expression with namespaces and variables', async () => {
    const result = await (0, index_1.evalla)([
        { name: 'radius', expr: '10' },
        { name: 'circumference', expr: '2 * $math.PI * radius' },
        { name: 'area', expr: '$math.PI * $math.pow(radius, 2)' }
    ]);
    const expectedCirc = 2 * Math.PI * 10;
    const expectedArea = Math.PI * 100;
    assert_1.strict.ok(Math.abs(result.values.circumference.toNumber() - expectedCirc) < 0.000001);
    assert_1.strict.ok(Math.abs(result.values.area.toNumber() - expectedArea) < 0.000001);
});
