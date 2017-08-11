import {Binary as BinaryType} from "bson";
import {MaxArrayLengthError} from "./_errors/max-array-length";
import {MissingDependencyError} from "./_errors/missing-dependency";
import {NotImplementedError} from "./_errors/not-implemented";
import {UnknownFormatError} from "./_errors/unknown-format";
import {WrongTypeError} from "./_errors/wrong-type";
import {SerializableType, VersionedType} from "./_interfaces";

export type Name = "buffer";
export const name: Name = "buffer";
export namespace bson {
  export type Input = BinaryType | Buffer | Uint8Array;
  export type Output = BinaryType;
}
export namespace json {
  export type Input = string;
  export type Output = string;
  // TODO(demurgos): Export bufferType to JSON
  export type Type = undefined;
}
export namespace qs {
  export type Input = string;
  export type Output = string;
}
export type Diff = any;

export interface Options {
  maxLength: number;
}

function isBinary(val: any): val is BinaryType {
  return val._bsontype === "Binary";
}

/* tslint:disable-next-line:variable-name */
let Binary: {new(b: Uint8Array): BinaryType} | undefined = undefined;
try {
  // TODO: Fix BSON type definitions
  /* tslint:disable-next-line:no-var-requires */
  Binary = require("bson").Binary;
} catch (err) {
  // Ignore dependency not found error.
}

export class BufferType
  implements VersionedType<Uint8Array, json.Input, json.Output, Diff>,
    SerializableType<Uint8Array, "bson", bson.Input, bson.Output>,
    SerializableType<Uint8Array, "qs", qs.Input, qs.Output> {
  readonly name: Name = name;
  readonly maxLength: number;

  constructor(options: Options) {
    this.maxLength = options.maxLength;
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("BufferType#toJSON");
  }

  readTrusted(format: "bson", val: bson.Output): Uint8Array;
  readTrusted(format: "json", val: json.Output): Uint8Array;
  readTrusted(format: "qs", val: qs.Output): Uint8Array;
  readTrusted(format: "bson" | "json" | "qs", input: any): Uint8Array {
    switch (format) {
      case "bson":
        return (<any> input as {value(asRaw: true): Buffer}).value(true);
      case "json":
      case "qs":
        const len: number = input.length / 2;
        const result: Uint8Array = new Uint8Array(len);
        for (let i: number = 0; i < len; i++) {
          result[i] = parseInt(input.substr(2 * i, 2), 16);
        }
        return result;
      default:
        return undefined as never;
    }
  }

  read(format: "bson" | "json" | "qs", input: any): Uint8Array {
    let result: Uint8Array;
    switch (format) {
      case "bson":
        if (isBinary(input)) {
          // TODO: Fix BSON type definitions
          result = (<any> input as {value(asRaw: true): Buffer}).value(true);
        } else {
          result = input;
        }
        break;
      case "json":
      case "qs":
        if (typeof input !== "string") {
          throw WrongTypeError.create("string", input);
        } else if (!/^(?:[0-9a-f]{2})*$/.test(input)) {
          throw WrongTypeError.create("lowerCaseHexEvenLengthString", input);
        }
        const len: number = input.length / 2;
        result = new Uint8Array(len);
        for (let i: number = 0; i < len; i++) {
          result[i] = parseInt(input.substr(2 * i, 2), 16);
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

  write(format: "bson", val: Uint8Array): bson.Output;
  write(format: "json", val: Uint8Array): json.Output;
  write(format: "qs", val: Uint8Array): qs.Output;
  write(format: "bson" | "json" | "qs", val: Uint8Array): any {
    switch (format) {
      case "bson":
        if (Binary === undefined) {
          throw MissingDependencyError.create("bson", "Required to write buffers to BSON.");
        }
        return new Binary(Buffer.from(val as any));
      case "json":
      case "qs":
        const result: string[] = new Array(val.length);
        const len: number = val.length;
        for (let i: number = 0; i < len; i++) {
          result[i] = (val[i] < 16 ? "0" : "") + val[i].toString(16);
        }
        return result.join("");
      default:
        return undefined as never;
    }
  }

  testError(val: Uint8Array): Error | undefined {
    if (!(val instanceof Uint8Array)) {
      return WrongTypeError.create("Uint8Array", val);
    }
    if (this.maxLength !== undefined && val.length > this.maxLength) {
      return MaxArrayLengthError.create(val, this.maxLength);
    }
    return undefined;
  }

  test(val: Uint8Array): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: Uint8Array, val2: Uint8Array): boolean {
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

  clone(val: Uint8Array): Uint8Array {
    return Uint8Array.from(val);
  }

  /**
   * @param oldVal
   * @param newVal
   * @returns `true` if there is a difference, `undefined` otherwise
   */
  diff(oldVal: Uint8Array, newVal: Uint8Array): Diff | undefined {
    throw NotImplementedError.create("BufferType#diff");
  }

  patch(oldVal: Uint8Array, diff: Diff | undefined): Uint8Array {
    throw NotImplementedError.create("BufferType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("BufferType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("BufferType#squash");
  }
}

export {BufferType as Type};
