import incident from "incident";

import { lazyProperties } from "./_helpers/lazy-properties.js";
import { testError } from "./_helpers/test-error.js";
import { createInvalidTypeError } from "./errors/invalid-type.js";
import { createLazyOptionsError } from "./errors/lazy-options.js";
import { IoType, Lazy, Reader, VersionedType, Writer } from "./index.js";
import { LiteralType } from "./literal.js";
import { readVisitor } from "./readers/read-visitor.js";
import { RecordType } from "./record.js";
import { TsEnumType } from "./ts-enum.js";

export type Name = "union";
export const name: Name = "union";
export type Diff = any;

export interface TaggedUnionTypeOptions<T, K extends RecordType<T> = RecordType<T>> {
  variants: ReadonlyArray<K>;
  tag: keyof T;
}

export type TestWithVariantResult<T> =
  [true, VersionedType<T, any>]
  | [false, VersionedType<T, any> | undefined];

export class TaggedUnionType<T, K extends RecordType<T> = RecordType<T>> implements IoType<T>,
  TaggedUnionTypeOptions<T, K> {
  readonly name: Name = name;
  readonly variants!: ReadonlyArray<K>;
  readonly tag!: keyof T;

  private _options?: Lazy<TaggedUnionTypeOptions<T, K>>;

  private _outTag: string | undefined;

  private _tagType: TsEnumType<any> | undefined;

  private _valueToVariantMap: Map<any, K> | undefined;

  constructor(options: Lazy<TaggedUnionTypeOptions<T, K>>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(
        this,
        this._applyOptions,
        ["variants", "tag"],
      );
    }
  }

  match(value: unknown): K | undefined {
    if (typeof value !== "object" || value === null) {
      throw createInvalidTypeError("object", value);
    }
    const tag: keyof T = this.tag;
    const tagValue: unknown = Reflect.get(value, tag);
    if (tagValue === undefined) {
      return undefined;
      // throw new incident.Incident("MissingTag", {union: this, value});
    }
    const variant: K | undefined = this.getValueToVariantMap().get(tagValue); // tagToVariant
    if (variant === undefined) {
      return undefined;
      // throw new incident.Incident("VariantNotFound", {union: this, value});
    }
    return variant;
  }

  matchTrusted(value: T): K {
    return this.match(value)!;
  }

  write<W>(writer: Writer<W>, value: T): W {
    const variant: K | undefined = this.match(value);
    if (variant === undefined) {
      throw new incident.Incident("VariantNotFound", {union: this, value});
    }
    if (variant.write === undefined) {
      throw new incident.Incident("NotWritable", {type: variant});
    }
    return variant.write(writer, value);
  }

  read<R>(reader: Reader<R>, raw: R): T {
    return this.variantRead(reader, raw)[1];
  }

  variantRead<R>(reader: Reader<R>, raw: R): [K, T] {
    return reader.readRecord(raw, readVisitor({
      fromMap: <RK, RV>(
        input: Map<RK, RV>,
        keyReader: Reader<RK>,
        valueReader: Reader<RV>,
      ): [K, T] => {
        const outTag: string = this.getOutTag();
        for (const [rawKey, rawValue] of input) {
          const outKey: string = keyReader.readString(
            rawKey,
            readVisitor({fromString: (input: string): string => input}),
          );
          if (outKey !== outTag) {
            continue;
          }
          const tagValue: any = this.getTagType().read(valueReader, rawValue);
          const variant: K | undefined = this.getValueToVariantMap().get(tagValue); // tagToVariant
          if (variant === undefined) {
            throw new incident.Incident("VariantNotFound", {union: this, tagValue});
          }
          return [variant, variant.read!(reader, raw)];
        }
        throw new incident.Incident("MissingOutTag");
      },
    }));
  }

  testError(value: unknown): Error | undefined {
    if (typeof value !== "object" || value === null) {
      return createInvalidTypeError("object", value);
    }
    const variant: K | undefined = this.match(value);
    if (variant === undefined) {
      return new incident.Incident("UnknownUnionVariant", "Unknown union variant");
    }
    return testError(variant, value);
  }

  // testWithVariant(val: T): TestWithVariantResult<T> {
  //   const variant: K | undefined = this.match(val);
  //   if (variant === undefined) {
  //     return [false as false, undefined];
  //   }
  //   return [variant.test(val), variant] as TestWithVariantResult<T>;
  // }

  test(value: unknown): value is T {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    const type: K | undefined = this.match(value);
    if (type === undefined) {
      return false;
    }
    return type.test(value);
  }

  // TODO: Always return true?
  equals(val1: T, val2: T): boolean {
    const type1: K = this.matchTrusted(val1);
    const type2: K = this.matchTrusted(val2);
    return type1 === type2 && type1.equals(val1, val2);
  }

  clone(val: T): T {
    return this.matchTrusted(val).clone(val);
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: TaggedUnionTypeOptions<T, K> = typeof this._options === "function"
      ? this._options()
      : this._options;
    delete this._options;
    const variants: ReadonlyArray<K> = options.variants;
    const tag: keyof T = options.tag;
    Object.assign(this, {variants, tag});
  }

  /**
   * Returns the serialized name of the tag property
   */
  private getOutTag(): string {
    if (this._outTag === undefined) {
      const tag: keyof T = this.tag;
      let outTag: string | undefined = undefined;
      for (const variant of this.variants) {
        const cur: string = variant.getOutKey(tag as any);
        if (outTag === undefined) {
          outTag = cur;
        } else if (cur !== outTag) {
          throw new incident.Incident("MixedOutTag", {tag, out: [cur, outTag]});
        }
      }
      if (outTag === undefined) {
        throw new incident.Incident("AssertionFailed", "Expected outTag to be defined");
      }
      this._outTag = outTag;
    }
    return this._outTag;
  }

  private getTagType(): TsEnumType<any> {
    if (this._tagType === undefined) {
      const tag: keyof T = this.tag;
      let tagType: TsEnumType<any> | undefined = undefined;
      for (const variant of this.variants) {
        const lit: LiteralType<any> = variant.properties[tag].type as any;
        const cur: TsEnumType<any> = lit.type as any;
        if (tagType === undefined) {
          tagType = cur;
        } else if (cur !== tagType) {
          throw new incident.Incident("MixedTagType", {tag, type: [cur, tagType]});
        }
      }
      if (tagType === undefined) {
        throw new incident.Incident("AssertionFailed", "Expected tagType to be defined");
      }
      this._tagType = tagType;
    }
    return this._tagType;
  }

  private getValueToVariantMap(): Map<any, K> {
    if (this._valueToVariantMap === undefined) {
      const tag: keyof T = this.tag;
      const valueToVariantMap: Map<any, K> = new Map();
      for (const variant of this.variants) {
        const lit: LiteralType<any> = variant.properties[tag].type as any;
        if (valueToVariantMap.has(lit.value)) {
          throw new incident.Incident("DuplicateTagValue", {value: lit.value});
        }
        valueToVariantMap.set(lit.value, variant);
      }
      if (valueToVariantMap === undefined) {
        throw new incident.Incident("AssertionFailed", "Expected valueToVariantMap to be defined");
      }
      this._valueToVariantMap = valueToVariantMap;
    }
    return this._valueToVariantMap;
  }
}
