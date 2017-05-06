import {Incident} from "incident";
import {UnknownFormatError} from "../errors/unknown-format";
import {WrongTypeError} from "../errors/wrong-type";
import {SerializableType, VersionedType} from "../interfaces";

export type Name = "float64";
export const name: Name = "float64";
export type T = number;
export namespace bson {
  // TODO(demurgos): Check if BSON support NaN and Infinity (add some tests)
  export type Input = number;
  export type Output = number;
}
export namespace json {
  export type Input = number | "NaN" | "+Infinity" | "-Infinity";
  export type Output = number | "NaN" | "+Infinity" | "-Infinity";
  export interface Type {
    name: Name;
    notNan: boolean;
    notInfinity: boolean;
  }
}
export namespace qs {
  export type Input = string;
  export type Output = string;
}
export type Diff = [number, number];
export interface Options {
  notNan?: boolean;
  notInfinity?: boolean;
}

export class Float64Type
  implements VersionedType<T, json.Input, json.Output, Diff>,
    SerializableType<T, "bson", bson.Input, bson.Output>,
    SerializableType<T, "qs", qs.Input, qs.Output> {
  static fromJSON(options: json.Type): Float64Type {
    return new Float64Type(options);
  }

  readonly name: Name = name;
  readonly notNan: boolean; // TODO(demurgos): rename to allowNaN
  readonly notInfinity: boolean; // TODO(demurgos): rename to allowInfinity

  constructor(options?: Options) {
    const defaultNotNan: boolean = true;
    const defaultNotInfinity: boolean = true;
    if (options === undefined) {
      this.notNan = defaultNotNan;
      this.notInfinity = defaultNotInfinity;
    } else {
      this.notNan = options.notNan !== undefined ? options.notNan : defaultNotNan;
      this.notInfinity = options.notInfinity !== undefined ? options.notInfinity : defaultNotInfinity;
    }
  }

  toJSON(): json.Type {
    return {
      name: name,
      notNan: this.notNan,
      notInfinity: this.notInfinity
    };
  }

  readTrusted(format: "bson", val: bson.Output): T;
  readTrusted(format: "json", val: json.Output): T;
  readTrusted(format: "qs", val: qs.Output): T;
  readTrusted(format: "bson" | "json" | "qs", input: any): T {
    switch (format) {
      case "bson":
        return input;
      case "json":
        if (typeof input === "number") {
          return input;
        }
        switch (input) {
          case "NaN":
            return NaN;
          case "+Infinity":
            return Infinity;
          case "-Infinity":
            return -Infinity;
          default:
            return undefined as never;
        }
      case "qs":
        switch (input) {
          case "NaN":
            return NaN;
          case "+Infinity":
            return Infinity;
          case "-Infinity":
            return -Infinity;
          default:
            return parseFloat(input);
        }
      default:
        return undefined as never;
    }
  }

  read(format: "bson" | "json" | "qs", input: any): T {
    switch (format) {
      case "bson":
        if (typeof input !== "number") {
          throw WrongTypeError.create("number", input);
        }
        return input;
      case "json":
        if (typeof input === "number") {
          return input;
        }
        switch (input) {
          case "NaN":
            if (this.notNan) {
              throw Incident("Nan", "NaN is not allowed");
            }
            return NaN;
          case "+Infinity":
            if (this.notNan) {
              throw Incident("Infinity", "+Infinity is not allowed");
            }
            return Infinity;
          case "-Infinity":
            if (this.notNan) {
              throw Incident("Infinity", "-Infinity is not allowed");
            }
            return -Infinity;
          default:
            throw Incident("InvalidNumberInput", "Expected a number, or one of NaN, +Infinity, -Infinity");
        }
      case "qs":
        if (typeof input !== "string") {
          throw WrongTypeError.create("string", input);
        }
        switch (input) {
          case "NaN":
            if (this.notNan) {
              throw Incident("Nan", "NaN is not allowed");
            }
            return NaN;
          case "+Infinity":
            if (this.notNan) {
              throw Incident("Infinity", "+Infinity is not allowed");
            }
            return Infinity;
          case "-Infinity":
            if (this.notNan) {
              throw Incident("Infinity", "-Infinity is not allowed");
            }
            return -Infinity;
          default:
            const val: number = parseFloat(input);
            const error: Error | undefined = this.testError(val);
            if (error !== undefined) {
              throw error;
            }
            return val;
        }
      default:
        throw UnknownFormatError.create(format);
    }
  }

  write(format: "bson", val: T): bson.Output;
  write(format: "json", val: T): json.Output;
  write(format: "qs", val: T): qs.Output;
  write(format: "bson" | "json" | "qs", val: T): any {
    if (format === "bson") {
      return val;
    }
    if (isNaN(val)) {
      return "NaN";
    } else if (val === Infinity) {
      return "+Infinity";
    } else if (val === -Infinity) {
      return "-Infinity";
    }
    return format === "json" ? val : val.toString(10);
  }

  testError(val: T): Error | undefined {
    if (typeof val !== "number") {
      return WrongTypeError.create("number", val);
    }
    if (isNaN(val) && this.notNan) {
      return Incident("");
    } else if (val === Infinity && this.notInfinity) {
      return Incident("Infinity", "+Infinity is not allowed");
    } else if (val === -Infinity && this.notInfinity) {
      return Incident("Infinity", "-Infinity is not allowed");
    }
    return undefined;
  }

  test(val: T): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: T, val2: T): boolean {
    if (isNaN(val1) || isNaN(val2)) {
      return isNaN(val1) && isNaN(val2);
    }
    return val1 === val2;
  }

  clone(val: T): T {
    return val;
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    // We can't use an arithmetic difference due to possible precision loss
    return this.equals(oldVal, newVal) ? undefined : [oldVal, newVal];
  }

  patch(oldVal: T, diff: Diff | undefined): T {
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
}

export {Float64Type as Type};
