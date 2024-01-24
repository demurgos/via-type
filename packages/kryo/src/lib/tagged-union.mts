import {lazyProperties} from "./_helpers/lazy-properties.mjs";
import {writeError} from "./_helpers/write-error.mjs";
import {CheckKind} from "./checks/check-kind.mjs";
import {UnionMatchCheck} from "./checks/union-match.mjs";
import {UnionTagValueCheck} from "./checks/union-tag-value.mjs";
import {
  CheckId,
  IoType,
  KryoContext,
  Lazy,
  NOOP_CONTEXT,
  Reader,
  Result,
  TypedValue,
  VersionedType,
  Writer
} from "./index.mjs";
import {LiteralType} from "./literal.mjs";
import {readVisitor} from "./readers/read-visitor.mjs";
import {RecordType} from "./record.mjs";
import {TsEnumType} from "./ts-enum.mjs";

export type Name = "union";
export const name: Name = "union";
export type Diff = any;

export interface TaggedUnionTypeOptions<T, $T extends RecordType<T> = RecordType<T>> {
  variants: readonly $T[];
  tag: keyof T;
}

export type TestWithVariantResult<T> =
  [true, VersionedType<T, unknown>]
  | [false, VersionedType<T, unknown> | undefined];

/**
 * Represent a union T of record type M, where each record has key K with a unique value acting as a discriminant.
 *
 * This the runtime variant of TypeScript's discriminated unions.
 */
