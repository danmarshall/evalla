import { evalla, SecurityError, CircularDependencyError, ValidationError, EvaluationError } from '../src/index';

describe('Error Type Differentiation', () => {
  test('can catch SecurityError specifically', async () => {
    try {
      await evalla([
        { name: 'obj', value: { x: 10 } },
        { name: 'bad', expr: 'obj.prototype' }
      ]);
      fail('Should have thrown SecurityError');
    } catch (error) {
      expect(error).toBeInstanceOf(SecurityError);
      if (error instanceof Error) {
        expect(error.name).toBe('SecurityError');
        expect(error.message).toContain('prototype');
      }
    }
  });

  test('can catch CircularDependencyError specifically', async () => {
    try {
      await evalla([
        { name: 'a', expr: 'b + 1' },
        { name: 'b', expr: 'a + 1' }
      ]);
      fail('Should have thrown CircularDependencyError');
    } catch (error) {
      expect(error).toBeInstanceOf(CircularDependencyError);
      if (error instanceof Error) {
        expect(error.name).toBe('CircularDependencyError');
        expect(error.message).toContain('Circular dependency');
      }
    }
  });

  test('can catch ValidationError specifically', async () => {
    try {
      await evalla([
        { name: '$invalid', expr: '1' }
      ]);
      fail('Should have thrown ValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      if (error instanceof Error) {
        expect(error.name).toBe('ValidationError');
        expect(error.message).toContain('cannot start with $');
      }
    }
  });

  test('can catch EvaluationError specifically', async () => {
    try {
      await evalla([
        { name: 'result', expr: 'undefinedVar + 1' }
      ]);
      fail('Should have thrown EvaluationError');
    } catch (error) {
      expect(error).toBeInstanceOf(EvaluationError);
      if (error instanceof Error) {
        expect(error.name).toBe('EvaluationError');
        expect(error.message).toContain('Undefined variable');
      }
    }
  });

  test('can differentiate between error types programmatically', async () => {
    const testCases = [
      {
        input: [{ name: 'obj', value: {} }, { name: 'bad', expr: 'obj.constructor' }],
        expectedType: SecurityError,
        description: 'security issue'
      },
      {
        input: [{ name: 'a', expr: 'a + 1' }],
        expectedType: CircularDependencyError,
        description: 'circular dependency'
      },
      {
        input: [{ name: '' }],
        expectedType: ValidationError,
        description: 'validation error'
      }
    ];

    for (const testCase of testCases) {
      try {
        await evalla(testCase.input as any);
        fail(`Should have thrown error for ${testCase.description}`);
      } catch (error) {
        expect(error).toBeInstanceOf(testCase.expectedType);
        
        // Demonstrate programmatic error handling
        if (error instanceof SecurityError) {
          // Handle security errors differently
          expect(error.name).toBe('SecurityError');
        } else if (error instanceof CircularDependencyError) {
          // Handle circular dependencies differently
          expect(error.name).toBe('CircularDependencyError');
        } else if (error instanceof ValidationError) {
          // Handle validation errors differently
          expect(error.name).toBe('ValidationError');
        }
      }
    }
  });
});
