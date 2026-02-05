import { useState } from 'react';
import { Plus, Trash2, Play, BookOpen } from 'lucide-react';

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

  const loadExample = () => {
    setExpressions([
      { name: 'radius', expr: '5' },
      { name: 'pi', expr: '$math.PI' },
      { name: 'circumference', expr: '2 * pi * radius' },
      { name: 'area', expr: 'pi * radius * radius' },
      { name: 'point', expr: '{x: 10, y: 20}' },
      { name: 'scaledX', expr: 'point.x * 2' }
    ]);
    setResult(null);
    setError(null);
    setErrorIndex(null);
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
      
      if (err.variableName) {
        const index = expressions.findIndex(e => e.name === err.variableName);
        if (index !== -1) {
          setErrorIndex(index);
        }
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Expressions</h2>
        <p className="text-gray-600 mb-6">
          Define variables with math expressions. They can reference each other and will be evaluated in the correct order automatically.
        </p>
        
        <div className="space-y-4 mb-6">
          {expressions.map((expr, index) => (
            <div 
              key={index}
              className={`grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-4 items-center p-4 rounded-lg border-2 ${
                errorIndex === index 
                  ? 'bg-red-50 border-red-300' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <input
                type="text"
                placeholder="Variable name"
                value={expr.name}
                onChange={(e) => updateExpression(index, 'name', e.target.value)}
                className={`px-4 py-2 border-2 rounded-lg font-mono focus:outline-none focus:border-teal-500 ${
                  errorIndex === index ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <input
                type="text"
                placeholder="Expression (e.g., a + b)"
                value={expr.expr}
                onChange={(e) => updateExpression(index, 'expr', e.target.value)}
                className={`px-4 py-2 border-2 rounded-lg font-mono focus:outline-none focus:border-teal-500 ${
                  errorIndex === index ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <button
                onClick={() => removeExpression(index)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 justify-center"
              >
                <Trash2 size={18} />
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={addExpression}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Expression
          </button>
          <button
            onClick={evaluate}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Play size={20} />
            Evaluate
          </button>
          <button
            onClick={loadExample}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <BookOpen size={20} />
            Load Example
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-lg">
          <p className="text-red-700 font-mono">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Results</h3>
          <div className="space-y-3">
            {Object.entries(result.values).map(([name, value]: [string, any]) => (
              <div key={name} className="grid grid-cols-[200px_1fr] gap-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <div className="font-semibold text-gray-700 font-mono">{name}</div>
                <div className="text-green-700 font-mono font-semibold">{value.toString()}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-gray-600 italic">
            Evaluation order: {result.order.join(' → ')}
          </div>
        </div>
      )}

      <div className="bg-teal-50 border-l-4 border-teal-600 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-teal-900 mb-4">Quick Tips</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Variables can reference other variables (e.g., <code className="bg-teal-100 px-2 py-1 rounded text-sm">b = a * 2</code>)</li>
          <li>• Use decimal precision math (e.g., <code className="bg-teal-100 px-2 py-1 rounded text-sm">0.1 + 0.2</code> = 0.3 exactly!)</li>
          <li>• Access nested properties with dots (e.g., <code className="bg-teal-100 px-2 py-1 rounded text-sm">point.x</code>)</li>
          <li>• Use <code className="bg-teal-100 px-2 py-1 rounded text-sm">$math</code> functions: <code className="bg-teal-100 px-2 py-1 rounded text-sm">$math.sqrt(16)</code>, <code className="bg-teal-100 px-2 py-1 rounded text-sm">$math.PI</code>, etc.</li>
          <li>• Convert units: <code className="bg-teal-100 px-2 py-1 rounded text-sm">$unit.mmToInch(25.4)</code></li>
          <li>• Convert angles: <code className="bg-teal-100 px-2 py-1 rounded text-sm">$angle.toRad(180)</code></li>
        </ul>
      </div>
    </div>
  );
}
