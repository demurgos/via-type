import {UnknownFormatError} from "./_errors/unknown-format";
import {WrongTypeError} from "./_errors/wrong-type";
import {SerializableType, VersionedType} from "./_interfaces";

export type Name = "null";
export const name: Name = "null";
export type T = null;
export namespace bson {
  export type Input = null;
  export type Output = null;
}
export namespace json {
  export type Input = null;
  export type Output = null;
  export interface Type {
    name: Name;
  }
}
export namespace qs {
  export type Input = "";
  export type Output = "";
}
export type Diff = undefined;

export class NullType
  implements VersionedType<T, json.Input, json.Output, Diff>,
    SerializableType<T, "bson", bson.Input, bson.Output>,
    SerializableType<T, "qs", qs.Input, qs.Output> {
  readonly name: Name = name;

  toJSON(): json.Type {
    return {name: name};
  }

  readTrusted(format: "bson", val: bson.Output): T;
  readTrusted(format: "json", val: json.Output): T;
  readTrusted(format: "qs", val: qs.Output): T;
  readTrusted(format: "bson" | "json" | "qs", input: any): T {
    return null;
  }

  read(format: "bson" | "json" | "qs", input: any): T {
    switch (format) {
      case "bson":
      case "json":
        if (input !== null) {
          throw WrongTypeError.create("null", input);
        }
        return null;
      case "qs":
        if (input !== "") {
          throw WrongTypeError.create("\"\"", input);
        }
        return null;
      default:
        throw UnknownFormatError.create(format);
    }
  }

  write(format: "bson", val: T): bson.Output;
  write(format: "json", val: T): json.Output;
  write(format: "qs", val: T): qs.Output;
  write(format: "bson" | "json" | "qs", val: T): any {
    switch (format) {
      case "bson":
      case "json":
        return null;
      case "qs":
        return "";
      default:
        return undefined as never;
    }
  }

  testError(val: T): Error | undefined {
    if (val !== "null") {
      return WrongTypeError.create("null", val);
    }
    return undefined;
  }

  test(val: T): val is T {
    return val === null;
  }

  equals(val1: T, val2: T): boolean {
    return val1 === val2;
  }

  clone(val: T): T {
    return val;
  }

  /**
   * @param oldVal
   * @param newVal
   * @returns `true` if there is a difference, `undefined` otherwise
   */
  diff(oldVal: T, newVal: T): Diff | undefined {
    return undefined;
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    return null;
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    return undefined;
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    return undefined;
  }
}

export {NullType as Type};
