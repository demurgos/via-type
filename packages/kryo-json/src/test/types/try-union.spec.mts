import { CaseStyle } from "kryo";
import { IntegerType } from "kryo/integer";
import { RecordType } from "kryo/record";
import { TryUnionType } from "kryo/try-union";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import { JSON_READER } from "../../lib/json-reader.mjs";
import { JSON_WRITER } from "../../lib/json-writer.mjs";

describe("kryo-json | TryUnion", function () {
  describe("Shape", function () {
    interface Rectangle {
      width: number;
      height: number;
    }

    const $Rectangle: RecordType<Rectangle> = new RecordType<Rectangle>({
      properties: {
        width: {type: new IntegerType()},
        height: {type: new IntegerType()},
      },
      changeCase: CaseStyle.KebabCase,
    });

    interface Circle {
      radius: number;
    }

    const $Circle: RecordType<Circle> = new RecordType<Circle>({
      properties: {
        radius: {type: new IntegerType()},
      },
      changeCase: CaseStyle.KebabCase,
    });

    type Shape = Rectangle | Circle;
    const $Shape: TryUnionType<Shape> = new TryUnionType<Shape>({
      variants: [$Rectangle, $Circle],
    });

    const items: TestItem[] = [
      {
        name: "Rectangle {width: 10, height: 20}",
        value: {
          width: 10,
          height: 20,
        },
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "{\"width\":10,\"height\":20}"},
        ],
      },
      {
        name: "Circle {radius: 15}",
        value: {
          radius: 15,
        },
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "{\"radius\":15}"},
        ],
      },
    ];

    registerMochaSuites($Shape, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "{\"type\":\"circle\"}",
        "{\"type\":\"circle\",\"radius\":true}",
        "null",
        "true",
        "false",
        "",
        "0",
        "1",
        "0.5",
        "0.0001",
        "2.220446049250313e-16",
        "9007199254740991",
        "-9007199254740991",
        "\"\"",
        "\"0\"",
        "\"1\"",
        "\"null\"",
        "\"true\"",
        "\"false\"",
        "\"undefined\"",
        "\"NaN\"",
        "\"Infinity\"",
        "\"-Infinity\"",
        "\"foo\"",
        "[]",
        "{}",
        "\"1970-01-01T00:00:00.000Z\"",
      ];
      registerErrMochaTests(JSON_READER, $Shape, invalids);
    });
  });
});
