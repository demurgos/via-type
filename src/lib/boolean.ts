import {UnknownFormatError} from "./_errors/unknown-format";
import {WrongTypeError} from "./_errors/wrong-type";
import {SerializableType, VersionedType} from "./_interfaces";

export type Name = "boolean";
export const name: Name = "boolean";
export type T = boolean;
export namespace bson {
  export type Input = boolean;
  export type Output = boolean;
}
export namespace json {
  export type Input = boolean;
  export type Output = boolean;
}
export namespace qs {
  export type Input = "true" | "false";
  export type Output = "true" | "false";
}
export type Diff = boolean;

export class BooleanType
  implements VersionedType<T, json.Input, json.Output, Diff>,
    SerializableType<T, "bson", bson.Input, bson.Output>,
    SerializableType<T, "qs", qs.Input, qs.Output> {
  readonly name: Name = name;

  toJSON(): undefined {
    return undefined;
  }

  readTrusted(format: "bson", val: bson.Output): T;
  readTrusted(format: "json", val: json.Output): T;
  readTrusted(format: "qs", val: qs.Output): T;
  readTrusted(format: "bson" | "json" | "qs", input: any): T {
    switch (format) {
      case "bson":
      case "json":
        return input;
      case "qs":
        return input === "true";
      default:
        return undefined as never;
    }
  }

  read(format: "bson" | "json" | "qs", input: any): T {
    switch (format) {
      case "bson":
      case "json":
        if (typeof input !== "boolean") {
          throw WrongTypeError.create("boolean", input);
        }
        return input;
      case "qs":
        if (!(input === "true" || input === "false")) {
          throw WrongTypeError.create("\"true\" | \"false\"", input);
        }
        return input === "true";
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
        return val;
      case "qs":
        return val ? "true" : "false";
      default:
        return undefined as never;
    }
  }

  testError(val: T): Error | undefined {
    if (typeof val !== "boolean") {
      return WrongTypeError.create("boolean", val);
    }
    return undefined;
  }

  test(val: T): val is T {
    return this.testError(val) === undefined;
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
    /* tslint:disable-next-line:strict-boolean-expressions */
    return (oldVal !== newVal) || undefined;
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    return oldVal === (diff === undefined);
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    return diff;
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    /* tslint:disable-next-line:strict-boolean-expressions */
    return (diff1 !== diff2) && undefined;
  }
}

export {BooleanType as Type};
