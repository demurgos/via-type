import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { createLazyOptionsError } from "../errors/lazy-options";
import { createNotImplementedError } from "../errors/not-implemented";
import { JSON_SERIALIZER } from "../json/index";
import { Lazy, Serializer, Type } from "../types";

export type Name = "custom";
export const name: Name = "custom";

export type Read<T> = (input: any, serializer: Serializer) => T;
export type Write<T> = (value: T, serializer: Serializer) => any;
export type TestError<T> = (val: T) => Error | undefined;
export type Equals<T> = (val1: T, val2: T) => boolean;
export type Clone<T> = (val: T) => T;

export interface Options<T> {
  read: Read<T>;
  write: Write<T>;
  testError: TestError<T>;
  equals: Equals<T>;
  clone: Clone<T>;
}

export class CustomType<T> implements Type<T> {
  readonly name: Name = name;
  readonly read: Read<T>;
  readonly write: Write<T>;
  readonly testError: TestError<T>;
  readonly equals: Equals<T>;
  readonly clone: Clone<T>;

  private _options?: Lazy<Options<T>>;

  constructor(options: Lazy<Options<T>>) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.read = <any> undefined;
    this.write = <any> undefined;
    this.testError = <any> undefined;
    this.equals = <any> undefined;
    this.clone = <any> undefined;

    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["read", "write", "testError", "equals", "clone"]);
    }
  }

  toJSON(): never {
    throw createNotImplementedError("CustomType#toJSON");
  }

  readTrustedJson(input: any): T {
    return this.read(input, JSON_SERIALIZER);
  }

  readJson(input: any): T {
    return this.read(input, JSON_SERIALIZER);
  }

  writeJson(value: T): any {
    return this.write(value, JSON_SERIALIZER);
  }

  test(val: T): boolean {
    return this.testError(val) === undefined;
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: Options<T> = typeof this._options === "function" ? this._options() : this._options;
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
    Object.freeze(this);
  }
}
