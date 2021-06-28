import { IntegerType } from "kryo/lib/integer";
import { MapType } from "kryo/lib/map";
import { Ucs2StringType } from "kryo/lib/ucs2-string";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import { JSON_READER } from "../../lib/json-reader.js";
import { JSON_WRITER } from "../../lib/json-writer.js";

describe("kryo-json | Map", function () {
  describe("IntMap", function () {
    const $IntMap: MapType<number, number> = new MapType({
      keyType: new IntegerType(),
      valueType: new IntegerType(),
      maxSize: 5,
    });

    const items: TestItem[] = [
      {
        value: new Map([[1, 100], [2, 200]]),
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "{\"1\":100,\"2\":200}"},
        ],
      },
    ];

    registerMochaSuites($IntMap, items);

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
      registerErrMochaTests(JSON_READER, $IntMap, invalids);
    });
  });

  describe("StringMap", function () {
    const $StringMap: MapType<string, number> = new MapType({
      keyType: new Ucs2StringType({pattern: /^a+$/, maxLength: 10}),
      valueType: new IntegerType(),
      maxSize: 5,
      assumeStringKey: true,
    });

    const items: TestItem[] = [
      {
        value: new Map([["a", 100], ["aa", 200]]),
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "{\"a\":100,\"aa\":200}"},
        ],
      },
    ];

    registerMochaSuites($StringMap, items);

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
      registerErrMochaTests(JSON_READER, $StringMap, invalids);
    });
  });
});
