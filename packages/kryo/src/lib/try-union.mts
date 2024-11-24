import {writeCheck, writeError} from "./_helpers/context.mjs";
import {lazyProperties} from "./_helpers/lazy-properties.mjs";
import {AggregateCheck} from "./checks/aggregate.mjs";
import {CheckKind} from "./checks/check-kind.mjs";
import {UnionMatchCheck} from "./checks/union-match.mjs";
import {
  CheckId,
  IoType,
  KryoContext,
  Lazy,
  NOOP_CONTEXT,
  Reader,
  Result,
  Type,
  TypedValue,
  VersionedType,
  Writer
} from "./index.mjs";

export type Name = "union";
export const name: Name = "union";
export type Diff = any;

export interface TryUnionTypeOptions<T, M extends Type<T> = Type<T>> {
  variants: M[];
}

export type TestWithVariantResult<T> =
  [true, VersionedType<T, any>]
  | [false, VersionedType<T, any> | undefined];

export class TryUnionType<T, M extends Type<T> = Type<T>> implements IoType<T>, TryUnionTypeOptions<T, M> {
  readonly name: Name = name;
  readonly variants!: M[];

  private _options?: Lazy<TryUnionTypeOptions<T, M>>;

  constructor(options: Lazy<TryUnionTypeOptions<T, M>>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(
        this,
        this._applyOptions,
        ["variants"],
      );
    }
  }

  match(cx: KryoContext | null, value: unknown): Result<TypedValue<T, M>, CheckId> {
    const variantChecks: CheckId[] = [];
    for (const variant of this.variants) {
      const {ok, value: actual} = variant.test(cx, value);
      if (ok) {
        return {ok: true, value: {type: variant, value: actual}};
      } else {
        variantChecks.push(actual satisfies CheckId);
      }
    }
    const source: CheckId = writeCheck(cx, {
      check: CheckKind.Aggregate,
      children: variantChecks,
    } satisfies AggregateCheck);
    return writeError(cx, {check: CheckKind.UnionMatch, children: [source]} satisfies UnionMatchCheck);
  }

  matchTrusted(value: T): TypedValue<T, M> {
    const {ok, value: actual} = this.match(NOOP_CONTEXT, value);
    if (ok) {
      return actual;
    }
    throw new Error("no matching variant found for `TryUnion` value");
  }

  write<W>(writer: Writer<W>, value: T): W {
    const variant: M = this.matchTrusted(value).type;
    if (variant.write === undefined) {
      throw new Error(`write is not supported for TryUnion with non-writable variant ${variant.name}`);
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
    const variantChecks: CheckId[] = [];
    for (const variant of this.variants) {
      if (variant.read === undefined) {
        throw new Error(`read is not supported for TryUnion with non-readable variant ${variant.name}`);
      }
      const {ok, value: actual} = variant.read(cx, reader, raw);
      if (ok) {
        return {ok: true, value: {type: variant, value: actual}};
      } else {
        variantChecks.push(actual satisfies CheckId);
      }
    }
    const source: CheckId = cx.write({
      check: CheckKind.Aggregate,
      children: variantChecks,
    } satisfies AggregateCheck);
    return writeError(cx, {check: CheckKind.UnionMatch, children: [source]} satisfies UnionMatchCheck);
  }

  test(cx: KryoContext | null, value: unknown): Result<T, CheckId> {
    const {ok, value: actual} = this.match(cx, value);
    if (ok) {
      return {ok: true, value: actual.value};
    } else {
      return {ok: false, value: actual};
    }
  }

  equals(val1: T, val2: T): boolean {
    const match1: TypedValue<T, M> = this.matchTrusted(val1);
    const match2: TypedValue<T, M> = this.matchTrusted(val2);
    return match1.type === match2.type && match1.type.equals(match1.value, match2.value);
  }

  clone(val: T): T {
    return this.matchTrusted(val).type.clone(val);
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Error("missing `_options` for lazy initialization");
    }
    const options: TryUnionTypeOptions<T, M> = typeof this._options === "function"
      ? this._options()
      : this._options;
    delete this._options;
    const variants: M[] = options.variants;
    Object.assign(this, {variants});
  }
}
