import Decimal from 'decimal.js';
import { SecurityError, EvaluationError } from './errors.js';
import { isNamespaceHead } from './namespaces.js';
import { getErrorMessage } from './error-messages.js';

// Dangerous properties that should never be accessible
const DANGEROUS_PROPERTIES = new Set([
  'prototype',
  '__proto__',
  'constructor',
]);

// Check if a property name is safe to access
const isSafeProperty = (propertyName: string): boolean => {
  // Block dangerous properties
  if (DANGEROUS_PROPERTIES.has(propertyName)) {
    return false;
  }
  // Block any property starting with __
  if (propertyName.startsWith('__')) {
    return false;
  }
  return true;
};

// Custom AST evaluator that uses Decimal for all numeric operations
// Security: Only evaluates whitelisted node types, no arbitrary code execution
export const evaluateAST = async (node: any, context: Record<string, any>): Promise<any> => {
  switch (node.type) {
    case 'Literal':
      // Convert all numeric literals to Decimal for precision
      if (typeof node.value === 'number') {
        return new Decimal(node.raw || node.value);
      }
      return node.value;
      
    case 'Identifier':
      if (!(node.name in context)) {
        throw new EvaluationError(getErrorMessage('UNDEFINED_VARIABLE', { name: node.name }));
      }
      return context[node.name];
      
    case 'MemberExpression':
      const object = await evaluateAST(node.object, context);
      if (object === null || object === undefined) {
        throw new EvaluationError(getErrorMessage('CANNOT_ACCESS_PROPERTY', { value: object }));
      }
      
      let propertyName: string;
      if (node.computed) {
        const property = await evaluateAST(node.property, context);
        propertyName = String(property);
      } else {
        propertyName = node.property.name;
      }
      
      // Security check: block dangerous property access
      if (!isSafeProperty(propertyName)) {
        throw new SecurityError(
          getErrorMessage('PROPERTY_ACCESS_DENIED', { property: propertyName }),
          propertyName
        );
      }
      
      return object[propertyName];
      
    case 'BinaryExpression':
      const left = await evaluateAST(node.left, context);
      const right = await evaluateAST(node.right, context);
      return evaluateBinaryOp(node.operator, left, right);
      
    case 'UnaryExpression':
      const argument = await evaluateAST(node.argument, context);
      return evaluateUnaryOp(node.operator, argument);
      
    case 'CallExpression':
      const callee = await evaluateAST(node.callee, context);
      const args = [];
      for (const arg of node.arguments) {
        args.push(await evaluateAST(arg, context));
      }
      if (typeof callee !== 'function') {
        throw new EvaluationError(getErrorMessage('CALLEE_NOT_FUNCTION'));
      }
      // Get the correct 'this' context for method calls
      let thisArg = null;
      if (node.callee.type === 'MemberExpression') {
        thisArg = await evaluateAST(node.callee.object, context);
      }
      return callee.apply(thisArg, args);
      
    case 'ConditionalExpression':
      const test = await evaluateAST(node.test, context);
      return test ? await evaluateAST(node.consequent, context) : await evaluateAST(node.alternate, context);
      
    case 'LogicalExpression':
      const leftLog = await evaluateAST(node.left, context);
      if (node.operator === '&&') {
        return leftLog ? await evaluateAST(node.right, context) : leftLog;
      } else if (node.operator === '||') {
        return leftLog ? leftLog : await evaluateAST(node.right, context);
      } else if (node.operator === '??') {
        return leftLog != null ? leftLog : await evaluateAST(node.right, context);
      }
      throw new EvaluationError(getErrorMessage('UNSUPPORTED_LOGICAL_OPERATOR', { operator: node.operator }));
      
    default:
      throw new EvaluationError(getErrorMessage('UNSUPPORTED_NODE_TYPE', { type: node.type }));
  }
};

