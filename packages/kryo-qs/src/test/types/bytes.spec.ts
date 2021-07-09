import { BytesType } from "kryo/bytes";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import { QsReader } from "../../lib/qs-reader.js";
import { QsWriter } from "../../lib/qs-writer.js";

describe("kryo-qs | Bytes", function () {
  const QS_READER: QsReader = new QsReader();
  const QS_WRITER: QsWriter = new QsWriter();

  const shortBuffer: BytesType = new BytesType({
    maxLength: 2,
  });

  const items: TestItem[] = [
    {
      name: "Uint8Array.from([])",
      value: Uint8Array.from([]),
      io: [
        {writer: QS_WRITER, reader: QS_READER, raw: "_="},
      ],
    },
    {
      name: "Uint8Array.from([1])",
      value: Uint8Array.from([1]),
      io: [
        {writer: QS_WRITER, reader: QS_READER, raw: "_=01"},
      ],
    },
    {
      name: "Uint8Array.from([2, 3])",
      value: Uint8Array.from([2, 3]),
      io: [
        {writer: QS_WRITER, reader: QS_READER, raw: "_=0203"},
      ],
    },
  ];

  registerMochaSuites(shortBuffer, items);

  describe("Reader", function () {
    const invalids: string[] = [
      "\"040506\"",
      "[7]",
      "[0.5]",
      "[null]",
      "[]",
      "[0]",
      "[0, 0]",
      "\"1970-01-01T00:00:00.000Z\"",
      "0",
      "1",
      "",
      "\"0\"",
      "\"true\"",
      "\"false\"",
      "null",
      "{}",
    ];
    registerErrMochaTests(QS_READER, shortBuffer, invalids);
  });
});
