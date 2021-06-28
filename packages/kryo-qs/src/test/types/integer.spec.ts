import { IntegerType } from "kryo/lib/integer";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import { QsReader } from "../../lib/qs-reader.js";
import { QsWriter } from "../../lib/qs-writer.js";

describe("kryo-qs | Integer", function () {
  const QS_READER: QsReader = new QsReader();
  const QS_WRITER: QsWriter = new QsWriter();

  describe("Main", function () {
    const $Integer: IntegerType = new IntegerType();

    const items: TestItem[] = [
      {
        name: "0",
        value: 0,
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_=0"},
        ],
      },
      {
        name: "1",
        value: 1,
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_=1"},
        ],
      },
      {
        name: "-1",
        value: -1,
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_=-1"},
        ],
      },
      {
        name: "2",
        value: 2,
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_=2"},
        ],
      },
      {
        name: "1e3",
        value: 1e3,
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_=1000"},
        ],
      },
      {
        name: "-1e3",
        value: -1e3,
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_=-1000"},
        ],
      },
      {
        name: "Number.MAX_SAFE_INTEGER",
        value: Number.MAX_SAFE_INTEGER,
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_=9007199254740991"},
        ],
      },
      {
        name: "Number.MAX_SAFE_INTEGER - 1",
        value: Number.MAX_SAFE_INTEGER - 1,
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_=9007199254740990"},
        ],
      },
      {
        name: "Number.MIN_SAFE_INTEGER",
        value: Number.MIN_SAFE_INTEGER,
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_=-9007199254740991"},
        ],
      },
      {
        name: "Number.MIN_SAFE_INTEGER - 1",
        value: Number.MIN_SAFE_INTEGER - 1,
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_=-9007199254740992"},
        ],
      },
      {
        name: "Number.MIN_SAFE_INTEGER + 1",
        value: Number.MIN_SAFE_INTEGER + 1,
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_=-9007199254740990"},
        ],
      },
    ];

    registerMochaSuites($Integer, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "null",
        "true",
        "false",
        "",
        "0.5",
        "0.0001",
        "2.220446049250313e-16",
        "9007199254740992", // Number.MAX_SAFE_INTEGER + 1
        "-9007199254740993", // Number.MIN_SAFE_INTEGER - 2
        "\"\"",
        "\"0\"",
        "\"null\"",
        "\"true\"",
        "\"false\"",
        "\"NaN\"",
        "\"Infinity\"",
        "\"-Infinity\"",
        "[]",
        "{}",
        "\"1970-01-01T00:00:00.000Z\"",
      ];
      registerErrMochaTests(QS_READER, $Integer, invalids);
    });
  });
});
