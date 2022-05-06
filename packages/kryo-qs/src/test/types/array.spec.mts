import { ArrayIoType, ArrayType } from "kryo/array";
import { $Boolean } from "kryo/boolean";
import { $Uint8, IntegerType } from "kryo/integer";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import { QsReader } from "../../lib/qs-reader.mjs";
import { QsWriter } from "../../lib/qs-writer.mjs";

describe("kryo-qs | Array", function () {
  const QS_READER: QsReader = new QsReader();
  const QS_WRITER: QsWriter = new QsWriter();

  describe("Main", function () {
    const $IntArray: ArrayIoType<number> = new ArrayType({
      itemType: new IntegerType(),
      maxLength: 2,
    });

    const items: TestItem[] = [
      {
        value: [],
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: ""},
        ],
      },
      {
        value: [1],
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_%5B0%5D=1"},
          {reader: QS_READER, raw: "_[]=1"},
        ],
      },
      {
        value: [2, 3],
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_%5B0%5D=2&_%5B1%5D=3"},
          {reader: QS_READER, raw: "_[]=2&_[]=3"},
        ],
      },
    ];

    registerMochaSuites($IntArray, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "_[0]=1",
        "_[0]=1&_[1]=3",
        "[4,5,6]",
        "[0.5]",
        "[null]",
        "[undefined]",
        "[]",
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
      registerErrMochaTests(QS_READER, $IntArray, invalids);
    });
  });

  describe("Min/Max length", function () {
    const $IntArray: ArrayIoType<number> = new ArrayType({
      itemType: $Uint8,
      minLength: 2,
      maxLength: 4,
    });

    const items: TestItem[] = [
      {
        value: [0, 1],
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_%5B0%5D=0&_%5B1%5D=1"},
        ],
      },
      {
        value: [0, 1, 2],
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_%5B0%5D=0&_%5B1%5D=1&_%5B2%5D=2"},
        ],
      },
      {
        value: [0, 1, 2, 3],
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: "_%5B0%5D=0&_%5B1%5D=1&_%5B2%5D=2&_%5B3%5D=3"},
        ],
      },
    ];

    registerMochaSuites($IntArray, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "[0.5]",
        "[null]",
        "[undefined]",
        "[]",
        "[0]",
        "[0,1,2,3,4]",
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
      registerErrMochaTests(QS_READER, $IntArray, invalids);
    });
  });

  describe("Nested array", function () {
    const $NestedBooleanArray: ArrayIoType<boolean[]> = new ArrayType({
      itemType: new ArrayType({
        itemType: $Boolean,
        maxLength: Infinity,
      }),
      maxLength: Infinity,
    });

    const items: TestItem[] = [
      {
        value: [],
        io: [
          {writer: QS_WRITER, reader: QS_READER, raw: ""},
        ],
      },
      {
        value: [[]],
        io: [
          {writer: QS_WRITER, raw: ""},
        ],
      },
      {
        value: [[true], [false, true]],
        io: [
          {
            writer: QS_WRITER,
            reader: QS_READER,
            raw: "_%5B0%5D%5B0%5D=true&_%5B1%5D%5B0%5D=false&_%5B1%5D%5B1%5D=true",
          },
        ],
      },
    ];

    registerMochaSuites($NestedBooleanArray, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "[0.5]",
        "[null]",
        "[undefined]",
        "[]",
        "[[[]]]",
        "[0]",
        "[0,1,2,3,4]",
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
      registerErrMochaTests(QS_READER, $NestedBooleanArray, invalids);
    });
  });
});
