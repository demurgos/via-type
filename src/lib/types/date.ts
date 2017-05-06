import {InvalidTimestampError} from "../errors/invalid-timestamp";
import {UnknownFormatError} from "../errors/unknown-format";
import {WrongTypeError} from "../errors/wrong-type";
import {SerializableType, VersionedType} from "../interfaces";

export type Name = "date";
export const name: Name = "date";
export type T = Date;
export namespace bson {
  export type Input = Date;
  export type Output = Date;
}
export namespace json {
  export type Input = string | number;
  export type Output = string;
  export interface Type {
    name: Name;
  }
}
export namespace qs {
  export type Input = string;
  export type Output = string;
}
export type Diff = number;

export class DateType
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
    switch (format) {
      case "bson":
        return new Date(input.getTime());
      case "json":
      case "qs":
        return new Date(input);
      default:
        return undefined as never;
    }
  }

  read(format: "bson" | "json" | "qs", input: any): T {
    let result: Date;
    switch (format) {
      case "bson":
        if (!(input instanceof Date)) {
          throw WrongTypeError.create("Date", input);
        }
        result = new Date(input.getTime());
        break;
      case "json":
        if (typeof input === "string") {
          result = new Date(input);
        } else if (typeof input === "number") {
          result = new Date(input);
        } else {
          throw WrongTypeError.create("string | number", input);
        }
        break;
      case "qs":
        if (typeof input !== "string") {
          throw WrongTypeError.create("string", input);
        }
        result = new Date(input);
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

  write(format: "bson", val: T): bson.Output;
  write(format: "json", val: T): json.Output;
  write(format: "qs", val: T): qs.Output;
  write(format: "bson" | "json" | "qs", val: T): any {
    switch (format) {
      case "bson":
        return new Date(val.getTime());
      case "json":
      case "qs":
        return val.toISOString();
      default:
        return undefined as never;
    }
  }

  testError(val: T): Error | undefined {
    if (!(val instanceof Date)) {
      return WrongTypeError.create("Date", val);
    }
    const time: number = val.getTime();
    if (isNaN(time) || time > Number.MAX_SAFE_INTEGER || time < Number.MIN_SAFE_INTEGER) {
      return InvalidTimestampError.create(val);
    }

    return undefined;
  }

  test(val: T): val is T {
    return this.testError(val) === undefined;
  }

  equals(val1: T, val2: T): boolean {
    return val1.getTime() === val2.getTime();
  }

  clone(val: T): T {
    return new Date(val.getTime());
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    return newVal.getTime() - oldVal.getTime() || undefined;
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    return new Date(oldVal.getTime() + (diff || 0));
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
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

export {DateType as Type};
