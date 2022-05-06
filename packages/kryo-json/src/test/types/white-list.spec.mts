import { Ucs2StringType } from "kryo/ucs2-string";
import { WhiteListType } from "kryo/white-list";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import { JSON_READER } from "../../lib/json-reader.mjs";
import { JSON_WRITER } from "../../lib/json-writer.mjs";

describe("kryo-json | WhiteList", function () {
  describe("\"foo\" | \"bar\" | \"baz\"", function () {
    const $Ucs2String: Ucs2StringType = new Ucs2StringType({maxLength: 10});
    type VarName = "foo" | "bar" | "baz";
    const $VarName: WhiteListType<VarName> = new WhiteListType<VarName>({
      itemType: $Ucs2String,
      values: ["foo", "bar", "baz"],
    });

    const items: TestItem[] = [
      {
        value: "foo",
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"foo\""},
        ],
      },
      {
        value: "bar",
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"bar\""},
        ],
      },
      {
        value: "baz",
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "\"baz\""},
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
      registerErrMochaTests(JSON_READER, $VarName, invalids);
    });
  });
});
