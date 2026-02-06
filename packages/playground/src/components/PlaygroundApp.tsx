import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Play } from 'lucide-react';
import { examples, type Expression } from '../data/examples';

export default function PlaygroundApp() {
  const [expressions, setExpressions] = useState<Expression[]>([
    { name: 'a', expr: '10', mode: 'expr' },
    { name: 'b', expr: 'a * 2', mode: 'expr' },
    { name: 'c', expr: 'a + b', mode: 'expr' }
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

  // Helper function to get input field styling based on error state
  const getInputClassName = (hasValidationError: boolean, index: number) => {
    const baseClasses = 'w-full px-3 py-2 text-sm border rounded font-mono focus:outline-none focus:ring-2';
    if (hasValidationError) {
      return `${baseClasses} border-orange-400 bg-orange-50 focus:ring-orange-500`;
    }
    if (errorIndex === index) {
      return `${baseClasses} border-red-300 bg-white focus:ring-blue-500`;
    }
    return `${baseClasses} border-gray-300 bg-white focus:ring-blue-500`;
  };

  const updateExpression = (index: number, field: 'name' | 'expr' | 'value', value: string) => {
    const newExpressions = [...expressions];
    if (field === 'value') {
      // Parse JSON for value field
      try {
        newExpressions[index].value = JSON.parse(value);
      } catch (e) {
        // Keep as string if not valid JSON yet
        newExpressions[index].value = value;
      }
    } else {
      newExpressions[index][field] = value;
    }
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

  const addExpression = (mode: 'expr' | 'value' = 'expr') => {
    setExpressions([...expressions, { name: '', expr: mode === 'expr' ? '' : undefined, value: mode === 'value' ? '' : undefined, mode }]);
  };

  const removeExpression = (index: number) => {
    setExpressions(expressions.filter((_, i) => i !== index));
  };


  const loadExample = (key: string) => {
    const example = examples[key];
    if (example) {
      // Ensure mode is set for each expression
      const examplesWithMode = example.expressions.map(e => ({
        ...e,
        mode: e.mode || (e.expr !== undefined ? 'expr' : 'value') as 'expr' | 'value'
      }));
      setExpressions(examplesWithMode);
      setResult(null);
      setError(null);
      setErrorIndex(null);
      setSyntaxErrors(new Map());
      setNameErrors(new Map());
    }
  };

  const evaluate = async () => {
    setError(null);
    setErrorIndex(null);

    try {
      // Dynamic import to avoid SSR issues
      const { evalla } = await import('evalla');

      // Filter out expressions without names and prepare for evalla
      const validExpressions = expressions
        .filter(e => e.name.trim())
        .map(e => {
          if (e.mode === 'value') {
            // For value mode, parse JSON if it's a string
            let parsedValue = e.value;
            if (typeof e.value === 'string' && e.value.trim()) {
              try {
                parsedValue = JSON.parse(e.value);
              } catch (err) {
                throw new Error(`Invalid JSON for "${e.name}": ${e.value}`);
              }
            }
            return { name: e.name, value: parsedValue };
          } else {
            // For expression mode
            if (!e.expr || !e.expr.trim()) {
              throw new Error(`Expression for "${e.name}" is empty`);
            }
            return { name: e.name, expr: e.expr };
          }
        });

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
            <div>Expression / Value (JSON)</div>
            <div className="w-[90px]"></div>
          </div>
          <div className="space-y-4 sm:space-y-2">
            {expressions.map((expr, index) => {
              const mode = expr.mode || (expr.expr !== undefined ? 'expr' : 'value');
              const isValueMode = mode === 'value';
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
                      className={getInputClassName(hasNameError, index)}
                    />
                    {hasNameError && (
                      <div className="text-xs text-orange-600 mt-1">{nameErrors.get(index)}</div>
                    )}
                  </div>
                  {isValueMode ? (
                    <div className="space-y-1">
                      <textarea
                        placeholder='e.g. {"x": 10, "y": 20}'
                        value={typeof expr.value === 'string' ? expr.value : JSON.stringify(expr.value, null, 2)}
                        onChange={(e) => updateExpression(index, 'value', e.target.value)}
                        rows={3}
                        className={getInputClassName(false, index)}
                      />
                      <div className="text-xs text-gray-500 italic">Value mode (JSON)</div>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="e.g. a + b"
                        value={expr.expr || ''}
                        onChange={(e) => updateExpression(index, 'expr', e.target.value)}
                        className={getInputClassName(hasSyntaxError, index)}
                      />
                      {hasSyntaxError && (
                        <div className="text-xs text-orange-600 mt-1">{syntaxErrors.get(index)}</div>
                      )}
                      <div className="text-xs text-gray-500 italic">Expression mode</div>
                    </div>
                  )}
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
                    <div className="flex gap-2 items-start">
                      <label className="text-xs font-medium text-gray-600 w-12 mt-2">Name</label>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="e.g. radius"
                          value={expr.name}
                          onChange={(e) => updateExpression(index, 'name', e.target.value)}
                          className={getInputClassName(hasNameError, index).replace('w-full', 'flex-1')}
                        />
                        {hasNameError && (
                          <div className="text-xs text-orange-600 mt-1">{nameErrors.get(index)}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <label className="text-xs font-medium text-gray-600 w-12 mt-2">{isValueMode ? 'Value' : 'Expr'}</label>
                      {isValueMode ? (
                        <div className="flex-1">
                          <textarea
                            placeholder='{"x": 10}'
                            value={typeof expr.value === 'string' ? expr.value : JSON.stringify(expr.value, null, 2)}
                            onChange={(e) => updateExpression(index, 'value', e.target.value)}
                            rows={3}
                            className={getInputClassName(false, index).replace('w-full', 'flex-1')}
                          />
                        </div>
                      ) : (
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="e.g. a + b"
                            value={expr.expr || ''}
                            onChange={(e) => updateExpression(index, 'expr', e.target.value)}
                            className={getInputClassName(hasSyntaxError, index).replace('w-full', 'flex-1')}
                          />
                          {hasSyntaxError && (
                            <div className="text-xs text-orange-600 mt-1">{syntaxErrors.get(index)}</div>
                          )}
                        </div>
                      )}
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
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => addExpression('expr')}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center gap-1.5 justify-center"
            >
              <Plus size={16} />
              <span>Add Expression</span>
            </button>
            <button
              onClick={() => addExpression('value')}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors flex items-center gap-1.5 justify-center"
            >
              <Plus size={16} />
              <span>Add Value</span>
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
