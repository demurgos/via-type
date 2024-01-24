import { ArrayIoType, ArrayType } from "kryo/array";
import { $Boolean } from "kryo/boolean";
import { $Uint8, IntegerType } from "kryo/integer";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import {SEARCH_PARAMS_READER} from "../../lib/search-params-reader.mjs";
import {SEARCH_PARAMS_WRITER} from "../../lib/search-params-writer.mjs";

describe("kryo-search-params | Array", function () {
  describe("Main", function () {
    const $IntArray: ArrayIoType<number> = new ArrayType({
      itemType: new IntegerType(),
      maxLength: 2,
    });

    const items: TestItem[] = [
      {
        value: [],
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=%5B%5D"},
        ],
      },
      {
        value: [1],
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=%5B1%5D"},
          {reader: SEARCH_PARAMS_READER, raw: "_=[1]"},
        ],
      },
      {
        value: [2, 3],
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=%5B2%2C3%5D"},
          {reader: SEARCH_PARAMS_READER, raw: "_=[2,3]"},
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
      registerErrMochaTests(SEARCH_PARAMS_READER, $IntArray, invalids);
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
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=%5B0%2C1%5D"},
        ],
      },
      {
        value: [0, 1, 2],
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=%5B0%2C1%2C2%5D"},
        ],
      },
      {
        value: [0, 1, 2, 3],
        io: [
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=%5B0%2C1%2C2%2C3%5D"},
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
      registerErrMochaTests(SEARCH_PARAMS_READER, $IntArray, invalids);
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
          {writer: SEARCH_PARAMS_WRITER, reader: SEARCH_PARAMS_READER, raw: "_=%5B%5D"},
        ],
      },
      {
        value: [[]],
        io: [
          {writer: SEARCH_PARAMS_WRITER, raw: "_=%5B%5B%5D%5D"},
        ],
      },
      {
        value: [[true], [false, true]],
        io: [
          {
            writer: SEARCH_PARAMS_WRITER,
            reader: SEARCH_PARAMS_READER,
            raw: "_=%5B%5Btrue%5D%2C%5Bfalse%2Ctrue%5D%5D",
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
      registerErrMochaTests(SEARCH_PARAMS_READER, $NestedBooleanArray, invalids);
    });
  });
});
