import { $Boolean } from "kryo/boolean";
import { $Uint8, IntegerType } from "kryo/integer";
import { SetType } from "kryo/set";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import { JSON_READER } from "../../lib/json-reader.mjs";
import { JSON_WRITER } from "../../lib/json-writer.mjs";

describe("kryo-json | Set", function () {
  describe("Main", function () {
    const $IntSet: SetType<number> = new SetType({
      itemType: new IntegerType(),
      maxSize: 2,
    });

    const items: TestItem[] = [
      {
        name: "new Set([])",
        value: new Set([]),
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[]"},
        ],
      },
      {
        name: "new Set([1])",
        value: new Set([1]),
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[1]"},
        ],
      },
      {
        name: "new Set([2, 3])",
        value: new Set([2, 3]),
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[2,3]"},
          {reader: JSON_READER, raw: "[3,2]"},
          {reader: JSON_READER, raw: "[2,2,3,3]"},
        ],
      },
    ];

    registerMochaSuites($IntSet, items);

    describe("Reader", function () {
      const invalids: string[] = [
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
      registerErrMochaTests(JSON_READER, $IntSet, invalids);
    });
  });

  describe("Max size", function () {
    const $IntSet: SetType<number> = new SetType({
      itemType: $Uint8,
      maxSize: 4,
    });

    const items: TestItem[] = [
      {
        value: new Set([0, 1]),
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[0,1]"},
        ],
      },
      {
        value: new Set([0, 1, 2]),
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[0,1,2]"},
        ],
      },
      {
        value: new Set([0, 1, 2, 3]),
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[0,1,2,3]"},
          {reader: JSON_READER, raw: "[0,1,2,3,3,3]"},
        ],
      },
    ];

    registerMochaSuites($IntSet, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "[0.5]",
        "[null]",
        "[undefined]",
        "[]",
        "[0]",
        "[0,1,2,3,4]",
        "[0,1,2,3,4,4,4]",
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
      registerErrMochaTests(JSON_READER, $IntSet, invalids);
    });
  });

  describe("Nested Set", function () {
    const $NestedBooleanSet: SetType<Set<boolean>> = new SetType({
      itemType: new SetType({
        itemType: $Boolean,
        maxSize: Infinity,
      }),
      maxSize: Infinity,
    });

    const items: TestItem[] = [
      {
        name: "new Set([])",
        value: new Set([]),
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[]"},
        ],
      },
      {
        name: "new Set([new Set([])])",
        value: new Set([new Set([])]),
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[[]]"},
        ],
      },
      {
        name: "new Set([new Set([true]), new Set([false, true])])",
        value: new Set([new Set([true]), new Set([false, true])]),
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[[false,true],[true]]"},
          {reader: JSON_READER, raw: "[[true],[false,true]]"},
          {reader: JSON_READER, raw: "[[true],[true],[false,true]]"},
        ],
      },
    ];

    registerMochaSuites($NestedBooleanSet, items);

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
      registerErrMochaTests(JSON_READER, $NestedBooleanSet, invalids);
    });
  });
});
