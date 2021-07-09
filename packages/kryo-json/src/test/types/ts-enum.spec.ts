import { CaseStyle } from "kryo";
import { TsEnumType } from "kryo/ts-enum";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import { JSON_READER } from "../../lib/json-reader.js";
import { JSON_WRITER } from "../../lib/json-writer.js";

describe("kryo-json | TsEnum", function () {
  describe("Color", function () {
    enum Color {
      Red,
      Green,
      Blue,
    }

    const $Color: TsEnumType<Color> = new TsEnumType({enum: Color});

    const items: TestItem[] = [
      {
        name: "Color.Red",
        value: Color.Red,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"Red\""},
        ],
      },
      {
        name: "Color.Green",
        value: Color.Green,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"Green\""},
        ],
      },
      {
        name: "Color.Blue",
        value: Color.Blue,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"Blue\""},
        ],
      },
      {
        value: 0,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"Red\""},
        ],
      },
      {
        value: 1,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"Green\""},
        ],
      },
      {
        value: 2,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"Blue\""},
        ],
      },
    ];

    registerMochaSuites($Color, items);

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
      registerErrMochaTests(JSON_READER, $Color, invalids);
    });
  });

  describe("Node (Kebab-Case)", function () {
    enum Node {
      Expression,
      BinaryOperator,
      BlockStatement,
    }

    const $Node: TsEnumType<Node> = new TsEnumType(() => ({enum: Node, changeCase: CaseStyle.KebabCase}));

    const items: TestItem[] = [
      {
        name: "Node.Expression",
        value: Node.Expression,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"expression\""},
        ],
      },
      {
        name: "Node.BinaryOperator",
        value: Node.BinaryOperator,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"binary-operator\""},
        ],
      },
      {
        name: "Node.BlockStatement",
        value: Node.BlockStatement,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"block-statement\""},
        ],
      },
      {
        value: 0,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"expression\""},
        ],
      },
      {
        value: 1,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"binary-operator\""},
        ],
      },
      {
        value: 2,
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"block-statement\""},
        ],
      },
    ];

    registerMochaSuites($Node, items);

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
      registerErrMochaTests(JSON_READER, $Node, invalids);
    });
  });
});
