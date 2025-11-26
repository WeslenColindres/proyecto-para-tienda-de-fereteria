declare module 'csv-parser' {
  import type { Transform } from 'node:stream';

  interface CsvParserOptions {
    separator?: string;
    headers?: string[] | boolean;
    mapHeaders?: (args: { header: string; index: number }) => string | null;
    skipLines?: number;
    strict?: boolean;
    maxRowBytes?: number;
    escape?: string;
    newline?: string;
    quote?: string;
    raw?: boolean;
    skipComments?: boolean;
    trim?: boolean;
  }

  export default function csvParser(options?: CsvParserOptions): Transform;
}
