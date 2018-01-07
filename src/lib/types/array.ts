import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { InvalidArrayItemError } from "../errors/invalid-array-item";
import { MaxArrayLengthError } from "../errors/max-array-length";
import { NotImplementedError } from "../errors/not-implemented";
import { WrongTypeError } from "../errors/wrong-type";
import { Lazy, VersionedType } from "../types";

export type Name = "array";
export const name: Name = "array";
export namespace json {
  export type Input = any[];
  export type Output = any[];
  // TODO(demurgos): Export arrayType to JSON
  export type Type = undefined;
}
export type Diff = any;

export interface Options<T, Input, Output extends Input, Diff> {
  itemType: VersionedType<T, Input, Output, Diff>;
  maxLength: number;
}

export class ArrayType<T> implements VersionedType<T[], json.Input, json.Output, Diff> {
  readonly name: Name = name;
  readonly itemType: VersionedType<T, any, any, any>;
  readonly maxLength: number;

  private _options: Lazy<Options<T, any, any, any>>;

  constructor(options: Lazy<Options<T, any, any, any>>, lazy?: boolean) {
    this._options = options;
    if (lazy === undefined) {
      lazy = typeof options === "function";
    }
    if (!lazy) {
      this._applyOptions();
    } else {
      lazyProperties(
        this,
        this._applyOptions,
        ["itemType", "maxLength"],
      );
    }
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("ArrayType#toJSON");
  }

  readTrustedJson(input: json.Output): T[] {
    return input.map((item: any): T => this.itemType.readTrustedJson(item));
  }

  readJson(input: any): T[] {
    let result: T[];
    if (!Array.isArray(input)) {
      throw WrongTypeError.create("array", input);
    }
    result = input.map((item: any): T => this.itemType.readJson(item));
    const error: Error | undefined = this.testError(result);
    if (error !== undefined) {
      throw error;
    }
    return result;
  }

  writeJson(val: T[]): json.Output {
    return val.map((item: T): any => this.itemType.writeJson(item));
  }

  testError(val: T[]): Error | undefined {
    if (!Array.isArray(val)) {
      return WrongTypeError.create("array", val);
    }
    if (this.maxLength !== undefined && val.length > this.maxLength) {
      return MaxArrayLengthError.create(val, this.maxLength);
    }
    for (let i: number = 0; i < val.length; i++) {
      const error: Error | undefined = this.itemType.testError(val[i]);
      if (error !== undefined) {
        return InvalidArrayItemError.create(i, val[i]);
      }
    }
    return undefined;
  }

  test(val: T[]): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: T[], val2: T[]): boolean {
    if (val2.length !== val1.length) {
      return false;
    }
    for (let i: number = 0; i < val1.length; i++) {
      if (val2[i] !== val1[i]) {
        return false;
      }
    }
    return true;
  }

  clone(val: T[]): T[] {
    return val.map((item: T): T => this.itemType.clone(item));
  }

  /**
   * @param oldVal
   * @param newVal
   * @returns `true` if there is a difference, `undefined` otherwise
   */
  diff(oldVal: T[], newVal: T[]): Diff | undefined {
    throw NotImplementedError.create("ArrayType#diff");
  }

  patch(oldVal: T[], diff: Diff | undefined): T[] {
    throw NotImplementedError.create("ArrayType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("ArrayType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("ArrayType#squash");
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Incident("No pending options");
    }
    const options: Options<T, any, any, any> = typeof this._options === "function" ? this._options() : this._options;

    const itemType: VersionedType<T, any, any, any> = options.itemType;
    const maxLength: number = options.maxLength;

    Object.assign(this, {itemType, maxLength});
    Object.freeze(this);
  }
}
