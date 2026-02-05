import { useState } from 'react';
import { Plus, Trash2, Play } from 'lucide-react';
import { examples, type Expression } from '../data/examples';

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
