import { CaseStyle } from "../../lib/index.mjs";
import { IntegerType } from "../../lib/integer.mjs";
import { RecordType } from "../../lib/record.mjs";
import { TryUnionType } from "../../lib/try-union.mjs";
import { runTests, TypedValue } from "../helpers/test.mjs";

describe("TryUnion", function () {
  describe("TryUnion<Shape>", function () {
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

    const items: TypedValue[] = [
      {
        name: "Rectangle {width: 10, height: 20}",
        value: {
          width: 10,
          height: 20,
        } as Rectangle,
        valid: true,
      },
      {
        name: "Circle {radius: 15}",
        value: {
          radius: 15,
        } as Circle,
        valid: true,
      },

      {
        name: "{}",
        value: {},
        valid: false,
      },
      {
        name: "{type: \"circle\", radius: true}",
        value: {
          type: "circle",
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
      {
        name: "new Date(\"1247-05-18T19:40:08.418Z\")",
        value: new Date("1247-05-18T19:40:08.418Z"),
        valid: false,
      },
      {name: "NaN", value: NaN, valid: false},
      {name: "undefined", value: undefined, valid: false},
      {name: "null", value: null, valid: false},
      {name: "[]", value: [], valid: false},
      {name: "{}", value: {}, valid: false},
      {name: "/regex/", value: /regex/, valid: false},
    ];

    runTests($Shape, items);

    // it(".testWithVariant should return [true, $Rectangle]", () => {
    //   const [test, variant] = $Shape.testWithVariant({width: 10, height: 20});
    //   assert.strictEqual(test, true);
    //   assert.strictEqual(variant, $Rectangle);
    // });
    //
    // it(".testWithVariant should return [true, $Circle]", () => {
    //   const [test, variant] = $Shape.testWithVariant({radius: 15});
    //   assert.strictEqual(test, true);
    //   assert.strictEqual(variant, $Circle);
    // });

    // it(".testWithVariant should return [false, undefined]", () => {
    //   const [test, variant] = $Shape.testWithVariant({length: 25} as any);
    //   assert.strictEqual(test, false);
    //   assert.strictEqual(variant, undefined);
    // });
  });
});
