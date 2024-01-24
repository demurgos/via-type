import { CaseStyle } from "kryo";
import { TsEnumType } from "kryo/ts-enum";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import {SEARCH_PARAMS_READER} from "../../lib/search-params-reader.mjs";
import {SEARCH_PARAMS_WRITER} from "../../lib/search-params-writer.mjs";

describe("kryo-search-params | TsEnum", function () {

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
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=Red"},
        ],
      },
      {
        name: "Color.Green",
        value: Color.Green,
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=Green"},
        ],
      },
      {
        name: "Color.Blue",
        value: Color.Blue,
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=Blue"},
        ],
      },
      {
        value: 0,
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=Red"},
        ],
      },
      {
        value: 1,
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=Green"},
        ],
      },
      {
        value: 2,
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=Blue"},
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
      registerErrMochaTests(SEARCH_PARAMS_READER, $Color, invalids);
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
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=expression"},
        ],
      },
      {
        name: "Node.BinaryOperator",
        value: Node.BinaryOperator,
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=binary-operator"},
        ],
      },
      {
        name: "Node.BlockStatement",
        value: Node.BlockStatement,
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=block-statement"},
        ],
      },
      {
        value: 0,
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=expression"},
        ],
      },
      {
        value: 1,
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=binary-operator"},
        ],
      },
      {
        value: 2,
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=block-statement"},
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
      registerErrMochaTests(SEARCH_PARAMS_READER, $Node, invalids);
    });
  });
});
