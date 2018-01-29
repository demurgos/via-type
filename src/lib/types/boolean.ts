import { createInvalidTypeError } from "../errors/invalid-type";
import { VersionedType } from "../types";

export type Name = "boolean";
export const name: Name = "boolean";

export type Diff = boolean;

export class BooleanType implements VersionedType<boolean, boolean, boolean, Diff> {
  readonly name: Name = name;

  toJSON(): undefined {
    /* tslint:disable-next-line:return-undefined */
    return undefined;
  }

  readTrustedJson(input: boolean): boolean {
    return input;
  }

  readJson(input: any): boolean {
    if (typeof input !== "boolean") {
      throw createInvalidTypeError("boolean", input);
    }
    return input;
  }

  writeJson(val: boolean): boolean {
    return val;
  }

  testError(val: boolean): Error | undefined {
    if (typeof val !== "boolean") {
      return createInvalidTypeError("boolean", val);
    }
    return undefined;
  }

  test(val: boolean): val is boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: boolean, val2: boolean): boolean {
    return val1 === val2;
  }

  clone(val: boolean): boolean {
    return val;
  }

  /**
   * @param oldVal
   * @param newVal
   * @returns `true` if there is a difference, `undefined` otherwise
   */
  diff(oldVal: boolean, newVal: boolean): Diff | undefined {
    /* tslint:disable-next-line:strict-boolean-expressions */
    return (oldVal !== newVal) || undefined;
  }

  patch(oldVal: boolean, diff: Diff | undefined): boolean {
    return oldVal === (diff === undefined);
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    return diff;
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    /* tslint:disable-next-line:strict-boolean-expressions */
    return (diff1 !== diff2) && undefined;
  }
}
