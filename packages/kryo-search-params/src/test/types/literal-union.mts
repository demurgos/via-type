import { LiteralUnionType } from "kryo/literal-union";
import { Ucs2StringType } from "kryo/ucs2-string";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import {SEARCH_PARAMS_READER} from "../../lib/search-params-reader.mjs";
import {SEARCH_PARAMS_WRITER} from "../../lib/search-params-writer.mjs";

describe("kryo-search-params | LiteralUnion", function () {
  describe("\"foo\" | \"bar\" | \"baz\"", function () {
    const $Ucs2String: Ucs2StringType = new Ucs2StringType({maxLength: 10});
    type VarName = "foo" | "bar" | "baz";
    const $VarName: LiteralUnionType<VarName> = new LiteralUnionType<VarName>({
      type: $Ucs2String,
      values: ["foo", "bar", "baz"],
    });

    const items: TestItem[] = [
      {
        value: "foo",
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=foo"},
        ],
      },
      {
        value: "bar",
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=bar"},
        ],
      },
      {
        value: "baz",
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=baz"},
        ],
      },
    ];

    registerMochaSuites($VarName, items);

    describe("Reader", function () {
      const invalids: string[] = [
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
        "\"quz\"",
        "\" foo\"",
        "\" foo \"",
        "\"foo \"",
        "\"FOO\"",
        "[]",
        "{}",
        "\"1970-01-01T00:00:00.000Z\"",
      ];
      registerErrMochaTests(SEARCH_PARAMS_READER, $VarName, invalids);
    });
  });
});
