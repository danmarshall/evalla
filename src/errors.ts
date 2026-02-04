// Custom error classes for evalla

export class EvallaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EvallaError';
    Object.setPrototypeOf(this, EvallaError.prototype);
  }
}

export class SecurityError extends EvallaError {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class CircularDependencyError extends EvallaError {
  constructor(message: string) {
    super(message);
    this.name = 'CircularDependencyError';
    Object.setPrototypeOf(this, CircularDependencyError.prototype);
  }
}

export class ValidationError extends EvallaError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class EvaluationError extends EvallaError {
  constructor(message: string) {
    super(message);
    this.name = 'EvaluationError';
    Object.setPrototypeOf(this, EvaluationError.prototype);
  }
}
