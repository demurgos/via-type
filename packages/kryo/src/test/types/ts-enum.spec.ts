import { CaseStyle } from "../../lib/index.js";
import { TsEnumType } from "../../lib/ts-enum.js";
import { runTests, TypedValue } from "../helpers/test.js";

describe("TsEnum", function () {
  enum Color {
    Red,
    Green,
    Blue,
  }

  const $Color: TsEnumType<Color> = new TsEnumType({enum: Color});

  const items: TypedValue[] = [
    {
      name: "Color.Red",
      value: Color.Red,
      valid: true,
    },
    {
      name: "Color.Green",
      value: Color.Green,
      valid: true,
    },
    {
      name: "Color.Blue",
      value: Color.Blue,
      valid: true,
    },
    {
      name: "0",
      value: 0,
      valid: true,
    },
    {
      name: "1",
      value: 1,
      valid: true,
    },
    {
      name: "2",
      value: 2,
      valid: true,
    },

    {name: "new Date()", value: new Date(), valid: false},
    {name: "3", value: 3, valid: false},
    {name: "-1", value: -1, valid: false},
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

  runTests($Color, items);
});

describe("SimpleEnum: rename KebabCase", function () {
  enum Node {
    Expression,
    BinaryOperator,
    BlockStatement,
  }

  const $Node: TsEnumType<Node> = new TsEnumType(() => ({enum: Node, changeCase: CaseStyle.KebabCase}));

  const items: TypedValue[] = [
    {
      name: "Node.Expression",
      value: Node.Expression,
      valid: true,
    },
    {
      name: "Node.BinaryOperator",
      value: Node.BinaryOperator,
      valid: true,
    },
    {
      name: "Node.BlockStatement",
      value: Node.BlockStatement,
      valid: true,
    },
    {
      name: "0",
      value: 0,
      valid: true,
    },
    {
      name: "1",
      value: 1,
      valid: true,
    },
    {
      name: "2",
      value: 2,
      valid: true,
    },
  ];

  runTests($Node, items);
});
