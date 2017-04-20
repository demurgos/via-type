import {ucs2} from "punycode";
import {nfc as unormNfc} from "unorm";
import {LowerCaseError} from "./errors/case-error";
import {MaxCodepointLengthError} from "./errors/max-codepoint-length-error";
import {MinCodepointLengthError} from "./errors/min-codepoint-length-error";
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

export const NAME: string = "codepoint-string";

export enum Normalization {
  None,
  Nfc
}

// TODO: There should be a way to have code-point length and unicode RegExp, without blocking unmatched halves
export interface CodepointStringOptions {
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

export interface CompleteCodepointStringOptions extends CodepointStringOptions {
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

const DEFAULT_OPTIONS: CompleteCodepointStringOptions = {
  normalization: Normalization.Nfc,
  enforceUnicodeRegExp: true,
  regex: null,
  lowerCase: false,
  trimmed: false,
  minLength: null,
  maxLength: null
};

function readSync(format: "json-doc" | "bson-doc", val: any, options: CodepointStringOptions): string {
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

  const error: Error | null = testErrorSync(valStr, options, true);
  if (error !== null) {
    throw error;
  }
  return valStr;
}

function readTrustedSync(format: "json-doc" | "bson-doc", val: any): string {
  return val;
}

function writeSync(format: "json-doc" | "bson-doc", val: string): string {
  return val;
}

// TODO: Check normalization
function testErrorSync(val: any, options: CodepointStringOptions, trustNormalization: boolean = false) {
  if (!(typeof val === "string")) {
    return new IncidentTypeError("string", val);
  }

  if (!trustNormalization) {
    if (val !== unormNfc(val)) {
      return new Error("Wrong normalization");
    }
  }

  if (options.lowerCase) {
    if (val !== val.toLowerCase()) {
      return new LowerCaseError(val);
    }
  }

  if (options.trimmed) {
    if (val !== val.trim()) {
      return new TrimError(val);
    }
  }

  let cpLen: number;
  try {
    cpLen = checkedUcs2Decode(val).length;
  } catch (err) {
    return err;
  }

  const minLength: number | null | undefined = options.minLength;
  if (typeof minLength === "number" && cpLen < minLength) {
    return new MinCodepointLengthError(val, minLength);
  }

  const maxLength: number | null | undefined = options.maxLength;
  if (typeof maxLength === "number" && cpLen > maxLength) {
    return new MaxCodepointLengthError(val, maxLength);
  }

  if (options.regex instanceof RegExp) {
    if (!options.regex.unicode && options.enforceUnicodeRegExp) {
      throw new Error("Enforced unicode RegExp");
    }

    if (!options.regex.test(val)) {
      return new PatternError(val, options.regex);
    }
  }

  return null;
}

function testSync(val: string, options: CodepointStringOptions): boolean {
  return testErrorSync(val, options) === null;
}

function equalsSync(val1: string, val2: string): boolean {
  return val1 === val2;
}

function cloneSync(val: string): string {
  return val;
}

function diffSync(oldVal: string, newVal: string): [string, string] | null {
  return oldVal === newVal ? null : [oldVal, newVal];
}

function patchSync(oldVal: string, diff: [string, string] | null): string {
  return diff === null ? oldVal : diff[1];
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

export class CodepointStringType implements SerializableTypeSync<string, "bson-doc", string>,
  VersionedTypeSync<string, string, [string, string]>,
  SerializableTypeAsync<string, "bson-doc", string>,
  VersionedTypeAsync<string, string, [string, string]> {

  isSync: true = true;
  isAsync: true = true;
  isSerializable: true = true;
  isVersioned: true = true;
  isCollection: false = false;
  type: string = NAME;
  types: string[] = [NAME];

  options: CompleteCodepointStringOptions;

  constructor(options?: CodepointStringOptions) {
    this.options = {...DEFAULT_OPTIONS, ...options};
  }

  // TODO: Check how RegExp are handled
  toJSON(): { type: "codepoint-string" } & CompleteCodepointStringOptions {
    return {...this.options, type: "codepoint-string"};
  }

  readTrustedSync(format: "json-doc" | "bson-doc", val: any): string {
    return readTrustedSync(format, val);
  }

  async readTrustedAsync(format: "bson-doc" | "json-doc", val: string): Promise<string> {
    return readTrustedSync(format, val);
  }

  readSync(format: "json-doc" | "bson-doc", val: any): string {
    return readSync(format, val, this.options);
  }

  async readAsync(format: "json-doc" | "bson-doc", val: any): Promise<string> {
    return readSync(format, val, this.options);
  }

  writeSync(format: "json-doc" | "bson-doc", val: string): any {
    return writeSync(format, val);
  }

  async writeAsync(format: "json-doc" | "bson-doc", val: string): Promise<any> {
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

  equalsSync(val1: string, val2: string): boolean {
    return equalsSync(val1, val2);
  }

  async equalsAsync(val1: string, val2: string): Promise<boolean> {
    return equalsSync(val1, val2);
  }

  cloneSync(val: string): string {
    return cloneSync(val);
  }

  async cloneAsync(val: string): Promise<string> {
    return cloneSync(val);
  }

  diffSync(oldVal: string, newVal: string): [string, string] | null {
    return diffSync(oldVal, newVal);
  }

  async diffAsync(oldVal: string, newVal: string): Promise<[string, string] | null> {
    return diffSync(oldVal, newVal);
  }

  patchSync(oldVal: string, diff: [string, string] | null): string {
    return patchSync(oldVal, diff);
  }

  async patchAsync(oldVal: string, diff: [string, string] | null): Promise<string> {
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
