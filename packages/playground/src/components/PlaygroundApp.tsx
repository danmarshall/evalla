import { useState, useRef, useEffect } from 'react';
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
  const [syntaxErrors, setSyntaxErrors] = useState<Map<number, string>>(new Map());
  const [nameErrors, setNameErrors] = useState<Map<number, string>>(new Map());
  
  // Store debounce timeouts per expression index
  const debounceTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const nameDebounceTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());
  // Store check functions in ref to avoid module-level state
  const checkSyntaxFn = useRef<((expr: string) => { valid: boolean; error?: string }) | null>(null);
  const checkVariableNameFn = useRef<((name: string) => { valid: boolean; error?: string }) | null>(null);

  // Load check functions on mount
  useEffect(() => {
    import('evalla').then(({ checkSyntax, checkVariableName }) => {
      checkSyntaxFn.current = checkSyntax;
      checkVariableNameFn.current = checkVariableName;
    }).catch(err => {
      console.error('Failed to load validation functions:', err);
    });
  }, []);

  const updateExpression = (index: number, field: 'name' | 'expr', value: string) => {
    const newExpressions = [...expressions];
    newExpressions[index][field] = value;
    setExpressions(newExpressions);

    // Check variable name in real-time with debouncing
    if (field === 'name') {
      // Clear existing timeout for this name field
      const existingTimeout = nameDebounceTimeouts.current.get(index);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      if (!value.trim()) {
        // Clear name error when name is cleared
        const newNameErrors = new Map(nameErrors);
        newNameErrors.delete(index);
        setNameErrors(newNameErrors);
        return;
      }

      // Debounce name check (300ms delay)
      const timeout = setTimeout(() => {
        if (!checkVariableNameFn.current) {
          return; // checkVariableName not loaded yet
        }

        const nameResult = checkVariableNameFn.current(value);
        
        setNameErrors(prev => {
          const newNameErrors = new Map(prev);
          if (!nameResult.valid) {
            newNameErrors.set(index, nameResult.error || 'Invalid variable name');
          } else {
            newNameErrors.delete(index);
          }
          return newNameErrors;
        });
      }, 300);

      nameDebounceTimeouts.current.set(index, timeout);
    }

    // Check syntax for expression field in real-time with debouncing
    if (field === 'expr') {
      // Clear existing timeout for this expression
      const existingTimeout = debounceTimeouts.current.get(index);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      if (!value.trim()) {
        // Clear syntax error when expression is cleared
        const newSyntaxErrors = new Map(syntaxErrors);
        newSyntaxErrors.delete(index);
        setSyntaxErrors(newSyntaxErrors);
        return;
      }

      // Debounce syntax check (300ms delay)
      const timeout = setTimeout(() => {
        if (!checkSyntaxFn.current) {
          return; // checkSyntax not loaded yet
        }

        const syntaxResult = checkSyntaxFn.current(value);
        
        setSyntaxErrors(prev => {
          const newSyntaxErrors = new Map(prev);
          if (!syntaxResult.valid) {
            newSyntaxErrors.set(index, syntaxResult.error || 'Syntax error');
          } else {
            newSyntaxErrors.delete(index);
          }
          return newSyntaxErrors;
        });
      }, 300);

      debounceTimeouts.current.set(index, timeout);
    }
  };

  const addExpression = () => {
    setExpressions([...expressions, { name: '', expr: '' }]);
  };

  const removeExpression = (index: number) => {
    // Clear any pending timeouts for this expression
    const timeout = debounceTimeouts.current.get(index);
    if (timeout) {
      clearTimeout(timeout);
      debounceTimeouts.current.delete(index);
    }
    const nameTimeout = nameDebounceTimeouts.current.get(index);
    if (nameTimeout) {
      clearTimeout(nameTimeout);
      nameDebounceTimeouts.current.delete(index);
    }

    setExpressions(expressions.filter((_, i) => i !== index));
    
    // Remove errors for the removed expression
    const newSyntaxErrors = new Map(syntaxErrors);
    const newNameErrors = new Map(nameErrors);
    newSyntaxErrors.delete(index);
    newNameErrors.delete(index);
    
    // Adjust indices for remaining expressions and their timeouts
    const adjustedSyntaxErrors = new Map<number, string>();
    const adjustedNameErrors = new Map<number, string>();
    const adjustedTimeouts = new Map<number, NodeJS.Timeout>();
    const adjustedNameTimeouts = new Map<number, NodeJS.Timeout>();
    
    newSyntaxErrors.forEach((error, idx) => {
      if (idx > index) {
        adjustedSyntaxErrors.set(idx - 1, error);
      } else {
        adjustedSyntaxErrors.set(idx, error);
      }
    });
    
    newNameErrors.forEach((error, idx) => {
      if (idx > index) {
        adjustedNameErrors.set(idx - 1, error);
      } else {
        adjustedNameErrors.set(idx, error);
      }
    });
    
    debounceTimeouts.current.forEach((timeout, idx) => {
      if (idx > index) {
        adjustedTimeouts.set(idx - 1, timeout);
      } else if (idx !== index) {
        adjustedTimeouts.set(idx, timeout);
      }
    });
    
    nameDebounceTimeouts.current.forEach((timeout, idx) => {
      if (idx > index) {
        adjustedNameTimeouts.set(idx - 1, timeout);
      } else if (idx !== index) {
        adjustedNameTimeouts.set(idx, timeout);
      }
    });
    
    setSyntaxErrors(adjustedSyntaxErrors);
    setNameErrors(adjustedNameErrors);
    debounceTimeouts.current = adjustedTimeouts;
    nameDebounceTimeouts.current = adjustedNameTimeouts;
  };


  const loadExample = (key: string) => {
    const example = examples[key];
    if (example) {
      setExpressions(example.expressions);
      setResult(null);
      setError(null);
      setErrorIndex(null);
      setSyntaxErrors(new Map()); // Clear syntax errors when loading example
      setNameErrors(new Map()); // Clear name errors when loading example
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
            {expressions.map((expr, index) => {
              const hasSyntaxError = syntaxErrors.has(index);
              const hasNameError = nameErrors.has(index);
              return (
              <div
                key={index}
                className={`${errorIndex === index ? 'bg-red-50 -mx-2 px-2 py-1 rounded' : ''}`}
              >
                {/* Desktop layout */}
                <div className="hidden sm:grid sm:grid-cols-[150px_1fr_auto] gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="e.g. radius"
                      value={expr.name}
                      onChange={(e) => updateExpression(index, 'name', e.target.value)}
                      className={`w-full px-3 py-2 text-sm border rounded font-mono focus:outline-none focus:ring-2 ${
                        hasNameError 
                          ? 'border-orange-400 bg-orange-50 focus:ring-orange-500' 
                          : errorIndex === index 
                            ? 'border-red-300 bg-white focus:ring-blue-500' 
                            : 'border-gray-300 bg-white focus:ring-blue-500'
                      }`}
                    />
                    {hasNameError && (
                      <div className="text-orange-600 text-xs mt-1 font-mono">
                        {nameErrors.get(index)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="e.g. a + b"
                      value={expr.expr}
                      onChange={(e) => updateExpression(index, 'expr', e.target.value)}
                      className={`w-full px-3 py-2 text-sm border rounded font-mono focus:outline-none focus:ring-2 ${
                        hasSyntaxError 
                          ? 'border-orange-400 bg-orange-50 focus:ring-orange-500' 
                          : errorIndex === index 
                            ? 'border-red-300 bg-white focus:ring-blue-500' 
                            : 'border-gray-300 bg-white focus:ring-blue-500'
                      }`}
                    />
                    {hasSyntaxError && (
                      <div className="text-orange-600 text-xs mt-1 font-mono">
                        {syntaxErrors.get(index)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeExpression(index)}
                    className="w-24 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors flex items-center gap-1.5 justify-center"
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
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="e.g. radius"
                          value={expr.name}
                          onChange={(e) => updateExpression(index, 'name', e.target.value)}
                          className={`w-full px-3 py-2 text-sm border rounded font-mono focus:outline-none focus:ring-2 ${
                            hasNameError 
                              ? 'border-orange-400 bg-orange-50 focus:ring-orange-500' 
                              : errorIndex === index 
                                ? 'border-red-300 bg-white focus:ring-blue-500' 
                                : 'border-gray-300 bg-white focus:ring-blue-500'
                          }`}
                        />
                        {hasNameError && (
                          <div className="text-orange-600 text-xs mt-1 font-mono">
                            {nameErrors.get(index)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <label className="text-xs font-medium text-gray-600 w-12">Expr</label>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="e.g. a + b"
                          value={expr.expr}
                          onChange={(e) => updateExpression(index, 'expr', e.target.value)}
                          className={`w-full px-3 py-2 text-sm border rounded font-mono focus:outline-none focus:ring-2 ${
                            hasSyntaxError 
                              ? 'border-orange-400 bg-orange-50 focus:ring-orange-500' 
                              : errorIndex === index 
                                ? 'border-red-300 bg-white focus:ring-blue-500' 
                                : 'border-gray-300 bg-white focus:ring-blue-500'
                          }`}
                        />
                        {hasSyntaxError && (
                          <div className="text-orange-600 text-xs mt-1 font-mono">
                            {syntaxErrors.get(index)}
                          </div>
                        )}
                      </div>
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
            )})}
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={addExpression}
              className="w-24 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors flex items-center gap-1.5 justify-center"
            >
              <Plus size={16} />
              <span>Add</span>
            </button>
          </div>

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
                  {Object.entries(result.values).map(([name, value]: [string, any]) => {
                    // Handle different value types: Decimal, boolean, null
                    const displayValue = value === null ? 'null' : 
                                        typeof value === 'boolean' ? String(value) :
                                        value.toString();
                    return (
                      <tr key={name}>
                        <td className="py-2 px-2 font-mono text-gray-700">{name}</td>
                        <td className="py-2 px-2 font-mono text-green-700 font-semibold break-all">{displayValue}</td>
                      </tr>
                    );
                  })}
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
