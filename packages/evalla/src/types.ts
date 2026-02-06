import Decimal from 'decimal.js';

export interface ExpressionInput {
  name: string;
  expr?: string;
  value?: any;
}

export interface EvaluationResult {
  values: Record<string, Decimal | boolean | null>;
  order: string[];
}
