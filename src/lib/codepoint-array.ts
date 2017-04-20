import {ucs2} from "punycode";
import {nfc as unormNfc} from "unorm";
import {LowerCaseError} from "./errors/case-error";
import {MaxLengthError} from "./errors/max-length-error";
import {MinLengthError} from "./errors/min-length-error";
import {TrimError} from "./errors/not-trimmed-error";
import {PatternError} from "./errors/pattern-error";
import {IncidentTypeError} from "./errors/unexpected-type-error";
import {checkedUcs2Decode} from "./helpers/checked-ucs2-decode";
import {
  SerializableTypeAsync,
  SerializableTypeSync,
  VersionedTypeAsync,
  VersionedTypeSync
} from "./interfaces";

export const NAME: string = "codepoint-array";

export enum Normalization {
  None,
  Nfc
}

// TODO: There should be a way to have code-point length and unicode RegExp, without blocking unmatched halves
// (But then, we can't serialize as a string due to ambiguity)
export interface CodepointArrayOptions {
  /**
   * Ensure NFC normalization when reading strings.
   *
   * References:
   * - http://unicode.org/faq/normalization.html
   * - http://unicode.org/reports/tr15/
   */
  normalization?: Normalization;

  enforceUnicodeRegExp?: boolean;

  // TODO(demurgos): Rename to `pattern`
  regex?: RegExp | null;

  lowerCase?: boolean;

  /**
   * The string cannot start or end with any of the following whitespace and line terminator
   * characters:
   *
   * - Unicode Character 'CHARACTER TABULATION' (U+0009)
   * - Unicode Character 'LINE FEED (LF)' (U+000A)
   * - Unicode Character 'LINE TABULATION' (U+000B)
   * - Unicode Character 'FORM FEED (FF)' (U+000C)
   * - Unicode Character 'CARRIAGE RETURN (CR)' (U+000D)
   * - Unicode Character 'SPACE' (U+0020)
   * - Unicode Character 'NO-BREAK SPACE' (U+00A0)
   * - Unicode Character 'LINE SEPARATOR' (U+2028)
   * - Unicode Character 'PARAGRAPH SEPARATOR' (U+2029)
   * - Unicode Character 'ZERO WIDTH NO-BREAK SPACE' (U+FEFF)
   * - Any other Unicode character of the "Separator, space" (Zs) general category
   *
   * @see <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim>
   * @see <http://www.fileformat.info/info/unicode/category/Zs/list.htm>
   */
  trimmed?: boolean;
  minLength?: number | null;
  maxLength?: number | null;
}

export interface CompleteCodepointArrayOptions extends CodepointArrayOptions {
  normalization: Normalization;

  enforceUnicodeRegExp: boolean;

  /**
   * @see [[Ucs2StringOptions.regex]]
   */
  regex: RegExp | null;
  lowerCase: boolean;

  /**
   * @see [[Ucs2StringOptions.trimmed]]
   */
  trimmed: boolean;
  minLength: number | null;
  maxLength: number | null;
}

const DEFAULT_OPTIONS: CompleteCodepointArrayOptions = {
  normalization: Normalization.Nfc,
  enforceUnicodeRegExp: true,
  regex: null,
  lowerCase: false,
  trimmed: false,
  minLength: null,
  maxLength: null
};

function readSync(format: "json-doc" | "bson-doc", val: any, options: CodepointArrayOptions): number[] {
  let valStr: string = String(val);

  switch (options.normalization) {
    case Normalization.Nfc:
      valStr = unormNfc(valStr);
      break;
    case Normalization.None:
      break;
  }

  if (options.lowerCase) {
    valStr = valStr.toLowerCase();
  }

  if (options.trimmed) {
    valStr = valStr.trim();
  }

  // TODO: Possibility to opt-out of the check
  const codepoints: number[] = checkedUcs2Decode(val);

  const error: Error | null = testErrorSync(codepoints, options);
  if (error !== null) {
    throw error;
  }

  return codepoints;
}

function readTrustedSync(format: "json-doc" | "bson-doc", val: string): number[] {
  return ucs2.decode(val);
}

function writeSync(format: "json-doc" | "bson-doc", val: number[]): string {
  return ucs2.encode(val);
}

function testErrorSync(val: number[], options: CodepointArrayOptions): Error | null {
  if (!Array.isArray(val)) {
    return new IncidentTypeError("array", val);
  }
  let valStr: string;
  try {
    valStr = ucs2.encode(val);
    // TODO: Possibility to opt-out of the check for unmatched surrogate halves
    // TODO: Do not encode / decode just to check for unmatched surrogate halves
    checkedUcs2Decode(valStr);
  } catch (err) {
    return err;
  }

  // TODO: normalization

  if (options.lowerCase) {
    if (valStr !== valStr.toLowerCase()) {
      return new LowerCaseError(valStr);
    }
  }

  if (options.trimmed) {
    if (valStr !== valStr.trim()) {
      return new TrimError(valStr);
    }
  }

  const valLen: number = val.length;

  const minLength: number | null | undefined = options.minLength;
  if (typeof minLength === "number" && valLen < minLength) {
    return new MinLengthError(val, minLength);
  }

  const maxLength: number | null | undefined = options.maxLength;
  if (typeof maxLength === "number" && valLen > maxLength) {
    return new MaxLengthError(val, maxLength);
  }

  if (options.regex instanceof RegExp) {
    if (!options.regex.unicode && options.enforceUnicodeRegExp) {
      throw new Error("Enforced unicode RegExp");
    }

    if (!options.regex.test(valStr)) {
      return new PatternError(valStr, options.regex);
    }
  }

  return null;
}

