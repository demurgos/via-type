import { lazyProperties } from "./_helpers/lazy-properties.mjs";
import { createInvalidFloat64Error } from "./errors/invalid-float64.mjs";
import { createInvalidTypeError } from "./errors/invalid-type.mjs";
import { createLazyOptionsError } from "./errors/lazy-options.mjs";
import { IoType, Lazy, Ord, Reader, VersionedType, Writer } from "./index.mjs";
import { readVisitor } from "./readers/read-visitor.mjs";

export type Name = "float64";
export const name: Name = "float64";
export namespace json {
  export interface Type {
    readonly name: Name;
    readonly allowNaN: boolean;
    readonly allowInfinity: boolean;
  }
}

/**
 * Options for the `Float64` meta-type.
 */
export interface Float64TypeOptions {
  /**
   * Accept `NaN` values.
   * If you enable this option, the `test` method will treat two `NaN` values as equal.
   *
   * @default `false`
   */
  readonly allowNaN?: boolean;

  /**
   * Accept `+Infinity` and `-Infinity`.
   *
   * @default `false`
   */
  readonly allowInfinity?: boolean;

  // TODO: Add `unifyZeros` (defaults to `true`) to handle `+0` and `-0`
}

export class Float64Type implements IoType<number>, VersionedType<number, [number, number]>, Ord<number> {
  readonly name: Name = name;
  readonly allowNaN!: boolean;
  readonly allowInfinity!: boolean;

  private _options: Lazy<Float64TypeOptions>;

  constructor(options?: Lazy<Float64TypeOptions>) {
    this._options = options !== undefined ? options : {};
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["allowNaN", "allowInfinity"]);
    }
  }

  static fromJSON(options: json.Type): Float64Type {
    return new Float64Type(options);
  }

  toJSON(): json.Type {
    return {
      name,
      allowNaN: this.allowNaN,
      allowInfinity: this.allowInfinity,
    };
  }

  read<R>(reader: Reader<R>, raw: R): number {
    return reader.readFloat64(raw, readVisitor({
      fromFloat64: (input: number): number => {
        const error: Error | undefined = reader.trustInput ? undefined : this.testError(input);
        if (error !== undefined) {
          throw error;
        }
        return input;
      },
    }));
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: number): W {
    return writer.writeFloat64(value);
  }

  testError(val: unknown): Error | undefined {
    if (typeof val !== "number") {
      return createInvalidTypeError("number", val);
    }
    if (isNaN(val) && !this.allowNaN) {
      return createInvalidFloat64Error(val);
    } else if (Math.abs(val) === Infinity && !this.allowInfinity) {
      return createInvalidFloat64Error(val);
    }
    return undefined;
  }

  test(value: unknown): value is number {
    return typeof value === "number"
      && (this.allowNaN || !isNaN(value))
      && (this.allowInfinity || Math.abs(value) !== Infinity);
  }

  /**
   * Tests the equivalence of two valid float64 values.
   *
   * Two values are equivalent if they are both `NaN`, both `-0`, both `+0` or non-zero and
   * numerically equal.
   */
  equals(left: number, right: number): boolean {
    return Object.is(left, right);
  }

  /**
   * Compares two valid float64 values.
   *
   * The values are ordered as follow:
   * - `-Infinity`
   * - Negative non-zero finite values
   * - `-0`
   * - `+0`
   * - Positive non-zero finite values
   * - `+Infinity`
   * - `NaN`
   *
   * @param left Left operand.
   * @param right Right operand.
   * @return Boolean indicating if `left <= right`
   */
  lte(left: number, right: number): boolean {
    if (isNaN(right)) {
      return true;
    } else if (isNaN(left)) {
      return false;
    }
    if (left === 0 && right === 0) {
      return Object.is(left, -0) || Object.is(right, +0);
    }
    return left <= right;
  }

  clone(value: number): number {
    return value;
  }

  diff(oldVal: number, newVal: number): [number, number] | undefined {
    // We can't use an arithmetic difference due to possible precision loss
    return this.equals(oldVal, newVal) ? undefined : [oldVal, newVal];
  }

  patch(oldVal: number, diff: [number, number] | undefined): number {
    return diff === undefined ? oldVal : diff[1];
  }

  reverseDiff(diff: [number, number] | undefined): [number, number] | undefined {
    return diff === undefined ? undefined : [diff[1], diff[0]];
  }

  squash(diff1: [number, number] | undefined, diff2: [number, number] | undefined): [number, number] | undefined {
    if (diff1 === undefined) {
      return diff2 === undefined ? undefined : [diff2[0], diff2[1]];
    } else if (diff2 === undefined) {
      return [diff1[0], diff1[1]];
    }
    return this.equals(diff1[0], diff2[1]) ? undefined : [diff1[0], diff2[1]];
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: Float64TypeOptions = typeof this._options === "function" ? this._options() : this._options;
    const allowNaN: boolean = options.allowNaN !== undefined ? options.allowNaN : false;
    const allowInfinity: boolean = options.allowInfinity !== undefined ? options.allowInfinity : false;

    Object.assign(this, {allowNaN, allowInfinity});
  }
}

export const $Float64: Float64Type = new Float64Type();
