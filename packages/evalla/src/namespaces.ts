import Decimal from 'decimal.js';

// Helper to ensure value is a Decimal
const toDecimal = (x: any): Decimal => {
  if (x instanceof Decimal) return x;
  return new Decimal(x);
};

// Symbol to mark namespace head objects
const NAMESPACE_HEAD_MARKER = Symbol('NAMESPACE_HEAD');

// Check if a value is a namespace head
export const isNamespaceHead = (value: any): boolean => {
  return value != null && typeof value === 'object' && value[NAMESPACE_HEAD_MARKER] === true;
};

// Safe, whitelisted namespaces only - security first
export const createNamespaces = () => {
  // Use Object.create(null) to prevent prototype pollution
  const namespaces = Object.create(null);

  // $math namespace - mathematical constants and functions
  namespaces.$math = Object.create(null);
  namespaces.$math[NAMESPACE_HEAD_MARKER] = true;
  // Use Decimal.js methods for maximum precision as recommended in docs
  namespaces.$math.PI = new Decimal(-1).acos(); // Decimal.acos(-1) gives precise PI
  namespaces.$math.E = new Decimal(1).exp(); // e^1 gives precise E
  namespaces.$math.SQRT2 = new Decimal(2).sqrt();
  namespaces.$math.SQRT1_2 = new Decimal(0.5).sqrt();
  namespaces.$math.LN2 = new Decimal(2).ln();
  namespaces.$math.LN10 = new Decimal(10).ln();
  namespaces.$math.LOG2E = namespaces.$math.E.log(2);
  namespaces.$math.LOG10E = namespaces.$math.E.log(10);
  
  // Safe math functions wrapped with Decimal
  namespaces.$math.abs = (x: any) => toDecimal(x).abs();
  namespaces.$math.sqrt = (x: any) => toDecimal(x).sqrt();
  namespaces.$math.cbrt = (x: any) => toDecimal(x).cbrt();
  namespaces.$math.floor = (x: any) => toDecimal(x).floor();
  namespaces.$math.ceil = (x: any) => toDecimal(x).ceil();
  namespaces.$math.round = (x: any) => toDecimal(x).round();
  namespaces.$math.trunc = (x: any) => toDecimal(x).trunc();
  namespaces.$math.sin = (x: any) => new Decimal(Math.sin(toDecimal(x).toNumber()));
  namespaces.$math.cos = (x: any) => new Decimal(Math.cos(toDecimal(x).toNumber()));
  namespaces.$math.tan = (x: any) => new Decimal(Math.tan(toDecimal(x).toNumber()));
  namespaces.$math.asin = (x: any) => new Decimal(Math.asin(toDecimal(x).toNumber()));
  namespaces.$math.acos = (x: any) => new Decimal(Math.acos(toDecimal(x).toNumber()));
  namespaces.$math.atan = (x: any) => new Decimal(Math.atan(toDecimal(x).toNumber()));
  namespaces.$math.atan2 = (y: any, x: any) => new Decimal(Math.atan2(toDecimal(y).toNumber(), toDecimal(x).toNumber()));
  namespaces.$math.exp = (x: any) => toDecimal(x).exp();
  namespaces.$math.ln = (x: any) => toDecimal(x).ln();
  namespaces.$math.log = (x: any) => toDecimal(x).log();
  namespaces.$math.log10 = (x: any) => toDecimal(x).log(10);
  namespaces.$math.log2 = (x: any) => toDecimal(x).log(2);
  namespaces.$math.pow = (x: any, y: any) => toDecimal(x).pow(toDecimal(y));
  namespaces.$math.min = (...args: any[]) => Decimal.min(...args.map(toDecimal));
  namespaces.$math.max = (...args: any[]) => Decimal.max(...args.map(toDecimal));

  // $unit namespace - unit conversions
  namespaces.$unit = Object.create(null);
  namespaces.$unit[NAMESPACE_HEAD_MARKER] = true;
  namespaces.$unit.mmToInch = (x: any) => toDecimal(x).div(25.4);
  namespaces.$unit.inchToMm = (x: any) => toDecimal(x).mul(25.4);
  namespaces.$unit.cmToInch = (x: any) => toDecimal(x).div(2.54);
  namespaces.$unit.inchToCm = (x: any) => toDecimal(x).mul(2.54);
  namespaces.$unit.mToFt = (x: any) => toDecimal(x).mul(3.28084);
  namespaces.$unit.ftToM = (x: any) => toDecimal(x).div(3.28084);

  // $angle namespace - angle conversions
  namespaces.$angle = Object.create(null);
  namespaces.$angle[NAMESPACE_HEAD_MARKER] = true;
  // Use precise PI from $math namespace for angle conversions
  namespaces.$angle.toRad = (deg: any) => toDecimal(deg).mul(namespaces.$math.PI).div(180);
  namespaces.$angle.toDeg = (rad: any) => toDecimal(rad).mul(180).div(namespaces.$math.PI);

  return namespaces;
};