// <T, K extends keyof T, M extends (RecordType<T> & {properties: {[tag in K]: LiteralType<unknown> & {type: TsEnumType}}}
export class TaggedUnionType<T, M extends RecordType<T> = RecordType<T>>
implements IoType<T>,
    TaggedUnionTypeOptions<T, M> {
  readonly name: Name = name;
  readonly variants!: readonly M[];
  readonly tag!: keyof T;
  private _valueToVariantMap!: Map<unknown, M>;

  private _options?: Lazy<TaggedUnionTypeOptions<T, M>>;

  private _outTag: string | undefined;

  private _tagType: TsEnumType | undefined;


  constructor(options: Lazy<TaggedUnionTypeOptions<T, M>>) {
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

  match(cx: KryoContext, value: unknown): Result<M, CheckId> {
    if (typeof value !== "object" || value === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Record"]});
    }
    const tag: keyof T = this.tag;
    const tagValue: unknown = Reflect.get(value, tag);
    if (tagValue === undefined) {
      return writeError(cx, {check: CheckKind.UnionTagPresent, tag: String(tag)});
    }
    const variantType: M | undefined = this._valueToVariantMap.get(tagValue); // tagToVariant
    if (variantType === undefined) {
      return writeError(cx, {
        check: CheckKind.UnionTagValue,
        tag: String(this.tag),
        actual: String(tagValue),
        allowed: [...this._valueToVariantMap.keys()].map((s) => String(s))
      } satisfies UnionTagValueCheck);
    }
    return {ok: true, value: variantType};
  }

  matchTrusted(value: T): M {
    const {ok, value: variantType} = this.match(NOOP_CONTEXT, value);
    if (!ok) {
      throw new Error("no matching variant found for `TaggedUnion` value");
    }
    return variantType;
  }

  write<W>(writer: Writer<W>, value: T): W {
    const variant: M = this.matchTrusted(value);
    if (variant.write === undefined) {
      throw new Error(`write is not supported for TaggedUnion with non-writable variant ${variant.name}`);
    }
    return variant.write(writer, value);
  }

  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<T, CheckId> {
    const {ok, value} = this.variantRead(cx, reader, raw);
    if (ok) {
      return {ok: true, value: value.value};
    } else {
      return {ok: false, value};
    }
  }

  variantRead<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<TypedValue<T, M>, CheckId> {
    return reader.readRecord(cx, raw, readVisitor({
      fromMap: <RK, RV>(
        input: Map<RK, RV>,
        keyReader: Reader<RK>,
        valueReader: Reader<RV>,
      ): Result<TypedValue<T, M>, CheckId> => {
        const outTag: string = this.getOutTag();
        for (const [rawKey, rawValue] of input) {
          const {ok: okUnecheckedKey, value: outKey} = keyReader.readString(
            cx,
            rawKey,
            readVisitor({fromString: (value: string): Result<string, CheckId> => ({ok: true, value})}),
          );
          if (!okUnecheckedKey) {
            return writeError(cx, {check: CheckKind.PropertyKeyFormat, children: [outKey]});
          }
          if (outKey !== outTag) {
            continue;
          }
          const {ok: tagValueOk, value: tagValue} = this.getTagType().read(cx, valueReader, rawValue);
          const variant: M | undefined = tagValueOk ? this._valueToVariantMap.get(tagValue) : undefined; // tagToVariant
          if (variant === undefined) {
            return writeError(cx, {
              check: CheckKind.UnionTagValue,
              tag: String(this.tag),
              actual: String(tagValue),
              allowed: [...this._valueToVariantMap.keys()].map((s) => String(s))
            } satisfies UnionTagValueCheck);
          }
          const {ok, value} = variant.read!(cx, reader, raw);
          if (!ok) {
            return writeError(cx, {check: CheckKind.UnionMatch, children: [value]} satisfies UnionMatchCheck);
          }
          return {ok: true, value: {type: variant, value}};
        }
        return writeError(cx, {check: CheckKind.UnionTagPresent, tag: String(this.tag)});
      },
    }));
  }

  test(cx: KryoContext, value: unknown): Result<T, CheckId> {
    if (typeof value !== "object" || value === null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Record"]});
    }
    const {ok, value: variantType} = this.match(cx, value);
    if (!ok) {
      return writeError(cx, {check: CheckKind.UnionMatch, children: [variantType]} satisfies UnionMatchCheck);
    }
    return variantType.test(cx, value);
  }

  equals(val1: T, val2: T): boolean {
    const type1: M = this.matchTrusted(val1);
    const type2: M = this.matchTrusted(val2);
    return type1 === type2 && type1.equals(val1, val2);
  }

  clone(val: T): T {
    return this.matchTrusted(val).clone(val);
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Error("missing `_options` for lazy initialization");
    }
    const options: TaggedUnionTypeOptions<T, M> = typeof this._options === "function"
      ? this._options()
      : this._options;
    delete this._options;

    const variants: readonly M[] = options.variants;
    const tag: keyof T = options.tag;
    const tagValueToType: Map<unknown, M> = new Map();

    for (const variantType of variants) {
      const lit: LiteralType<unknown> & { type: TsEnumType } = variantType.properties[tag].type as any;
      if (tagValueToType.has(lit.value)) {
        throw new Error(`\`TaggedUnion\` tag value ${lit.value} is is not unique`);
      }
      tagValueToType.set(lit.value, variantType);
    }

    Object.assign(this, {variants, tag, _valueToVariantMap: tagValueToType});
  }

  /**
   * Returns the serialized name of the tag property.
   *
   * The name is computed on-demand and cached. It is not computed in the constructor (or option application)
   * to avoid throwing if the type is not used for IO.
   */
  private getOutTag(): string {
    const tag = this.tag;
    if (this._outTag === undefined) {
      let outTag: string | undefined = undefined;
      for (const variant of this.variants) {
        const cur: string = variant.getOutKey(tag);
        if (outTag === undefined) {
          outTag = cur;
        } else if (cur !== outTag) {
          throw new Error(`conflict for out key of the tag property: tag=${String(tag)}, firstOut=${cur}, secondOut=${outTag}`);
        }
      }
      if (outTag === undefined) {
        throw new Error("failed to find out key of the tag property");
      }
      this._outTag = outTag;
    }
    return this._outTag;
  }

  /**
   * Returns the type of the tag property.
   *
   * The type is computed on-demand and cached. It is not computed in the constructor (or option application)
   * to avoid throwing if the type is not used for IO.
   */
  private getTagType(): TsEnumType {
    if (this._tagType === undefined) {
      const tag = this.tag;
      let tagType: TsEnumType | undefined = undefined;
      for (const variant of this.variants) {
        const lit: LiteralType<unknown> & { type: TsEnumType } = variant.properties[tag].type as any;
        const cur: TsEnumType = lit.type;
        if (tagType === undefined) {
          tagType = cur;
        } else if (cur !== tagType) {
          throw new Error("conflict for tag property type");
        }
      }
      if (tagType === undefined) {
        throw new Error("failed to find type of the tag property");
      }
      this._tagType = tagType;
    }
    return this._tagType;
  }
}
