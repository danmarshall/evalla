import Decimal from 'decimal.js';
import { SecurityError, EvaluationError } from './errors';

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
        throw new EvaluationError(`Undefined variable: ${node.name}`);
      }
      return context[node.name];
      
    case 'MemberExpression':
      const object = await evaluateAST(node.object, context);
      if (object === null || object === undefined) {
        throw new EvaluationError(`Cannot access property of ${object}`);
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
          `Access to property "${propertyName}" is not allowed for security reasons`,
          propertyName
        );
      }
      
      return object[propertyName];
      
    case 'ObjectExpression':
      const obj: any = {};
      for (const prop of node.properties) {
        if (prop.type === 'Property') {
          const key = prop.key.type === 'Identifier' ? prop.key.name : await evaluateAST(prop.key, context);
          const value = await evaluateAST(prop.value, context);
          obj[key] = value;
        } else if (prop.type === 'SpreadElement') {
          const spread = await evaluateAST(prop.argument, context);
          Object.assign(obj, spread);
        }
      }
      return obj;
      
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
        throw new EvaluationError('Callee is not a function');
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
      throw new EvaluationError(`Unsupported logical operator: ${node.operator}`);
      
    case 'ArrayExpression':
      const array = [];
      for (const element of node.elements) {
        array.push(await evaluateAST(element, context));
      }
      return array;
      
    default:
      throw new EvaluationError(`Unsupported node type: ${node.type}`);
  }
};

// Evaluate binary operations with Decimal support
const evaluateBinaryOp = (operator: string, left: any, right: any): any => {
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
    case '==':
    case '===':
      if (left instanceof Decimal && right instanceof Decimal) {
        return left.eq(right);
      }
      return operator === '===' ? left === right : left == right;
    case '!=':
    case '!==':
      if (left instanceof Decimal && right instanceof Decimal) {
        return !left.eq(right);
      }
      return operator === '!==' ? left !== right : left != right;
    default:
      throw new EvaluationError(`Unsupported binary operator: ${operator}`);
  }
};

// Evaluate unary operations
const evaluateUnaryOp = (operator: string, argument: any): any => {
  switch (operator) {
    case '-':
      if (argument instanceof Decimal) {
        return argument.neg();
      }
      return -argument;
    case '+':
      if (argument instanceof Decimal) {
        return argument;
      }
      return +argument;
    case '!':
      return !argument;
    default:
      throw new EvaluationError(`Unsupported unary operator: ${operator}`);
  }
};
