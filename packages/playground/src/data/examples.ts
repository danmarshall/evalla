export interface Expression {
  name: string;
  expr: string;
}

export interface Example {
  name: string;
  expressions: Expression[];
}

export const examples: Record<string, Example> = {
  circle: {
    name: 'Circle calculations',
    expressions: [
      { name: 'radius', expr: '5' },
      { name: 'pi', expr: '$math.PI' },
      { name: 'circumference', expr: '2 * pi * radius' },
      { name: 'area', expr: 'pi * radius * radius' }
    ]
  },
  objects: {
    name: 'Object properties',
    expressions: [
      { name: 'point', expr: '{x: 10, y: 20}' },
      { name: 'scaledX', expr: 'point.x * 2' },
      { name: 'scaledY', expr: 'point.y * 2' }
    ]
  },
  precision: {
    name: 'Decimal precision',
    expressions: [
      { name: 'a', expr: '0.1' },
      { name: 'b', expr: '0.2' },
      { name: 'sum', expr: 'a + b' }
    ]
  },
  trig: {
    name: 'Trigonometry',
    expressions: [
      { name: 'degrees', expr: '45' },
      { name: 'radians', expr: '$angle.toRad(degrees)' },
      { name: 'sine', expr: '$math.sin(radians)' },
      { name: 'cosine', expr: '$math.cos(radians)' }
    ]
  },
  mathConstants: {
    name: '$math - Constants',
    expressions: [
      { name: 'pi', expr: '$math.PI' },
      { name: 'e', expr: '$math.E' },
      { name: 'sqrt2', expr: '$math.SQRT2' },
      { name: 'ln2', expr: '$math.LN2' },
      { name: 'log2e', expr: '$math.LOG2E' }
    ]
  },
  mathBasic: {
    name: '$math - Basic functions',
    expressions: [
      { name: 'absVal', expr: '$math.abs(-42)' },
      { name: 'sqrtVal', expr: '$math.sqrt(144)' },
      { name: 'cbrtVal', expr: '$math.cbrt(27)' },
      { name: 'floorVal', expr: '$math.floor(4.9)' },
      { name: 'ceilVal', expr: '$math.ceil(4.1)' },
      { name: 'roundVal', expr: '$math.round(4.5)' }
    ]
  },
  mathAdvanced: {
    name: '$math - Powers & logs',
    expressions: [
      { name: 'base', expr: '2' },
      { name: 'exponent', expr: '10' },
      { name: 'power', expr: '$math.pow(base, exponent)' },
      { name: 'log2', expr: '$math.log2(power)' },
      { name: 'ln', expr: '$math.ln($math.E)' },
      { name: 'log10', expr: '$math.log10(1000)' }
    ]
  },
  mathMinMax: {
    name: '$math - Min/Max',
    expressions: [
      { name: 'values', expr: '{a: 42, b: 17, c: 99, d: 8}' },
      { name: 'minVal', expr: '$math.min(values.a, values.b, values.c, values.d)' },
      { name: 'maxVal', expr: '$math.max(values.a, values.b, values.c, values.d)' },
      { name: 'range', expr: 'maxVal - minVal' }
    ]
  },
  trigAdvanced: {
    name: '$math - Advanced trig',
    expressions: [
      { name: 'angle', expr: '30' },
      { name: 'rad', expr: '$angle.toRad(angle)' },
      { name: 'tanVal', expr: '$math.tan(rad)' },
      { name: 'atanVal', expr: '$math.atan(tanVal)' },
      { name: 'backToDeg', expr: '$angle.toDeg(atanVal)' }
    ]
  },
  unitLength: {
    name: '$unit - Length conversions',
    expressions: [
      { name: 'mm', expr: '25.4' },
      { name: 'inches', expr: '$unit.mmToInch(mm)' },
      { name: 'cm', expr: 'mm / 10' },
      { name: 'inchesFromCm', expr: '$unit.cmToInch(cm)' },
      { name: 'meters', expr: '1' },
      { name: 'feet', expr: '$unit.mToFt(meters)' }
    ]
  },
  unitRoundTrip: {
    name: '$unit - Round-trip test',
    expressions: [
      { name: 'original', expr: '100' },
      { name: 'toInch', expr: '$unit.mmToInch(original)' },
      { name: 'backToMm', expr: '$unit.inchToMm(toInch)' },
      { name: 'difference', expr: 'backToMm - original' }
    ]
  },
  angleConversions: {
    name: '$angle - Conversions',
    expressions: [
      { name: 'deg0', expr: '0' },
      { name: 'deg90', expr: '90' },
      { name: 'deg180', expr: '180' },
      { name: 'deg360', expr: '360' },
      { name: 'rad90', expr: '$angle.toRad(deg90)' },
      { name: 'rad180', expr: '$angle.toRad(deg180)' },
      { name: 'backTo180', expr: '$angle.toDeg(rad180)' }
    ]
  },
  pythagorean: {
    name: 'Pythagorean theorem',
    expressions: [
      { name: 'a', expr: '3' },
      { name: 'b', expr: '4' },
      { name: 'aSquared', expr: '$math.pow(a, 2)' },
      { name: 'bSquared', expr: '$math.pow(b, 2)' },
      { name: 'cSquared', expr: 'aSquared + bSquared' },
      { name: 'c', expr: '$math.sqrt(cSquared)' }
    ]
  },
  compoundInterest: {
    name: 'Compound interest',
    expressions: [
      { name: 'principal', expr: '1000' },
      { name: 'rate', expr: '0.05' },
      { name: 'years', expr: '10' },
      { name: 'e', expr: '$math.E' },
      { name: 'amount', expr: 'principal * $math.pow(e, rate * years)' },
      { name: 'interest', expr: 'amount - principal' }
    ]
  },
  nestedObjects: {
    name: 'Deep nested objects',
    expressions: [
      { name: 'config', expr: '{display: {width: 1920, height: 1080}, scale: 2}' },
      { name: 'scaledWidth', expr: 'config.display.width / config.scale' },
      { name: 'scaledHeight', expr: 'config.display.height / config.scale' },
      { name: 'aspectRatio', expr: 'scaledWidth / scaledHeight' }
    ]
  },
  stressDependencies: {
    name: 'Stress test - Dependencies',
    expressions: [
      { name: 'a', expr: '1' },
      { name: 'b', expr: 'a + 1' },
      { name: 'c', expr: 'b + 1' },
      { name: 'd', expr: 'c + 1' },
      { name: 'e', expr: 'd + 1' },
      { name: 'f', expr: 'e + 1' },
      { name: 'g', expr: 'f + 1' },
      { name: 'h', expr: 'g + 1' },
      { name: 'i', expr: 'h + 1' },
      { name: 'j', expr: 'i + 1' },
      { name: 'sum', expr: 'a + b + c + d + e + f + g + h + i + j' }
    ]
  },
  stressMath: {
    name: 'Stress test - Math ops',
    expressions: [
      { name: 'n', expr: '1000000' },
      { name: 'sqrt', expr: '$math.sqrt(n)' },
      { name: 'log', expr: '$math.log10(n)' },
      { name: 'power', expr: '$math.pow(sqrt, 2)' },
      { name: 'nested', expr: '$math.sqrt($math.sqrt($math.sqrt(n)))' },
      { name: 'combo', expr: '$math.max(sqrt, log, $math.min(power, nested))' }
    ]
  },
  orderIndependent1: {
    name: 'Order independence - Basic',
    expressions: [
      { name: 'result', expr: 'a + b + c' },
      { name: 'c', expr: '30' },
      { name: 'a', expr: '10' },
      { name: 'b', expr: '20' }
    ]
  },
  orderIndependent2: {
    name: 'Order independence - Complex',
    expressions: [
      { name: 'final', expr: 'step3 * 2' },
      { name: 'step1', expr: 'base + 5' },
      { name: 'step3', expr: 'step2 + step1' },
      { name: 'base', expr: '10' },
      { name: 'step2', expr: 'base * 2' }
    ]
  },
  orderIndependent3: {
    name: 'Order independence - Mixed',
    expressions: [
      { name: 'total', expr: 'subtotal + tax' },
      { name: 'subtotal', expr: 'price * quantity' },
      { name: 'quantity', expr: '5' },
      { name: 'tax', expr: 'subtotal * taxRate' },
      { name: 'price', expr: '19.99' },
      { name: 'taxRate', expr: '0.08' }
    ]
  }
};
