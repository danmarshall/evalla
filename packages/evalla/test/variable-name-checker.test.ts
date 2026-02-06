import { checkVariableName, VariableNameCheckResult } from '../src/index';

describe('checkVariableName - Variable Name Validation', () => {
  describe('Valid variable names', () => {
    it('should accept simple alphanumeric names', () => {
      expect(checkVariableName('myVar').valid).toBe(true);
      expect(checkVariableName('variable1').valid).toBe(true);
      expect(checkVariableName('_private').valid).toBe(true);
      expect(checkVariableName('camelCase').valid).toBe(true);
      expect(checkVariableName('snake_case').valid).toBe(true);
    });

    it('should accept names with underscores (but not __ prefix)', () => {
      expect(checkVariableName('_var').valid).toBe(true);
      expect(checkVariableName('var_name').valid).toBe(true);
      expect(checkVariableName('_').valid).toBe(true);
    });

    it('should accept names with dollar signs in middle or end', () => {
      expect(checkVariableName('my$var').valid).toBe(true);
      expect(checkVariableName('var$').valid).toBe(true);
    });
  });

  describe('Invalid variable names - $ prefix', () => {
    it('should reject names starting with $', () => {
      const result = checkVariableName('$myVar');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Variable names cannot start with $ (reserved for system namespaces)');
    });

    it('should reject system namespace names', () => {
      expect(checkVariableName('$math').valid).toBe(false);
      expect(checkVariableName('$unit').valid).toBe(false);
      expect(checkVariableName('$angle').valid).toBe(false);
    });
  });

  describe('Invalid variable names - __ prefix', () => {
    it('should reject names starting with __', () => {
      const result = checkVariableName('__private');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Variable names cannot start with __ (reserved for security reasons)');
    });

    it('should reject __ prefix with any continuation', () => {
      expect(checkVariableName('__proto__').valid).toBe(false);
      expect(checkVariableName('__').valid).toBe(false);
    });
  });

  describe('Invalid variable names - reserved values', () => {
    it('should reject "true"', () => {
      const result = checkVariableName('true');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Variable name cannot be a reserved value: true');
    });

    it('should reject "false"', () => {
      const result = checkVariableName('false');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Variable name cannot be a reserved value: false');
    });

    it('should reject "null"', () => {
      const result = checkVariableName('null');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Variable name cannot be a reserved value: null');
    });

    it('should reject "Infinity"', () => {
      const result = checkVariableName('Infinity');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Variable name cannot be a reserved value: Infinity');
    });
  });

  describe('Invalid variable names - starts with number', () => {
    it('should reject names starting with digits', () => {
      const result = checkVariableName('9invalid');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Variable names cannot start with a number');
    });

    it('should reject various number prefixes', () => {
      expect(checkVariableName('0var').valid).toBe(false);
      expect(checkVariableName('1').valid).toBe(false);
      expect(checkVariableName('123abc').valid).toBe(false);
    });
  });

  describe('Invalid variable names - contains dots', () => {
    it('should reject names with dots', () => {
      const result = checkVariableName('obj.prop');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Variable names cannot contain dots (dots are only for property access in expressions)');
    });

    it('should reject various dot patterns', () => {
      expect(checkVariableName('a.b').valid).toBe(false);
      expect(checkVariableName('nested.obj.prop').valid).toBe(false);
      expect(checkVariableName('.hidden').valid).toBe(false);
      expect(checkVariableName('end.').valid).toBe(false);
    });
  });

  describe('Invalid variable names - empty', () => {
    it('should reject empty string', () => {
      const result = checkVariableName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Variable name cannot be empty');
    });
  });

  describe('Invalid variable names - type validation', () => {
    it('should reject non-string inputs', () => {
      const result = checkVariableName(123 as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Variable name must be a string');
    });

    it('should reject various non-string types', () => {
      expect(checkVariableName(null as any).valid).toBe(false);
      expect(checkVariableName(undefined as any).valid).toBe(false);
      expect(checkVariableName({} as any).valid).toBe(false);
      expect(checkVariableName([] as any).valid).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should accept JavaScript reserved words (they are just math symbols in evalla)', () => {
      expect(checkVariableName('return').valid).toBe(true);
      expect(checkVariableName('if').valid).toBe(true);
      expect(checkVariableName('for').valid).toBe(true);
      expect(checkVariableName('while').valid).toBe(true);
      expect(checkVariableName('class').valid).toBe(true);
      expect(checkVariableName('function').valid).toBe(true);
    });

    it('should accept NaN (not reserved in evalla)', () => {
      expect(checkVariableName('NaN').valid).toBe(true);
    });

    it('should accept very long names', () => {
      const longName = 'a'.repeat(1000);
      expect(checkVariableName(longName).valid).toBe(true);
    });
  });

  describe('Return type validation', () => {
    it('should return correct structure for valid names', () => {
      const result: VariableNameCheckResult = checkVariableName('valid');
      expect(result).toHaveProperty('valid');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return correct structure for invalid names', () => {
      const result: VariableNameCheckResult = checkVariableName('$invalid');
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('error');
      expect(result.valid).toBe(false);
      expect(typeof result.error).toBe('string');
    });
  });
});