function testSync(val: number[], options: CodepointArrayOptions): boolean {
  return testErrorSync(val, options) === null;
}

function equalsSync(val1: number[], val2: number[]): boolean {
  if (val1.length !== val2.length) {
    return false;
  }
  const len: number = val1.length;
  for (let i: number = 0; i < len; i++) {
    if (val1[i] !== val2[i]) {
      return false;
    }
  }
  return true;
}

function cloneSync(val: number[]): number[] {
  return [...val];
}

function diffSync(oldVal: number[], newVal: number[]): [string, string] | null {
  const oldValStr: string = ucs2.encode(oldVal);
  const newValStr: string = ucs2.encode(newVal);
  return oldValStr === newValStr ? null : [oldValStr, newValStr];
}

function patchSync(oldVal: number[], diff: [string, string] | null): number[] {
  return diff === null ? [...oldVal] : ucs2.decode(diff[1]);
}

function reverseDiffSync(diff: [string, string] | null): [string, string] | null {
  return diff === null ? null : [diff[1], diff[0]];
}

function squashSync(diff1: [string, string] | null, diff2: [string, string] | null): [string, string] | null {
  if (diff1 === null) {
    return diff2 === null ? null : diff2;
  } else {
    return diff2 === null ? diff1 : [diff1[0], diff2[1]];
  }
}

export class CodepointArrayType implements SerializableTypeSync<number[], "bson-doc", string>,
  VersionedTypeSync<number[], string, [string, string]>,
  SerializableTypeAsync<number[], "bson-doc", string>,
  VersionedTypeAsync<number[], string, [string, string]> {

  isSync: true = true;
  isAsync: true = true;
  isSerializable: true = true;
  isVersioned: true = true;
  isCollection: false = false;
  type: string = NAME;
  types: string[] = [NAME];

  options: CompleteCodepointArrayOptions;

  constructor(options?: CodepointArrayOptions) {
    this.options = {...DEFAULT_OPTIONS, ...options};
  }

  // TODO: Check how RegExp are handled
  toJSON(): { type: "codepoint-array" } & CompleteCodepointArrayOptions {
    return {...this.options, type: "codepoint-array"};
  }

  readTrustedSync(format: "json-doc" | "bson-doc", val: string): number[] {
    return readTrustedSync(format, val);
  }

  async readTrustedAsync(format: "bson-doc" | "json-doc", val: string): Promise<number[]> {
    return readTrustedSync(format, val);
  }

  readSync(format: "json-doc" | "bson-doc", val: string): number[] {
    return readSync(format, val, this.options);
  }

  async readAsync(format: "json-doc" | "bson-doc", val: string): Promise<number[]> {
    return readSync(format, val, this.options);
  }

  writeSync(format: "json-doc" | "bson-doc", val: number[]): string {
    return writeSync(format, val);
  }

  async writeAsync(format: "json-doc" | "bson-doc", val: number[]): Promise<string> {
    return writeSync(format, val);
  }

  testErrorSync(val: any): Error | null {
    return testErrorSync(val, this.options);
  }

  async testErrorAsync(val: any): Promise<Error | null> {
    return testErrorSync(val, this.options);
  }

  testSync(val: any): boolean {
    return testSync(val, this.options);
  }

  async testAsync(val: any): Promise<boolean> {
    return testSync(val, this.options);
  }

  equalsSync(val1: number[], val2: number[]): boolean {
    return equalsSync(val1, val2);
  }

  async equalsAsync(val1: number[], val2: number[]): Promise<boolean> {
    return equalsSync(val1, val2);
  }

  cloneSync(val: number[]): number[] {
    return cloneSync(val);
  }

  async cloneAsync(val: number[]): Promise<number[]> {
    return cloneSync(val);
  }

  diffSync(oldVal: number[], newVal: number[]): [string, string] | null {
    return diffSync(oldVal, newVal);
  }

  async diffAsync(oldVal: number[], newVal: number[]): Promise<[string, string] | null> {
    return diffSync(oldVal, newVal);
  }

  patchSync(oldVal: number[], diff: [string, string] | null): number[] {
    return patchSync(oldVal, diff);
  }

  async patchAsync(oldVal: number[], diff: [string, string] | null): Promise<number[]> {
    return patchSync(oldVal, diff);
  }

  reverseDiffSync(diff: [string, string] | null): [string, string] | null {
    return reverseDiffSync(diff);
  }

  async reverseDiffAsync(diff: [string, string] | null): Promise<[string, string] | null> {
    return reverseDiffSync(diff);
  }

  squashSync(diff1: [string, string] | null, diff2: [string, string] | null): [string, string] | null {
    return squashSync(diff1, diff2);
  }

  async squashAsync(diff1: [string, string] | null, diff2: [string, string] | null): Promise<[string, string] | null> {
    return squashSync(diff1, diff2);
  }
}
