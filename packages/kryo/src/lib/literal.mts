import incident from "incident";

import { lazyProperties } from "./_helpers/lazy-properties.mjs";
import { testError } from "./_helpers/test-error.mjs";
import { createLazyOptionsError } from "./errors/lazy-options.mjs";
import { IoType, Lazy, Reader, Type, Writer } from "./index.mjs";

export type Name = "literal";
export const name: Name = "literal";
export type Diff = any;

/**
 * T: Typescript type
 * K: Kryo type
 */
export interface LiteralTypeOptions<T, K extends Type<any> = Type<any>> {
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
  read<R>(reader: Reader<R>, raw: R): T;

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

  read<R>(reader: Reader<R>, raw: R): T {
    if (this.type.read === undefined) {
      throw new incident.Incident("NotReadable", {type: this});
    }
    return reader.trustInput ? this.clone(this.value) : this.type.read(reader, raw);
  }

  write<W>(writer: Writer<W>, value: T): W {
    if (this.type.write === undefined) {
      throw new incident.Incident("NotWritable", {type: this});
    }
    return this.type.write(writer, value);
  }

  testError(val: unknown): Error | undefined {
    const error: Error | undefined = testError(this.type, val);
    if (error !== undefined) {
      return error;
    }
    if (!this.type.equals(val, this.value)) {
      return incident.Incident("InvalidLiteral", "Invalid literal value");
    }
    return undefined;
  }

  test(value: unknown): value is T {
    return this.type.test(value) && this.type.equals(value, this.value);
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
      throw createLazyOptionsError(this);
    }
    const options: LiteralTypeOptions<T, K> = typeof this._options === "function"
      ? this._options()
      : this._options;

    const type: K = options.type;
    const value: T = options.value;

    Object.assign(this, {type, value});
  }
};
