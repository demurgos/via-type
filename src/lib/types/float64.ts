import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { createInvalidFloat64Error } from "../errors/invalid-float64";
import { createInvalidTypeError } from "../errors/invalid-type";
import { Lazy, VersionedType } from "../types";

export type Name = "float64";
export const name: Name = "float64";
export namespace json {
  export interface Type {
    readonly name: Name;
    readonly allowNaN: boolean;
    readonly allowInfinity: boolean;
  }
}
export type Diff = [number, number];

/**
 * Options for the `Float64` meta-type.
 */
export interface Float64Options {
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

// tslint:disable:max-line-length
export class Float64Type implements VersionedType<number, number | "NaN" | "+Infinity" | "-Infinity", number | "NaN" | "+Infinity" | "-Infinity", Diff> {
  readonly name: Name = name;
  readonly allowNaN: boolean;
  readonly allowInfinity: boolean;

  private _options: Lazy<Float64Options>;

  constructor(options?: Lazy<Float64Options>, lazy?: boolean) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.allowNaN = <any> undefined;
    this.allowInfinity = <any> undefined;

    this._options = options !== undefined ? options : {};
    if (lazy === undefined) {
      lazy = typeof options === "function";
    }
    if (!lazy) {
      this._applyOptions();
    } else {
      lazyProperties(
        this,
        this._applyOptions,
        ["allowNaN", "allowInfinity"],
      );
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

  readTrustedJson(input: number | "NaN" | "+Infinity" | "-Infinity"): number {
    switch (input) {
      case "NaN":
        return NaN;
      case "+Infinity":
        return Infinity;
      case "-Infinity":
        return -Infinity;
      default:
        return input;
    }
  }

  readJson(input: number | "NaN" | "+Infinity" | "-Infinity"): number {
    switch (input) {
      case "NaN":
        if (!this.allowNaN) {
          throw createInvalidFloat64Error(input);
        }
        return NaN;
      case "+Infinity":
        if (!this.allowInfinity) {
          throw createInvalidFloat64Error(input);
        }
        return Infinity;
      case "-Infinity":
        if (!this.allowInfinity) {
          throw createInvalidFloat64Error(input);
        }
        return -Infinity;
      default:
        if (typeof input === "number") {
          return input;
        } else {
          throw createInvalidFloat64Error(input);
        }
    }
  }

  writeJson(val: number): number | "NaN" | "+Infinity" | "-Infinity" {
    if (isNaN(val)) {
      return "NaN";
    } else if (val === Infinity) {
      return "+Infinity";
    } else if (val === -Infinity) {
      return "-Infinity";
    }
    return val;
  }

  testError(val: number): Error | undefined {
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

  test(val: number): boolean {
    return typeof val === "number" && (this.allowNaN || !isNaN(val)) && (this.allowInfinity || Math.abs(val) !== Infinity);
  }

  equals(val1: number, val2: number): boolean {
    if (isNaN(val1) || isNaN(val2)) {
      return isNaN(val1) && isNaN(val2);
    }
    return val1 === val2;
  }

  clone(val: number): number {
    return val;
  }

  diff(oldVal: number, newVal: number): Diff | undefined {
    // We can't use an arithmetic difference due to possible precision loss
    return this.equals(oldVal, newVal) ? undefined : [oldVal, newVal];
  }

  patch(oldVal: number, diff: Diff | undefined): number {
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
    return this.equals(diff1[0], diff2[1]) ? undefined : [diff1[0], diff2[1]];
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Incident("No pending options");
    }
    const options: Float64Options = typeof this._options === "function" ? this._options() : this._options;
    const allowNaN: boolean = options.allowNaN !== undefined ? options.allowNaN : false;
    const allowInfinity: boolean = options.allowInfinity !== undefined ? options.allowInfinity : false;

    Object.assign(this, {allowNaN, allowInfinity});
    Object.freeze(this);
  }
}
