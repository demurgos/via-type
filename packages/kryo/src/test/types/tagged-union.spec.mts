import { CaseStyle } from "../../lib/index.mjs";
import { IntegerType } from "../../lib/integer.mjs";
import { LiteralType } from "../../lib/literal.mjs";
import { RecordType } from "../../lib/record.mjs";
import { TaggedUnionType } from "../../lib/tagged-union.mjs";
import { TsEnumType } from "../../lib/ts-enum.mjs";
import { runTests, TypedValue } from "../helpers/test.mjs";

describe("TaggedUnion", function () {
  describe("TaggedUnion<Shape>", function () {
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
    const shapeType: TaggedUnionType<Shape> = new TaggedUnionType<Shape>(() => ({
      variants: [rectangleType, circleType],
      tag: "type",
    }));

    const items: TypedValue[] = [
      {
        name: "Rectangle {type: ShapeType.Rectangle, width: 10, height: 20}",
        value: {
          type: ShapeType.Rectangle,
          width: 10,
          height: 20,
        } as Rectangle,
        valid: true,
      },
      {
        name: "Circle {type: ShapeType.Circle, radius: 15}",
        value: {
          type: ShapeType.Circle,
          radius: 15,
        } as Circle,
        valid: true,
      },

      {
        name: "{type: ShapeType.Circle}",
        value: {
          type: ShapeType.Circle,
        },
        valid: false,
      },
      {
        name: "{radius: 15}",
        value: {
          radius: 15,
        },
        valid: false,
      },
      {
        name: "{type: ShapeType.Circle, radius: true}",
        value: {
          type: ShapeType.Circle,
          radius: true,
        },
        valid: false,
      },
      {name: "\"foo\"", value: "bar", valid: false},
      {name: "0", value: 0, valid: false},
      {name: "1", value: 1, valid: false},
      {name: "\"\"", value: "", valid: false},
      {name: "\"0\"", value: "0", valid: false},
      {name: "true", value: true, valid: false},
      {name: "false", value: false, valid: false},
      {name: "Infinity", value: Infinity, valid: false},
      {name: "-Infinity", value: -Infinity, valid: false},
      {name: "new Date(\"1247-05-18T19:40:08.418Z\")", value: new Date("1247-05-18T19:40:08.418Z"), valid: false},
      {name: "NaN", value: NaN, valid: false},
      {name: "undefined", value: undefined, valid: false},
      {name: "null", value: null, valid: false},
      {name: "[]", value: [], valid: false},
      {name: "{}", value: {}, valid: false},
      {name: "/regex/", value: /regex/, valid: false},
    ];

    runTests(shapeType, items);
  });
});
