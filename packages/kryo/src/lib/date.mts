import {writeError} from "./_helpers/write-error.mjs";
import {CheckKind} from "./checks/check-kind.mjs";
import {
  CheckId,
  IoType,
  KryoContext,
  Ord,
  Reader,
  Result,
  VersionedType,
  Writer} from "./index.mjs";
import { readVisitor } from "./readers/read-visitor.mjs";

export type Name = "date";
export const name: Name = "date";
export type Diff = number;

export class DateType implements IoType<Date>, VersionedType<Date, Diff>, Ord<Date> {
  readonly name: Name = name;

  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<Date, CheckId> {
    return reader.readDate(cx, raw, readVisitor({
      fromDate: (input: Date): Result<Date, CheckId> => {
        return this.test(cx, input);
      },
    }));
  }

  write<W>(writer: Writer<W>, value: Date): W {
    return writer.writeDate(value);
  }

  test(cx: KryoContext | null, value: unknown): Result<Date, CheckId> {
    if (!(value instanceof Date)) {
      if (value !== null && typeof value === "object") {
        return writeError(cx,{check: CheckKind.InstanceOf, class: "Date"});
      } else {
        return writeError(cx,{check: CheckKind.BaseType, expected: ["Object"]});
      }
    }
    const time: number = value.getTime();
    if (isNaN(time) || time > Number.MAX_SAFE_INTEGER || time < Number.MIN_SAFE_INTEGER) {
      return writeError(cx,{check: CheckKind.UnixTimestamp});
    }
    return {ok: true, value};
  }

  equals(left: Date, right: Date): boolean {
    return left.getTime() === right.getTime();
  }

  lte(left: Date, right: Date): boolean {
    return left.getTime() <= right.getTime();
  }

  clone(val: Date): Date {
    return new Date(val.getTime());
  }

  diff(oldVal: Date, newVal: Date): Diff | undefined {
    // tslint:disable-next-line:strict-boolean-expressions
    return newVal.getTime() - oldVal.getTime() || undefined;
  }

  patch(oldVal: Date, diff: Diff | undefined): Date {
    // tslint:disable-next-line:strict-boolean-expressions
    return new Date(oldVal.getTime() + (diff || 0));
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    // tslint:disable-next-line:strict-boolean-expressions
    return diff && -diff;
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    if (diff1 === undefined) {
      return diff2;
    } else if (diff2 === undefined) {
      return diff1;
    }
    return diff2 === -diff1 ? undefined : diff1 + diff2;
  }
}

export const $Date: DateType = new DateType();
