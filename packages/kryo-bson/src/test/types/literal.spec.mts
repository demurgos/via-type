import { LiteralIoType, LiteralType } from "kryo/literal";
import { TsEnumType } from "kryo/ts-enum";
import { Ucs2StringType } from "kryo/ucs2-string";
import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";

import { BsonReader } from "../../lib/bson-reader.mjs";
import { BsonWriter } from "../../lib/bson-writer.mjs";

describe("kryo-bson | Literal", function () {
  const BSON_READER: BsonReader = new BsonReader();
  const BSON_WRITER: BsonWriter = new BsonWriter();

  describe("Literal<\"foo\">", function () {
    const $FooLit: LiteralIoType<"foo"> = new LiteralType<"foo">(() => ({
      type: new Ucs2StringType({maxLength: Infinity}),
      value: "foo",
    }));

    const items: TestItem[] = [
      {
        value: "foo",
        io: [
          {writer: BSON_WRITER, reader: BSON_READER, raw: Buffer.from("10000000025f0004000000666f6f0000", "hex")},
        ],
      },
    ];

    registerMochaSuites($FooLit, items);

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
        "9007199254740992", // Number.MAX_SAFE_INTEGER + 1
        "-9007199254740993", // Number.MIN_SAFE_INTEGER - 2
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
        "\"bar\"",
        "[]",
        "{}",
        "\"1970-01-01T00:00:00.000Z\"",
      ];
      registerErrMochaTests(BSON_READER, $FooLit, invalids);
    });
  });

  describe("Literal<Color.Red>", function () {
    enum Color {
      Red,
      Green,
      Blue,
    }

    const $ColorRed: LiteralIoType<Color.Red> = new LiteralType<Color.Red>({
      type: new TsEnumType({enum: Color}),
      value: Color.Red,
    });

    const items: TestItem[] = [
      {
        name: "Color.Red",
        value: Color.Red,
        io: [
          {writer: BSON_WRITER, reader: BSON_READER, raw: Buffer.from("10000000025f00040000005265640000", "hex")},
        ],
      },
      {
        name: "0",
        value: 0,
        io: [
          {writer: BSON_WRITER, reader: BSON_READER, raw: Buffer.from("10000000025f00040000005265640000", "hex")},
        ],
      },
    ];

    registerMochaSuites($ColorRed, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "Green",
        "\"Green\"",
        "true",
        "false",
        "undefined",
        "",
        "0",
        "1",
        "0.5",
        "0.0001",
        "2.220446049250313e-16",
        "9007199254740992", // Number.MAX_SAFE_INTEGER + 1
        "-9007199254740993", // Number.MIN_SAFE_INTEGER - 2
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
        "\"bar\"",
        "[]",
        "{}",
        "\"1970-01-01T00:00:00.000Z\"",
      ];
      registerErrMochaTests(BSON_READER, $ColorRed, invalids);
    });
  });
});
