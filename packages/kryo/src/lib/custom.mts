import { lazyProperties } from "./_helpers/lazy-properties.mjs";
import {CheckId, KryoContext, Lazy, Reader, Result,Type, Writer} from "./index.mjs";

export type Name = "custom";
export const name: Name = "custom";

export type Read<T> = <R>(cx: KryoContext, reader: Reader<R>, raw: R) => Result<T, CheckId>;
export type Write<T> = <W>(writer: Writer<W>, value: T) => W;
export type Test<T> = (cx: KryoContext, value: unknown) => Result<T, CheckId>;
export type Equals<T> = (val1: T, val2: T) => boolean;
export type Clone<T> = (val: T) => T;

export interface CustomTypeOptions<T> {
  read: Read<T>;
  write: Write<T>;
  test: Test<T>;
  equals: Equals<T>;
  clone: Clone<T>;
}

export class CustomType<T> implements Type<T> {
  readonly name: Name = name;
  readonly read!: Read<T>;
  readonly write!: Write<T>;
  readonly test!: Test<T>;
  readonly equals!: Equals<T>;
  readonly clone!: Clone<T>;

  private _options?: Lazy<CustomTypeOptions<T>>;

  constructor(options: Lazy<CustomTypeOptions<T>>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["read", "write", "test", "equals", "clone"]);
    }
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Error("missing `_options` for lazy initialization");
    }
    const options: CustomTypeOptions<T> = typeof this._options === "function" ? this._options() : this._options;
    Object.assign(
      this,
      {
        read: options.read,
        write: options.write,
        test: options.test,
        equals: options.equals,
        clone: options.clone,
      },
    );
  }
}
