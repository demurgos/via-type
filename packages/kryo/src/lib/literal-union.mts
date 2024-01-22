import {lazyProperties} from "./_helpers/lazy-properties.mjs";
import {writeError} from "./_helpers/write-error.mjs";
import {CheckKind} from "./checks/check-kind.mjs";
import {CheckId, IoType, KryoContext, Lazy, Reader, Result, VersionedType, Writer} from "./index.mjs";

export type Name = "LiteralUnion";
export const name: Name = "LiteralUnion";
export type Diff = [number, number];

export interface LiteralUnionTypeOptions<T> {
  type: VersionedType<any, any>;
  values: T[];
}

/**
 * `TryUnion` of `Literal`; but where the base type is shared.
 */
export class LiteralUnionType<T> implements IoType<T>, VersionedType<T, Diff> {
  readonly name: Name = name;
  readonly type!: VersionedType<any, any>;
  readonly values!: T[];

  private _options: Lazy<LiteralUnionTypeOptions<T>>;

  constructor(options: Lazy<LiteralUnionTypeOptions<T>>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["type", "values"]);
    }
  }

  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<T, CheckId> {
    if (this.type.read === undefined) {
      throw new Error(`read is not supported for LiteralUnion with non-readable type ${this.type.name}`);
    }
    const {ok, value} = this.type.read(cx, reader, raw);
    if (ok) {
      for (const allowed of this.values) {
        if (this.type.equals(value, allowed)) {
          return {ok: true, value};
        }
      }
      return writeError(cx,{check: CheckKind.LiteralValue});
    } else {
      return writeError(cx,{check: CheckKind.LiteralType, children: [value]});
    }
  }

  write<W>(writer: Writer<W>, value: T): W {
    if (this.type.write === undefined) {
      throw new Error(`write is not supported for LiteralUnion with non-writable type ${this.type.name}`);
    }
    return this.type.write(writer, value);
  }

  test(cx: KryoContext, value: unknown): Result<T, CheckId> {
    const {ok, value: actual} = this.type.test(cx, value);
    if (!ok) {
      return writeError(cx,{check: CheckKind.LiteralType, children: [actual]});
    }
    for (const allowed of this.values) {
      if (this.type.equals(actual, allowed)) {
        return {ok: true, value: actual};
      }
    }
    return writeError(cx,{check: CheckKind.LiteralValue});
  }

  equals(val1: T, val2: T): boolean {
    return this.type.equals(val1, val2);
  }

  clone(val: T): T {
    return this.type.clone(val);
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    return this.type.diff(oldVal, newVal);
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    return this.type.patch(oldVal, diff);
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    return this.type.reverseDiff(diff);
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    return this.type.squash(diff1, diff2);
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Error("missing `_options` for lazy initialization");
    }
    const options: LiteralUnionTypeOptions<T> = typeof this._options === "function" ? this._options() : this._options;

    const type: VersionedType<any, any> = options.type;
    const values: T[] = options.values;

    Object.assign(this, {type, values});
  }
}
