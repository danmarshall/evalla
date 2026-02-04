// Type definitions for the Peggy-generated parser
export interface SyntaxError extends Error {
  location: {
    start: { offset: number; line: number; column: number };
    end: { offset: number; line: number; column: number };
  };
}

export function parse(input: string): any;
