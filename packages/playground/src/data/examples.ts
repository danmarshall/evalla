export interface Expression {
  name: string;
  expr?: string;
  value?: any;
  mode?: 'expr' | 'value';
}

export interface Example {
  name: string;
  expressions: Expression[];
}

export const examples: Record<string, Example> = {
  circle: {
    name: 'Circle calculations',
    expressions: [
      { name: 'radius', expr: '5', mode: 'expr' as const },
      { name: 'pi', expr: '$math.PI', mode: 'expr' as const },
      { name: 'circumference', expr: '2 * pi * radius', mode: 'expr' as const },
      { name: 'area', expr: 'pi * radius * radius', mode: 'expr' as const }
    ]
  },
  arrayLiterals: {
    name: 'Array literals',
    expressions: [
      { name: 'data', expr: '[10, 20, 30, 40, 50]' },
      { name: 'first', expr: 'data[0]' },
      { name: 'last', expr: 'data[4]' },
      { name: 'sum', expr: 'data[0] + data[1] + data[2] + data[3] + data[4]' },
      { name: 'average', expr: 'sum / 5' }
    ]
  },
  objectProperties: {
    name: 'Object properties with dot notation',
    expressions: [
      { 
        name: 'point', 
        value: {x: 10, y: 20}, 
        mode: 'value' as const
      },
      { name: 'scaledX', expr: 'point.x * 2', mode: 'expr' as const },
      { name: 'scaledY', expr: 'point.y * 2', mode: 'expr' as const },
      { name: 'distance', expr: '$math.sqrt(point.x**2 + point.y**2)', mode: 'expr' as const }
    ]
  },
  nestedObjects: {
    name: 'Nested objects with dot notation',
    expressions: [
      { 
        name: 'config', 
        value: {
          display: {
            width: 1920,
            height: 1080
          },
          scale: 2
        }, 
        mode: 'value' as const
      },
      { name: 'scaledWidth', expr: 'config.display.width / config.scale', mode: 'expr' as const },
      { name: 'scaledHeight', expr: 'config.display.height / config.scale', mode: 'expr' as const },
      { name: 'aspectRatio', expr: 'config.display.width / config.display.height', mode: 'expr' as const }
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
    name: '$math - Min/Max with arrays',
    expressions: [
      { name: 'values', expr: '[42, 17, 99, 8]' },
      { name: 'minVal', expr: '$math.min(values[0], values[1], values[2], values[3])' },
      { name: 'maxVal', expr: '$math.max(values[0], values[1], values[2], values[3])' },
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
  nestedArrays: {
    name: 'Nested arrays (matrices)',
    expressions: [
      { name: 'matrix', expr: '[[1, 2, 3], [4, 5, 6], [7, 8, 9]]' },
      { name: 'topLeft', expr: 'matrix[0][0]' },
      { name: 'center', expr: 'matrix[1][1]' },
      { name: 'bottomRight', expr: 'matrix[2][2]' },
      { name: 'diagonal', expr: 'topLeft + center + bottomRight' }
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
  },
  booleanSlope: {
    name: 'Boolean - Is it steep?',
    expressions: [
      { name: 'rise', expr: '15' },
      { name: 'run', expr: '20' },
      { name: 'slope', expr: 'rise / run' },
      { name: 'isSteep', expr: 'slope > 0.5' },
      { name: 'label', expr: 'isSteep ? slope : null' }
    ]
  },
  booleanComparisons: {
    name: 'Boolean - Comparisons',
    expressions: [
      { name: 'a', expr: '10' },
      { name: 'b', expr: '20' },
      { name: 'less', expr: 'a < b' },
      { name: 'greater', expr: 'a > b' },
      { name: 'equal', expr: 'a = b' },
      { name: 'notEqual', expr: 'a != b' }
    ]
  },
  booleanLogic: {
    name: 'Boolean - Logical ops',
    expressions: [
      { name: 'x', expr: '15' },
      { name: 'inRange', expr: 'x > 10 && x < 20' },
      { name: 'outOfRange', expr: 'x < 10 || x > 20' },
      { name: 'valid', expr: '!outOfRange' }
    ]
  },
  equalityOperators: {
    name: 'Equality - Single & double',
    expressions: [
      { name: 'x', expr: '5' },
      { name: 'y', expr: '5' },
      { name: 'z', expr: '10' },
      { name: 'singleEq', expr: 'x = y' },
      { name: 'doubleEq', expr: 'x == y' },
      { name: 'calculated', expr: '(x + 5) = z' }
    ]
  },
  reservedValues: {
    name: 'Reserved values in action',
    expressions: [
      { name: 'enabled', expr: 'true' },
      { name: 'disabled', expr: 'false' },
      { name: 'missing', expr: 'null' },
      { name: 'result', expr: 'enabled && !disabled' },
      { name: 'fallback', expr: 'missing ?? 42' }
    ]
  },
  ternaryBoolean: {
    name: 'Ternary with boolean branches',
    expressions: [
      { name: 'score', expr: '85' },
      { name: 'passed', expr: 'score >= 60 ? true : false' },
      { name: 'grade', expr: 'score >= 90 ? 100 : score' },
      { name: 'bonus', expr: 'score >= 90 ? 10 : null' }
    ]
  }
};
