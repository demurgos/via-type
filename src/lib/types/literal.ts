import {Incident} from "incident";
import {NotImplementedError} from "../errors/not-implemented";
import {UnknownFormatError} from "../errors/unknown-format";
import {SerializableType, VersionedType} from "../interfaces";

export type Name = "literal";
export const name: Name = "literal";
export namespace bson {
  export type Input = any;
  export type Output = any;
}
export namespace json {
  export type Input = any;
  export type Output = any;
  export type Type = undefined;
}
export namespace qs {
  export type Input = any;
  export type Output = any;
}
export type Diff = any;

export interface Options<T, Output, Input extends Output, Diff> {
  type: VersionedType<any, Output, Input, Diff>;
  value: T;
}

export class LiteralType<T>
  implements VersionedType<T, json.Input, json.Output, Diff>,
    SerializableType<T, "bson", bson.Input, bson.Output>,
    SerializableType<T, "qs", qs.Input, qs.Output> {
  readonly name: Name = name;
  readonly type: VersionedType<T, any, any, Diff>;
  readonly value: T;

  constructor(options: Options<T, any, any, any>) {
    this.type = options.type;
    this.value = options.value;
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("LiteralType#toJSON");
  }

  readTrusted(format: "bson", val: bson.Output): T;
  readTrusted(format: "json", val: json.Output): T;
  readTrusted(format: "qs", val: qs.Output): T;
  readTrusted(format: "bson" | "json" | "qs", input: any): T {
    // TODO(demurgos): Check if the format is supported instead of casting to `any`
    return this.type.readTrusted(<any> format, input);
  }

  read(format: "bson" | "json" | "qs", input: any): T {
    switch (format) {
      case "bson":
      case "json":
      case "qs":
        // TODO(demurgos): Check if the format is supported instead of casting to `any`
        return this.type.read(<any> format, input);
      default:
        throw UnknownFormatError.create(format);
    }
  }

  write(format: "bson", val: T): bson.Output;
  write(format: "json", val: T): json.Output;
  write(format: "qs", val: T): qs.Output;
  write(format: "bson" | "json" | "qs", val: T): any {
    // TODO(demurgos): Check if the format is supported instead of casting to `any`
    return this.type.write(<any> format, val);
  }

  testError(val: T): Error | undefined {
    const error: Error | undefined = this.type.testError(val);
    if (error) {
      return error;
    }
    if (!this.type.equals(val, this.value)) {
      return Incident("InvalidLiteral", "Invalid literal value");
    }
    return undefined;
  }

  test(val: T): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: T, val2: T): boolean {
    return this.type.equals(val1, val2);
  }

  clone(val: T): T {
    return this.type.clone(val);
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    throw NotImplementedError.create("LiteralType#diff");
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    throw NotImplementedError.create("LiteralType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("LiteralType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("LiteralType#squash");
  }
}

export {LiteralType as Type};
