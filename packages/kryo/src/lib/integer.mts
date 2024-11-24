import {writeError} from "./_helpers/context.mjs";
import {lazyProperties} from "./_helpers/lazy-properties.mjs";
import {CheckKind} from "./checks/check-kind.mjs";
import {CheckId, IoType, KryoContext, Lazy, Ord, Reader, Result, VersionedType, Writer} from "./index.mjs";
import {readVisitor} from "./readers/read-visitor.mjs";

export type Name = "Integer";
export const name: Name = "Integer";
export namespace json {
  export interface Type {
    name: Name;
    min: number;
    max: number;
  }
}
export type Diff = number;

/**
 * Options for the `integer` type.
 */
export interface IntegerTypeOptions {
  /**
   * Inclusive minimum value.
   */
  min?: number;

  /**
   * Inclusive maximum value.
   */
  max?: number;
}

/**
 * Default value for the `min` option.
 * It corresponds to `-(2**53)`.
 */
export const DEFAULT_MIN: number = Number.MIN_SAFE_INTEGER - 1;

/**
 * Default value for the `max` option.
 * It corresponds to `2**53 - 1`.
 */
export const DEFAULT_MAX: number = Number.MAX_SAFE_INTEGER;

export class IntegerType implements IoType<number>, VersionedType<number, Diff>, Ord<number> {

  readonly name: Name = name;
  readonly min!: number;
  readonly max!: number;

  private _options: Lazy<IntegerTypeOptions>;

  constructor(options?: Lazy<IntegerTypeOptions>) {
    if (options === undefined) {
      this._options = {};
      this._applyOptions();
      return;
    }
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["min", "max"]);
    }
  }

  static fromJSON(options: json.Type): IntegerType {
    return new IntegerType(options);
  }

  toJSON(): json.Type {
    return {name, min: this.min, max: this.max};
  }

  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<number, CheckId> {
    return reader.readFloat64(cx, raw, readVisitor({
      fromFloat64: (input: number): Result<number, CheckId> => {
        if (reader.trustInput) {
          return {ok: true, value: input};
        }
        return this.test(cx, input);
      },
    }));
  }

  write<W>(writer: Writer<W>, value: number): W {
    return writer.writeFloat64(value);
  }

  test(cx: KryoContext | null, value: unknown): Result<number, CheckId> {
    if (typeof value !== "number" || Math.round(value) !== value) {
      return writeError(cx,{check: CheckKind.BaseType, expected: ["Sint53"]});
    }
    if (
      !(this.min <= value && value <= this.max)
    ) {
      return writeError(cx, {check: CheckKind.Range, min: this.min, max: this.max, actual: value});
    }
    return {ok: true, value};
  }

  equals(left: number, right: number): boolean {
    return left === right;
  }

  lte(left: number, right: number): boolean {
    return left <= right;
  }

  clone(val: number): number {
    return val;
  }

  diff(oldVal: number, newVal: number): Diff | undefined {
    return newVal === oldVal ? undefined : newVal - oldVal;
  }

  patch(oldVal: number, diff: Diff | undefined): number {
    return diff === undefined ? oldVal : oldVal + diff as number;
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    /* tslint:disable-next-line:strict-boolean-expressions */
    return diff && -diff;
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    if (diff1 === undefined) {
      return diff2;
    } else if (diff2 === undefined) {
      return diff1;
    }
    return diff2 === -diff1 ? undefined : diff1 + diff2;
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Error("missing `_options` for lazy initialization");
    }
    const options: IntegerTypeOptions = typeof this._options === "function" ? this._options() : this._options;

    const min: number = options.min !== undefined ? options.min : DEFAULT_MIN;
    const max: number = options.max !== undefined ? options.max : DEFAULT_MAX;

    Object.assign(this, {min, max});
  }
}

export const $Sint8: IntegerType = new IntegerType({min: -128, max: 127});
export const $Sint16: IntegerType = new IntegerType({min: -32768, max: 32767});
export const $Sint32: IntegerType = new IntegerType({min: -2147483648, max: 2147483647});
export const $Sint54: IntegerType = new IntegerType({
  min: -9007199254740992,
  max: 9007199254740991,
});
export const $Uint8: IntegerType = new IntegerType({min: 0, max: 255});
export const $Uint16: IntegerType = new IntegerType({min: 0, max: 65535});
export const $Uint32: IntegerType = new IntegerType({min: 0, max: 4294967295});
export const $Uint53: IntegerType = new IntegerType({min: 0, max: 9007199254740991});
