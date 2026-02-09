import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Play, Upload, Download, FileText } from 'lucide-react';
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
  const [nextVarNumber, setNextVarNumber] = useState<number>(4); // Counter for unique variable names
  
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

  // Helper function to format textarea value for display
  const getTextareaValue = (expr: Expression): string => {
    // Use raw string if available (user is editing)
    if (expr.valueRaw !== undefined) {
      return expr.valueRaw;
    }
    // Otherwise format the parsed value (from examples)
    return expr.value ? JSON.stringify(expr.value, null, 2) : '';
  };

  // Helper function to get input field styling based on error state and mode
  const getInputClassName = (hasValidationError: boolean, index: number, mode?: 'expr' | 'value', isValueField?: boolean, isNameField?: boolean) => {
    const baseClasses = 'w-full px-3 py-2 text-sm border rounded font-mono focus:outline-none focus:ring-2';
    if (hasValidationError) {
      return `${baseClasses} border-orange-400 bg-orange-50 focus:ring-orange-500`;
    }
    if (errorIndex === index) {
      return `${baseClasses} border-red-300 bg-white focus:ring-blue-500`;
    }
    // Value mode fields get purple border to indicate they won't appear in results
    if (mode === 'value' && (isValueField || isNameField)) {
      return `${baseClasses} border-purple-400 bg-white focus:ring-purple-500`;
    }
    // Expression mode fields get teal border to match Add Expression button
    if (mode === 'expr' || (!mode && !isValueField)) {
      return `${baseClasses} border-teal-400 bg-white focus:ring-teal-500`;
    }
    return `${baseClasses} border-gray-300 bg-white focus:ring-blue-500`;
  };

  const updateExpression = (index: number, field: 'name' | 'expr' | 'value', value: string) => {
    const newExpressions = [...expressions];
    
    if (field === 'value') {
      // Store raw string for textarea display
      newExpressions[index].valueRaw = value;
      
      // Parse JSON for evaluation later
      // While typing, invalid JSON is stored as string, valid JSON is parsed
      try {
        newExpressions[index].value = value ? JSON.parse(value) : undefined;
      } catch (e) {
        // Keep unparsed for now - validation will show error
        newExpressions[index].value = undefined;
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

    // Check syntax for expression field in real-time with debouncing (only for expr mode)
    if (field === 'expr' && newExpressions[index].mode === 'expr') {
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

    // Check JSON syntax for value field in real-time with debouncing (only for value mode)
    if (field === 'value' && newExpressions[index].mode === 'value') {
      // Clear existing timeout for this value field
      const existingTimeout = debounceTimeouts.current.get(index);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      if (!value.trim()) {
        // Clear syntax error when value is cleared
        const newSyntaxErrors = new Map(syntaxErrors);
        newSyntaxErrors.delete(index);
        setSyntaxErrors(newSyntaxErrors);
        return;
      }

      // Debounce JSON validation (300ms delay)
      const timeout = setTimeout(() => {
        try {
          // Try to parse the JSON
          JSON.parse(value);
          // Valid JSON - clear any errors
          setSyntaxErrors(prev => {
            const newSyntaxErrors = new Map(prev);
            newSyntaxErrors.delete(index);
            return newSyntaxErrors;
          });
        } catch (e) {
          // Invalid JSON - show error
          setSyntaxErrors(prev => {
            const newSyntaxErrors = new Map(prev);
            newSyntaxErrors.set(index, e instanceof Error ? e.message : 'Invalid JSON');
            return newSyntaxErrors;
          });
        }
      }, 300);

      debounceTimeouts.current.set(index, timeout);
    }
  };

  const addExpression = (mode: 'expr' | 'value' = 'expr') => {
    setExpressions([
      ...expressions,
      { 
        name: `var${nextVarNumber}`, 
        expr: mode === 'expr' ? '' : undefined,
        value: undefined,
        mode 
      },
    ]);
    setNextVarNumber(nextVarNumber + 1);
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

  // Upload/Download functions
  const handleUploadJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target?.result as string);
            // Import all key-value pairs as value mode expressions
            Object.entries(json).forEach(([key, value]) => {
              setExpressions(prev => [
                ...prev,
                { name: key, value, mode: 'value' as const }
              ]);
            });
          } catch (err) {
            setError('Failed to parse JSON file: ' + (err instanceof Error ? err.message : 'Unknown error'));
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handlePasteJSON = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const json = JSON.parse(text);
      // Import all key-value pairs as value mode expressions
      Object.entries(json).forEach(([key, value]) => {
        setExpressions(prev => [
          ...prev,
          { name: key, value, mode: 'value' as const }
        ]);
      });
    } catch (err) {
      setError('Failed to parse JSON from clipboard: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleUploadExpressions = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            const data = JSON.parse(content);
            
            // Support both array format and object format
            if (Array.isArray(data)) {
              // Array of expression objects
              data.forEach((item: any) => {
                if (item.name && (item.expr !== undefined || item.value !== undefined)) {
                  setExpressions(prev => [...prev, {
                    name: item.name,
                    expr: item.expr,
                    value: item.value,
                    mode: item.mode || (item.value !== undefined ? 'value' : 'expr')
                  }]);
                }
              });
            } else {
              // Object format: key = name, value = expression string
              Object.entries(data).forEach(([key, value]) => {
                setExpressions(prev => [
                  ...prev,
                  { name: key, expr: String(value), mode: 'expr' as const }
                ]);
              });
            }
          } catch (err) {
            setError('Failed to parse expressions file: ' + (err instanceof Error ? err.message : 'Unknown error'));
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handlePasteExpressions = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text);
      
      // Support both array format and object format
      if (Array.isArray(data)) {
        // Array of expression objects
        data.forEach((item: any) => {
          if (item.name && (item.expr !== undefined || item.value !== undefined)) {
            setExpressions(prev => [...prev, {
              name: item.name,
              expr: item.expr,
              value: item.value,
              mode: item.mode || (item.value !== undefined ? 'value' : 'expr')
            }]);
          }
        });
      } else {
        // Object format: key = name, value = expression string
        Object.entries(data).forEach(([key, value]) => {
          setExpressions(prev => [
            ...prev,
            { name: key, expr: String(value), mode: 'expr' as const }
          ]);
        });
      }
    } catch (err) {
      setError('Failed to parse expressions from clipboard: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleDownloadExpressions = () => {
    const exprOnly = expressions.filter(e => e.mode === 'expr');
    const data = exprOnly.map(e => ({
      name: e.name,
      expr: e.expr || ''
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expressions.json';
    a.click();
    URL.revokeObjectURL(url);
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

    // Check if there are any syntax errors before evaluating
    if (syntaxErrors.size > 0) {
      const firstErrorIndex = Array.from(syntaxErrors.keys())[0];
      const errorMessage = syntaxErrors.get(firstErrorIndex);
      setError(`Cannot evaluate: ${errorMessage}`);
      setErrorIndex(firstErrorIndex);
      return;
    }

    // Check if there are any name errors before evaluating
    if (nameErrors.size > 0) {
      const firstErrorIndex = Array.from(nameErrors.keys())[0];
      const errorMessage = nameErrors.get(firstErrorIndex);
      setError(`Cannot evaluate: ${errorMessage}`);
      setErrorIndex(firstErrorIndex);
      return;
    }

    try {
      // Dynamic import to avoid SSR issues
      const { evalla } = await import('evalla');

      // Format inputs for evalla based on mode
      const validInputs = expressions
        .filter(e => {
          // Filter out incomplete expressions
          if (!e.name.trim()) return false;
          if (e.mode === 'value') {
            return e.value !== undefined && e.value !== '';
          } else {
            // Allow blank expr (will return null), just ensure expr field exists
            return e.expr !== undefined;
          }
        })
        .map(e => {
          if (e.mode === 'value') {
            // Value mode: pass value property
            return { name: e.name, value: e.value };
          } else {
            // Expression mode: pass expr property (even if blank)
            return { name: e.name, expr: e.expr || '' };
          }
        });

      if (validInputs.length === 0) {
        setError('Please add at least one expression');
        return;
      }

      const evalResult = await evalla(validInputs);
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

  // Separate values and expressions for display
  const valueExpressions = expressions.filter(e => e.mode === 'value').map(e => ({ 
    ...e, 
    originalIndex: expressions.indexOf(e) 
  }));
  const exprExpressions = expressions.filter(e => e.mode !== 'value').map(e => ({ 
    ...e, 
    originalIndex: expressions.indexOf(e) 
  }));

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

        {/* VALUES SECTION */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3 sm:p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-purple-900">Values (JSON)</h3>
            <div className="flex gap-2">
              <button
                onClick={handlePasteJSON}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors flex items-center gap-1"
                title="Paste JSON from clipboard"
              >
                <FileText size={14} />
                <span>Paste</span>
              </button>
              <button
                onClick={handleUploadJSON}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors flex items-center gap-1"
                title="Upload JSON file"
              >
                <Upload size={14} />
                <span>Upload</span>
              </button>
            </div>
          </div>
          <p className="text-purple-800 text-xs sm:text-sm mb-3 italic">
            Values are JSON objects/arrays that can be referenced in expressions but do not appear in the evaluation results.
          </p>
          
          {valueExpressions.length > 0 ? (
            <>
              {/* Desktop header */}
              <div className="hidden sm:grid sm:grid-cols-[150px_1fr_auto] gap-2 mb-2 text-sm font-medium text-purple-900">
                <div>Name</div>
                <div>JSON Value</div>
                <div className="w-[90px]"></div>
              </div>
              <div className="space-y-4 sm:space-y-2">
                {valueExpressions.map(({ originalIndex, ...expr }) => {
                  const hasSyntaxError = syntaxErrors.has(originalIndex);
                  const hasNameError = nameErrors.has(originalIndex);
                  return (
                  <div
                    key={originalIndex}
                    className={`${errorIndex === originalIndex ? 'bg-red-50 -mx-2 px-2 py-1 rounded' : ''}`}
                  >
                    {/* Desktop layout */}
                    <div className="hidden sm:grid sm:grid-cols-[150px_1fr_auto] gap-2 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="e.g. point"
                          value={expr.name}
                          onChange={(e) => updateExpression(originalIndex, 'name', e.target.value)}
                          className={getInputClassName(hasNameError, originalIndex, expr.mode, false, true)}
                        />
                        {hasNameError && (
                          <div className="text-orange-600 text-xs mt-1 font-mono">
                            {nameErrors.get(originalIndex)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <textarea
                          rows={3}
                          value={getTextareaValue(expr)}
                          onChange={(e) => updateExpression(originalIndex, 'value', e.target.value)}
                          className={getInputClassName(hasSyntaxError, originalIndex, expr.mode, true)}
                          placeholder='{"x": 10, "y": 20}'
                        />
                        {hasSyntaxError && (
                          <div className="text-orange-600 text-xs mt-1 font-mono">
                            {syntaxErrors.get(originalIndex)}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeExpression(originalIndex)}
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
                          <label className="text-xs font-medium text-purple-900 w-12">Name</label>
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="e.g. point"
                              value={expr.name}
                              onChange={(e) => updateExpression(originalIndex, 'name', e.target.value)}
                              className={getInputClassName(hasNameError, originalIndex, expr.mode, false, true)}
                            />
                            {hasNameError && (
                              <div className="text-orange-600 text-xs mt-1 font-mono">
                                {nameErrors.get(originalIndex)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 items-start">
                          <label className="text-xs font-medium text-purple-900 w-12 mt-2">Value</label>
                          <div className="flex-1">
                            <textarea
                              rows={3}
                              value={getTextareaValue(expr)}
                              onChange={(e) => updateExpression(originalIndex, 'value', e.target.value)}
                              className={getInputClassName(hasSyntaxError, originalIndex, expr.mode, true)}
                              placeholder='{"x": 10, "y": 20}'
                            />
                            {hasSyntaxError && (
                              <div className="text-orange-600 text-xs mt-1 font-mono">
                                {syntaxErrors.get(originalIndex)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeExpression(originalIndex)}
                        className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors self-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            </>
          ) : (
            <p className="text-purple-700 text-sm italic text-center py-4">No values defined. Add values to use in your expressions.</p>
          )}
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => addExpression('value')}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded transition-colors flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>Add Value</span>
            </button>
          </div>
        </div>

        {/* EXPRESSIONS SECTION */}
        <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-3 sm:p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-teal-900">Expressions</h3>
            <div className="flex gap-2">
              <button
                onClick={handlePasteExpressions}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded transition-colors flex items-center gap-1"
                title="Paste expressions from clipboard"
              >
                <FileText size={14} />
                <span>Paste</span>
              </button>
              <button
                onClick={handleUploadExpressions}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded transition-colors flex items-center gap-1"
                title="Upload expressions file"
              >
                <Upload size={14} />
                <span>Upload</span>
              </button>
              <button
                onClick={handleDownloadExpressions}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded transition-colors flex items-center gap-1"
                title="Download expressions"
                disabled={exprExpressions.length === 0}
              >
                <Download size={14} />
                <span>Download</span>
              </button>
            </div>
          </div>
          <p className="text-teal-800 text-xs sm:text-sm mb-3 italic">
            Expressions are mathematical formulas that will be evaluated and appear in the results.
          </p>
          
          {exprExpressions.length > 0 ? (
            <>
              {/* Desktop header */}
              <div className="hidden sm:grid sm:grid-cols-[150px_1fr_auto] gap-2 mb-2 text-sm font-medium text-teal-900">
                <div>Name</div>
                <div>Expression</div>
                <div className="w-[90px]"></div>
              </div>
              <div className="space-y-4 sm:space-y-2">
                {exprExpressions.map(({ originalIndex, ...expr }) => {
                  const hasSyntaxError = syntaxErrors.has(originalIndex);
                  const hasNameError = nameErrors.has(originalIndex);
                  return (
                  <div
                    key={originalIndex}
                    className={`${errorIndex === originalIndex ? 'bg-red-50 -mx-2 px-2 py-1 rounded' : ''}`}
                  >
                    {/* Desktop layout */}
                    <div className="hidden sm:grid sm:grid-cols-[150px_1fr_auto] gap-2 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="e.g. radius"
                          value={expr.name}
                          onChange={(e) => updateExpression(originalIndex, 'name', e.target.value)}
                          className={getInputClassName(hasNameError, originalIndex, expr.mode, false, true)}
                        />
                        {hasNameError && (
                          <div className="text-orange-600 text-xs mt-1 font-mono">
                            {nameErrors.get(originalIndex)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="e.g. a + b"
                          value={expr.expr || ''}
                          onChange={(e) => updateExpression(originalIndex, 'expr', e.target.value)}
                          className={getInputClassName(hasSyntaxError, originalIndex, expr.mode, false, false)}
                        />
                        {hasSyntaxError && (
                          <div className="text-orange-600 text-xs mt-1 font-mono">
                            {syntaxErrors.get(originalIndex)}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeExpression(originalIndex)}
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
                          <label className="text-xs font-medium text-teal-900 w-12">Name</label>
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="e.g. radius"
                              value={expr.name}
                              onChange={(e) => updateExpression(originalIndex, 'name', e.target.value)}
                              className={getInputClassName(hasNameError, originalIndex, expr.mode, false, true)}
                            />
                            {hasNameError && (
                              <div className="text-orange-600 text-xs mt-1 font-mono">
                                {nameErrors.get(originalIndex)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 items-start">
                          <label className="text-xs font-medium text-teal-900 w-12 mt-2">Expr</label>
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="e.g. a + b"
                              value={expr.expr || ''}
                              onChange={(e) => updateExpression(originalIndex, 'expr', e.target.value)}
                              className={getInputClassName(hasSyntaxError, originalIndex, expr.mode, false, false)}
                            />
                            {hasSyntaxError && (
                              <div className="text-orange-600 text-xs mt-1 font-mono">
                                {syntaxErrors.get(originalIndex)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeExpression(originalIndex)}
                        className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors self-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            </>
          ) : (
            <p className="text-teal-700 text-sm italic text-center py-4">No expressions defined. Add expressions to calculate results.</p>
          )}
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => addExpression('expr')}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded transition-colors flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>Add Expression</span>
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
