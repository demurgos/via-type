import { lazyProperties } from "./_helpers/lazy-properties.mjs";
import { createLazyOptionsError } from "./errors/lazy-options.mjs";
import { IoType, Lazy, Type } from "./index.mjs";

export type Name = "generic";
export const name: Name = "generic";

export interface GenericTypeOptions<Fn extends (...args: any[]) => any> {
  apply: (...typeArgs: Type<unknown>[]) => Type<ReturnType<Fn>>;
}

export interface GenericIoTypeOptions<Fn extends (...args: any[]) => any> {
  apply: (...typeArgs: IoType<unknown>[]) => IoType<ReturnType<Fn>>;
}

/**
 * TODO: Proper type inference
 * Requires:
 * - https://github.com/microsoft/TypeScript/issues/22617
 * - https://github.com/microsoft/TypeScript/issues/40111
 */
export interface GenericType<Fn extends (...args: any[]) => any> {
  apply(...typeArgs: Type<unknown>[]): Type<ReturnType<Fn>>;
}

export interface GenericIoType<Fn extends (...args: any[]) => any> {
  apply(...typeArgs: IoType<unknown>[]): IoType<ReturnType<Fn>>;
}

export interface GenericTypeConstructor {
  new<Fn extends (...args: any[]) => any>(options: Lazy<GenericIoTypeOptions<Fn>>): GenericIoType<Fn>;

  new<Fn extends (...args: any[]) => any>(options: Lazy<GenericTypeOptions<Fn>>): GenericType<Fn>;
}

/**
 * Generic type constructor (not a type itself).
 */
export const GenericType: GenericTypeConstructor = (class<Fn extends (...args: any[]) => any> {
  readonly name: Name = name;
  readonly apply!: (...typeArgs: Type<unknown>[]) => Type<ReturnType<Fn>>;

  _options: Lazy<GenericTypeOptions<Fn>>;

  constructor(options: Lazy<GenericTypeOptions<Fn>>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["apply"]);
    }
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: GenericTypeOptions<Fn> = typeof this._options === "function" ?
      this._options() :
      this._options;

    const apply: (...typeArgs: Type<unknown>[]) => Type<ReturnType<Fn>> = options.apply;

    Object.assign(this, {apply});
  }
}) as GenericTypeConstructor;
