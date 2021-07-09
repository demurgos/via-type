import { DateType } from "kryo/date";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import { QsReader } from "../../lib/qs-reader.js";
import { QsWriter } from "../../lib/qs-writer.js";

describe("kryo-qs | Date", function () {
  const QS_READER: QsReader = new QsReader();
  const QS_WRITER: QsWriter = new QsWriter();

  const type: DateType = new DateType();

  const items: TestItem[] = [
    {
      name: "new Date(0)",
      value: new Date(0),
      io: [
        {writer: QS_WRITER, reader: QS_READER, raw: "_=1970-01-01T00%3A00%3A00.000Z"},
        // {reader: QS_READER, raw: "_=0"},
      ],
    },
    {
      name: "new Date(1)",
      value: new Date(1),
      io: [
        {writer: QS_WRITER, reader: QS_READER, raw: "_=1970-01-01T00%3A00%3A00.001Z"},
        // {reader: QS_READER, raw: "_=1"},
      ],
    },
    {
      name: "new Date(\"1247-05-18T19:40:08.418Z\")",
      value: new Date("1247-05-18T19:40:08.418Z"),
      io: [
        {writer: QS_WRITER, reader: QS_READER, raw: "_=1247-05-18T19%3A40%3A08.418Z"},
      ],
    },
    {
      name: "new Date(Number.EPSILON)",
      value: new Date(Number.EPSILON),
      io: [
        {writer: QS_WRITER, reader: QS_READER, raw: "_=1970-01-01T00%3A00%3A00.000Z"},
      ],
    },
    {
      name: "new Date(Math.PI)",
      value: new Date(Math.PI),
      io: [
        {writer: QS_WRITER, reader: QS_READER, raw: "_=1970-01-01T00%3A00%3A00.003Z"},
      ],
    },
  ];

  registerMochaSuites(type, items);

  describe("Reader", function () {
    const invalids: string[] = [
      "null",
      "\"\"",
      "\"0\"",
      "\"true\"",
      "\"false\"",
      "true",
      "false",
      "[]",
      "{}",
    ];
    registerErrMochaTests(QS_READER, type, invalids);
  });
});
