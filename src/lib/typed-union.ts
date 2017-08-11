import {Incident} from "incident";
import {NotImplementedError} from "./_errors/not-implemented";
import {VersionedType} from "./_interfaces";

export type Name = "typed-union";
export const name: Name = "typed-union";
export namespace json {
  export type Input = any;
  export type Output = any;
  export interface Type {
    name: Name;
    notNan: boolean;
    notInfinity: boolean;
  }
}
export type Diff = [number, number];

// TODO: Rename to whiteList
export class TypedUnionType<T> implements VersionedType<T, json.Input, json.Output, Diff> {
  readonly name: Name = name;
  readonly itemType: VersionedType<any, any, any, any>;
  readonly values: T[];

  constructor(itemType: VersionedType<any, any, any, any>, values: T[]) {
    this.itemType = itemType;
    this.values = values;
  }

  static fromJSON(options: json.Type): TypedUnionType<any> {
    throw NotImplementedError.create("TypedUnionType.fromJSON");
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("TypedUnionType#toJSON");
  }

  readTrusted(format: "json", val: json.Output): T {
    return this.itemType.read(format, val);
  }

  read(format: "json", val: any): T {
    const value: T = this.itemType.read(format, val);
    for (const allowed of this.values) {
      if (this.itemType.equals(value, allowed)) {
        return value;
      }
    }
    throw Incident("UnkownVariant", "Unknown variant");
  }

  write(format: "json", val: T): json.Output {
    return this.itemType.write(format, val);
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
}

export {TypedUnionType as Type};
