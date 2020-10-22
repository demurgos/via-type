import { $Date } from "../../lib/date.js";
import { GenericIoType, GenericType } from "../../lib/generic.js";
import { IoType } from "../../lib/index.js";
import { $Uint32 } from "../../lib/integer.js";
import { RecordIoType, RecordType } from "../../lib/record.js";
import { $Ucs2String } from "../../lib/ucs2-string.js";
import { runTests, TypedValue } from "../helpers/test.js";

describe("kryo | Generic", function () {
  describe("TimedValue<T>", function () {
    interface TimedValue<T> {
      time: Date;
      value: T;
    }

    const $TimedValue: GenericIoType<<T>(t: T) => TimedValue<T>> = new GenericType({
      apply: <T>(t: IoType<T>): RecordIoType<TimedValue<T>> => new RecordType({
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
          output: {
            json: JSON.stringify({
              time: "1970-01-01T00:00:00.000Z",
              value: "foo",
            }),
          },
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
          output: {
            json: JSON.stringify({
              time: "1970-01-01T00:00:00.000Z",
              value: 42,
            }),
          },
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
