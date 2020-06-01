import incident from "incident";

import { checkedUcs2Decode } from "./_helpers/checked-ucs2-decode.js";
import { lazyProperties } from "./_helpers/lazy-properties.js";
import { createInvalidTypeError } from "./errors/invalid-type.js";
import { createLazyOptionsError } from "./errors/lazy-options.js";
import { createLowerCaseError } from "./errors/lower-case.js";
import { createMaxCodepointsError } from "./errors/max-codepoints.js";
import { createMinCodepointsError } from "./errors/min-codepoints.js";
import { createMissingDependencyError } from "./errors/missing-dependency.js";
import { createNotTrimmedError } from "./errors/not-trimmed.js";
import { createPatternNotMatchedError } from "./errors/pattern-not-matched.js";
import { IoType, Lazy, Reader, VersionedType, Writer } from "./index.js";
import { readVisitor } from "./readers/read-visitor.js";

export type UnormNfc = (str: string) => string;

export interface UnormLike {
  nfc: UnormNfc;
}

export enum Normalization {
  None,
  Nfc,
}

export type Name = "codepoint-string";
export const name: Name = "codepoint-string";
export namespace json {
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

  /**
   * Unicode normalization library to use.
   */
  unorm?: UnormLike;
}

export class CodepointStringType implements IoType<string>, VersionedType<string, Diff> {

  readonly name: Name = name;
  readonly normalization!: Normalization;
  readonly enforceUnicodeRegExp!: boolean;
  readonly pattern?: RegExp;
  readonly lowerCase!: boolean;
  readonly trimmed!: boolean;
  readonly minCodepoints?: number;
  readonly maxCodepoints!: number;
  readonly unorm?: UnormLike;

  private _options: Lazy<CodepointStringOptions>;

  constructor(options: Lazy<CodepointStringOptions>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(
        this,
        this._applyOptions,
        [
          "normalization",
          "enforceUnicodeRegExp",
          "pattern",
          "lowerCase",
          "trimmed",
          "minCodepoints",
          "maxCodepoints",
          "unorm",
        ],
      );
    }
  }

  static fromJSON(options: json.Type): CodepointStringType {
    const resolvedOptions: CodepointStringOptions = {
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

  // TODO: Dynamically add with prototype?
  read<R>(reader: Reader<R>, raw: R): string {
    return reader.readString(raw, readVisitor({
      fromString: (input: string): string => {
        const error: Error | undefined = this.testError(input);
        if (error !== undefined) {
          throw error;
        }
        return input;
      },
    }));
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: string): W {
    return writer.writeString(value);
  }

  testError(value: unknown): Error | undefined {
    if (!(typeof value === "string")) {
      return createInvalidTypeError("string", value);
    }

    switch (this.normalization) {
      case Normalization.Nfc:
        if (this.unorm === undefined) {
          throw createMissingDependencyError("unorm", "Required to normalize unicode strings to NFC.");
        }
        if (value !== this.unorm.nfc(value)) {
          return incident.Incident("UnicodeNormalization", "Not NFC-Normalized");
        }
        break;
      case Normalization.None:
        break;
      default:
        throw new incident.Incident(
          `IncompleteSwitch: Received unexpected variant for this.normalization: ${this.normalization}`,
        );
    }

    if (this.lowerCase && value !== value.toLowerCase()) {
      return createLowerCaseError(value);
    }

    if (this.trimmed && value !== value.trim()) {
      return createNotTrimmedError(value);
    }

    let codepointCount: number;
    try {
      codepointCount = checkedUcs2Decode(value).length;
    } catch (err) {
      return err;
    }

    const minCodepoints: number | undefined = this.minCodepoints;
    if (typeof minCodepoints === "number" && codepointCount < minCodepoints) {
      return createMinCodepointsError(value, codepointCount, minCodepoints);
    }

    if (codepointCount > this.maxCodepoints) {
      return createMaxCodepointsError(value, codepointCount, this.maxCodepoints);
    }

    if (this.pattern instanceof RegExp) {
      if (!this.pattern.unicode && this.enforceUnicodeRegExp) {
        throw new incident.Incident(
          "NonUnicodeRegExp",
          "Enforced unicode RegExp, use `enforceUnicodeRegExp = false` or `Ucs2StringType`",
        );
      }

      if (!this.pattern.test(value)) {
        return createPatternNotMatchedError(this.pattern, value);
      }
    }

    return undefined;
  }

  test(value: unknown): value is string {
    return this.testError(value) === undefined;
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
    const options: CodepointStringOptions = typeof this._options === "function" ? this._options() : this._options;

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
    const unorm: UnormLike | undefined = options.unorm;

    Object.assign(
      this,
      {normalization, enforceUnicodeRegExp, pattern, lowerCase, trimmed, minCodepoints, maxCodepoints, unorm},
    );
  }
}
