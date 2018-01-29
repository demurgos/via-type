import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { createNotImplementedError, NotImplementedError } from "../errors/not-implemented";
import { Lazy, VersionedType } from "../types";

export type Name = "literal";
export const name: Name = "literal";
export namespace bson {
  export type Input = any;
  export type Output = any;
}
export namespace json {
  export type Input = any;
  export type Output = any;
  export type Type = undefined;
}
export type Diff = any;

export interface Options<T, Output, Input extends Output, Diff> {
  type: VersionedType<any, Output, Input, Diff>;
  value: T;
}

/**
 * You may need to explicitly write the type or inference won't pick it.
 * For example, in the case of enum values, inference will pick the type of the enum instead of
 * the specific property you pass.
 *
 * @see https://github.com/Microsoft/TypeScript/issues/10195
 */
export class LiteralType<T> implements VersionedType<T, json.Input, json.Output, Diff> {
  readonly name: Name = name;
  readonly type: VersionedType<T, any, any, Diff>;
  readonly value: T;

  private _options: Lazy<Options<T, any, any, any>>;

  constructor(options: Lazy<Options<T, any, any, any>>, lazy?: boolean) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.type = <any> undefined;
    this.value = <any> undefined;

    this._options = options;
    if (lazy === undefined) {
      lazy = typeof options === "function";
    }
    if (!lazy) {
      this._applyOptions();
    } else {
      lazyProperties(
        this,
        this._applyOptions,
        ["type", "value"],
      );
    }
  }

  toJSON(): json.Type {
    throw createNotImplementedError("LiteralType#toJSON");
  }

  readTrustedJson(input: json.Output): T {
    return this.type.readTrustedJson(input);
  }

  readJson(input: any): T {
    return this.type.readJson(input);
  }

  writeJson(val: T): json.Output {
    return this.type.writeJson(val);
  }

  testError(val: T): Error | undefined {
    const error: Error | undefined = this.type.testError(val);
    if (error !== undefined) {
      return error;
    }
    if (!this.type.equals(val, this.value)) {
      return Incident("InvalidLiteral", "Invalid literal value");
    }
    return undefined;
  }

  test(val: T): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: T, val2: T): boolean {
    return this.type.equals(val1, val2);
  }

  clone(val: T): T {
    return this.type.clone(val);
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    throw createNotImplementedError("LiteralType#diff");
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    throw createNotImplementedError("LiteralType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("LiteralType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("LiteralType#squash");
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Incident("No pending options");
    }
    const options: Options<T, any, any, any> = typeof this._options === "function" ? this._options() : this._options;

    const type: VersionedType<T, any, any, Diff> = options.type;
    const value: T = options.value;

    Object.assign(this, {type, value});
    Object.freeze(this);
  }
}
