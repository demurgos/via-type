import {writeError} from "./_helpers/context.mjs";
import {CheckKind} from "./checks/check-kind.mjs";
import {CheckId, IoType, KryoContext, Reader, Result,VersionedType, Writer} from "./index.mjs";
import {readVisitor} from "./readers/read-visitor.mjs";

export type Name = "null";
export const name: Name = "null";

export class NullType implements IoType<null>, VersionedType<null, undefined> {
  readonly name: Name = name;

  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<null, CheckId> {
    return reader.readNull(cx, raw, readVisitor({
      fromNull: () => ({ok: true, value: null}),
    }));
  }

  write<W>(writer: Writer<W>, _: null): W {
    return writer.writeNull();
  }

  test(cx: KryoContext | null, value: unknown): Result<null, CheckId> {
    if (value !== null) {
      return writeError(cx, {check: CheckKind.BaseType, expected: ["Null"]});
    }
    return {ok: true, value};
  }

  equals(left: null, right: null): boolean {
    return left === right;
  }

  lte(_left: null, _right: null): boolean {
    return true;
  }

  clone(val: null): null {
    return val;
  }

  /**
   * @param _oldVal
   * @param _newVal
   * @returns `true` if there is a difference, `undefined` otherwise
   */
  diff(_oldVal: null, _newVal: null): undefined {
    return;
  }

  patch(_oldVal: null, _diff: undefined): null {
    return null;
  }

  reverseDiff(_diff: undefined): undefined {
    return;
  }

  squash(_diff1: undefined, _diff2: undefined): undefined {
    return;
  }
}

export const $Null: NullType = new NullType();
