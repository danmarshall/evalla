import Decimal from 'decimal.js';

// Helper to ensure value is a Decimal
const toDecimal = (x: any): Decimal => {
  if (x instanceof Decimal) return x;
  return new Decimal(x);
};

// Safe, whitelisted namespaces only - security first
export const createNamespaces = () => {
  // Use Object.create(null) to prevent prototype pollution
  const namespaces = Object.create(null);

  // $math namespace - mathematical constants and functions
  namespaces.$math = Object.create(null);
  namespaces.$math.PI = new Decimal(Math.PI);
  namespaces.$math.E = new Decimal(Math.E);
  namespaces.$math.SQRT2 = new Decimal(Math.SQRT2);
  namespaces.$math.SQRT1_2 = new Decimal(Math.SQRT1_2);
  namespaces.$math.LN2 = new Decimal(Math.LN2);
  namespaces.$math.LN10 = new Decimal(Math.LN10);
  namespaces.$math.LOG2E = new Decimal(Math.LOG2E);
  namespaces.$math.LOG10E = new Decimal(Math.LOG10E);
  
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
  namespaces.$unit.mmToInch = (x: any) => toDecimal(x).div(25.4);
  namespaces.$unit.inchToMm = (x: any) => toDecimal(x).mul(25.4);
  namespaces.$unit.cmToInch = (x: any) => toDecimal(x).div(2.54);
  namespaces.$unit.inchToCm = (x: any) => toDecimal(x).mul(2.54);
  namespaces.$unit.mToFt = (x: any) => toDecimal(x).mul(3.28084);
  namespaces.$unit.ftToM = (x: any) => toDecimal(x).div(3.28084);

  // $angle namespace - angle conversions
  namespaces.$angle = Object.create(null);
  namespaces.$angle.toRad = (deg: any) => toDecimal(deg).mul(Math.PI).div(180);
  namespaces.$angle.toDeg = (rad: any) => toDecimal(rad).mul(180).div(Math.PI);

  return namespaces;
};
