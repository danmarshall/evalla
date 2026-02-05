import { useState } from 'react';
import { Plus, Trash2, Play } from 'lucide-react';

interface Expression {
  name: string;
  expr: string;
}

export default function PlaygroundApp() {
  const [expressions, setExpressions] = useState<Expression[]>([
    { name: 'a', expr: '10' },
    { name: 'b', expr: 'a * 2' },
    { name: 'c', expr: 'a + b' }
  ]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);

  const updateExpression = (index: number, field: 'name' | 'expr', value: string) => {
    const newExpressions = [...expressions];
    newExpressions[index][field] = value;
    setExpressions(newExpressions);
  };

  const addExpression = () => {
    setExpressions([...expressions, { name: '', expr: '' }]);
  };

  const removeExpression = (index: number) => {
    setExpressions(expressions.filter((_, i) => i !== index));
  };

  const examples: Record<string, { name: string; expressions: Expression[] }> = {
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
    }
  };

  const loadExample = (key: string) => {
    const example = examples[key];
    if (example) {
      setExpressions(example.expressions);
      setResult(null);
      setError(null);
      setErrorIndex(null);
    }
  };

  const evaluate = async () => {
    setError(null);
    setErrorIndex(null);

    try {
      // Dynamic import to avoid SSR issues
      const { evalla } = await import('evalla');

      const validExpressions = expressions.filter(e => e.name.trim() && e.expr.trim());

      if (validExpressions.length === 0) {
        setError('Please add at least one expression');
        return;
      }

      const evalResult = await evalla(validExpressions);
      setResult(evalResult);
    } catch (err: any) {
      setError(err.message);
      setResult(null);

      if (err.variableName) {
        const index = expressions.findIndex(e => e.name === err.variableName);
        if (index !== -1) {
          setErrorIndex(index);
        }
      }
    }
  };

  return (
    <div className='content'>
      <div className="mb-6">
        <h2 style={{ marginTop: '2rem' }}>Playground</h2>
        <p className="text-gray-600 text-sm sm:text-base mb-4">
          Define variables with math expressions. They can reference each other and will be evaluated in the correct order automatically.
        </p>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-600">Examples</span>
          <select
            onChange={(e) => e.target.value && loadExample(e.target.value)}
            defaultValue=""
            className="px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Choose an example</option>
            {Object.entries(examples).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
          {/* Desktop header */}
          <div className="hidden sm:grid sm:grid-cols-[150px_1fr_auto] gap-2 mb-2 text-sm font-medium text-gray-600">
            <div>Name</div>
            <div>Expression</div>
            <div className="w-[90px]"></div>
          </div>
          <div className="space-y-4 sm:space-y-2">
            {expressions.map((expr, index) => (
              <div
                key={index}
                className={`${errorIndex === index ? 'bg-red-50 -mx-2 px-2 py-1 rounded' : ''}`}
              >
                {/* Desktop layout */}
                <div className="hidden sm:grid sm:grid-cols-[150px_1fr_auto] gap-2 items-center">
                  <input
                    type="text"
                    placeholder="e.g. radius"
                    value={expr.name}
                    onChange={(e) => updateExpression(index, 'name', e.target.value)}
                    className={`px-3 py-2 text-sm border rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${errorIndex === index ? 'border-red-300 bg-white' : 'border-gray-300 bg-white'}`}
                  />
                  <input
                    type="text"
                    placeholder="e.g. a + b"
                    value={expr.expr}
                    onChange={(e) => updateExpression(index, 'expr', e.target.value)}
                    className={`px-3 py-2 text-sm border rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${errorIndex === index ? 'border-red-300 bg-white' : 'border-gray-300 bg-white'}`}
                  />
                  <button
                    onClick={() => removeExpression(index)}
                    className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors flex items-center gap-1.5 justify-center"
                  >
                    <Trash2 size={16} />
                    <span>Remove</span>
                  </button>
                </div>
                {/* Mobile layout */}
                <div className="sm:hidden flex gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex gap-2 items-center">
                      <label className="text-xs font-medium text-gray-600 w-12">Name</label>
                      <input
                        type="text"
                        placeholder="e.g. radius"
                        value={expr.name}
                        onChange={(e) => updateExpression(index, 'name', e.target.value)}
                        className={`flex-1 px-3 py-2 text-sm border rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${errorIndex === index ? 'border-red-300 bg-white' : 'border-gray-300 bg-white'}`}
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <label className="text-xs font-medium text-gray-600 w-12">Expr</label>
                      <input
                        type="text"
                        placeholder="e.g. a + b"
                        value={expr.expr}
                        onChange={(e) => updateExpression(index, 'expr', e.target.value)}
                        className={`flex-1 px-3 py-2 text-sm border rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${errorIndex === index ? 'border-red-300 bg-white' : 'border-gray-300 bg-white'}`}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeExpression(index)}
                    className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors self-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addExpression}
            className="mt-3 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded font-semibold transition-colors flex items-center gap-1.5"
          >
            <Plus size={18} />
            <span>Add</span>
          </button>

        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <p className="text-red-700 font-mono text-sm">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">Results</h3>
          <div className="flex gap-2 mb-4">
            <button
              onClick={evaluate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-semibold transition-colors flex items-center gap-1.5"
            >
              <Play size={18} />
              <span>Evaluate</span>
            </button>
            {result && (
              <button
                onClick={() => setResult(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded font-semibold transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          {result ? (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-green-200">
                    <th className="text-left py-2 font-medium text-gray-600">Name</th>
                    <th className="text-left py-2 font-medium text-gray-600">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.values).map(([name, value]: [string, any]) => (
                    <tr key={name}>
                      <td className="py-2 px-2 font-mono text-gray-700">{name}</td>
                      <td className="py-2 px-2 font-mono text-green-700 font-semibold break-all">{value.toString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-gray-600 text-xs sm:text-sm italic">
                Evaluation order: {result.order.join(' → ')}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm italic">Click Evaluate to see results</p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-3">Quick Tips</h3>
        <ul className="space-y-1.5 text-gray-700 text-sm sm:text-base">
          <li>• Variables can reference other variables (e.g., <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm">b = a * 2</code>)</li>
          <li>• Use decimal precision math (e.g., <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm">0.1 + 0.2</code> = 0.3 exactly!)</li>
          <li>• Access nested properties with dots (e.g., <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm">point.x</code>)</li>
          <li>• Use <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm">$math</code> functions: <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm">$math.sqrt(16)</code>, <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm">$math.PI</code>, etc.</li>
          <li>• Convert units: <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm">$unit.mmToInch(25.4)</code></li>
          <li>• Convert angles: <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm">$angle.toRad(180)</code></li>
        </ul>
      </div>
    </div>
  );
}