// Evaluate binary operations with Decimal support
// Evaluate binary operations with Decimal support
const evaluateBinaryOp = (operator: string, left: any, right: any): any => {
  // Check for namespace heads in binary operations
  if (isNamespaceHead(left) || isNamespaceHead(right)) {
    throw new EvaluationError(
      getErrorMessage('NAMESPACE_HEAD_IN_OPERATION')
    );
  }
  
  // Type validation for arithmetic and comparison operators
  const arithmeticOps = ['+', '-', '*', '/', '%', '**'];
  const comparisonOps = ['<', '>', '<=', '>='];
  
  if (arithmeticOps.includes(operator) || comparisonOps.includes(operator)) {
    // Check left operand
    if (typeof left === 'string') {
      throw new EvaluationError(
        getErrorMessage('STRING_IN_OPERATION', { operator })
      );
    }
    if (typeof left === 'object' && left !== null && !(left instanceof Decimal) && !Array.isArray(left)) {
      throw new EvaluationError(
        getErrorMessage('OBJECT_IN_OPERATION', { operator })
      );
    }
    if (Array.isArray(left)) {
      throw new EvaluationError(
        getErrorMessage('ARRAY_IN_OPERATION', { operator })
      );
    }
    
    // Check right operand
    if (typeof right === 'string') {
      throw new EvaluationError(
        getErrorMessage('STRING_IN_OPERATION', { operator })
      );
    }
    if (typeof right === 'object' && right !== null && !(right instanceof Decimal) && !Array.isArray(right)) {
      throw new EvaluationError(
        getErrorMessage('OBJECT_IN_OPERATION', { operator })
      );
    }
    if (Array.isArray(right)) {
      throw new EvaluationError(
        getErrorMessage('ARRAY_IN_OPERATION', { operator })
      );
    }
  }
  
  // For equality operators, allow any types but provide clear semantics
  if (operator === '==' || operator === '=' || operator === '!=') {
    // Decimals: use Decimal.eq()
    if (left instanceof Decimal && right instanceof Decimal) {
      const equal = left.eq(right);
      return operator === '!=' ? !equal : equal;
    }
    
    // Booleans and null: use === for type-safe comparison
    if (typeof left === 'boolean' || left === null || 
        typeof right === 'boolean' || right === null) {
      const equal = left === right;
      return operator === '!=' ? !equal : equal;
    }
    
    // Different types or mixed types: use == for compatibility
    const equal = left == right;
    return operator === '!=' ? !equal : equal;
  }
  
  const toDecimal = (val: any): Decimal => {
    if (val instanceof Decimal) return val;
    return new Decimal(val);
  };
  
  switch (operator) {
    case '+':
      return toDecimal(left).plus(toDecimal(right));
    case '-':
      return toDecimal(left).minus(toDecimal(right));
    case '*':
      return toDecimal(left).times(toDecimal(right));
    case '/':
      return toDecimal(left).div(toDecimal(right));
    case '%':
      return toDecimal(left).mod(toDecimal(right));
    case '**':
      return toDecimal(left).pow(toDecimal(right));
    case '<':
      return toDecimal(left).lt(toDecimal(right));
    case '>':
      return toDecimal(left).gt(toDecimal(right));
    case '<=':
      return toDecimal(left).lte(toDecimal(right));
    case '>=':
      return toDecimal(left).gte(toDecimal(right));
    default:
      throw new EvaluationError(getErrorMessage('UNSUPPORTED_BINARY_OPERATOR', { operator }));
  }
};

// Evaluate unary operations
const evaluateUnaryOp = (operator: string, argument: any): any => {
  switch (operator) {
    case '-':
    case '+':
      // Type validation for unary arithmetic operators
      if (typeof argument === 'string') {
        throw new EvaluationError(
          getErrorMessage('STRING_WITH_UNARY', { operator })
        );
      }
      if (typeof argument === 'object' && argument !== null && !(argument instanceof Decimal) && !Array.isArray(argument)) {
        throw new EvaluationError(
          getErrorMessage('OBJECT_WITH_UNARY', { operator })
        );
      }
      if (Array.isArray(argument)) {
        throw new EvaluationError(
          getErrorMessage('ARRAY_WITH_UNARY', { operator })
        );
      }
      
      if (operator === '-') {
        if (argument instanceof Decimal) {
          return argument.neg();
        }
        return -argument;
      } else {
        if (argument instanceof Decimal) {
          return argument;
        }
        return +argument;
      }
    case '!':
      return !argument;
    default:
      throw new EvaluationError(getErrorMessage('UNSUPPORTED_UNARY_OPERATOR', { operator }));
  }
};
