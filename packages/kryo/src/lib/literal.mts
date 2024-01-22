import {lazyProperties} from "./_helpers/lazy-properties.mjs";
import {writeError} from "./_helpers/write-error.mjs";
import {CheckKind} from "./checks/check-kind.mjs";
import {LiteralTypeCheck} from "./checks/literal-type.mjs";
import {CheckId, IoType, KryoContext, Lazy, Reader, Result, Type, Writer} from "./index.mjs";

export type Name = "Literal";
export const name: Name = "Literal";
export type Diff = any;

/**
 * T: Typescript type
 * K: Kryo type
 */
export interface LiteralTypeOptions<T, K extends Type<T> = Type<T>> {
  type: K;
  value: T;
}

export interface LiteralTypeConstructor {
  new<T>(options: Lazy<LiteralTypeOptions<T, IoType<any>>>): LiteralIoType<T>;

  new<T>(options: Lazy<LiteralTypeOptions<T>>): LiteralType<T>;
}

export interface LiteralType<T, K extends Type<any> = Type<any>> extends Type<T>, LiteralTypeOptions<T, K> {
}

export interface LiteralIoType<T, K extends IoType<any> = IoType<any>> extends IoType<T>, LiteralType<T, K> {
  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<T, CheckId>;

  write<W>(writer: Writer<W>, value: T): W;
}

/**
 * You may need to explicitly write the type or inference won't pick it.
 * For example, in the case of enum values, inference will pick the type of the enum instead of
 * the specific property you pass.
 *
 * @see https://github.com/Microsoft/TypeScript/issues/10195
 */
// tslint:disable-next-line:variable-name
export const LiteralType: LiteralTypeConstructor = class<T, K extends Type<any> = Type<any>> implements IoType<T> {
  readonly name: Name = name;
  readonly type!: K;
  readonly value!: T;

  private _options: Lazy<LiteralTypeOptions<T, K>>;

  constructor(options: Lazy<LiteralTypeOptions<T, K>>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["type", "value"]);
    }
  }

  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<T, CheckId> {
    if (this.type.read === undefined) {
      throw new Error(`read is not supported for Literal with non-readable type ${this.type.name}`);
    }
    return this.type.read(cx, reader, raw);
  }

  write<W>(writer: Writer<W>, value: T): W {
    if (this.type.write === undefined) {
      throw new Error(`write is not supported for Literal with non-writable type ${this.type.name}`);
    }
    return this.type.write(writer, value);
  }

  test(cx: KryoContext, value: unknown): Result<T, CheckId> {
    const {ok, value: actual} = this.type.test(cx, value);
    if (!ok) {
      return writeError(cx, {check: CheckKind.LiteralType, children: [actual]} satisfies LiteralTypeCheck);
    }
    if (!this.type.equals(actual, this.value)) {
      return writeError(cx, {check: CheckKind.LiteralValue});
    }
    return {ok: true, value: actual};
  }

  equals(left: T, right: T): boolean {
    return this.type.equals(left, right);
  }

  lte(left: T, right: T): boolean {
    return this.type.lte!(left, right);
  }

  clone(val: T): T {
    return this.type.clone(val);
  }

  diff(_oldVal: T, _newVal: T): undefined {
    return;
  }

  patch(oldVal: T, _diff: undefined): T {
    return this.type.clone(oldVal);
  }

  reverseDiff(_diff: Diff | undefined): undefined {
    return;
  }

  squash(_diff1: undefined, _diff2: undefined): undefined {
    return;
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Error("missing `_options` for lazy initialization");
    }
    const options: LiteralTypeOptions<T, K> = typeof this._options === "function"
      ? this._options()
      : this._options;

    const type: K = options.type;
    const value: T = options.value;

    Object.assign(this, {type, value});
  }
};
