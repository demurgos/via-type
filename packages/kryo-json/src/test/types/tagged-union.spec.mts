import { CaseStyle } from "kryo";
import { IntegerType } from "kryo/integer";
import { LiteralType } from "kryo/literal";
import { RecordType } from "kryo/record";
import { TaggedUnionType } from "kryo/tagged-union";
import { TsEnumType } from "kryo/ts-enum";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import { JSON_READER } from "../../lib/json-reader.mjs";
import { JSON_WRITER } from "../../lib/json-writer.mjs";

describe("kryo-json | TaggedUnion", function () {
  describe("Shape", function () {
    enum ShapeType {
      Rectangle,
      Circle,
    }

    const shapeTypeType: TsEnumType<ShapeType> = new TsEnumType({
      enum: ShapeType,
      changeCase: CaseStyle.KebabCase,
    });

    interface Rectangle {
      type: ShapeType.Rectangle;
      width: number;
      height: number;
    }

    const rectangleType: RecordType<Rectangle> = new RecordType<Rectangle>({
      properties: {
        type: {
          type: new LiteralType<ShapeType.Rectangle>({
            type: shapeTypeType,
            value: ShapeType.Rectangle,
          }),
        },
        width: {type: new IntegerType()},
        height: {type: new IntegerType()},
      },
    });

    interface Circle {
      type: ShapeType.Circle;
      radius: number;
    }

    const circleType: RecordType<Circle> = new RecordType<Circle>({
      properties: {
        type: {
          type: new LiteralType<ShapeType.Circle>({
            type: shapeTypeType,
            value: ShapeType.Circle,
          }),
        },
        radius: {type: new IntegerType()},
      },
    });

    type Shape = Rectangle | Circle;

    const $Shape: TaggedUnionType<Shape> = new TaggedUnionType<Shape>(() => ({
      variants: [rectangleType, circleType],
      tag: "type",
    }));

    const items: TestItem[] = [
      {
        name: "Rectangle {type: ShapeType.Rectangle, width: 10, height: 20}",
        value: {
          type: ShapeType.Rectangle,
          width: 10,
          height: 20,
        },
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "{\"type\":\"rectangle\",\"width\":10,\"height\":20}"},
        ],
      },
      {
        name: "Circle {type: ShapeType.Circle, radius: 15}",
        value: {
          type: ShapeType.Circle,
          radius: 15,
        },
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "{\"type\":\"circle\",\"radius\":15}"},
        ],
      },
    ];

    registerMochaSuites($Shape, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "{\"type\":\"circle\"}",
        "{\"radius\":15}",
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
