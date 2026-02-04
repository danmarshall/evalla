// Custom error classes for evalla

export class EvallaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EvallaError';
    Object.setPrototypeOf(this, EvallaError.prototype);
  }
}

export class SecurityError extends EvallaError {
  /** The property that was accessed */
  public readonly property?: string;

  constructor(message: string, property?: string) {
    super(message);
    this.name = 'SecurityError';
    this.property = property;
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class CircularDependencyError extends EvallaError {
  /** The cycle path (e.g., ['a', 'b', 'c', 'a']) */
  public readonly cycle?: string[];

  constructor(message: string, cycle?: string[]) {
    super(message);
    this.name = 'CircularDependencyError';
    this.cycle = cycle;
    Object.setPrototypeOf(this, CircularDependencyError.prototype);
  }
}

export class ValidationError extends EvallaError {
  /** The variable name that failed validation */
  public readonly variableName?: string;

  constructor(message: string, variableName?: string) {
    super(message);
    this.name = 'ValidationError';
    this.variableName = variableName;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class EvaluationError extends EvallaError {
  /** The variable name where evaluation failed */
  public readonly variableName?: string;

  constructor(message: string, variableName?: string) {
    super(message);
    this.name = 'EvaluationError';
    this.variableName = variableName;
    Object.setPrototypeOf(this, EvaluationError.prototype);
  }
}

export class ParseError extends EvaluationError {
  /** The expression that failed to parse */
  public readonly expression?: string;
  /** Line number where error occurred (1-indexed) */
  public readonly line?: number;
  /** Column number where error occurred (1-indexed) */
  public readonly column?: number;

  constructor(
    message: string,
    details?: {
      variableName?: string;
      expression?: string;
      line?: number;
      column?: number;
    }
  ) {
    super(message, details?.variableName);
    this.name = 'ParseError';
    this.expression = details?.expression;
    this.line = details?.line;
    this.column = details?.column;
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}
