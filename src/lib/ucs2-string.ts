import {ucs2} from "punycode";
import {nfc as unormNfc} from "unorm";
import {LowerCaseError} from "./errors/case-error";
import {MaxLengthError} from "./errors/max-length-error";
import {MinLengthError} from "./errors/min-length-error";
import {TrimError} from "./errors/not-trimmed-error";
import {PatternError} from "./errors/pattern-error";
import {IncidentTypeError} from "./errors/unexpected-type-error";
import {
  SerializableTypeAsync,
  SerializableTypeSync,
  VersionedTypeAsync,
  VersionedTypeSync
} from "./interfaces";

export const NAME: string = "ucs2-string";

export interface Ucs2StringOptions {
  allowUnicodeRegExp?: boolean;

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

export interface CompleteUcs2StringOptions extends Ucs2StringOptions {
  allowUnicodeRegExp: boolean;

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

const DEFAULT_OPTIONS: CompleteUcs2StringOptions = {
  allowUnicodeRegExp: false,
  regex: null,
  lowerCase: false,
  trimmed: false,
  minLength: null,
  maxLength: null
};

function readSync(format: "json-doc" | "bson-doc", val: any, options: Ucs2StringOptions): string {
  let valStr: string = String(val);

  if (options.lowerCase) {
    valStr = valStr.toLowerCase();
  }

  if (options.trimmed) {
    valStr = valStr.trim();
  }

  const error: Error | null = testErrorSync(valStr, options);
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

function testErrorSync(val: any, options: Ucs2StringOptions) {
  if (!(typeof val === "string")) {
    return new IncidentTypeError("string", val);
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

  const strLen: number = val.length;

  const minLength: number | null | undefined = options.minLength;
  if (typeof minLength === "number" && strLen < minLength) {
    return new MinLengthError(val, minLength);
  }

  const maxLength: number | null | undefined = options.maxLength;
  if (typeof maxLength === "number" && strLen > maxLength) {
    return new MaxLengthError(val, maxLength);
  }

  if (options.regex instanceof RegExp) {
    if (options.regex.unicode && !options.allowUnicodeRegExp) {
      throw new Error("Disallowed unicode RegExp, use `allowUnicodeRegExp` or `CodepointStringType`");
    }

    if (!options.regex.test(val)) {
      return new PatternError(val, options.regex);
    }
  }

  return null;
}

function testSync(val: string, options: Ucs2StringOptions): boolean {
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

/**
 * The type used for simple Javascript strings.
 * Javascript strings expose characters as UCS2 code units. This is a fixed-size encoding that supports the unicode
 * codepoints from U+000000 to U+00FFFF (Basic Multilingual Plane or BMP). Displaying larger codepoints is
 * a property of the environment based on UTF-16 surrogate pairs. Unicode does not, and will never, assign
 * characters to the codepoints from U+OOD800 to U+00DFFF. These spare codepoints allows UTF16 to combine
 * codeunits from 0xd800 to 0xdfff in pairs (called surrogate pairs) to represent codepoints from supplementary planes.
 * This transformation happens during the transition from codeunits to codepoints in UTF-16.
 * In UCS2, the codeunits from 0xd800 to 0xdfff directly produce codepoints in the range from U+OOD8OO to
 * U+OODFF. Then, the display might merge these codepoints into higher codepoints during the rendering.
 *
 *
 * Lets take an example (all the numbers are in hexadecimal):
 *
 * ```
 *                                         +---+---+---+---+---+---+
 * Bytes                                   | 00| 41| d8| 34| dd| 1e|
 *                                         +---+---+---+---+---+---+
 * UTF-16BE codeunits                      | 0x0041| 0xd834| 0xdd1e|
 *                                         +-------+-------+-------+
 * Codepoints (from UTF-16BE)              |  U+41 |   U+01D11E    |
 *                                         +-------+---------------+
 * Displayed (from UTF-16BE)               |   A   |       𝄞       |
 *                                         +-------+-------+-------+
 * UCS2 codeunits                          | 0x0041| 0xd834| 0xdd1e|
 *                                         +-------+-------+-------+
 * Codepoints (from UCS2BE)                |  U+41 | U+D834| U+DD1E|  <- This is what Javascript sees
 *                                         +-------+-------+-------+
 * Displayed (from UCS2BE)                 |   A   |   �   |   �   |  <- This is what the user may see
 *                                         +-------+-------+-------+
 * Displayed (from UCS2BE with surrogates) |   A   |       𝄞       |  <- This is what the user may see
 *                                         +-------+---------------+
 * ```
 *
 * The most important takeaway is that codepoints outside of the BMP are a property of the display, not of
 * the Javscript string.
 * This is the cause of multiple issues.
 * - Surrogate halves are exposed as distinct characters: `"𝄞".length === 2`
 * - Unmatched surrogate halves are allowed: `"\ud834"`
 * - Surrogate pairs in the wrong order are allowed: `"\udd1e\ud834"`
 *
 * If you need to support the full unicode range by manipulating codepoints instead of UCS2 character codes, you may
 * want to use CodepointString or CodepointArray instead of Ucs2String.
 *
 * PS: This type does not deal with Unicdoe normalization either. Use CodepointString and CodepointArray if you need
 * it.
 */
export class Ucs2StringType implements
  SerializableTypeSync<string, "bson-doc", string>,
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

  options: CompleteUcs2StringOptions;

  constructor(options?: Ucs2StringOptions) {
    this.options = {...DEFAULT_OPTIONS, ...options};
  }

  // TODO: Check how RegExp are handled
  toJSON(): {type: "ucs2-string"} & CompleteUcs2StringOptions {
    return {...this.options, type: "ucs2-string"};
  }

  readTrustedSync(format: "json-doc" | "bson-doc", val: any): string {
    return readTrustedSync(format, val);
  }

  async readTrustedAsync(format: "json-doc", val: string): Promise<string>;
  async readTrustedAsync(format: "bson-doc", val: string): Promise<string>;
  async readTrustedAsync(format: any, val: any): Promise<any> {
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
