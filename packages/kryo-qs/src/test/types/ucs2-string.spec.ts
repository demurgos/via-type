import { Ucs2StringType } from "kryo/ucs2-string";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import { QsReader } from "../../lib/qs-reader.js";
import { QsWriter } from "../../lib/qs-writer.js";

describe("kryo-qs | Ucs2StringType", function () {
  const QS_READER: QsReader = new QsReader();
  const QS_WRITER: QsWriter = new QsWriter();

  describe("Ucs2StringType({maxLength: 15})", function () {
    const $String50: Ucs2StringType = new Ucs2StringType({maxLength: 15});

    const items: TestItem[] = [
      {
        value: "",
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_="},
        ],
      },
      {
        value: "Hello World!",
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_=Hello%20World%21"},
          {reader: QS_READER, raw: "_=Hello World!"},
        ],
      },
      {
        value: "ԂЯØǷ Łƕ੬ ɃɅϨϞ",
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_=%D4%82%D0%AF%C3%98%C7%B7%20%C5%81%C6%95%E0%A9%AC%20%C9%83%C9%85%CF%A8%CF%9E"},
          {reader: QS_READER, raw: "_=ԂЯØǷ Łƕ੬ ɃɅϨϞ"},
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
      registerErrMochaTests(QS_READER, $String50, invalids);
    });
  });
});
