import { $Date } from "../../lib/date.mjs";
import { GenericIoType, GenericType } from "../../lib/generic.mjs";
import { IoType } from "../../lib/index.mjs";
import { $Uint32 } from "../../lib/integer.mjs";
import { RecordIoType, RecordType } from "../../lib/record.mjs";
import { $Ucs2String } from "../../lib/ucs2-string.mjs";
import { runTests, TypedValue } from "../helpers/test.mjs";

describe("kryo | Generic", function () {
  describe("TimedValue<T>", function () {
    interface TimedValue<T> {
      time: Date;
      value: T;
    }

    const $TimedValue: GenericIoType<<T>(t: T) => TimedValue<T>> = new GenericType({
      apply: <T,>(t: IoType<T>): RecordIoType<TimedValue<T>> => new RecordType({
        properties: {
          time: {type: $Date},
          value: {type: t},
        },
      }),
    });

    describe("TimedValue<string>", function () {
      const $TimedString = $TimedValue.apply($Ucs2String) as IoType<TimedValue<string>>;
      const items: TypedValue[] = [
        {
          value: {
            time: new Date(0),
            value: "foo",
          },
          valid: true,
        },
        {
          value: {
            time: new Date(0),
            value: 42,
          },
          valid: false,
        },
      ];

      runTests($TimedString, items);
    });

    describe("TimedValue<number>", function () {
      const $TimedUint32 = $TimedValue.apply($Uint32) as IoType<TimedValue<number>>;
      const items: TypedValue[] = [
        {
          value: {
            time: new Date(0),
            value: 42,
          },
          valid: true,
        },
        {
          value: {
            time: new Date(0),
            value: "foo",
          },
          valid: false,
        },
      ];

      runTests($TimedUint32, items);
    });
  });
});
