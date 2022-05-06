import incident from "incident";

import { lazyProperties } from "./_helpers/lazy-properties.js";
import { testError } from "./_helpers/test-error.js";
import { createInvalidArrayItemsError } from "./errors/invalid-array-items.js";
import { createInvalidTypeError } from "./errors/invalid-type.js";
import { createLazyOptionsError } from "./errors/lazy-options.js";
import { createMaxArrayLengthError } from "./errors/max-array-length.js";
import { createMinArrayLengthError } from "./errors/min-array-length.js";
import { IoType, Lazy, Reader, Type, Writer } from "./index.js";
import { readVisitor } from "./readers/read-visitor.js";

export type Name = "array";
export const name: Name = "array";
export type Diff = any;

/**
 * T: Item type
 * M: Meta-Type
 */
export interface ArrayTypeOptions<T, M extends Type<T> = Type<T>> {
  itemType: M;
  minLength?: number;
  maxLength: number;
}

export interface ArrayTypeConstructor {
  /**
   * Create a new array type with full read/write support
   */
  new<T>(options: Lazy<ArrayTypeOptions<T, IoType<T>>>): ArrayIoType<T, IoType<T>>;

  /**
   * Create a new simple array type
   */
  new<T>(options: Lazy<ArrayTypeOptions<T>>): ArrayType<T>;
}

export interface ArrayType<T, M extends Type<T> = Type<T>> extends Type<T[]>, ArrayTypeOptions<T, M> {
}

export interface ArrayIoType<T, M extends IoType<T> = IoType<T>> extends IoType<T[]>,
  ArrayTypeOptions<T, M> {
}

// tslint:disable-next-line:variable-name
export const ArrayType: ArrayTypeConstructor = <any> class<T, M extends Type<T> = Type<T>> {
  readonly name: Name = name;
  readonly itemType!: M;
  readonly minLength?: number;
  readonly maxLength!: number;

  private _options: Lazy<ArrayTypeOptions<T, M>>;

  constructor(options: Lazy<ArrayTypeOptions<T, M>>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["itemType", "minLength", "maxLength"]);
    }
  }

  // TODO: Dynamically add with prototype?
  read<R>(reader: Reader<R>, raw: R): T[] {
    const itemType: M = this.itemType;
    const minLength: number | undefined = this.minLength;
    const maxLength: number | undefined = this.maxLength;

    return reader.readList(raw, readVisitor({
      fromList<RI>(input: Iterable<RI>, itemReader: Reader<RI>): T[] {
        let invalid: undefined | Map<number, Error> = undefined;
        const result: T[] = [];
        let i: number = 0;
        for (const rawItem of input) {
          if (maxLength !== undefined && i === maxLength) {
            throw createMaxArrayLengthError([...input], maxLength);
          }
          try {
            const item: T = itemType.read!(itemReader, rawItem);
            if (invalid === undefined) {
              result.push(item);
            }
          } catch (err: unknown) {
            if (!(err instanceof Error)) {
              throw err;
            }
            if (invalid === undefined) {
              invalid = new Map();
            }
            invalid.set(i, err);
          }
          i++;
        }
        if (invalid !== undefined) {
          throw createInvalidArrayItemsError(invalid);
        }
        if (minLength !== undefined && i < minLength) {
          throw createMinArrayLengthError([...input], minLength);
        }
        return result;
      },
    }));
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: T[]): W {
    return writer.writeList(value.length, <IW>(index: number, itemWriter: Writer<IW>): IW => {
      if (this.itemType.write === undefined) {
        throw new incident.Incident("NotWritable", {type: this.itemType});
      }
      return this.itemType.write(itemWriter, value[index]);
    });
  }

  testError(value: unknown): Error | undefined {
    if (!Array.isArray(value)) {
      return createInvalidTypeError("array", value);
    }
    if (this.maxLength !== undefined && value.length > this.maxLength) {
      return createMaxArrayLengthError(value, this.maxLength);
    }
    if (this.minLength !== undefined && value.length < this.minLength) {
      return createMinArrayLengthError(value, this.minLength);
    }
    const invalid: Map<number, Error> = new Map();
    const itemCount: number = value.length;
    for (let i: number = 0; i < itemCount; i++) {
      const error: Error | undefined = testError(this.itemType, value[i]);
      if (error !== undefined) {
        invalid.set(i, error);
      }
    }
    if (invalid.size !== 0) {
      return createInvalidArrayItemsError(invalid);
    }
    return undefined;
  }

  test(val: unknown): val is T[] {
    if (
      !Array.isArray(val)
      || (this.maxLength !== undefined && val.length > this.maxLength)
      || (this.minLength !== undefined && val.length < this.minLength)
    ) {
      return false;
    }
    for (const item of val) {
      if (!this.itemType.test(item)) {
        return false;
      }
    }
    return true;
  }

  equals(left: T[], right: T[]): boolean {
    if (left.length !== right.length) {
      return false;
    }
    for (let i: number = 0; i < left.length; i++) {
      if (!this.itemType.equals(left[i], right[i])) {
        return false;
      }
    }
    return true;
  }

  lte(left: T[], right: T[]): boolean {
    const minLength: number = Math.min(left.length, right.length);
    for (let i: number = 0; i < minLength; i++) {
      const leftItem: T = left[i];
      const rightItem: T = right[i];
      if (!this.itemType.equals(leftItem, rightItem)) {
        return this.itemType.lte!(leftItem, rightItem);
      }
    }
    return left.length <= right.length;
  }

  clone(val: T[]): T[] {
    return val.map((item: T): T => this.itemType.clone(item));
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: ArrayTypeOptions<T, M> = typeof this._options === "function" ? this._options() : this._options;

    const itemType: M = options.itemType;
    const minLength: number | undefined = options.minLength;
    const maxLength: number = options.maxLength;

    Object.assign(this, {itemType, minLength, maxLength});
  }
};
