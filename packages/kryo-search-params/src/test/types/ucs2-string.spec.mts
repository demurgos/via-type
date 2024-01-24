import { Ucs2StringType } from "kryo/ucs2-string";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import {SEARCH_PARAMS_READER} from "../../lib/search-params-reader.mjs";
import {SEARCH_PARAMS_WRITER} from "../../lib/search-params-writer.mjs";

describe("kryo-search-params | Ucs2StringType", function () {
  describe("Ucs2StringType({maxLength: 15})", function () {
    const $String50: Ucs2StringType = new Ucs2StringType({maxLength: 15});

    const items: TestItem[] = [
      {
        value: "",
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_="},
        ],
      },
      {
        value: "Hello World!",
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=Hello+World%21"},
          {reader: SEARCH_PARAMS_READER, raw: "_=Hello World!"},
        ],
      },
      {
        value: "ԂЯØǷ Łƕ੬ ɃɅϨϞ",
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=%D4%82%D0%AF%C3%98%C7%B7+%C5%81%C6%95%E0%A9%AC+%C9%83%C9%85%CF%A8%CF%9E"},
          {reader: SEARCH_PARAMS_READER, raw: "_=ԂЯØǷ Łƕ੬ ɃɅϨϞ"},
        ],
      },
    ];

    registerMochaSuites($String50, items);

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
        "\"foo\"",
        "[]",
        "{}",
        "\"1970-01-01T00:00:00.000Z\"",
      ];
      registerErrMochaTests(SEARCH_PARAMS_READER, $String50, invalids);
    });
  });
});
