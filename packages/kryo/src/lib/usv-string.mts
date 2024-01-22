// import { checkedUcs2Decode } from "./_helpers/checked-ucs2-decode.mjs";
import {lazyProperties} from "./_helpers/lazy-properties.mjs";
import {stringIsWellFormed} from "./_helpers/string-is-well-formed.mjs";
import {writeError} from "./_helpers/write-error.mjs";
import {CheckKind} from "./checks/check-kind.mjs";
import {CheckId, IoType, KryoContext, Lazy, Reader, Result, VersionedType, Writer} from "./index.mjs";
import {readVisitor} from "./readers/read-visitor.mjs";

export enum Normalization {
  Nfc = "NFC",
  Nfd = "NFD",
  Nfkc = "NFKC",
  Nfkd = "NFKD",
}

export type Name = "codepoint-string";
export const name: Name = "codepoint-string";
export namespace json {
  export interface Type {
    name: Name;
    normalization: null | "NFC" | "NFD" | "NFKC" | "NFKD";
    allowUcs2RegExp: boolean;
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

export interface UsvStringOptions {
  /**
   * Ensure NFC normalization when reading strings.
   *
   * References:
   * - http://unicode.org/faq/normalization.html
   * - http://unicode.org/reports/tr15/
   */
  normalization?: null | Normalization;

  allowUcs2RegExp?: boolean;
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

/**
 * A Unicode Scalar Value (USV) String is a type representing a string of well-formed Unicode code points.
 *
 * It corresponds to strings _without_ lone surrogate pairs.
 *
 * http://devdoc.net/web/developer.mozilla.org/en-US/docs/Web/API/USVString.html
 * https://webidl.spec.whatwg.org/#idl-USVString
 */
export class UsvStringType implements IoType<string>, VersionedType<string, Diff> {
  readonly name: Name = name;
  readonly normalization!: null | Normalization;
  readonly allowUcs2RegExp!: boolean;
  readonly pattern?: RegExp;
  readonly lowerCase!: boolean;
  readonly trimmed!: boolean;
  readonly minCodepoints?: number;
  readonly maxCodepoints!: number;

  private _options: Lazy<UsvStringOptions>;

  constructor(options: Lazy<UsvStringOptions>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(
        this,
        this._applyOptions,
        [
          "normalization",
          "allowUcs2RegExp",
          "pattern",
          "lowerCase",
          "trimmed",
          "minCodepoints",
          "maxCodepoints",
        ],
      );
    }
  }

  static fromJSON(options: json.Type): UsvStringType {
    const resolvedOptions: UsvStringOptions = {
      normalization: options.normalization === undefined ? options.normalization : null,
      allowUcs2RegExp: options.allowUcs2RegExp,
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
    return new UsvStringType(resolvedOptions);
  }

  toJSON(): json.Type {
    const jsonType: json.Type = {
      name,
      normalization: this.normalization,
      allowUcs2RegExp: this.allowUcs2RegExp,
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

  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<string, CheckId> {
    return reader.readString(cx, raw, readVisitor({
      fromString: (input: string): Result<string, CheckId> => {
        if (reader.trustInput) {
          return {ok: true, value: input};
        }
        return this.test(cx, input);
      },
    }));
  }

  write<W>(writer: Writer<W>, value: string): W {
    return writer.writeString(value);
  }

  test(cx: KryoContext | null, value: unknown): Result<string, CheckId> {
    if (typeof value !== "string" || !stringIsWellFormed(value)) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["UsvString"]});
    }
    if (this.normalization !== null) {
      if (value.normalize(this.normalization) !== value) {
        return writeError(cx,{check: CheckKind.UnicodeNormalization, normalization: this.normalization});
      }
    }
    const codepoints = [...value];
    if (codepoints.length > this.maxCodepoints || codepoints.length < (this.minCodepoints ?? 0)) {
      return writeError(cx,{check: CheckKind.Size, min: this.minCodepoints ?? 0, max: this.maxCodepoints, actual: codepoints.length});
    }
    if (this.trimmed && value.trim() !== value) {
      return writeError(cx,{check: CheckKind.Trimmed});
    }
    if (this.lowerCase && value.toLowerCase() !== value) {
      return writeError(cx,{check: CheckKind.LowerCase});
    }
    if ((this.pattern instanceof RegExp) && !this.pattern.test(value)) {
      return writeError(cx,{check: CheckKind.StringPattern});
    }
    return {ok: true, value};
  }

  equals(left: string, right: string): boolean {
    return left === right;
  }

  lte(left: string, right: string): boolean {
    const leftList: string[] = [...left];
    const rightList: string[] = [...right];

    const minLength: number = Math.min(leftList.length, rightList.length);
    for (let i: number = 0; i < minLength; i++) {
      const leftItem: number = leftList[i].codePointAt(0)!;
      const rightItem: number = rightList[i].codePointAt(0)!;
      if (leftItem !== rightItem) {
        return leftItem <= rightItem;
      }
    }
    return leftList.length <= rightList.length;
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
      throw new Error("missing `_options` for lazy initialization");
    }
    const options: UsvStringOptions = typeof this._options === "function" ? this._options() : this._options;

    const normalization: Normalization = options.normalization ?? Normalization.Nfc;
    const allowUcs2RegExp: boolean = options.allowUcs2RegExp ?? true;
    const pattern: RegExp | undefined = options.pattern;
    const lowerCase: boolean = options.lowerCase !== undefined ? options.lowerCase : false;
    const trimmed: boolean = options.trimmed !== undefined ? options.trimmed : false;
    const minCodepoints: number | undefined = options.minCodepoints;
    const maxCodepoints: number = options.maxCodepoints;

    if (pattern !== undefined && !pattern.unicode && !allowUcs2RegExp) {
      throw new Error(
        "ucs2 pattern requires explicit opt-in with `allowUcs2RegExp`",
      );
    }

    Object.assign(
      this,
      {normalization, allowUcs2RegExp, pattern, lowerCase, trimmed, minCodepoints, maxCodepoints},
    );
  }
}
