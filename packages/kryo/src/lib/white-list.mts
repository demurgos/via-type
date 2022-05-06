import incident from "incident";

import { lazyProperties } from "./_helpers/lazy-properties.mjs";
import { testError } from "./_helpers/test-error.mjs";
import { createLazyOptionsError } from "./errors/lazy-options.mjs";
import { IoType, Lazy, Reader, VersionedType, Writer } from "./index.mjs";

export type Name = "white-list";
export const name: Name = "white-list";
export type Diff = [number, number];

export interface WhiteListTypeOptions<T> {
  itemType: VersionedType<any, any>;
  values: T[];
}

export class WhiteListType<T> implements IoType<T>, VersionedType<T, Diff> {
  readonly name: Name = name;
  readonly itemType!: VersionedType<any, any>;
  readonly values!: T[];

  private _options: Lazy<WhiteListTypeOptions<T>>;

  constructor(options: Lazy<WhiteListTypeOptions<T>>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["itemType", "values"]);
    }
  }

  read<R>(reader: Reader<R>, raw: R): T {
    if (this.itemType.read === undefined) {
      throw new incident.Incident("NotReadable", {type: this});
    }
    const result: T = this.itemType.read(reader, raw);
    for (const allowed of this.values) {
      if (this.itemType.equals(result, allowed)) {
        return result;
      }
    }
    throw incident.Incident("UnkownVariant", "Unknown variant");
  }

  write<W>(writer: Writer<W>, value: T): W {
    if (this.itemType.write !== undefined) {
      return this.itemType.write(writer, value);
    } else {
      throw new incident.Incident("NotWritable", {type: this});
    }
  }

  testError(val: unknown): Error | undefined {
    const error: Error | undefined = testError(this.itemType, val);
    if (error !== undefined) {
      return error;
    }
    for (const allowed of this.values) {
      if (this.itemType.equals(val, allowed)) {
        return undefined;
      }
    }
    return incident.Incident("UnkownVariant", "Unknown variant");
  }

  test(value: unknown): value is T {
    if (!this.itemType.test(value)) {
      return false;
    }
    for (const allowed of this.values) {
      if (this.itemType.equals(value, allowed)) {
        return true;
      }
    }
    return false;
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
    const options: WhiteListTypeOptions<T> = typeof this._options === "function" ? this._options() : this._options;

    const itemType: VersionedType<any, any> = options.itemType;
    const values: T[] = options.values;

    Object.assign(this, {itemType, values});
  }
}
