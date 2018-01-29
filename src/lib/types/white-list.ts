import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { createLazyOptionsError } from "../errors/lazy-options";
import { createNotImplementedError, NotImplementedError } from "../errors/not-implemented";
import { Lazy, VersionedType } from "../types";

export type Name = "white-list";
export const name: Name = "white-list";
export namespace json {
  export type Input = any;
  export type Output = any;

  export interface Type {
    name: Name;
  }
}
export type Diff = [number, number];

export interface Options<T> {
  itemType: VersionedType<any, any, any, any>;
  values: T[];
}

export class WhiteListType<T> implements VersionedType<T, json.Input, json.Output, Diff> {
  readonly name: Name = name;
  readonly itemType: VersionedType<any, any, any, any>;
  readonly values: T[];

  private _options: Lazy<Options<T>>;

  constructor(options: Lazy<Options<T>>) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.itemType = <any> undefined;
    this.values = <any> undefined;

    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["itemType", "values"]);
    }
  }

  static fromJSON(options: json.Type): WhiteListType<any> {
    throw createNotImplementedError("WhiteListType.fromJSON");
  }

  toJSON(): json.Type {
    throw createNotImplementedError("TypedUnionType#toJSON");
  }

  readTrustedJson(val: json.Output): T {
    return this.itemType.readJson(val);
  }

  readJson(val: any): T {
    const value: T = this.itemType.readJson(val);
    for (const allowed of this.values) {
      if (this.itemType.equals(value, allowed)) {
        return value;
      }
    }
    throw Incident("UnkownVariant", "Unknown variant");
  }

  writeJson(val: T): json.Output {
    return this.itemType.writeJson(val);
  }

  testError(val: T): Error | undefined {
    const error: Error | undefined = this.itemType.testError(val);
    if (error !== undefined) {
      return error;
    }
    for (const allowed of this.values) {
      if (this.itemType.equals(val, allowed)) {
        return undefined;
      }
    }
    return Incident("UnkownVariant", "Unknown variant");
  }

  test(val: T): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: T, val2: T): boolean {
    return this.itemType.equals(val1, val2);
  }

  clone(val: T): T {
    return this.itemType.clone(val);
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    return this.itemType.diff(oldVal, newVal);
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    return this.itemType.patch(oldVal, diff);
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    return this.itemType.reverseDiff(diff);
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    return this.itemType.squash(diff1, diff2);
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: Options<T> = typeof this._options === "function" ? this._options() : this._options;

    const itemType: VersionedType<any, any, any, any> = options.itemType;
    const values: T[] = options.values;

    Object.assign(this, {itemType, values});
    Object.freeze(this);
  }
}
