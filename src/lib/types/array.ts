import {InvalidArrayItemError} from "../errors/invalid-array-item";
import {MaxArrayLengthError} from "../errors/max-array-length";
import {NotImplementedError} from "../errors/not-implemented";
import {UnknownFormatError} from "../errors/unknown-format";
import {WrongTypeError} from "../errors/wrong-type";
import {SerializableType, VersionedType} from "../interfaces";

export type Name = "array";
export const name: Name = "array";
export namespace bson {
  export type Input = any[];
  export type Output = any[];
}
export namespace json {
  export type Input = any[];
  export type Output = any[];
  // TODO(demurgos): Export arrayType to JSON
  export type Type = undefined;
}
export namespace qs {
  export type Input = any[] | undefined;
  export type Output = any[] | undefined;
}
export type Diff = any;

export interface Options<T, Output, Input extends Output, Diff> {
  itemType: VersionedType<T, Output, Input, Diff>;
  maxLength: number;
}

export class ArrayType<T>
  implements VersionedType<T[], json.Input, json.Output, Diff>,
    SerializableType<T[], "bson", bson.Input, bson.Output>,
    SerializableType<T[], "qs", qs.Input, qs.Output> {
  readonly name: Name = name;
  readonly itemType: VersionedType<T, any, any, any>;
  readonly maxLength: number;

  constructor(options: Options<T, any, any, any>) {
    this.itemType = options.itemType;
    this.maxLength = options.maxLength;
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("ArrayType#toJSON");
  }

  readTrusted(format: "bson", val: bson.Output): T[];
  readTrusted(format: "json", val: json.Output): T[];
  readTrusted(format: "qs", val: qs.Output): T[];
  readTrusted(format: "bson" | "json" | "qs", input: any): T[] {
    switch (format) {
      case "bson":
      case "json":
        // TODO(demurgos): Check if the format is supported instead of casting to `any`
        return input.map((item: any): T => this.itemType.readTrusted(<any> format, item));
      case "qs":
        if (Array.isArray(input)) {
          // TODO(demurgos): Check if the format is supported instead of casting to `any`
          return input.map((item: any): T => this.itemType.readTrusted(<any> format, item));
        } else {
          return [];
        }
      default:
        return undefined as never;
    }
  }

  read(format: "bson" | "json" | "qs", input: any): T[] {
    let result: T[];
    switch (format) {
      case "bson":
      case "json":
        if (!Array.isArray(input)) {
          throw WrongTypeError.create("array", input);
        }
        // TODO(demurgos): Check if the format is supported instead of casting to `any`
        result = input.map((item: any): T => this.itemType.readTrusted(<any> format, item));
        break;
      case "qs":
        if (Array.isArray(input)) {
          // TODO(demurgos): Check if the format is supported instead of casting to `any`
          result = input.map((item: any): T => this.itemType.readTrusted(<any> format, item));
        } else if (input === undefined) {
          result = [];
        } else {
          throw WrongTypeError.create("array | undefined", input);
        }
        break;
      default:
        throw UnknownFormatError.create(format);
    }
    const error: Error | undefined = this.testError(result);
    if (error !== undefined) {
      throw error;
    }
    return result;
  }

  write(format: "bson", val: T[]): bson.Output;
  write(format: "json", val: T[]): json.Output;
  write(format: "qs", val: T[]): qs.Output;
  write(format: "bson" | "json" | "qs", val: T[]): any {
    switch (format) {
      case "bson":
      case "json":
        // TODO(demurgos): Check if the format is supported instead of casting to `any`
        return val.map((item: T): any => this.itemType.write(<any> format, item));
      case "qs":
        if (val.length > 0) {
          // TODO(demurgos): Check if the format is supported instead of casting to `any`
          return val.map((item: T): any => this.itemType.write(<any> format, item));
        } else {
          return undefined;
        }
      default:
        return undefined as never;
    }
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
}

export {ArrayType as Type};
