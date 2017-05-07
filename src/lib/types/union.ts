import {Incident} from "incident";
import {NotImplementedError} from "../errors/not-implemented";
import {UnknownFormatError} from "../errors/unknown-format";
import {SerializableType, VersionedType} from "../interfaces";

export type Name = "union";
export const name: Name = "union";
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

export type Matcher<T, Output, Input extends Output, Diff> = (
  value: any,
  variants: VersionedType<T, Output, Input, Diff>[]
) => VersionedType<T, Output, Input, Diff> | undefined;

export type TrustedMatcher<T, Output, Input extends Output, Diff> = (
  value: T,
  variants: VersionedType<T, Output, Input, Diff>[]
) => VersionedType<T, Output, Input, Diff>;

export type ReadMatcher<T, Output, Input extends Output, Diff> = (
  format: "bson" | "json" | "qs",
  value: T,
  variants: VersionedType<T, Output, Input, Diff>[]
) => VersionedType<T, Output, Input, Diff> | undefined;

export type ReadTrustedMatcher<T, Output, Input extends Output, Diff> = (
  format: "bson" | "json" | "qs",
  value: T,
  variants: VersionedType<T, Output, Input, Diff>[]
) => VersionedType<T, Output, Input, Diff>;

export interface Options<T, Output, Input extends Output, Diff> {
  variants: VersionedType<T, Output, Input, Diff>[];
  matcher: Matcher<T, Output, Input, Diff>;
  trustedMatcher?: TrustedMatcher<T, Output, Input, Diff>;
  readMatcher: ReadMatcher<T, Output, Input, Diff>;
  readTrustedMatcher?: ReadTrustedMatcher<T, Output, Input, Diff>;
}

export class UnionType<T>
  implements VersionedType<T, json.Input, json.Output, Diff>,
    SerializableType<T, "bson", bson.Input, bson.Output>,
    SerializableType<T, "qs", qs.Input, qs.Output> {
  readonly name: Name = name;
  readonly variants: VersionedType<T, any, any, Diff>[];
  readonly matcher: Matcher<T, any, any, Diff>;
  readonly trustedMatcher: TrustedMatcher<T, any, any, Diff>;
  readonly readMatcher: ReadMatcher<T, any, any, Diff>;
  readonly readTrustedMatcher: ReadTrustedMatcher<T, any, any, Diff>;

  constructor(options: Options<T, any, any, any>) {
    this.variants = options.variants;
    this.matcher = options.matcher;
    this.trustedMatcher = options.trustedMatcher || this.matcher as TrustedMatcher<T, any, any, Diff>;
    this.readMatcher = options.readMatcher;
    this.readTrustedMatcher = options.readTrustedMatcher || this.readMatcher as ReadTrustedMatcher<T, any, any, Diff>;
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("UnionType#toJSON");
  }

  readTrusted(format: "bson", val: bson.Output): T;
  readTrusted(format: "json", val: json.Output): T;
  readTrusted(format: "qs", val: qs.Output): T;
  readTrusted(format: "bson" | "json" | "qs", input: any): T {
    // TODO(demurgos): Check if the format is supported instead of casting to `any`
    return this.readTrustedMatcher(format, input, this.variants).readTrusted(<any> format, input);
  }

  read(format: "bson" | "json" | "qs", input: any): T {
    switch (format) {
      case "bson":
      case "json":
      case "qs":
        // TODO(demurgos): Check if the format is supported instead of casting to `any`
        const type: VersionedType<T, any, any, any> | undefined = this.readMatcher(format, input, this.variants);
        if (type === undefined) {
          throw Incident("UnknownUnionVariant", "Unknown union variant");
        }
        return type.read(<any> format, input);
      default:
        throw UnknownFormatError.create(format);
    }
  }

  write(format: "bson", val: T): bson.Output;
  write(format: "json", val: T): json.Output;
  write(format: "qs", val: T): qs.Output;
  write(format: "bson" | "json" | "qs", val: T): any {
    // TODO(demurgos): Check if the format is supported instead of casting to `any`
    return this.trustedMatcher(val, this.variants).write(<any> format, val);
  }

  testError(val: T): Error | undefined {
    const type: VersionedType<T, any, any, any> | undefined = this.matcher(val, this.variants);
    if (type === undefined) {
      return Incident("UnknownUnionVariant", "Unknown union variant");
    }
    return type.testError(val);
  }

  test(val: T): boolean {
    const type: VersionedType<T, any, any, any> | undefined = this.matcher(val, this.variants);
    if (type === undefined) {
      return false;
    }
    return type.test(val);
  }

  // TODO: Always return true ?
  equals(val1: T, val2: T): boolean {
    const type1: VersionedType<T, any, any, any> = this.trustedMatcher(val1, this.variants);
    const type2: VersionedType<T, any, any, any> = this.trustedMatcher(val2, this.variants);
    return type1 === type2 && type1.equals(val1, val2);
  }

  clone(val: T): T {
    return this.trustedMatcher(val, this.variants).clone(val);
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    throw NotImplementedError.create("UnionType#diff");
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    throw NotImplementedError.create("UnionType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("UnionType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("UnionType#squash");
  }
}

export {UnionType as Type};
