import { lazyProperties } from "../_helpers/lazy-properties";
import { createInvalidArrayItemsError } from "../errors/invalid-array-items";
import { createInvalidTypeError } from "../errors/invalid-type";
import { createLazyOptionsError } from "../errors/lazy-options";
import { createMaxArrayLengthError } from "../errors/max-array-length";
import { createNotImplementedError } from "../errors/not-implemented";
import { JSON_SERIALIZER } from "../json";
import { Lazy, VersionedType } from "../types";

export type Name = "array";
export const name: Name = "array";
export namespace json {
  // TODO(demurgos): Export arrayType to JSON
  export type Type = undefined;
}
export type Diff = any;

export interface Options<T, Input, Output extends Input, Diff> {
  itemType: VersionedType<T, Input, Output, Diff>;
  maxLength: number;
}

export class ArrayType<T> implements VersionedType<T[], any[], any[], Diff> {
  readonly name: Name = name;
  readonly itemType: VersionedType<T, any, any, any>;
  readonly maxLength: number;

  private _options: Lazy<Options<T, any, any, any>>;

  constructor(options: Lazy<Options<T, any, any, any>>, lazy?: boolean) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.itemType = <any> undefined;
    this.maxLength = <any> undefined;

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
    throw createNotImplementedError("ArrayType#toJSON");
  }

  readTrustedJson(input: any[]): T[] {
    return input.map((item: any): T => JSON_SERIALIZER.readTrusted(this.itemType, item));
  }

  readJson(input: any): T[] {
    if (!Array.isArray(input)) {
      throw createInvalidTypeError("array", input);
    }
    if (this.maxLength !== undefined && input.length > this.maxLength) {
      throw createMaxArrayLengthError(input, this.maxLength);
    }
    let invalid: undefined | Map<number, Error> = undefined;
    const result: T[] = [];
    const itemCount: number = input.length;
    for (let i: number = 0; i < itemCount; i++) {
      try {
        const item: T = JSON_SERIALIZER.read(this.itemType, input[i]);
        if (invalid === undefined) {
          result.push(item);
        }
      } catch (err) {
        if (invalid === undefined) {
          invalid = new Map();
        }
        invalid.set(i, err);
      }
    }
    if (invalid !== undefined) {
      throw createInvalidArrayItemsError(invalid);
    }
    return result;
  }

  writeJson(val: T[]): any[] {
    return val.map((item: T): any => JSON_SERIALIZER.write(this.itemType, item));
  }

  testError(val: T[]): Error | undefined {
    if (!Array.isArray(val)) {
      return createInvalidTypeError("array", val);
    }
    if (this.maxLength !== undefined && val.length > this.maxLength) {
      return createMaxArrayLengthError(val, this.maxLength);
    }
    const invalid: Map<number, Error> = new Map();
    const itemCount: number = val.length;
    for (let i: number = 0; i < itemCount; i++) {
      const error: Error | undefined = this.itemType.testError(val[i]);
      if (error !== undefined) {
        invalid.set(i, error);
      }
    }
    if (invalid.size !== 0) {
      return createInvalidArrayItemsError(invalid);
    }
    return undefined;
  }

  test(val: T[]): val is T[] {
    if (!Array.isArray(val) || (this.maxLength !== undefined && val.length > this.maxLength)) {
      return false;
    }
    for (const item of val) {
      if (!this.itemType.test(item)) {
        return false;
      }
    }
    return true;
  }

  equals(val1: T[], val2: T[]): boolean {
    if (val2.length !== val1.length) {
      return false;
    }
    for (let i: number = 0; i < val1.length; i++) {
      if (!this.itemType.equals(val2[i], val1[i])) {
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
    throw createNotImplementedError("ArrayType#diff");
  }

  patch(oldVal: T[], diff: Diff | undefined): T[] {
    throw createNotImplementedError("ArrayType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("ArrayType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("ArrayType#squash");
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: Options<T, any, any, any> = typeof this._options === "function" ? this._options() : this._options;

    const itemType: VersionedType<T, any, any, any> = options.itemType;
    const maxLength: number = options.maxLength;

    Object.assign(this, {itemType, maxLength});
    Object.freeze(this);
  }
}
