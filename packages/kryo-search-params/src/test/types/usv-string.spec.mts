import { UsvStringType } from "kryo/usv-string";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import {SEARCH_PARAMS_READER} from "../../lib/search-params-reader.mjs";
import {SEARCH_PARAMS_WRITER} from "../../lib/search-params-writer.mjs";

describe("kryo-search-params | UsvString", function () {
  const type: UsvStringType = new UsvStringType({maxCodepoints: 500});

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
    {
      value: "1970-01-01T00:00:00.000Z",
      io: [
        {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=1970-01-01T00%3A00%3A00.000Z"},
        {reader: SEARCH_PARAMS_READER, raw: "_=1970-01-01T00:00:00.000Z"},
      ],
    },
  ];

  registerMochaSuites(type, items);

  describe("Reader", function () {
    const invalids: string[] = [
      "0.5",
      "0.0001",
      "null",
      "true",
      "false",
      "[]",
      "{}",
      "",
      "\"\udd1e\ud834\"",
    ];
    registerErrMochaTests(SEARCH_PARAMS_READER, type, invalids);
  });
});
