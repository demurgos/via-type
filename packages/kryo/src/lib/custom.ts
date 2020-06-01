import { lazyProperties } from "./_helpers/lazy-properties.js";
import { createLazyOptionsError } from "./errors/lazy-options.js";
import { Lazy, Reader, Type, Writer } from "./index.js";

export type Name = "custom";
export const name: Name = "custom";

export type Read<T> = <R>(reader: Reader<R>, raw: R) => T;
export type Write<T> = <W>(writer: Writer<W>, value: T) => W;
export type TestError = (val: unknown) => Error | undefined;
export type Equals<T> = (val1: T, val2: T) => boolean;
export type Clone<T> = (val: T) => T;

export interface CustomTypeOptions<T> {
  read: Read<T>;
  write: Write<T>;
  testError: TestError;
  equals: Equals<T>;
  clone: Clone<T>;
}

export class CustomType<T> implements Type<T> {
  readonly name: Name = name;
  readonly read!: Read<T>;
  readonly write!: Write<T>;
  readonly testError!: TestError;
  readonly equals!: Equals<T>;
  readonly clone!: Clone<T>;

  private _options?: Lazy<CustomTypeOptions<T>>;

  constructor(options: Lazy<CustomTypeOptions<T>>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["read", "write", "testError", "equals", "clone"]);
    }
  }

  test(value: unknown): value is T {
    return this.testError(value) === undefined;
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: CustomTypeOptions<T> = typeof this._options === "function" ? this._options() : this._options;
    Object.assign(
      this,
      {
        read: options.read,
        write: options.write,
        testError: options.testError,
        equals: options.equals,
        clone: options.clone,
      },
    );
  }
}
