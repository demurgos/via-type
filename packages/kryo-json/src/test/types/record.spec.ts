import { CaseStyle } from "kryo";
import { DateType } from "kryo/date";
import { IntegerType } from "kryo/integer";
import { RecordIoType, RecordType } from "kryo/record";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import { JSON_READER } from "../../lib/json-reader.js";
import { JSON_WRITER, PRETTY_JSON_WRITER } from "../../lib/json-writer.js";

describe("kryo-json | Record", function () {
  describe("TestRecord", function () {
    const $TestRecord: RecordIoType<any> = new RecordType({
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

    const items: TestItem[] = [
      {
        value: {
          dateProp: new Date(0),
          optIntProp: 50,
          nestedDoc: {
            id: 10,
          },
        },
        io: [
          {
            writer: JSON_WRITER,
            reader: JSON_READER,
            raw: "{\"dateProp\":\"1970-01-01T00:00:00.000Z\",\"optIntProp\":50,\"nestedDoc\":{\"id\":10}}",
          },
          {
            writer: PRETTY_JSON_WRITER,
            reader: JSON_READER,
            raw: `{
  "dateProp": "1970-01-01T00:00:00.000Z",
  "optIntProp": 50,
  "nestedDoc": {
    "id": 10
  }
}
`,
          },
        ],
      },
      {
        value: {
          dateProp: new Date(0),
          nestedDoc: {
            id: 10,
          },
        },
        io: [
          {
            writer: JSON_WRITER,
            reader: JSON_READER,
            raw: "{\"dateProp\":\"1970-01-01T00:00:00.000Z\",\"nestedDoc\":{\"id\":10}}",
          },
        ],
      },
    ];

    registerMochaSuites($TestRecord, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "\"1970-01-01T00:00:00.000Z\"",
        "null",
        "0",
        "1",
        "\"\"",
        "\"0\"",
        "\"true\"",
        "\"false\"",
        "true",
        "false",
        "[]",
        "{}",
      ];
      registerErrMochaTests(JSON_READER, $TestRecord, invalids);
    });

  });

  describe("Record: rename", function () {
    interface Rect {
      xMin: number;
      xMax: number;
      yMin: number;
      yMax: number;
    }

    const type: RecordIoType<Rect> = new RecordType<Rect>({
      properties: {
        xMin: {type: new IntegerType()},
        xMax: {type: new IntegerType(), changeCase: CaseStyle.ScreamingSnakeCase},
        yMin: {type: new IntegerType(), rename: "__yMin"},
        yMax: {type: new IntegerType()},
      },
      rename: {xMin: "xmin"},
      changeCase: CaseStyle.KebabCase,
    });

    const items: TestItem[] = [
      {
        name: "Rect {xMin: 0, xMax: 10, yMin: 20, yMax: 30}",
        value: {
          xMin: 0,
          xMax: 10,
          yMin: 20,
          yMax: 30,
        },
        io: [
          {
            writer: JSON_WRITER,
            reader: JSON_READER,
            raw: "{\"xmin\":0,\"X_MAX\":10,\"__yMin\":20,\"y-max\":30}",
          },
        ],
      },
    ];

    registerMochaSuites(type, items);
  });
});
