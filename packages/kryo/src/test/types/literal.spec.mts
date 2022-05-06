import { LiteralIoType, LiteralType } from "../../lib/literal.mjs";
import { TsEnumType } from "../../lib/ts-enum.mjs";
import { Ucs2StringType } from "../../lib/ucs2-string.mjs";
import { runTests, TypedValue } from "../helpers/test.mjs";

describe("Literal", function () {
  describe("Literal<\"foo\">", function () {
    const type: LiteralType<"foo"> = new LiteralType<"foo">(() => ({
      type: new Ucs2StringType({maxLength: Infinity}),
      value: "foo",
    }));

    const items: TypedValue[] = [
      {
        name: "\"foo\"",
        value: "foo",
        valid: true,
      },

      {name: "\"bar\"", value: "bar", valid: false},
      {name: "0", value: 0, valid: false},
      {name: "1", value: 1, valid: false},
      {name: "\"\"", value: "", valid: false},
      {name: "\"0\"", value: "0", valid: false},
      {name: "\"true\"", value: "true", valid: false},
      {name: "\"false\"", value: "false", valid: false},
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

    runTests(type, items);
  });

  describe("Literal<Color.Red>", function () {
    enum Color {
      Red,
      Green,
      Blue,
    }

    const $ColorRed: LiteralIoType<Color.Red> = new LiteralType<Color.Red>({
      type: new TsEnumType({enum: Color}),
      value: Color.Red,
    });

    const items: TypedValue[] = [
      {
        name: "Color.Red",
        value: Color.Red,
        valid: true,
      },
      {
        name: "0",
        value: 0,
        valid: true,
      },
      {name: "Color.Green", value: Color.Green, valid: false},
      {name: "undefined", value: undefined, valid: false},
    ];

    runTests($ColorRed, items);
  });
});
