import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { createLazyOptionsError } from "../errors/lazy-options";
import { createNotImplementedError, NotImplementedError } from "../errors/not-implemented";
import { JSON_SERIALIZER } from "../json/index";
import { JsonSerializer, Lazy, Serializer, Type, VersionedType } from "../types";

export type Name = "union";
export const name: Name = "union";
export namespace json {
  export type Input = any;
  export type Output = any;
  export type Type = undefined;
}
export type Diff = any;

export type Matcher<T> = (value: T) => Type<T> | undefined;
export type TrustedMatcher<T> = (value: T) => Type<T>;
export type ReadMatcher<T> = (input: any, serializer: Serializer) => Type<T> | undefined;
export type ReadTrustedMatcher<T> = (input: any, serializer: Serializer) => Type<T>;

export interface Options<T, Output, Input extends Output, Diff> {
  variants: VersionedType<T, Output, Input, Diff>[];
  matcher: Matcher<T>;
  trustedMatcher?: TrustedMatcher<T>;
  readMatcher: ReadMatcher<T>;
  readTrustedMatcher?: ReadTrustedMatcher<T>;
}

/* tslint:disable-next-line:max-line-length */
export type TestWithVariantResult<T> =
  [true, VersionedType<T, any, any, any>]
  | [false, VersionedType<T, any, any, any> | undefined];

export class UnionType<T> implements VersionedType<T, json.Input, json.Output, Diff> {
  readonly name: Name = name;
  readonly variants: VersionedType<T, any, any, Diff>[];
  readonly matcher: Matcher<T>;
  readonly trustedMatcher: TrustedMatcher<T>;
  readonly readMatcher: ReadMatcher<T>;
  readonly readTrustedMatcher: ReadTrustedMatcher<T>;

  private _options?: Lazy<Options<T, any, any, any>>;

  constructor(options: Lazy<Options<T, any, any, any>>) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.variants = <any> undefined;
    this.matcher = <any> undefined;
    this.trustedMatcher = <any> undefined;
    this.readMatcher = <any> undefined;
    this.readTrustedMatcher = <any> undefined;

    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(
        this,
        this._applyOptions,
        ["variants", "matcher", "trustedMatcher", "readMatcher", "readTrustedMatcher"],
      );
    }
  }

  toJSON(): json.Type {
    throw createNotImplementedError("UnionType#toJSON");
  }

  readTrustedJsonWithVariant(input: json.Output): [T, Type<T>] {
    const variant: Type<T> = this.readTrustedMatcher(input, JSON_SERIALIZER);
    // TODO(demurgos): Avoid casting
    return [(<any> variant as JsonSerializer<T>).readTrustedJson(input), variant];
  }

  readJsonWithVariant(input: any): [T, Type<T>] {
    const variant: Type<T> | undefined = this.readMatcher(input, JSON_SERIALIZER);
    if (variant === undefined) {
      throw new Incident("UnknownUnionVariant", "Unknown union variant");
    }
    // TODO(demurgos): Avoid casting
    return [(<any> variant as JsonSerializer<T>).readJson(input), variant];
  }

  readTrustedJson(input: json.Output): T {
    return this.readTrustedJsonWithVariant(input)[0];
  }

  readJson(input: any): T {
    return this.readJsonWithVariant(input)[0];
  }

  writeJson(val: T): json.Output {
    // TODO(demurgos): Avoid casting
    return (<any> this.trustedMatcher(val) as JsonSerializer<T>).writeJson(val);
  }

  testError(val: T): Error | undefined {
    const type: Type<T> | undefined = this.matcher(val);
    if (type === undefined) {
      return new Incident("UnknownUnionVariant", "Unknown union variant");
    }
    return type.testError(val);
  }

  testWithVariant(val: T): TestWithVariantResult<T> {
    const variant: Type<T> | undefined = this.matcher(val);
    if (variant === undefined) {
      return [false as false, undefined];
    }
    return [variant.test(val), variant] as TestWithVariantResult<T>;
  }

  test(val: T): boolean {
    const type: Type<T> | undefined = this.matcher(val);
    if (type === undefined) {
      return false;
    }
    return type.test(val);
  }

  // TODO: Always return true?
  equals(val1: T, val2: T): boolean {
    const type1: Type<T> = this.trustedMatcher(val1);
    const type2: Type<T> = this.trustedMatcher(val2);
    return type1 === type2 && type1.equals(val1, val2);
  }

  clone(val: T): T {
    return this.trustedMatcher(val).clone(val);
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    throw createNotImplementedError("UnionType#diff");
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    throw createNotImplementedError("UnionType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("UnionType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("UnionType#squash");
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: Options<T, any, any, any> = typeof this._options === "function" ? this._options() : this._options;
    delete this._options;
    const variants: VersionedType<T, any, any, Diff>[] = options.variants;
    const matcher: Matcher<T> = options.matcher;

    let trustedMatcher: TrustedMatcher<T>;
    if (options.trustedMatcher !== undefined) {
      trustedMatcher = options.trustedMatcher;
    } else {
      trustedMatcher = (value: T) => {
        const variant: Type<T> | undefined = matcher(value);
        if (variant === undefined) {
          throw new Incident("UnknownUnionVariant", "Unknown union variant");
        }
        return variant;
      };
    }

    const readMatcher: ReadMatcher<T> = options.readMatcher;

    let readTrustedMatcher: ReadTrustedMatcher<T>;
    if (options.readTrustedMatcher !== undefined) {
      readTrustedMatcher = options.readTrustedMatcher;
    } else {
      readTrustedMatcher = (
        input: any,
        serializer: Serializer,
      ): Type<T> => {
        const variant: Type<T> | undefined = readMatcher(input, serializer);
        if (variant === undefined) {
          throw new Incident("UnknownUnionVariant", {input, serializer}, "Unknown union variant");
        }
        return variant;
      };
    }
    Object.assign(this, {variants, matcher, trustedMatcher, readMatcher, readTrustedMatcher});
    Object.freeze(this);
  }
}
