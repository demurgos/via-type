import { Incident } from "incident";
import { checkedUcs2Decode } from "../_helpers/checked-ucs2-decode";
import { lazyProperties } from "../_helpers/lazy-properties";
import { createInvalidTypeError } from "../errors/invalid-type";
import { createLazyOptionsError } from "../errors/lazy-options";
import { createLowerCaseError } from "../errors/lower-case";
import { createMaxCodepointsError } from "../errors/max-codepoints";
import { createMinCodepointsError } from "../errors/min-codepoints";
import { createMissingDependencyError } from "../errors/missing-dependency";
import { createNotTrimmedError } from "../errors/not-trimmed";
import { createPatternNotMatchedError } from "../errors/pattern-not-matched";
import { Lazy, VersionedType } from "../types";

let unormNfc: ((str: string) => string) | undefined = undefined;
try {
  /* tslint:disable-next-line:no-var-requires no-require-imports */
  unormNfc = require("unorm").nfc;
} catch (err) {
  // Ignore dependency not found error.
}

export enum Normalization {
  None,
  Nfc,
}

export type Name = "codepoint-string";
export const name: Name = "codepoint-string";
export namespace json {
  export type Input = string;
  export type Output = string;

  export interface Type {
    name: Name;
    normalization: "none" | "nfc";
    enforceUnicodeRegExp: boolean;
    pattern?: [string, string];
    lowerCase: boolean;
    /**
     * @see [[Ucs2StringOptions.trimmed]]
     */
    trimmed: boolean;
    minCodepoints?: number;
    maxCodepoints: number;
  }
}
export type Diff = [string, string];

export interface Options {
  /**
   * Ensure NFC normalization when reading strings.
   *
   * References:
   * - http://unicode.org/faq/normalization.html
   * - http://unicode.org/reports/tr15/
   */
  normalization?: Normalization;

  enforceUnicodeRegExp?: boolean;
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
  minCodepoints?: number;
  maxCodepoints: number;
}

export class CodepointStringType implements VersionedType<string, json.Input, json.Output, Diff> {

  readonly name: Name = name;
  readonly normalization: Normalization;
  readonly enforceUnicodeRegExp: boolean;
  readonly pattern?: RegExp;
  readonly lowerCase: boolean;
  readonly trimmed: boolean;
  readonly minCodepoints?: number;
  readonly maxCodepoints: number;

  private _options: Lazy<Options>;

  constructor(options: Lazy<Options>) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.normalization = <any> undefined;
    this.enforceUnicodeRegExp = <any> undefined;
    this.lowerCase = <any> undefined;
    this.trimmed = <any> undefined;
    this.maxCodepoints = <any> undefined;

    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(
        this,
        this._applyOptions,
        ["normalization", "enforceUnicodeRegExp", "pattern", "lowerCase", "trimmed", "minCodepoints", "maxCodepoints"],
      );
    }
  }

  static fromJSON(options: json.Type): CodepointStringType {
    const resolvedOptions: Options = {
      normalization: options.normalization === "none" ? Normalization.None : Normalization.Nfc,
      enforceUnicodeRegExp: options.enforceUnicodeRegExp,
      lowerCase: options.lowerCase,
      trimmed: options.trimmed,
      maxCodepoints: options.maxCodepoints,
    };
    if (options.pattern !== undefined) {
      resolvedOptions.pattern = new RegExp(options.pattern[0], options.pattern[1]);
    }
    if (options.minCodepoints !== undefined) {
      resolvedOptions.minCodepoints = options.minCodepoints;
    }
    return new CodepointStringType(resolvedOptions);
  }

  toJSON(): json.Type {
    const jsonType: json.Type = {
      name,
      normalization: this.normalization === Normalization.None ? "none" : "nfc",
      enforceUnicodeRegExp: this.enforceUnicodeRegExp,
      lowerCase: this.lowerCase,
      trimmed: this.trimmed,
      maxCodepoints: this.maxCodepoints,
    };
    if (this.pattern !== undefined) {
      jsonType.pattern = [this.pattern.source, this.pattern.flags];
    }
    if (this.minCodepoints !== undefined) {
      jsonType.minCodepoints = this.minCodepoints;
    }
    return jsonType;
  }

  readTrustedJson(input: json.Output): string {
    return input;
  }

  readJson(input: any): string {
    const error: Error | undefined = this.testError(input);
    if (error !== undefined) {
      throw error;
    }
    return input;
  }

  writeJson(val: string): json.Output {
    return val;
  }

  testError(val: string): Error | undefined {
    if (!(typeof val === "string")) {
      return createInvalidTypeError("string", val);
    }

    switch (this.normalization) {
      case Normalization.Nfc:
        if (unormNfc === undefined) {
          throw createMissingDependencyError("unorm", "Required to normalize unicode strings to NFC.");
        }
        if (val !== unormNfc(val)) {
          return Incident("UnicodeNormalization", "Not NFC-Normalized");
        }
        break;
      case Normalization.None:
        break;
      default:
        throw new Incident(
          `IncompleteSwitch: Received unexpected variant for this.normalization: ${this.normalization}`,
        );
    }

    if (this.lowerCase && val !== val.toLowerCase()) {
      return createLowerCaseError(val);
    }

    if (this.trimmed && val !== val.trim()) {
      return createNotTrimmedError(val);
    }

    let codepointCount: number;
    try {
      codepointCount = checkedUcs2Decode(val).length;
    } catch (err) {
      return err;
    }

    const minCodepoints: number | undefined = this.minCodepoints;
    if (typeof minCodepoints === "number" && codepointCount < minCodepoints) {
      return createMinCodepointsError(val, codepointCount, minCodepoints);
    }

    if (codepointCount > this.maxCodepoints) {
      return createMaxCodepointsError(val, codepointCount, this.maxCodepoints);
    }

    if (this.pattern instanceof RegExp) {
      if (!this.pattern.unicode && this.enforceUnicodeRegExp) {
        throw new Incident(
          "NonUnicodeRegExp",
          "Enforced unicode RegExp, use `enforceUnicodeRegExp = false` or `Ucs2StringType`",
        );
      }

      if (!this.pattern.test(val)) {
        return createPatternNotMatchedError(this.pattern, val);
      }
    }

    return undefined;
  }

  test(val: string): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: string, val2: string): boolean {
    return val1 === val2;
  }

  clone(val: string): string {
    return val;
  }

  diff(oldVal: string, newVal: string): Diff | undefined {
    return oldVal === newVal ? undefined : [oldVal, newVal];
  }

  patch(oldVal: string, diff: Diff | undefined): string {
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

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: Options = typeof this._options === "function" ? this._options() : this._options;

    const normalization: Normalization = options.normalization !== undefined ?
      options.normalization :
      Normalization.Nfc;
    const enforceUnicodeRegExp: boolean = options.enforceUnicodeRegExp !== undefined ?
      options.enforceUnicodeRegExp :
      true;
    const pattern: RegExp | undefined = options.pattern;
    const lowerCase: boolean = options.lowerCase !== undefined ? options.lowerCase : false;
    const trimmed: boolean = options.trimmed !== undefined ? options.trimmed : false;
    const minCodepoints: number | undefined = options.minCodepoints;
    const maxCodepoints: number = options.maxCodepoints;

    Object.assign(
      this,
      {normalization, enforceUnicodeRegExp, pattern, lowerCase, trimmed, minCodepoints, maxCodepoints},
    );
    Object.freeze(this);
  }
}
