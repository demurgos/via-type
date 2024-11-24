import {writeError} from "./_helpers/context.mjs";
import {CheckKind} from "./checks/check-kind.mjs";
import {CheckId, IoType, KryoContext, Ord, Reader, Result,VersionedType, Writer} from "./index.mjs";
import { readVisitor } from "./readers/read-visitor.mjs";

export type Name = "Boolean";
export const name: Name = "Boolean";

export type Diff = boolean;

export class BooleanType implements IoType<boolean>, VersionedType<boolean, Diff>, Ord<boolean> {
  readonly name: Name = name;

  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<boolean, CheckId> {
    return reader.readBoolean(cx, raw, readVisitor({
      fromBoolean(input: boolean): Result<boolean, never> {
        return {ok: true, value: input};
      },
    }));
  }

  write<W>(writer: Writer<W>, value: boolean): W {
    return writer.writeBoolean(value);
  }

  test(cx: KryoContext | null, value: unknown): Result<boolean, CheckId> {
    if (typeof value !== "boolean") {
      return writeError(cx,{check: CheckKind.BaseType, expected: ["Boolean"]});
    }
    return {ok: true, value};
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
