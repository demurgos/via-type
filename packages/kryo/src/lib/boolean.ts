import { createInvalidTypeError } from "./errors/invalid-type.js";
import { IoType, Ord, Reader, VersionedType, Writer } from "./index.js";
import { readVisitor } from "./readers/read-visitor.js";

export type Name = "boolean";
export const name: Name = "boolean";

export type Diff = boolean;

export class BooleanType implements IoType<boolean>, VersionedType<boolean, Diff>, Ord<boolean> {
  readonly name: Name = name;

  // TODO: Dynamically add with prototype?
  read<R>(reader: Reader<R>, raw: R): boolean {
    return reader.readBoolean(raw, readVisitor({
      fromBoolean(input: boolean): boolean {
        return input;
      },
    }));
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: boolean): W {
    return writer.writeBoolean(value);
  }

  testError(val: unknown): Error | undefined {
    if (typeof val !== "boolean") {
      return createInvalidTypeError("boolean", val);
    }
    return undefined;
  }

  test(value: unknown): value is boolean {
    return typeof value === "boolean";
  }

  equals(left: boolean, right: boolean): boolean {
    return left === right;
  }

  lte(left: boolean, right: boolean): boolean {
    return left <= right;
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

export const $Boolean: BooleanType = new BooleanType();
