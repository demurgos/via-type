import {InvalidInt32Error} from "../errors/invalid-int32";
import {UnknownFormatError} from "../errors/unknown-format";
import {WrongTypeError} from "../errors/wrong-type";
import {SerializableType, VersionedType} from "../interfaces";

export type Name = "int32";
export const name: Name = "int32";
export type T = number;
export namespace bson {
  export type Input = number;
  export type Output = number;
}
export namespace json {
  export type Input = number;
  export type Output = number;
  export interface Type {
    name: Name;
  }
}
export namespace qs {
  export type Input = string;
  export type Output = string;
}
export type Diff = number;

export class Int32Type
  implements VersionedType<T, json.Input, json.Output, Diff>,
    SerializableType<T, "bson", bson.Input, bson.Output>,
    SerializableType<T, "qs", qs.Input, qs.Output> {

  readonly name: Name = name;

  constructor() {
  }

  static fromJSON(options: json.Type): Int32Type {
    return new Int32Type();
  }

  toJSON(): json.Type {
    return {name: name};
  }

  readTrusted(format: "bson", val: bson.Output): T;
  readTrusted(format: "json", val: json.Output): T;
  readTrusted(format: "qs", val: qs.Output): T;
  readTrusted(format: "bson" | "json" | "qs", input: any): T {
    switch (format) {
      case "bson":
        return input;
      case "json":
        return input;
      case "qs":
        return parseInt(input, 10);
      default:
        return undefined as never;
    }
  }

  read(format: "bson" | "json" | "qs", input: any): T {
    let val: number;
    switch (format) {
      case "bson":
      case "json":
        if (typeof input !== "number") {
          throw WrongTypeError.create("number", input);
        }
        val = input;
        break;
      case "qs":
        if (typeof input !== "string") {
          throw WrongTypeError.create("string", input);
        }
        val = parseInt(input, 10);
        break;
      default:
        throw UnknownFormatError.create(format);
    }

    if ((val | 0) !== val) {
      throw InvalidInt32Error.create(val, input);
    }
    return val;
  }

  write(format: "bson", val: T): bson.Output;
  write(format: "json", val: T): json.Output;
  write(format: "qs", val: T): qs.Output;
  write(format: "bson" | "json" | "qs", val: T): any {
    switch (format) {
      case "bson":
        return val;
      case "json":
        return val;
      case "qs":
        return val.toString(10);
      default:
        return undefined as never;
    }
  }

  testError(val: T): Error | undefined {
    if (typeof val !== "number") {
      return WrongTypeError.create("number", val);
    }
    if ((val | 0) !== val) {
      return InvalidInt32Error.create(val);
    }
    return undefined;
  }

  test(val: T): boolean {
    return typeof val === "number" && (val | 0) === val;
  }

  equals(val1: T, val2: T): boolean {
    return val1 === val2;
  }

  clone(val: T): T {
    return val;
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    return newVal === oldVal ? undefined : newVal - oldVal;
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    return diff === undefined ? oldVal : oldVal + diff as T;
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
}

export {Int32Type as Type};
