import {Incident} from "incident";
import {LowerCaseError} from "../errors/lower-case";
import {MaxUcs2StringLengthError} from "../errors/max-ucs2-string-length";
import {MinUcs2StringLengthError} from "../errors/min-ucs2-string-length";
import {NotTrimmedError} from "../errors/not-trimmed";
import {PatternNotMatchedError} from "../errors/pattern-not-matched";
import {UnknownFormatError} from "../errors/unknown-format";
import {WrongTypeError} from "../errors/wrong-type";
import {SerializableType, VersionedType} from "../interfaces";

export type Name = "ucs2-string";
export const name: Name = "ucs2-string";
export type T = string;
export namespace bson {
  export type Input = string;
  export type Output = string;
}
export namespace json {
  export type Input = string;
  export type Output = string;
  export interface Type {
    name: Name;
    allowUnicodeRegExp: boolean;
    pattern?: [string, string];
    lowerCase: boolean;
    /**
     * @see [[Options.trimmed]]
     */
    trimmed: boolean;
    minLength?: number;
    maxLength: number;
  }
}
export namespace qs {
  export type Input = string;
  export type Output = string;
}
export type Diff = [string, string];
export interface Options {
  allowUnicodeRegExp?: boolean;
  pattern?: RegExp;
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
  minLength?: number;
  maxLength: number;
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
export class Ucs2StringType
  implements VersionedType<T, json.Input, json.Output, Diff>,
    SerializableType<T, "bson", bson.Input, bson.Output>,
    SerializableType<T, "qs", qs.Input, qs.Output> {
  static fromJSON(options: json.Type): Ucs2StringType {
    const resolvedOptions: Options = {
      allowUnicodeRegExp: options.allowUnicodeRegExp,
      lowerCase: options.lowerCase,
      trimmed: options.trimmed,
      maxLength: options.maxLength
    };
    if (options.pattern !== undefined) {
      resolvedOptions.pattern = new RegExp(options.pattern[0], options.pattern[1]);
    }
    if (options.minLength !== undefined) {
      resolvedOptions.minLength = options.minLength;
    }
    return new Ucs2StringType(resolvedOptions);
  }

  readonly name: Name = name;
  readonly allowUnicodeRegExp: boolean;
  readonly pattern?: RegExp;
  readonly lowerCase: boolean;
  readonly trimmed: boolean;
  readonly minLength?: number;
  readonly maxLength: number;

  constructor(options: Options) {
    this.allowUnicodeRegExp = options.allowUnicodeRegExp !== undefined ? options.allowUnicodeRegExp : true;
    this.pattern = options.pattern;
    this.lowerCase = options.lowerCase !== undefined ? options.lowerCase : false;
    this.trimmed = options.trimmed !== undefined ? options.trimmed : false;
    this.minLength = options.minLength;
    this.maxLength = options.maxLength;
  }

  toJSON(): json.Type {
    const jsonType: json.Type = {
      name: name,
      allowUnicodeRegExp: this.allowUnicodeRegExp,
      lowerCase: this.lowerCase,
      trimmed: this.trimmed,
      maxLength: this.maxLength
    };
    if (this.pattern !== undefined) {
      jsonType.pattern = [this.pattern.source, this.pattern.flags];
    }
    if (this.minLength !== undefined) {
      jsonType.minLength = this.minLength;
    }
    return jsonType;
  }

  readTrusted(format: "bson", val: bson.Output): T;
  readTrusted(format: "json", val: json.Output): T;
  readTrusted(format: "qs", val: qs.Output): T;
  readTrusted(format: "bson" | "json" | "qs", input: any): T {
    return input;
  }

  read(format: "bson" | "json" | "qs", input: any): T {
    switch (format) {
      case "bson":
      case "json":
      case "qs":
        const error: Error | undefined = this.testError(input);
        if (error !== undefined) {
          throw error;
        }
        return input;
      default:
        throw UnknownFormatError.create(format);
    }
  }

  write(format: "bson", val: T): bson.Output;
  write(format: "json", val: T): json.Output;
  write(format: "qs", val: T): qs.Output;
  write(format: "bson" | "json" | "qs", val: T): any {
    return val;
  }

  testError(val: T): Error | undefined {
    if (typeof val !== "string") {
      return WrongTypeError.create("string", val);
    }
    if (this.lowerCase && val.toLowerCase() !== val) {
      return LowerCaseError.create(val);
    }
    if (this.trimmed && val.trim() !== val) {
      return NotTrimmedError.create(val);
    }
    const strLen: number = val.length;
    const minLength: number | undefined = this.minLength;
    if (minLength !== undefined && strLen < minLength) {
      return MinUcs2StringLengthError.create(val, minLength);
    }
    if (strLen > this.maxLength) {
      return MaxUcs2StringLengthError.create(val, this.maxLength);
    }

    if (this.pattern instanceof RegExp) {
      if (this.pattern.unicode && !this.allowUnicodeRegExp) {
        throw new Incident(
          "UnicodeRegExp",
          "Disallowed unicode RegExp, use `allowUnicodeRegExp` or `CodepointStringType`"
        );
      }

      if (!this.pattern.test(val)) {
        return PatternNotMatchedError.create(this.pattern, val);
      }
    }

    return undefined;
  }

  test(val: T): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: T, val2: T): boolean {
    return val1 === val2;
  }

  clone(val: T): T {
    return val;
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    return oldVal === newVal ? undefined : [oldVal, newVal];
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    return diff === undefined ? oldVal : diff[1];
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    return diff === undefined ? undefined : [diff[1], diff[0]];
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    if (diff1 === undefined) {
      return diff2 === undefined ? undefined : [diff2[0], diff2[1]];
    } else if (diff2 === undefined) {
      return [diff1[0], diff1[1]];
    }
    return diff1[0] === diff2[1] ? undefined : [diff1[0], diff2[1]];
  }
}

export {Ucs2StringType as Type};
