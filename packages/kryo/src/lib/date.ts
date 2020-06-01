import { createInvalidTimestampError } from "./errors/invalid-timestamp.js";
import { createInvalidTypeError } from "./errors/invalid-type.js";
import { IoType, Ord, Reader, VersionedType, Writer } from "./index.js";
import { readVisitor } from "./readers/read-visitor.js";

export type Name = "date";
export const name: Name = "date";
export type Diff = number;

export class DateType implements IoType<Date>, VersionedType<Date, Diff>, Ord<Date> {
  readonly name: Name = name;

  // TODO: Dynamically add with prototype?
  read<R>(reader: Reader<R>, raw: R): Date {
    return reader.readDate(raw, readVisitor({
      fromDate: (input: Date): Date => {
        const error: Error | undefined = this.testError(input);
        if (error !== undefined) {
          throw error;
        }
        return input;
      },
    }));
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: Date): W {
    return writer.writeDate(value);
  }

  testError(value: unknown): Error | undefined {
    if (!(value instanceof Date)) {
      return createInvalidTypeError("Date", value);
    }
    const time: number = value.getTime();
    if (isNaN(time) || time > Number.MAX_SAFE_INTEGER || time < Number.MIN_SAFE_INTEGER) {
      return createInvalidTimestampError(value);
    }

    return undefined;
  }

  test(value: unknown): value is Date {
    return this.testError(value) === undefined;
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
