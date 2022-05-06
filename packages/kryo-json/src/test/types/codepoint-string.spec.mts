import { CodepointStringType } from "kryo/codepoint-string";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";
import unorm from "unorm";

import { JSON_READER } from "../../lib/json-reader.mjs";
import { JSON_WRITER } from "../../lib/json-writer.mjs";

describe("kryo-json | CodepointString", function () {
  const type: CodepointStringType = new CodepointStringType({maxCodepoints: 500, unorm});

  const items: TestItem[] = [
    {
      value: "",
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "\"\""},
      ],
    },
    {
      value: "Hello World!",
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "\"Hello World!\""},
      ],
    },
    {
      value: "ԂЯØǷ Łƕ੬ ɃɅϨϞ",
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "\"ԂЯØǷ Łƕ੬ ɃɅϨϞ\""},
      ],
    },
    {
      value: "1970-01-01T00:00:00.000Z",
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "\"1970-01-01T00:00:00.000Z\""},
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
    registerErrMochaTests(JSON_READER, type, invalids);
  });
});
