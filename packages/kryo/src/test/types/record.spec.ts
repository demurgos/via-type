import { $Boolean } from "../../lib/boolean.js";
import { DateType } from "../../lib/date.js";
import { CaseStyle } from "../../lib/index.js";
import { $Uint32, IntegerType } from "../../lib/integer.js";
import { RecordType } from "../../lib/record.js";
import { $Ucs2String } from "../../lib/ucs2-string.js";
import { runTests, TypedValue } from "../helpers/test.js";

describe("kryo | Record", function () {
  describe("Main", function () {
    interface TestRecord {
      dateProp: Date;
      optIntProp?: number;
      nestedDoc?: {id?: number};
    }

    const $TestRecord: RecordType<TestRecord> = new RecordType({
      noExtraKeys: false,
      properties: {
        dateProp: {
          optional: false,
          type: new DateType(),
        },
        optIntProp: {
          optional: true,
          type: new IntegerType(),
        },
        nestedDoc: {
          optional: true,
          type: new RecordType({
            noExtraKeys: false,
            properties: {
              id: {
                optional: true,
                type: new IntegerType(),
              },
            },
          }),
        },
      },
    });

    const items: TypedValue[] = [
      {
        value: {
          dateProp: new Date(0),
          optIntProp: 50,
          nestedDoc: {
            id: 10,
          },
        },
        valid: true,
      },
      {
        value: {
          dateProp: new Date(0),
          nestedDoc: {
            id: 10,
          },
        },
        valid: true,
      },

      {name: "new Date(0)", value: new Date(0), valid: false},
      {name: "0", value: 0, valid: false},
      {name: "1", value: 1, valid: false},
      {name: "\"\"", value: "", valid: false},
      {name: "\"0\"", value: "0", valid: false},
      {name: "\"true\"", value: "true", valid: false},
      {name: "\"false\"", value: "false", valid: false},
      {name: "Infinity", value: Infinity, valid: false},
      {name: "-Infinity", value: -Infinity, valid: false},
      {name: "NaN", value: NaN, valid: false},
      {name: "undefined", value: undefined, valid: false},
      {name: "null", value: null, valid: false},
      {name: "[]", value: [], valid: false},
      {name: "{}", value: {}, valid: false},
      {name: "/regex/", value: /regex/, valid: false},
    ];

    runTests($TestRecord, items);
  });

  describe("Record: rename", function () {
    interface Rect {
      xMin: number;
      xMax: number;
      yMin: number;
      yMax: number;
    }

    const type: RecordType<Rect> = new RecordType<Rect>({
      properties: {
        xMin: {type: new IntegerType()},
        xMax: {type: new IntegerType(), changeCase: CaseStyle.ScreamingSnakeCase},
        yMin: {type: new IntegerType(), rename: "__yMin"},
        yMax: {type: new IntegerType()},
      },
      rename: {xMin: "xmin"},
      changeCase: CaseStyle.KebabCase,
    });

    const items: TypedValue[] = [
      {
        name: "Rect {xMin: 0, xMax: 10, yMin: 20, yMax: 30}",
        value: <Rect>{
          xMin: 0,
          xMax: 10,
          yMin: 20,
          yMax: 30,
        },
        valid: true,
      },
    ];

    runTests(type, items);
  });

  describe("Record: pick", function () {
    interface Base {
      foo: number;
      bar: string;
    }

    const $Base: RecordType<Base> = new RecordType<Base>({
      properties: {
        foo: {type: $Uint32},
        bar: {type: $Ucs2String},
      },
    });

    const $Pick: RecordType<Pick<Base, "foo">> = $Base.pick(["foo"]);

    const items: TypedValue[] = [
      {
        value: {
          foo: 10,
          bar: "bar",
        },
        valid: true,
      },
      {
        value: {
          foo: 20,
        },
        valid: true,
      },
      {
        value: {
          bar: "bar",
        },
        valid: false,
      },
    ];

    runTests($Pick, items);
  });

  describe("Record: omit", function () {
    interface Base {
      foo: number;
      bar: string;
    }

    const $Base: RecordType<Base> = new RecordType<Base>({
      properties: {
        foo: {type: $Uint32},
        bar: {type: $Ucs2String},
      },
    });

    const $Omit: RecordType<Omit<Base, "foo">> = $Base.omit(["foo"]);

    const items: TypedValue[] = [
      {
        value: {
          foo: 10,
          bar: "bar",
        },
        valid: true,
      },
      {
        value: {
          bar: "hello",
        },
        valid: true,
      },
      {
        value: {
          foo: 20,
        },
        valid: false,
      },
    ];

    runTests($Omit, items);
  });

  describe("Record: extend", function () {
    interface Base {
      foo: number;
      bar: string;
    }

    const $Base: RecordType<Base> = new RecordType<Base>({
      properties: {
        foo: {type: $Uint32},
        bar: {type: $Ucs2String},
      },
    });

    interface Ext {
      baz: boolean;
    }

    const $Ext: RecordType<Ext> = $Base.extend({
      properties: {
        baz: {type: $Boolean},
      },
    });

    const items: TypedValue[] = [
      {
        value: {
          foo: 10,
          bar: "bar",
          baz: true,
        },
        valid: true,
      },
      {
        value: {
          foo: 10,
          bar: "bar",
        },
        valid: false,
      },
    ];

    runTests($Ext, items);
  });
});
